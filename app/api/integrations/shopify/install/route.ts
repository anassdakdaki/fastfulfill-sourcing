import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildShopifyInstallUrl,
  createShopifyOAuthState,
  normalizeShopDomain,
  resolveShopifyWebhookBaseUrl,
  validateShopifyConfiguration,
  verifyShopifyOAuthSignature,
} from "@/lib/shopify";

const OAUTH_STATE_COOKIE = "ff_shopify_oauth_state";
const STORE_NAME_COOKIE = "ff_shopify_store_name";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shopDomain = normalizeShopDomain(searchParams.get("shop") ?? "");
  const storeName = (searchParams.get("store_name") ?? "").trim();
  const config = validateShopifyConfiguration();
  const hasHmac = searchParams.has("hmac");

  if (!shopDomain) {
    return NextResponse.redirect(new URL("/dashboard/integrations?integration_error=invalid_shopify_domain", request.url));
  }

  if (!config.ok) {
    return NextResponse.redirect(new URL("/dashboard/integrations?shopify=error&reason=shopify_setup_invalid&step=install_request", request.url));
  }

  if (hasHmac && !verifyShopifyOAuthSignature(request.url)) {
    return NextResponse.redirect(new URL("/dashboard/integrations?shopify=error&reason=invalid_install_hmac&step=install_request", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const state = createShopifyOAuthState({
    userId: user?.id,
    storeName: storeName || shopDomain,
  });
  const callbackBaseUrl = resolveShopifyWebhookBaseUrl(request.nextUrl.origin);
  const callbackUrl = new URL("/api/integrations/shopify/callback", callbackBaseUrl).toString();
  let installUrl: string;

  try {
    installUrl = buildShopifyInstallUrl(shopDomain, callbackUrl, state);
  } catch (error) {
    console.error("[shopify-install] failed to build install URL", error);
    return NextResponse.redirect(new URL("/dashboard/integrations?shopify=error&reason=shopify_setup_invalid&step=install_request", request.url));
  }

  const response = NextResponse.redirect(installUrl);

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  });

  response.cookies.set(STORE_NAME_COOKIE, storeName || shopDomain, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
