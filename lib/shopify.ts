import "server-only";

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const SHOPIFY_API_VERSION = "2026-04";
export const SHOPIFY_SCOPES = ["read_orders"];
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY ?? "";
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET ?? "";

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

function requireShopifyCredentials() {
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    throw new Error("Missing Shopify API credentials");
  }

  return {
    apiKey: SHOPIFY_API_KEY,
    apiSecret: SHOPIFY_API_SECRET,
  };
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

export function createShopifyOAuthState() {
  return crypto.randomBytes(16).toString("hex");
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
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";
  if (!webhookSecret || !hmacHeader) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", webhookSecret)
    .update(body, "utf8")
    .digest("base64");

  return timingSafeEqual(digest, hmacHeader);
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

async function loadIntegrationSecrets(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("store_integrations")
    .select("id, user_id, platform, store_name, store_url, store_domain, status, auto_fulfill, auto_import_orders, orders_synced, access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, scope, error_message, last_sync")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("Store integration not found");
  }

  return data as IntegrationSecretRecord;
}

export async function loadShopifyIntegrationByDomain(shopDomain: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("store_integrations")
    .select("id, user_id, platform, store_name, store_url, store_domain, status, auto_fulfill, auto_import_orders, orders_synced, access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, scope, error_message, last_sync")
    .eq("platform", "shopify")
    .eq("store_domain", shopDomain)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as IntegrationSecretRecord;
}

async function persistIntegrationTokens(id: string, tokens: ShopifyTokenResponse) {
  const admin = createAdminClient();
  const values = {
    ...tokenColumns(tokens),
    error_message: null,
    status: "connected",
  };

  const { error } = await admin
    .from("store_integrations")
    .update(values)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return values;
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

export async function upsertShopifyOrder(
  integration: IntegrationSecretRecord,
  shopifyOrder: ShopifyRestOrder
) {
  const admin = createAdminClient();
  const summary = mapShopifyOrderSummary(shopifyOrder.line_items ?? []);
  const shippingAddress = buildShippingAddress(shopifyOrder.shipping_address);
  const customerName = shippingAddress?.name ?? null;
  const customerEmail = shopifyOrder.contact_email ?? shopifyOrder.email ?? null;
  const destinationCountry = shopifyOrder.shipping_address?.country_code
    ?? shippingAddress?.country_code
    ?? shippingAddress?.country
    ?? null;
  const internalStatus = shopifyOrder.cancelled_at
    ? "cancelled"
    : mapShopifyFulfillmentStatus(shopifyOrder.fulfillment_status);

  const orderValues = {
    user_id: integration.user_id,
    product_name: summary.productName,
    quantity: summary.totalQuantity,
    unit_price: summary.unitPrice,
    status: internalStatus,
    destination_country: destinationCountry,
    tracking_number: null,
    source_platform: "shopify",
    source_store_domain: integration.store_domain ?? integration.store_url,
    external_order_id: String(shopifyOrder.id),
    external_order_name: shopifyOrder.name ?? null,
    customer_name: customerName,
    customer_email: customerEmail,
    shipping_address: shippingAddress,
    line_items: summary.lineItems,
  };

  const { data: order, error } = await admin
    .from("orders")
    .upsert(orderValues, {
      onConflict: "source_platform,source_store_domain,external_order_id",
    })
    .select("id, status")
    .single();

  if (error || !order) {
    throw new Error(error?.message ?? "Unable to upsert Shopify order");
  }

  if (!integration.auto_fulfill || !integration.auto_import_orders || internalStatus === "cancelled") {
    return { orderId: order.id, queued: false };
  }

  const queueValues = {
    order_id: order.id,
    user_id: integration.user_id,
    ref: buildFulfillmentRef(),
    product_name: summary.productName,
    sku: summary.sku,
    quantity: summary.totalQuantity,
    ship_to_country: destinationCountry,
    status: order.status === "processing" ? "packed" : "pending",
    tracking_number: null,
    customer_email: customerEmail,
  };

  const { error: queueError } = await admin
    .from("fulfillment_queue")
    .upsert(queueValues, { onConflict: "order_id" });

  if (queueError) {
    throw new Error(queueError.message);
  }

  return { orderId: order.id, queued: true };
}

export async function registerShopifyWebhooks(integrationId: string, webhookBaseUrl: string) {
  const integration = await loadIntegrationSecrets(integrationId);
  const uri = `${webhookBaseUrl.replace(/\/$/, "")}/api/webhooks/shopify`;
  const mutation = `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription {
          id
          topic
          uri
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const topics = ["ORDERS_CREATE", "APP_UNINSTALLED"];

  for (const topic of topics) {
    const data = await shopifyGraphQL<{
      webhookSubscriptionCreate: {
        userErrors: { field: string[] | null; message: string }[];
      };
    }>(integration, mutation, {
      topic,
      webhookSubscription: { uri },
    });

    const firstError = data.webhookSubscriptionCreate.userErrors[0];
    if (firstError) {
      const message = firstError.field?.length
        ? `${firstError.field.join(".")}: ${firstError.message}`
        : firstError.message;
      throw new Error(message);
    }
  }
}

export async function syncShopifyOrders(integrationId: string) {
  const integration = await loadIntegrationSecrets(integrationId);
  const since = integration.last_sync
    ? new Date(new Date(integration.last_sync).getTime() - 5 * 60 * 1000).toISOString()
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let nextUrl: string | null = new URL(
    `https://${integration.store_domain ?? integration.store_url}/admin/api/${SHOPIFY_API_VERSION}/orders.json`
  ).toString();

  const importedOrderIds = new Set<string>();

  while (nextUrl) {
    const url = new URL(nextUrl);
    if (!url.searchParams.has("status")) url.searchParams.set("status", "any");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "250");
    if (!url.searchParams.has("created_at_min")) url.searchParams.set("created_at_min", since);

    const { payload, response } = await shopifyRest<{ orders: ShopifyRestOrder[] }>(integration, url.toString());
    const orders = payload.orders ?? [];

    for (const order of orders) {
      await upsertShopifyOrder(integration, order);
      importedOrderIds.add(String(order.id));
    }

    nextUrl = parseNextLink(response.headers.get("link"));
  }

  const totalOrders = await refreshShopifyIntegrationStats(integration.id);

  return {
    importedOrders: importedOrderIds.size,
    totalOrders,
  };
}

export async function saveShopifyIntegration(input: {
  userId: string;
  storeName: string;
  shopDomain: string;
  tokens: ShopifyTokenResponse;
}) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("store_integrations")
    .select("id, user_id")
    .eq("platform", "shopify")
    .eq("store_domain", input.shopDomain)
    .maybeSingle();

  if (existing && existing.user_id !== input.userId) {
    throw new Error("This Shopify store is already connected to another FastFulfill account");
  }

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

  const { data, error } = await admin
    .from("store_integrations")
    .upsert(values, {
      onConflict: "platform,store_domain",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save Shopify integration");
  }

  return data.id as string;
}

export async function markShopifyIntegrationError(integrationId: string, message: string) {
  const admin = createAdminClient();
  await admin
    .from("store_integrations")
    .update({
      status: "error",
      error_message: message,
    })
    .eq("id", integrationId);
}

export async function disconnectShopifyByDomain(shopDomain: string) {
  const admin = createAdminClient();
  await admin
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
}

export async function refreshShopifyIntegrationStats(integrationId: string) {
  const admin = createAdminClient();
  const integration = await loadIntegrationSecrets(integrationId);
  const sourceStoreDomain = integration.store_domain ?? integration.store_url;

  const { count, error: countError } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("source_platform", "shopify")
    .eq("source_store_domain", sourceStoreDomain);

  if (countError) {
    throw new Error(countError.message);
  }

  const { error } = await admin
    .from("store_integrations")
    .update({
      last_sync: new Date().toISOString(),
      status: "connected",
      error_message: null,
      orders_synced: count ?? 0,
    })
    .eq("id", integration.id);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
