import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildShopifyInstallUrl,
  createShopifyOAuthState,
  loadPendingShopifyInstall,
  normalizeShopDomain,
  resolveShopifyInstallUrl,
  resolveShopifyWebhookBaseUrl,
  validateShopifyConfiguration,
  verifyShopifyOAuthSignature,
} from "@/lib/shopify";

const OAUTH_STATE_COOKIE = "ff_shopify_oauth_state";
const STORE_NAME_COOKIE = "ff_shopify_store_name";
const TOP_LEVEL_PARAM = "_ff_shopify_top";

function buildTopLevelEscapeResponse(request: NextRequest) {
  const breakoutUrl = new URL(request.url);
  breakoutUrl.searchParams.set(TOP_LEVEL_PARAM, "1");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to FastFulfill...</title>
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f8fafc;
        color: #0f172a;
      }
      main {
        width: min(92vw, 32rem);
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      }
      p { margin: 0.75rem 0 0; line-height: 1.5; color: #475569; }
      a { color: #4f46e5; font-weight: 600; }
    </style>
  </head>
  <body>
    <main>
      <h1>Continuing Shopify connection...</h1>
      <p>FastFulfill is moving this install flow out of the Shopify admin frame so the OAuth redirect can complete correctly.</p>
      <p>If nothing happens, <a href="${breakoutUrl.toString()}">continue here</a>.</p>
    </main>
    <script>
      (function () {
        var target = ${JSON.stringify(breakoutUrl.toString())};
        try {
          if (window.top && window.top !== window) {
            window.top.location.replace(target);
            return;
          }
        } catch (error) {}
        window.location.replace(target);
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shopDomain = normalizeShopDomain(searchParams.get("shop") ?? "");
  const storeName = (searchParams.get("store_name") ?? "").trim();
  const config = validateShopifyConfiguration();
  const hasHmac = searchParams.has("hmac");
  const isEmbedded = searchParams.get("embedded") === "1";
  const isTopLevelRetry = searchParams.get(TOP_LEVEL_PARAM) === "1";

  if (!shopDomain) {
    return NextResponse.redirect(new URL("/dashboard/integrations?integration_error=invalid_shopify_domain", request.url));
  }

  if (!config.ok) {
    return NextResponse.redirect(new URL("/dashboard/integrations?shopify=error&reason=shopify_setup_invalid&step=install_request", request.url));
  }

  if (hasHmac && !verifyShopifyOAuthSignature(request.url)) {
    return NextResponse.redirect(new URL("/dashboard/integrations?shopify=error&reason=invalid_install_hmac&step=install_request", request.url));
  }

  if (isEmbedded && !isTopLevelRetry) {
    console.log("[shopify-install] shop=%s embedded=1 escaping iframe before OAuth redirect", shopDomain);
    return buildTopLevelEscapeResponse(request);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let effectiveUserId = user?.id;
  let effectiveStoreName = storeName || shopDomain;

  if (!effectiveUserId) {
    if (!resolveShopifyInstallUrl()) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirectTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      loginUrl.searchParams.set("message", "connect_shopify");
      return NextResponse.redirect(loginUrl);
    }

    try {
      const pendingInstall = await loadPendingShopifyInstall(shopDomain);
      if (pendingInstall?.user_id) {
        effectiveUserId = pendingInstall.user_id;
        effectiveStoreName = pendingInstall.store_name || effectiveStoreName;
        console.log(
          "[shopify-install] recovered pending install shop=%s integration=%s user=%s",
          shopDomain,
          pendingInstall.id,
          pendingInstall.user_id
        );
      }
    } catch (error) {
      console.error("[shopify-install] pending install lookup failed", error);
      try {
        createAdminClient();
      } catch {
        return NextResponse.redirect(new URL("/dashboard/integrations?shopify=error&reason=shopify_setup_invalid&step=install_request&detail=Missing%20Supabase%20service%20role%20for%20pending%20Shopify%20install%20lookup", request.url));
      }
    }
  }

  console.log(
    "[shopify-install] shop=%s user=%s effectiveUser=%s embedded=%s topLevelRetry=%s",
    shopDomain,
    user?.id ?? "null",
    effectiveUserId ?? "null",
    isEmbedded,
    isTopLevelRetry
  );

  const state = createShopifyOAuthState({
    userId: effectiveUserId,
    storeName: effectiveStoreName,
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
