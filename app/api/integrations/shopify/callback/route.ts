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
const STORE_NAME_COOKIE = "ff_shopify_store_name";

function redirectToIntegrations(request: NextRequest, status: "connected" | "error") {
  const url = new URL("/dashboard/integrations", request.url);
  url.searchParams.set("shopify", status);
  return url;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state");
  const code = searchParams.get("code");
  const shopDomain = normalizeShopDomain(searchParams.get("shop") ?? "");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "";
  const storeName = request.cookies.get(STORE_NAME_COOKIE)?.value ?? shopDomain ?? "Shopify";

  const errorRedirect = NextResponse.redirect(redirectToIntegrations(request, "error"));
  errorRedirect.cookies.delete(OAUTH_STATE_COOKIE);
  errorRedirect.cookies.delete(STORE_NAME_COOKIE);

  if (!shopDomain || !code || !state) {
    return errorRedirect;
  }

  if (!verifyShopifyOAuthSignature(request.url) || state !== storedState) {
    return errorRedirect;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return errorRedirect;
  }

  let integrationId: string | null = null;

  try {
    const tokens = await exchangeShopifyCodeForToken(shopDomain, code);
    integrationId = await saveShopifyIntegration({
      userId: user.id,
      storeName,
      shopDomain,
      tokens,
    });

    await registerShopifyWebhooks(integrationId, request.nextUrl.origin);
    await syncShopifyOrders(integrationId);

    const successRedirect = NextResponse.redirect(redirectToIntegrations(request, "connected"));
    successRedirect.cookies.delete(OAUTH_STATE_COOKIE);
    successRedirect.cookies.delete(STORE_NAME_COOKIE);
    return successRedirect;
  } catch (error) {
    if (integrationId) {
      const message = error instanceof Error ? error.message : "Shopify connection failed";
      await markShopifyIntegrationError(integrationId, message);
    }

    return errorRedirect;
  }
}
