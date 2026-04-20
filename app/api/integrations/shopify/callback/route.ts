import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  classifyShopifyConnectError,
  exchangeShopifyCodeForToken,
  loadPendingShopifyInstall,
  markShopifyIntegrationConnected,
  markShopifyIntegrationError,
  normalizeShopDomain,
  parseShopifyOAuthState,
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

function buildNavigationResponse(
  targetUrl: URL,
  options: {
    title: string;
    message: string;
    closePopup?: boolean;
  }
) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${options.title}</title>
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
        width: min(92vw, 34rem);
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
      <h1>${options.title}</h1>
      <p>${options.message}</p>
      <p>If nothing happens, <a href="${targetUrl.toString()}">continue to FastFulfill</a>.</p>
    </main>
    <script>
      (function () {
        var target = ${JSON.stringify(targetUrl.toString())};
        var shouldClosePopup = ${options.closePopup ? "true" : "false"};

        try {
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.location.replace(target);
              if (shouldClosePopup) {
                window.close();
                return;
              }
            } catch (error) {}
          }

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
  const response = buildNavigationResponse(
    redirectToIntegrations(request, "error", { reason, step, detail }),
    {
      title: "Shopify connection failed",
      message: "FastFulfill is sending you back to the integrations page with the exact error details.",
      closePopup: true,
    }
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
  const response = buildNavigationResponse(
    redirectToIntegrations(
      request,
      "connected",
      warning || step || detail ? { warning, step, detail } : undefined
    ),
    {
      title: warning ? "Shopify connected with warnings" : "Shopify connected",
      message: warning
        ? "FastFulfill connected the store and is returning you to the integrations page with the warning details."
        : "FastFulfill connected the Shopify store and is returning you to the integrations page.",
      closePopup: true,
    }
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
  const signedState = state ? parseShopifyOAuthState(state) : null;
  const storeName =
    request.cookies.get(STORE_NAME_COOKIE)?.value ??
    signedState?.storeName ??
    shopDomain ??
    "Shopify";

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
  const stateOk = storedState ? state === storedState : Boolean(signedState);

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

  let effectiveUserId = user?.id ?? signedState?.userId ?? null;
  let effectiveStoreName = storeName;
  let db: SupabaseClient = supabase;

  if (!effectiveUserId && shopDomain) {
    try {
      const pendingInstall = await loadPendingShopifyInstall(shopDomain);
      if (pendingInstall?.user_id) {
        effectiveUserId = pendingInstall.user_id;
        effectiveStoreName = pendingInstall.store_name || effectiveStoreName;
        console.log(
          "[shopify-callback] recovered pending install shop=%s integration=%s user=%s",
          shopDomain,
          pendingInstall.id,
          pendingInstall.user_id
        );
      }
    } catch (error) {
      console.error("[shopify-callback] pending install lookup failed", error);
    }
  }

  if (!user && effectiveUserId) {
    try {
      db = createAdminClient();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Missing Supabase admin client configuration";
      return buildErrorRedirect(
        request,
        "unauthenticated",
        "session_lookup",
        detail
      );
    }
  }

  console.log(
    "[shopify-callback] user=%s effectiveUserId=%s",
    user?.id ?? "null",
    effectiveUserId ?? "null"
  );

  if (!effectiveUserId) {
    return buildErrorRedirect(
      request,
      "unauthenticated",
      "session_lookup",
      "No signed-in FastFulfill buyer session or recoverable OAuth user state was available in the Shopify callback."
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
    integrationId = await saveShopifyIntegration(db, {
      userId: effectiveUserId,
      storeName: effectiveStoreName,
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

  console.log(
    "[shopify-callback] integration saved shop=%s integration=%s user=%s",
    shopDomain,
    integrationId,
    effectiveUserId
  );

  let webhookBaseUrl: string;
  try {
    webhookBaseUrl = resolveShopifyWebhookBaseUrl(request.nextUrl.origin);
  } catch (error) {
    const classified = classifyShopifyConnectError(error);
    console.error("[shopify-callback] webhook base URL failed:", classified.message);
    await markShopifyIntegrationError(db, integrationId, classified.message);
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
    await markShopifyIntegrationError(db, integrationId, classified.message);
    return buildErrorRedirect(
      request,
      classified.reason,
      "webhook_registration",
      sanitizeShopifyDiagnosticMessage(classified.message)
    );
  }

  try {
    const syncResult = await syncShopifyOrders(db, integrationId);
    console.log(
      "[shopify-callback] initial sync completed integration=%s imported=%s total=%s",
      integrationId,
      syncResult.importedOrders,
      syncResult.totalOrders
    );
  } catch (error) {
    const classified = classifyShopifyConnectError(error);
    console.error("[shopify-callback] initial sync failed:", classified.message);

    if (classified.reason === "database_not_ready") {
      await markShopifyIntegrationError(db, integrationId, classified.message);
      return buildErrorRedirect(
        request,
        classified.reason,
        "initial_sync",
        sanitizeShopifyDiagnosticMessage(classified.message)
      );
    }

    await markShopifyIntegrationConnected(
      db,
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
