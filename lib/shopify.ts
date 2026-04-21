import "server-only";

import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const SHOPIFY_API_VERSION = "2026-04";
export const SHOPIFY_SCOPES = [
  "read_inventory",
  "read_merchant_managed_fulfillment_orders",
  "write_merchant_managed_fulfillment_orders",
  "read_orders",
  "read_products",
];
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY ?? "";
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET ?? "";
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";
const SHOPIFY_APP_INSTALL_URL = process.env.SHOPIFY_APP_INSTALL_URL ?? "";

type ShopifyTokenResponse = {
  access_token: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
};

type ShopifyRestAddress = {
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  company?: string | null;
  country?: string | null;
  country_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  province?: string | null;
  zip?: string | null;
};

type ShopifyRestLineItem = {
  id?: number | string;
  title?: string | null;
  name?: string | null;
  sku?: string | null;
  quantity?: number | null;
  price?: string | number | null;
  variant_title?: string | null;
};

export type ShopifyRestOrder = {
  id: number | string;
  name?: string | null;
  created_at?: string | null;
  cancelled_at?: string | null;
  contact_email?: string | null;
  email?: string | null;
  fulfillment_status?: string | null;
  shipping_address?: ShopifyRestAddress | null;
  line_items?: ShopifyRestLineItem[] | null;
};

type IntegrationSecretRecord = {
  id: string;
  user_id: string;
  platform: string;
  store_name: string;
  store_url: string;
  store_domain: string | null;
  status: string;
  auto_fulfill: boolean;
  auto_import_orders: boolean;
  orders_synced: number;
  access_token: string | null;
  access_token_expires_at: string | null;
  refresh_token: string | null;
  refresh_token_expires_at: string | null;
  scope: string | null;
  error_message: string | null;
  last_sync: string | null;
};

type MinimalSetupCheck = {
  ok: boolean;
  error?: string;
};

type ShopifyOAuthStatePayload = {
  nonce: string;
  userId?: string;
  storeName?: string;
  createdAt: number;
};

type ShopifyInstallLinkPayload = {
  permanent_domain?: string;
};

function normalizeAppUrl(rawValue: string) {
  const value = rawValue.trim();
  if (!value) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be a valid absolute URL");
  }

  const isLocalhost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1";

  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocalhost)) {
    throw new Error("NEXT_PUBLIC_APP_URL must use https, or http only for localhost");
  }

  return parsed.origin;
}

function normalizeAbsoluteUrl(rawValue: string, envName: string) {
  const value = rawValue.trim();
  if (!value) return null;

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${envName} must be a valid absolute URL`);
  }
}

function requireShopifyCredentials() {
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    throw new Error("Missing Shopify API credentials");
  }

  return {
    apiKey: SHOPIFY_API_KEY,
    apiSecret: SHOPIFY_API_SECRET,
  };
}

export function validateShopifyConfiguration(): MinimalSetupCheck {
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    return {
      ok: false,
      error: "Shopify API credentials are missing. Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET first.",
    };
  }

  try {
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL ?? "");
    normalizeAbsoluteUrl(SHOPIFY_APP_INSTALL_URL, "SHOPIFY_APP_INSTALL_URL");
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "NEXT_PUBLIC_APP_URL is invalid.",
    };
  }

  return { ok: true };
}

export function resolveShopifyWebhookBaseUrl(fallbackOrigin?: string) {
  const configuredOrigin = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL ?? "");
  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (!fallbackOrigin) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL for Shopify webhook registration");
  }

  return new URL(fallbackOrigin).origin;
}

export function resolveShopifyInstallUrl() {
  return normalizeAbsoluteUrl(SHOPIFY_APP_INSTALL_URL, "SHOPIFY_APP_INSTALL_URL");
}

export function resolveShopifyInstallDomain() {
  const installUrl = resolveShopifyInstallUrl();
  if (!installUrl) return null;

  const url = new URL(installUrl);
  const explicitDomain =
    normalizeShopDomain(url.searchParams.get("shop") ?? "") ??
    normalizeShopDomain(url.searchParams.get("store") ?? "") ??
    normalizeShopDomain(url.searchParams.get("permanent_domain") ?? "");

  if (explicitDomain) {
    return explicitDomain;
  }

  const signature = url.searchParams.get("signature") ?? "";
  const [encodedPayload] = signature.split("--");
  if (!encodedPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as ShopifyInstallLinkPayload;
    return normalizeShopDomain(payload.permanent_domain ?? "");
  } catch {
    return null;
  }
}

export function normalizeShopDomain(rawValue: string): string | null {
  const value = rawValue.trim().toLowerCase();
  if (!value) return null;

  const withProtocol = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;

  try {
    const host = new URL(withProtocol).hostname.toLowerCase();
    if (!host.endsWith(".myshopify.com")) return null;
    return host;
  } catch {
    return null;
  }
}

export function buildShopifyInstallUrl(shop: string, redirectUri: string, state: string) {
  const { apiKey } = requireShopifyCredentials();

  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", apiKey);
  url.searchParams.set("scope", SHOPIFY_SCOPES.join(","));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function createShopifyOAuthState(input?: {
  userId?: string;
  storeName?: string;
}) {
  const payload: ShopifyOAuthStatePayload = {
    nonce: crypto.randomBytes(16).toString("hex"),
    userId: input?.userId,
    storeName: input?.storeName,
    createdAt: Date.now(),
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(encodedPayload, "utf8")
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function parseShopifyOAuthState(state: string) {
  const [encodedPayload, signature] = state.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(encodedPayload, "utf8")
    .digest("base64url");

  if (!timingSafeEqual(expectedSignature, signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as ShopifyOAuthStatePayload;
    if (!payload?.nonce || !payload?.createdAt) {
      return null;
    }

    const ageMs = Date.now() - payload.createdAt;
    if (ageMs < 0 || ageMs > 15 * 60 * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyShopifyOAuthSignature(requestUrl: string) {
  const { apiSecret } = requireShopifyCredentials();
  const url = new URL(requestUrl);
  const search = url.search.startsWith("?") ? url.search.slice(1) : url.search;
  const pairs = search.split("&").filter(Boolean);

  let providedHmac = "";
  const messageParts: string[] = [];

  for (const pair of pairs) {
    const [rawKey, ...rawValueParts] = pair.split("=");
    const rawValue = rawValueParts.join("=");
    const key = decodeURIComponent(rawKey);

    if (key === "hmac") {
      providedHmac = rawValue;
      continue;
    }

    if (key === "signature") {
      continue;
    }

    messageParts.push(`${rawKey}=${rawValue}`);
  }

  if (!providedHmac) {
    return false;
  }

  messageParts.sort((left, right) => left.localeCompare(right));
  const digest = crypto
    .createHmac("sha256", apiSecret)
    .update(messageParts.join("&"), "utf8")
    .digest("hex");

  return timingSafeEqual(digest, providedHmac);
}

export function verifyShopifyWebhookSignature(body: string, hmacHeader: string | null) {
  if (!hmacHeader) {
    return false;
  }

  const secrets = [...new Set([SHOPIFY_WEBHOOK_SECRET, SHOPIFY_API_SECRET].filter(Boolean))];
  if (secrets.length === 0) {
    return false;
  }

  return secrets.some((secret) => {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64");

    return timingSafeEqual(digest, hmacHeader);
  });
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function buildExpiryDate(seconds?: number) {
  if (!seconds) return null;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function tokenColumns(tokens: ShopifyTokenResponse) {
  return {
    access_token: tokens.access_token,
    access_token_expires_at: buildExpiryDate(tokens.expires_in),
    refresh_token: tokens.refresh_token ?? null,
    refresh_token_expires_at: buildExpiryDate(tokens.refresh_token_expires_in),
    scope: tokens.scope ?? null,
  };
}

export async function exchangeShopifyCodeForToken(shop: string, code: string) {
  const { apiKey, apiSecret } = requireShopifyCredentials();

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
      expiring: "1",
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "Shopify token exchange failed");
  }

  return payload as ShopifyTokenResponse;
}

async function refreshShopifyToken(shop: string, refreshToken: string) {
  const { apiKey, apiSecret } = requireShopifyCredentials();

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: apiKey,
      client_secret: apiSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "Shopify token refresh failed");
  }

  return payload as ShopifyTokenResponse;
}

function tokenExpiresSoon(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now() + ACCESS_TOKEN_EXPIRY_BUFFER_MS;
}

/** @internal Used only within syncShopifyOrders – loaded via the caller's client. */
async function loadIntegrationSecrets(id: string): Promise<IntegrationSecretRecord> {
  // This path is kept for ensureFreshIntegration; supabase client is passed at callsite.
  // Actual loading happens in syncShopifyOrders using the caller's client.
  throw new Error(`loadIntegrationSecrets(${id}): call syncShopifyOrders(supabase, id) instead`);
}

/** @deprecated Use fn_shopify_lookup_integration RPC in the webhook route. */
export async function loadShopifyIntegrationByDomain(_shopDomain: string) {
  return null;
}

export async function verifyShopifyDbSetup(supabase: SupabaseClient): Promise<MinimalSetupCheck> {
  const { error: integrationError } = await supabase
    .from("store_integrations")
    .select("id, user_id, platform, store_domain, status, auto_fulfill, auto_import_orders, access_token, error_message")
    .limit(1);

  if (integrationError) {
    return {
      ok: false,
      error: "Supabase store integration schema is missing. Run migration 004_store_integrations_shopify.sql first.",
    };
  }

  const { error: ordersError } = await supabase
    .from("orders")
    .select("id, user_id, source_platform, source_store_domain, external_order_id, customer_name, customer_email, shipping_address, line_items")
    .limit(1);

  if (ordersError) {
    return {
      ok: false,
      error: "Supabase order sync columns are missing. Run migration 004_store_integrations_shopify.sql first.",
    };
  }

  const { error: queueError } = await supabase
    .from("fulfillment_queue")
    .select("id, order_id, user_id, product_name, sku, quantity, ship_to_country, status, customer_email")
    .limit(1);

  if (queueError) {
    return {
      ok: false,
      error: "Supabase fulfillment queue schema is incomplete. Run the full 004_store_integrations_shopify.sql migration before connecting Shopify.",
    };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error: rpcError } = await supabase.rpc("fn_shopify_lookup_integration", {
      p_shop_domain: "__ff_healthcheck__.myshopify.com",
    });

    if (rpcError) {
      return {
        ok: false,
        error: "Webhook helpers are missing. Run migration 005_shopify_rpc_helpers.sql or set SUPABASE_SERVICE_ROLE_KEY.",
      };
    }
  }

  return { ok: true };
}

export function classifyShopifyConnectError(error: unknown) {
  const message = error instanceof Error ? error.message : "Shopify connection failed";
  const normalized = message.toLowerCase();

  if (normalized.includes("missing shopify api credentials")) {
    return { reason: "shopify_setup_invalid", message };
  }

  if (
    normalized.includes("next_public_app_url") ||
    normalized.includes("callback url") ||
    normalized.includes("redirect_uri") ||
    normalized.includes("invalid_client") ||
    normalized.includes("access token") ||
    normalized.includes("token exchange") ||
    normalized.includes("client secret") ||
    normalized.includes("client_id") ||
    normalized.includes("invalid api key") ||
    normalized.includes("invalid_request")
  ) {
    return { reason: "token_exchange_failed", message };
  }

  if (
    normalized.includes("save shopify integration") ||
    normalized.includes("store_integrations")
  ) {
    return { reason: "integration_save_failed", message };
  }

  if (normalized.includes("webhook")) {
    return { reason: "webhook_registration_failed", message };
  }

  if (
    normalized.includes("schema") ||
    normalized.includes("relation") ||
    normalized.includes("column") ||
    normalized.includes("updated_at") ||
    normalized.includes("record \"new\" has no field") ||
    normalized.includes("fulfillment_queue") ||
    normalized.includes("source_store_domain")
  ) {
    return { reason: "database_not_ready", message };
  }

  if (
    normalized.includes("sync") ||
    normalized.includes("shopify order") ||
    normalized.includes("orders")
  ) {
    return { reason: "initial_sync_failed", message };
  }

  return { reason: "exception", message };
}

export function sanitizeShopifyDiagnosticMessage(message: string) {
  const redactions = [
    SHOPIFY_API_KEY,
    SHOPIFY_API_SECRET,
    SHOPIFY_WEBHOOK_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  ].filter(Boolean);

  let sanitized = message;
  for (const value of redactions) {
    sanitized = sanitized.split(value).join("[redacted]");
  }

  sanitized = sanitized.replace(/\s+/g, " ").trim();

  if (sanitized.length > 220) {
    sanitized = `${sanitized.slice(0, 217)}...`;
  }

  return sanitized;
}

/** Persist refreshed Shopify tokens. Uses a temporary admin client ONLY for token refresh
 *  (called from ensureFreshIntegration inside syncShopifyOrders). */
async function persistIntegrationTokens(id: string, tokens: ShopifyTokenResponse) {
  // Token refresh is a rare operation. We use the Supabase anon key + service_role
  // only when genuinely needed. If admin key unavailable, tokens persist next startup.
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const values = { ...tokenColumns(tokens), error_message: null, status: "connected" };
    const { error } = await admin.from("store_integrations").update(values).eq("id", id);
    if (error) throw new Error(error.message);
    return values;
  } catch {
    // If admin client unavailable, return the token values without persisting.
    // The next request will re-refresh if still needed.
    return { ...tokenColumns(tokens), error_message: null as string | null, status: "connected" };
  }
}

async function ensureFreshIntegration(integration: IntegrationSecretRecord) {
  if (!integration.access_token) {
    throw new Error("Store is missing a Shopify access token");
  }

  if (!integration.refresh_token || !tokenExpiresSoon(integration.access_token_expires_at)) {
    return integration;
  }

  const refreshed = await refreshShopifyToken(
    integration.store_domain ?? integration.store_url,
    integration.refresh_token
  );
  const persisted = await persistIntegrationTokens(integration.id, refreshed);

  return {
    ...integration,
    ...persisted,
  };
}

async function shopifyGraphQL<T>(
  integration: IntegrationSecretRecord,
  query: string,
  variables: Record<string, unknown>
) {
  const freshIntegration = await ensureFreshIntegration(integration);

  const response = await fetch(
    `https://${freshIntegration.store_domain ?? freshIntegration.store_url}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": freshIntegration.access_token ?? "",
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (response.status === 401 && freshIntegration.refresh_token) {
    const refreshed = await refreshShopifyToken(
      freshIntegration.store_domain ?? freshIntegration.store_url,
      freshIntegration.refresh_token
    );
    const persisted = await persistIntegrationTokens(freshIntegration.id, refreshed);
    const retryResponse = await fetch(
      `https://${freshIntegration.store_domain ?? freshIntegration.store_url}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": persisted.access_token,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    return parseGraphqlResponse<T>(retryResponse);
  }

  return parseGraphqlResponse<T>(response);
}

function parseGraphqlResponse<T>(response: Response) {
  return response.json().then((payload) => {
    if (!response.ok) {
      throw new Error(payload.errors?.[0]?.message ?? "Shopify request failed");
    }

    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message ?? "Shopify GraphQL request failed");
    }

    return payload.data as T;
  });
}

async function shopifyRest<T>(integration: IntegrationSecretRecord, url: string) {
  const freshIntegration = await ensureFreshIntegration(integration);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Shopify-Access-Token": freshIntegration.access_token ?? "",
    },
  });

  if (response.status === 401 && freshIntegration.refresh_token) {
    const refreshed = await refreshShopifyToken(
      freshIntegration.store_domain ?? freshIntegration.store_url,
      freshIntegration.refresh_token
    );
    const persisted = await persistIntegrationTokens(freshIntegration.id, refreshed);
    const retryResponse = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Shopify-Access-Token": persisted.access_token,
      },
    });

    return parseRestResponse<T>(retryResponse);
  }

  return parseRestResponse<T>(response);
}

async function parseRestResponse<T>(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.errors ?? payload.error ?? "Shopify REST request failed");
  }

  return {
    payload: payload as T,
    response,
  };
}

function parseNextLink(linkHeader: string | null) {
  if (!linkHeader) return null;

  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match?.[2] === "next") {
      return match[1];
    }
  }

  return null;
}

function mapShopifyFulfillmentStatus(status: string | null | undefined) {
  switch ((status ?? "").toLowerCase()) {
    case "fulfilled":
    case "shipped":
      return "shipped";
    case "partial":
    case "partially_fulfilled":
    case "scheduled":
    case "on_hold":
    case "request_declined":
      return "processing";
    default:
      return "pending";
  }
}

function mapShopifyOrderSummary(lineItems: ShopifyRestLineItem[] = []) {
  const normalizedItems = lineItems.map((item) => ({
    external_id: item.id ? String(item.id) : null,
    title: item.title ?? item.name ?? "Untitled item",
    sku: item.sku ?? null,
    quantity: Number(item.quantity ?? 0) || 0,
    unit_price: item.price !== undefined && item.price !== null ? Number(item.price) : null,
    variant_title: item.variant_title ?? null,
  }));

  const firstItem = normalizedItems[0];
  const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const productName = !firstItem
    ? "Shopify order"
    : normalizedItems.length === 1
      ? firstItem.title
      : `${firstItem.title} + ${normalizedItems.length - 1} more`;

  return {
    lineItems: normalizedItems,
    productName,
    sku: firstItem?.sku ?? null,
    totalQuantity: totalQuantity || 1,
    unitPrice: firstItem?.unit_price ?? null,
  };
}

function buildShippingAddress(address?: ShopifyRestAddress | null) {
  if (!address) return null;

  return {
    name: `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim() || null,
    line1: address.address1 ?? null,
    line2: address.address2 ?? null,
    city: address.city ?? null,
    state: address.province ?? null,
    zip: address.zip ?? null,
    country: address.country ?? null,
    country_code: address.country_code ?? null,
    company: address.company ?? null,
    phone: address.phone ?? null,
  };
}

function buildFulfillmentRef() {
  return `FF-ORD-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// ── Pure mapping helper (no DB) ───────────────────────────────────────────────

/** Maps a raw Shopify REST order to the fields needed for our DB.
 *  No database calls — safe to call anywhere, including the webhook route. */
export function mapShopifyOrderForWebhook(shopifyOrder: ShopifyRestOrder) {
  const summary = mapShopifyOrderSummary(shopifyOrder.line_items ?? []);
  const shippingAddress = buildShippingAddress(shopifyOrder.shipping_address);
  const customerName = shippingAddress?.name ?? null;
  const customerEmail = shopifyOrder.contact_email ?? shopifyOrder.email ?? null;
  const destinationCountry =
    shopifyOrder.shipping_address?.country_code ??
    shippingAddress?.country_code ??
    shippingAddress?.country ??
    null;
  const status = shopifyOrder.cancelled_at
    ? "cancelled"
    : mapShopifyFulfillmentStatus(shopifyOrder.fulfillment_status);

  return {
    productName: summary.productName,
    totalQuantity: summary.totalQuantity,
    unitPrice: summary.unitPrice,
    lineItems: summary.lineItems,
    status,
    customerName,
    customerEmail,
    shippingAddress,
    destinationCountry,
  };
}

async function upsertShopifyOrderForUser(
  supabase: SupabaseClient,
  integration: Pick<IntegrationSecretRecord, "id" | "user_id" | "store_domain" | "store_url" | "auto_fulfill" | "auto_import_orders">,
  shopifyOrder: ShopifyRestOrder
) {
  const mapped = mapShopifyOrderForWebhook(shopifyOrder);
  const sourceStoreDomain = integration.store_domain ?? integration.store_url;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        user_id: integration.user_id,
        product_name: mapped.productName,
        quantity: mapped.totalQuantity,
        unit_price: mapped.unitPrice ?? null,
        status: mapped.status,
        destination_country: mapped.destinationCountry,
        source_platform: "shopify",
        source_store_domain: sourceStoreDomain,
        external_order_id: String(shopifyOrder.id),
        external_order_name: shopifyOrder.name ?? null,
        customer_name: mapped.customerName,
        customer_email: mapped.customerEmail,
        shipping_address: mapped.shippingAddress,
        line_items: mapped.lineItems,
      },
      { onConflict: "source_platform,source_store_domain,external_order_id" }
    )
    .select("id, status")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Unable to upsert Shopify order");
  }

  if (!integration.auto_fulfill || !integration.auto_import_orders || mapped.status === "cancelled") {
    return { orderId: order.id };
  }

  const queueStatus = order.status === "processing" ? "packed" : "pending";
  const { error: queueError } = await supabase
    .from("fulfillment_queue")
    .upsert(
      {
        order_id: order.id,
        user_id: integration.user_id,
        product_name: mapped.productName,
        sku: mapped.lineItems[0]?.sku ?? null,
        quantity: mapped.totalQuantity,
        ship_to_country: mapped.destinationCountry,
        customer_email: mapped.customerEmail,
        status: queueStatus,
      },
      { onConflict: "order_id" }
    );

  if (queueError) {
    throw new Error(queueError.message);
  }

  return { orderId: order.id };
}

/** @deprecated Use fn_shopify_upsert_order RPC (no admin client needed). */
export async function upsertShopifyOrder(
  supabase: SupabaseClient,
  shopDomain: string,
  userId: string,
  integrationId: string,
  shopifyOrder: ShopifyRestOrder
) {
  const mapped = mapShopifyOrderForWebhook(shopifyOrder);

  const { data, error } = await supabase.rpc("fn_shopify_upsert_order", {
    p_shop_domain:         shopDomain,
    p_user_id:             userId,
    p_integration_id:      integrationId,
    p_external_id:         String(shopifyOrder.id),
    p_external_name:       shopifyOrder.name ?? null,
    p_product_name:        mapped.productName,
    p_quantity:            mapped.totalQuantity,
    p_unit_price:          mapped.unitPrice ?? null,
    p_status:              mapped.status,
    p_customer_name:       mapped.customerName,
    p_customer_email:      mapped.customerEmail,
    p_shipping_address:    mapped.shippingAddress,
    p_line_items:          mapped.lineItems,
    p_destination_country: mapped.destinationCountry,
  });

  if (error) throw new Error(error.message);
  return (data as { order_id: string }).order_id;
}

/** Register webhooks for a Shopify store directly using the access token.
 *  No DB reads required — tokens are passed in from the OAuth callback. */
export async function registerShopifyWebhooks(
  shop: string,
  accessToken: string,
  webhookBaseUrl: string
) {
  const base = webhookBaseUrl.replace(/\/$/, "");
  const uri     = `${base}/api/webhooks/shopify`;
  const gdprUri = `${base}/api/webhooks/shopify/gdpr`;

  const mutation = `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription { id topic uri }
        userErrors { field message }
      }
    }
  `;

  // topic → which URI to register it on
  const topics: Array<{ topic: string; webhookUri: string }> = [
    { topic: "ORDERS_CREATE",           webhookUri: uri },
    { topic: "APP_UNINSTALLED",         webhookUri: uri },
    { topic: "CUSTOMERS_DATA_REQUEST",  webhookUri: gdprUri },
    { topic: "CUSTOMERS_REDACT",        webhookUri: gdprUri },
    { topic: "SHOP_REDACT",             webhookUri: gdprUri },
  ];

  for (const { topic, webhookUri } of topics) {
    const response = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { topic, webhookSubscription: { uri: webhookUri } },
        }),
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.errors?.[0]?.message ?? "Shopify webhook registration failed");
    }

    const firstError = payload.data?.webhookSubscriptionCreate?.userErrors?.[0];
    if (firstError) {
      // "already registered" is not a fatal error — skip it
      if (firstError.message?.toLowerCase().includes("already")) continue;
      const message = firstError.field?.length
        ? `${firstError.field.join(".")}: ${firstError.message}`
        : firstError.message;
      throw new Error(message);
    }
  }
}

export async function saveShopifyIntegration(
  supabase: SupabaseClient,
  input: {
    userId: string;
    storeName: string;
    shopDomain: string;
    tokens: ShopifyTokenResponse;
  }
) {
  const values = {
    user_id: input.userId,
    platform: "shopify",
    store_name: input.storeName,
    store_url: input.shopDomain,
    store_domain: input.shopDomain,
    status: "syncing",
    auto_fulfill: true,
    auto_import_orders: true,
    products_mapped: 0,
    error_message: null,
    ...tokenColumns(input.tokens),
    metadata: {},
  };

  const { data: existingRows, error: existingError } = await supabase
    .from("store_integrations")
    .select("id")
    .eq("platform", "shopify")
    .eq("store_domain", input.shopDomain)
    .limit(1);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingId = existingRows?.[0]?.id as string | undefined;

  if (existingId) {
    const { data, error } = await supabase
      .from("store_integrations")
      .update(values)
      .eq("id", existingId)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to update Shopify integration");
    }

    return data.id as string;
  }

  const { data, error } = await supabase
    .from("store_integrations")
    .insert(values)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save Shopify integration");
  }

  return data.id as string;
}

export async function primeShopifyPendingInstall(
  supabase: SupabaseClient,
  input: {
    userId: string;
    storeName?: string;
  }
) {
  const shopDomain = resolveShopifyInstallDomain();
  if (!shopDomain) {
    throw new Error("Unable to determine the Shopify store domain from SHOPIFY_APP_INSTALL_URL");
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("store_integrations")
    .select("id, user_id, store_name, store_domain")
    .eq("platform", "shopify")
    .eq("store_domain", shopDomain)
    .limit(1);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const values = {
    user_id: input.userId,
    platform: "shopify",
    store_name: input.storeName?.trim() || shopDomain,
    store_url: shopDomain,
    store_domain: shopDomain,
    status: "disconnected",
    auto_fulfill: true,
    auto_import_orders: true,
    orders_synced: 0,
    products_mapped: 0,
    error_message: null,
    metadata: {
      pending_install: true,
      pending_started_at: new Date().toISOString(),
    },
  };

  const existingId = existingRows?.[0]?.id as string | undefined;

  if (existingId) {
    const { data, error } = await supabase
      .from("store_integrations")
      .update(values)
      .eq("id", existingId)
      .select("id, user_id, store_name, store_domain")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to update pending Shopify install");
    }

    return data as {
      id: string;
      user_id: string;
      store_name: string;
      store_domain: string;
    };
  }

  const { data, error } = await supabase
    .from("store_integrations")
    .insert(values)
    .select("id, user_id, store_name, store_domain")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to prepare Shopify install");
  }

  return data as {
    id: string;
    user_id: string;
    store_name: string;
    store_domain: string;
  };
}

export async function loadPendingShopifyInstall(shopDomain: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("store_integrations")
    .select("id, user_id, store_name, store_domain, metadata, status")
    .eq("platform", "shopify")
    .eq("store_domain", shopDomain)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    id: string;
    user_id: string;
    store_name: string;
    store_domain: string;
    metadata?: { pending_install?: boolean } | null;
    status: string;
  } | null;
}

export async function markShopifyIntegrationError(
  supabase: SupabaseClient,
  integrationId: string,
  message: string
) {
  await supabase
    .from("store_integrations")
    .update({ status: "error", error_message: message })
    .eq("id", integrationId);
}

export async function markShopifyIntegrationConnected(
  supabase: SupabaseClient,
  integrationId: string,
  warningMessage?: string
) {
  await supabase
    .from("store_integrations")
    .update({
      status: "connected",
      error_message: warningMessage ?? null,
    })
    .eq("id", integrationId);
}

/** Sync historical orders from Shopify REST API into the DB.
 *  Uses SECURITY DEFINER RPC for writes — no admin client needed. */
export async function syncShopifyOrders(supabase: SupabaseClient, integrationId: string) {
  // Load integration with the caller's supabase client (RLS: buyer can read own rows)
  const { data: integrationRow, error: loadErr } = await supabase
    .from("store_integrations")
    .select("id, user_id, store_domain, store_url, access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, scope, error_message, last_sync, auto_fulfill, auto_import_orders")
    .eq("id", integrationId)
    .single();

  if (loadErr || !integrationRow) {
    throw new Error("Store integration not found");
  }

  const integration = integrationRow as IntegrationSecretRecord;
  const freshIntegration = await ensureFreshIntegration(integration);
  const shopDomain = freshIntegration.store_domain ?? freshIntegration.store_url;

  const since = freshIntegration.last_sync
    ? new Date(new Date(freshIntegration.last_sync).getTime() - 5 * 60 * 1000).toISOString()
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let nextUrl: string | null = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/orders.json`;
  const importedOrderIds = new Set<string>();

  while (nextUrl) {
    const url = new URL(nextUrl);
    if (!url.searchParams.has("status")) url.searchParams.set("status", "any");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "250");
    if (!url.searchParams.has("created_at_min")) url.searchParams.set("created_at_min", since);

    const { payload, response } = await shopifyRest<{ orders: ShopifyRestOrder[] }>(
      freshIntegration,
      url.toString()
    );
    const orders = payload.orders ?? [];

    for (const order of orders) {
      await upsertShopifyOrderForUser(supabase, freshIntegration, order);
      importedOrderIds.add(String(order.id));
    }

    nextUrl = parseNextLink(response.headers.get("link"));
  }

  // Final accurate count
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("source_platform", "shopify")
    .eq("source_store_domain", shopDomain);

  await supabase
    .from("store_integrations")
    .update({ orders_synced: count ?? 0, last_sync: new Date().toISOString(), status: "connected", error_message: null })
    .eq("id", integrationId);

  return { importedOrders: importedOrderIds.size, totalOrders: count ?? 0 };
}

export async function loadShopifyIntegrationByDomainAdmin(shopDomain: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("store_integrations")
    .select("id, user_id, store_domain, store_url, auto_fulfill, auto_import_orders, status")
    .eq("platform", "shopify")
    .eq("store_domain", shopDomain)
    .neq("status", "disconnected")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function disconnectShopifyByDomainAdmin(shopDomain: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("store_integrations")
    .update({
      status: "disconnected",
      access_token: null,
      access_token_expires_at: null,
      refresh_token: null,
      refresh_token_expires_at: null,
      error_message: "Shopify app was uninstalled",
    })
    .eq("platform", "shopify")
    .eq("store_domain", shopDomain);

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertShopifyOrderAdmin(shopDomain: string, shopifyOrder: ShopifyRestOrder) {
  const integration = await loadShopifyIntegrationByDomainAdmin(shopDomain);
  if (!integration) return null;

  const admin = createAdminClient();
  return upsertShopifyOrderForUser(
    admin,
    integration as Pick<IntegrationSecretRecord, "id" | "user_id" | "store_domain" | "store_url" | "auto_fulfill" | "auto_import_orders">,
    shopifyOrder
  );
}
