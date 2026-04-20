import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  classifyShopifyConnectError,
  exchangeShopifyCodeForToken,
  markShopifyIntegrationConnected,
  markShopifyIntegrationError,
  normalizeShopDomain,
  registerShopifyWebhooks,
  resolveShopifyWebhookBaseUrl,
  sanitizeShopifyDiagnosticMessage,
  saveShopifyIntegration,
  syncShopifyOrders,
  validateShopifyConfiguration,
  verifyShopifyOAuthSignature,
} from "@/lib/shopify";

const OAUTH_STATE_COOKIE = "ff_shopify_oauth_state";
const STORE_NAME_COOKIE = "ff_shopify_store_name";

function redirectToIntegrations(
  request: NextRequest,
  status: "connected" | "error",
  options?: { reason?: string; warning?: string; step?: string; detail?: string }
) {
  const url = new URL("/dashboard/integrations", request.url);
  url.searchParams.set("shopify", status);

  if (options?.reason) {
    url.searchParams.set("reason", options.reason);
  }

  if (options?.warning) {
    url.searchParams.set("warning", options.warning);
  }

  if (options?.step) {
    url.searchParams.set("step", options.step);
  }

  if (options?.detail) {
    url.searchParams.set("detail", options.detail);
  }

  return url;
}

function clearOauthCookies(response: NextResponse) {
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(STORE_NAME_COOKIE);
}

function buildErrorRedirect(
  request: NextRequest,
  reason: string,
  step?: string,
  detail?: string
) {
  console.error("[shopify-callback] FAIL reason=%s step=%s detail=%s", reason, step, detail);
  const response = NextResponse.redirect(
    redirectToIntegrations(request, "error", { reason, step, detail })
  );
  clearOauthCookies(response);
  return response;
}

function buildSuccessRedirect(
  request: NextRequest,
  warning?: string,
  step?: string,
  detail?: string
) {
  const response = NextResponse.redirect(
    redirectToIntegrations(
      request,
      "connected",
      warning || step || detail ? { warning, step, detail } : undefined
    )
  );
  clearOauthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  const code = searchParams.get("code");
  const shopDomain = normalizeShopDomain(searchParams.get("shop") ?? "");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "";
  const storeName =
    request.cookies.get(STORE_NAME_COOKIE)?.value ?? shopDomain ?? "Shopify";

  console.log(
    "[shopify-callback] shop=%s code=%s state=%s storedState=%s",
    shopDomain,
    !!code,
    state?.slice(0, 8),
    storedState?.slice(0, 8)
  );

  if (!shopDomain || !code || !state) {
    return buildErrorRedirect(
      request,
      "missing_params",
      "oauth_callback_validation",
      "Shopify returned without the required OAuth parameters."
    );
  }

  const config = validateShopifyConfiguration();
  if (!config.ok) {
    return buildErrorRedirect(
      request,
      "shopify_setup_invalid",
      "oauth_callback_validation",
      config.error
    );
  }

  const hmacOk = verifyShopifyOAuthSignature(request.url);
  const stateOk = storedState ? state === storedState : true;

  console.log(
    "[shopify-callback] hmacOk=%s stateOk=%s cookiePresent=%s",
    hmacOk,
    stateOk,
    !!storedState
  );

  if (!hmacOk) {
    return buildErrorRedirect(
      request,
      "invalid_hmac",
      "oauth_callback_validation",
      "Shopify callback HMAC verification failed."
    );
  }
  if (!stateOk) {
    return buildErrorRedirect(
      request,
      "state_mismatch",
      "oauth_callback_validation",
      "The OAuth state cookie did not match the callback state."
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[shopify-callback] user=%s", user?.id ?? "null");

  if (!user) {
    return buildErrorRedirect(
      request,
      "unauthenticated",
      "session_lookup",
      "No signed-in FastFulfill buyer session was available in the Shopify callback."
    );
  }

  let integrationId: string | null = null;

  let tokens: Awaited<ReturnType<typeof exchangeShopifyCodeForToken>>;
  try {
    tokens = await exchangeShopifyCodeForToken(shopDomain, code);
  } catch (error) {
    const classified = classifyShopifyConnectError(error);
    console.error("[shopify-callback] token exchange failed:", classified.message);
    return buildErrorRedirect(
      request,
      classified.reason,
      "token_exchange",
      sanitizeShopifyDiagnosticMessage(classified.message)
    );
  }

  try {
    integrationId = await saveShopifyIntegration(supabase, {
      userId: user.id,
      storeName,
      shopDomain,
      tokens,
    });
  } catch (error) {
    const classified = classifyShopifyConnectError(error);
    console.error("[shopify-callback] integration save failed:", classified.message);
    return buildErrorRedirect(
      request,
      classified.reason,
      "integration_save",
      sanitizeShopifyDiagnosticMessage(classified.message)
    );
  }

  let webhookBaseUrl: string;
  try {
    webhookBaseUrl = resolveShopifyWebhookBaseUrl(request.nextUrl.origin);
  } catch (error) {
    const classified = classifyShopifyConnectError(error);
    console.error("[shopify-callback] webhook base URL failed:", classified.message);
    await markShopifyIntegrationError(supabase, integrationId, classified.message);
    return buildErrorRedirect(
      request,
      "shopify_setup_invalid",
      "webhook_registration",
      sanitizeShopifyDiagnosticMessage(classified.message)
    );
  }

  try {
    await registerShopifyWebhooks(
      shopDomain,
      tokens.access_token,
      webhookBaseUrl
    );
  } catch (error) {
    const classified = classifyShopifyConnectError(error);
    console.error(
      "[shopify-callback] webhook registration failed:",
      classified.message
    );
    await markShopifyIntegrationError(supabase, integrationId, classified.message);
    return buildErrorRedirect(
      request,
      classified.reason,
      "webhook_registration",
      sanitizeShopifyDiagnosticMessage(classified.message)
    );
  }

  try {
    await syncShopifyOrders(supabase, integrationId);
  } catch (error) {
    const classified = classifyShopifyConnectError(error);
    console.error("[shopify-callback] initial sync failed:", classified.message);

    if (classified.reason === "database_not_ready") {
      await markShopifyIntegrationError(supabase, integrationId, classified.message);
      return buildErrorRedirect(
        request,
        classified.reason,
        "initial_sync",
        sanitizeShopifyDiagnosticMessage(classified.message)
      );
    }

    await markShopifyIntegrationConnected(
      supabase,
      integrationId,
      `Initial sync failed: ${classified.message}`
    );
    return buildSuccessRedirect(
      request,
      "initial_sync_failed",
      "initial_sync",
      sanitizeShopifyDiagnosticMessage(classified.message)
    );
  }

  return buildSuccessRedirect(request);
}
