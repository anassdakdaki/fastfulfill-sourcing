import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeShopifyCodeForToken,
  markShopifyIntegrationError,
  normalizeShopDomain,
  registerShopifyWebhooks,
  saveShopifyIntegration,
  syncShopifyOrders,
  verifyShopifyOAuthSignature,
} from "@/lib/shopify";

const OAUTH_STATE_COOKIE = "ff_shopify_oauth_state";
const STORE_NAME_COOKIE  = "ff_shopify_store_name";

function redirectToIntegrations(request: NextRequest, status: "connected" | "error") {
  const url = new URL("/dashboard/integrations", request.url);
  url.searchParams.set("shopify", status);
  return url;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state      = searchParams.get("state");
  const code       = searchParams.get("code");
  const shopDomain = normalizeShopDomain(searchParams.get("shop") ?? "");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "";
  const storeName   = request.cookies.get(STORE_NAME_COOKIE)?.value ?? shopDomain ?? "Shopify";

  const errorRedirect = NextResponse.redirect(redirectToIntegrations(request, "error"));
  errorRedirect.cookies.delete(OAUTH_STATE_COOKIE);
  errorRedirect.cookies.delete(STORE_NAME_COOKIE);

  console.log("[shopify-callback] shop=%s code=%s state=%s storedState=%s", shopDomain, !!code, state, storedState);

  if (!shopDomain || !code || !state) {
    console.error("[shopify-callback] FAIL: missing params shop=%s code=%s state=%s", shopDomain, !!code, state);
    return errorRedirect;
  }

  const hmacOk = verifyShopifyOAuthSignature(request.url);
  const stateOk = state === storedState;
  console.log("[shopify-callback] hmacOk=%s stateOk=%s", hmacOk, stateOk);

  if (!hmacOk || !stateOk) {
    console.error("[shopify-callback] FAIL: hmacOk=%s stateOk=%s SHOPIFY_API_SECRET_set=%s", hmacOk, stateOk, !!process.env.SHOPIFY_API_SECRET);
    return errorRedirect;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log("[shopify-callback] user=%s", user?.id ?? "null");
  if (!user) {
    console.error("[shopify-callback] FAIL: no authenticated user");
    return errorRedirect;
  }

  let integrationId: string | null = null;

  try {
    const tokens = await exchangeShopifyCodeForToken(shopDomain, code);

    // Use the user's Supabase client — no admin key needed
    integrationId = await saveShopifyIntegration(supabase, {
      userId: user.id,
      storeName,
      shopDomain,
      tokens,
    });

    // Register webhooks using the fresh access token directly (no DB lookup)
    await registerShopifyWebhooks(shopDomain, tokens.access_token, request.nextUrl.origin);

    // Sync historical orders using the user's client + SECURITY DEFINER RPCs
    await syncShopifyOrders(supabase, integrationId);

    const successRedirect = NextResponse.redirect(redirectToIntegrations(request, "connected"));
    successRedirect.cookies.delete(OAUTH_STATE_COOKIE);
    successRedirect.cookies.delete(STORE_NAME_COOKIE);
    return successRedirect;
  } catch (error) {
    if (integrationId) {
      const message = error instanceof Error ? error.message : "Shopify connection failed";
      await markShopifyIntegrationError(supabase, integrationId, message);
    }
    console.error("Shopify OAuth callback error:", error);
    return errorRedirect;
  }
}
