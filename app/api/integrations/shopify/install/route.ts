import { NextRequest, NextResponse } from "next/server";
import {
  buildShopifyInstallUrl,
  createShopifyOAuthState,
  normalizeShopDomain,
} from "@/lib/shopify";

const OAUTH_STATE_COOKIE = "ff_shopify_oauth_state";
const STORE_NAME_COOKIE = "ff_shopify_store_name";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shopDomain = normalizeShopDomain(searchParams.get("shop") ?? "");
  const storeName = (searchParams.get("store_name") ?? "").trim();

  if (!shopDomain) {
    return NextResponse.redirect(new URL("/dashboard/integrations?integration_error=invalid_shopify_domain", request.url));
  }

  const state = createShopifyOAuthState();
  const callbackUrl = new URL("/api/integrations/shopify/callback", request.url).toString();
  const installUrl = buildShopifyInstallUrl(shopDomain, callbackUrl, state);
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
