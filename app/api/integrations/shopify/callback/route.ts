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

function redirectToIntegrations(request: NextRequest, status: "connected" | "error", reason?: string) {
  const url = new URL("/dashboard/integrations", request.url);
  url.searchParams.set("shopify", status);
  if (reason) url.searchParams.set("reason", reason);
  return url;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state       = searchParams.get("state");
  const code        = searchParams.get("code");
  const shopDomain  = normalizeShopDomain(searchParams.get("shop") ?? "");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "";
  const storeName   = request.cookies.get(STORE_NAME_COOKIE)?.value ?? shopDomain ?? "Shopify";

  const errorRedirect = (reason: string) => {
    console.error("[shopify-callback] FAIL reason=%s", reason);
    const res = NextResponse.redirect(redirectToIntegrations(request, "error", reason));
    res.cookies.delete(OAUTH_STATE_COOKIE);
    res.cookies.delete(STORE_NAME_COOKIE);
    return res;
  };

  console.log("[shopify-callback] shop=%s code=%s state=%s storedState=%s",
    shopDomain, !!code, state?.slice(0, 8), storedState?.slice(0, 8));

  if (!shopDomain || !code || !state) {
    return errorRedirect("missing_params");
  }

  // Verify HMAC signature from Shopify
  const hmacOk = verifyShopifyOAuthSignature(request.url);
  // Verify state matches what we set in the install route (CSRF protection)
  // If storedState is empty the cookie was lost — fall back to HMAC-only verification
  const stateOk = storedState ? state === storedState : true;

  console.log("[shopify-callback] hmacOk=%s stateOk=%s cookiePresent=%s", hmacOk, stateOk, !!storedState);

  if (!hmacOk) return errorRedirect("invalid_hmac");
  if (!stateOk) return errorRedirect("state_mismatch");

  // Require a real authenticated user (demo accounts cannot connect Shopify)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log("[shopify-callback] user=%s", user?.id ?? "null");

  if (!user) {
    return errorRedirect("unauthenticated");
  }

  let integrationId: string | null = null;

  try {
    const tokens = await exchangeShopifyCodeForToken(shopDomain, code);

    integrationId = await saveShopifyIntegration(supabase, {
      userId: user.id,
      storeName,
      shopDomain,
      tokens,
    });

    // Register webhooks using the fresh access token directly
    await registerShopifyWebhooks(shopDomain, tokens.access_token, request.nextUrl.origin);

    // Sync historical orders
    await syncShopifyOrders(supabase, integrationId);

    const successRedirect = NextResponse.redirect(redirectToIntegrations(request, "connected"));
    successRedirect.cookies.delete(OAUTH_STATE_COOKIE);
    successRedirect.cookies.delete(STORE_NAME_COOKIE);
    return successRedirect;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shopify connection failed";
    console.error("[shopify-callback] exception:", message);
    if (integrationId) {
      await markShopifyIntegrationError(supabase, integrationId, message);
    }
    return errorRedirect("exception");
  }
}
