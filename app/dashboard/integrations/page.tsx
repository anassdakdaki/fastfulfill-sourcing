"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2, AlertCircle, RefreshCw, Plug, Key,
  Zap, ToggleLeft, ToggleRight, Loader2, X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  loadMyIntegrations,
  connectStore,
  disconnectStore,
  loadShopifyConnectSetup,
  syncStore,
  toggleAutoFulfill,
} from "@/app/actions/dashboard";
import { formatDate } from "@/lib/utils";
import type { StoreIntegration, IntegrationPlatform } from "@/types/database";

/* Platform meta */
const PLATFORM_META: Record<IntegrationPlatform, {
  name: string; description: string; logo: string;
  color: string; features: string[];
  urlPlaceholder: string;
}> = {
  shopify: {
    name: "Shopify", logo: "S",
    description: "Sync orders, auto-fulfill Shopify sales, update inventory in real-time.",
    color: "bg-green-50 border-green-200",
    urlPlaceholder: "mystore.myshopify.com",
    features: ["Auto-import orders", "Real-time inventory sync", "Auto-fulfill on sale", "Tracking push-back"],
  },
  woocommerce: {
    name: "WooCommerce", logo: "W",
    description: "Connect your WordPress store and automate order fulfillment.",
    color: "bg-purple-50 border-purple-200",
    urlPlaceholder: "mystore.com",
    features: ["Order import via REST API", "Product sync", "Fulfillment automation", "Status webhooks"],
  },
  amazon: {
    name: "Amazon Seller", logo: "A",
    description: "Link your Amazon Seller account for FBA prep and direct fulfillment.",
    color: "bg-yellow-50 border-yellow-200",
    urlPlaceholder: "amazon.com/seller/XXXXX",
    features: ["FBA shipment creation", "Multi-marketplace", "Inventory alerts", "Order routing"],
  },
  tiktok: {
    name: "TikTok Shop", logo: "T",
    description: "Fulfill TikTok Shop orders directly through FastFulfill.",
    color: "bg-pink-50 border-pink-200",
    urlPlaceholder: "shop.tiktok.com/@mystore",
    features: ["Order auto-import", "Fast fulfillment SLA", "Returns management", "Tracking sync"],
  },
  etsy: {
    name: "Etsy", logo: "E",
    description: "Source and fulfill your Etsy listings with custom packaging.",
    color: "bg-orange-50 border-orange-200",
    urlPlaceholder: "etsy.com/shop/mystore",
    features: ["Listing sync", "Custom packaging", "Order import", "Tracking updates"],
  },
};

const PLATFORMS  = Object.keys(PLATFORM_META) as IntegrationPlatform[];
const LIVE_PLATFORM: IntegrationPlatform = "shopify";

const SHOPIFY_CONNECT_REASON_COPY: Record<string, string> = {
  invalid_shopify_domain: "The Shopify domain is invalid. Use a domain like mystore.myshopify.com.",
  invalid_install_hmac: "Shopify reached FastFulfill with an invalid install signature before OAuth started.",
  missing_params: "Shopify returned without the required OAuth parameters. Start the connection again from FastFulfill.",
  invalid_hmac: "Shopify returned an invalid OAuth signature. This usually means the Shopify app secret is wrong in your environment.",
  state_mismatch: "The Shopify OAuth state expired or changed during the redirect. Start the connection again and finish it in the same browser tab.",
  unauthenticated: "You must be signed in with your real FastFulfill buyer account before connecting Shopify.",
  shopify_setup_invalid: "The Shopify app environment is incomplete or invalid. Check SHOPIFY_API_KEY, SHOPIFY_API_SECRET, and NEXT_PUBLIC_APP_URL.",
  token_exchange_failed: "Shopify rejected the token exchange. This usually means the app credentials are wrong or the callback URL in Shopify does not match this app.",
  integration_save_failed: "Shopify authorized the app, but FastFulfill could not save the store connection in Supabase.",
  webhook_registration_failed: "Shopify authorized the app, but FastFulfill could not register the live order webhooks for this store.",
  database_not_ready: "The Shopify database schema is still incomplete. Run the full Supabase migrations before connecting the store.",
  exception: "FastFulfill could not finish the Shopify install flow. Check the latest server logs for the exact failing step.",
};

const SHOPIFY_CONNECT_WARNING_COPY: Record<string, string> = {
  initial_sync_failed: "Shopify connected successfully, but the first historical order import failed. Live webhooks are registered. Use Sync Now after checking the store warning below.",
};

function StatusBadge({ status }: { status: StoreIntegration["status"] }) {
  if (status === "connected") return (
    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
      <CheckCircle2 size={11} /> Connected
    </span>
  );
  if (status === "syncing") return (
    <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
      <RefreshCw size={11} className="animate-spin" /> Syncing
    </span>
  );
  if (status === "error") return (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
      <AlertCircle size={11} /> Error
    </span>
  );
  return null;
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const [integrations, setIntegrations] = useState<StoreIntegration[]>([]);
  const [loading, setLoading]           = useState(true);
  const [shopifyConnectMode, setShopifyConnectMode] = useState<"one_click" | "manual">("manual");
  const [syncing, setSyncing]           = useState<string | null>(null);
  const [toggling, setToggling]         = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [actionError, setActionError]   = useState("");

  // Connect form state
  const [connectingPlatform, setConnectingPlatform] = useState<IntegrationPlatform | null>(null);
  const [connectForm, setConnectForm] = useState({ store_name: "", store_url: "" });
  const [connectSaving, setConnectSaving] = useState(false);
  const [connectError, setConnectError]   = useState("");

  async function refreshIntegrations() {
    const [{ data }, connectSetup] = await Promise.all([
      loadMyIntegrations(),
      loadShopifyConnectSetup(),
    ]);
    setIntegrations(data as StoreIntegration[]);
    setShopifyConnectMode(connectSetup.mode);
    setLoading(false);
  }

  useEffect(() => {
    refreshIntegrations();
  }, []);

  function getConnected(p: IntegrationPlatform) {
    return integrations.find((i) => i.platform === p && i.status !== "disconnected");
  }

  async function handleSync(id: string) {
    setSyncing(id);
    setActionError("");
    const { error } = await syncStore(id);
    await refreshIntegrations();
    if (error) setActionError(error);
    setSyncing(null);
  }

  async function handleDisconnect(id: string) {
    setDisconnecting(id);
    await disconnectStore(id);
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
    setDisconnecting(null);
  }

  async function handleToggleAutoFulfill(id: string, current: boolean) {
    setToggling(id);
    await toggleAutoFulfill(id, !current);
    setIntegrations((prev) =>
      prev.map((i) => i.id === id ? { ...i, auto_fulfill: !current } : i)
    );
    setToggling(null);
  }

  function openConnectForm(platform: IntegrationPlatform) {
    if (platform !== LIVE_PLATFORM) return;
    setConnectingPlatform(platform);
    setConnectForm({ store_name: "", store_url: "" });
    setConnectError("");
  }

  function openPendingPopup() {
    const popup = window.open("", "_blank", "popup=yes,width=1100,height=800");
    if (popup) {
      popup.document.write(
        "<!doctype html><title>Connecting Shopify...</title><body style=\"font-family:system-ui;padding:24px\">Redirecting to Shopify...</body>"
      );
    }
    return popup;
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!connectingPlatform) return;
    const popup = openPendingPopup();
    setConnectSaving(true);
    setConnectError("");

    try {
      const { error, redirectTo } = await connectStore({
        platform: connectingPlatform,
        store_name: connectForm.store_name,
        store_url: connectForm.store_url,
      });

      if (error) {
        if (popup) popup.close();
        setConnectError(error);
        setConnectSaving(false);
        return;
      }

      if (redirectTo) {
        if (popup) {
          popup.location.href = redirectTo;
        } else {
          window.location.assign(redirectTo);
        }
        setConnectSaving(false);
        setConnectingPlatform(null);
        return;
      }

      if (popup) popup.close();
      setConnectError("FastFulfill did not receive a Shopify install URL.");
      setConnectSaving(false);
    } catch (error) {
      if (popup) popup.close();
      setConnectError(error instanceof Error ? error.message : "Shopify connection failed before the redirect started.");
      setConnectSaving(false);
    }
  }

  async function handleDirectConnect(platform: IntegrationPlatform) {
    if (platform !== LIVE_PLATFORM) return;
    const popup = openPendingPopup();
    setConnectSaving(true);
    setConnectError("");

    try {
      const { error, redirectTo } = await connectStore({
        platform,
      });

      if (error) {
        if (popup) popup.close();
        setConnectError(error);
        setConnectSaving(false);
        return;
      }

      if (redirectTo) {
        if (popup) {
          popup.location.href = redirectTo;
        } else {
          window.location.assign(redirectTo);
        }
        setConnectSaving(false);
        return;
      }

      if (popup) popup.close();
      setConnectError("FastFulfill did not receive a Shopify install URL.");
      setConnectSaving(false);
    } catch (error) {
      if (popup) popup.close();
      setConnectError(error instanceof Error ? error.message : "Shopify connection failed before the redirect started.");
      setConnectSaving(false);
    }
  }

  const connectedCount = integrations.length;
  const oauthStatus = searchParams.get("shopify");
  const oauthReason = searchParams.get("reason") ?? searchParams.get("integration_error") ?? "";
  const oauthWarning = searchParams.get("warning") ?? "";
  const oauthStep = searchParams.get("step") ?? "";
  const oauthDetail = searchParams.get("detail") ?? "";
  const hasOauthError = oauthStatus === "error" || Boolean(searchParams.get("integration_error"));
  const oauthErrorMessage =
    SHOPIFY_CONNECT_REASON_COPY[oauthReason] ??
    "FastFulfill could not finish the Shopify install flow. Check your Shopify app credentials, callback URL, and Supabase setup, then try again.";
  const oauthWarningMessage = SHOPIFY_CONNECT_WARNING_COPY[oauthWarning] ?? "";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Connect Shopify and automate your store operation.
          </p>
        </div>
        <Link href="/dashboard/integrations/api">
          <Button variant="outline" size="sm">
            <Key size={15} /> API & Webhooks
          </Button>
        </Link>
      </div>

      {oauthStatus === "connected" && !oauthWarning && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
          <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">Shopify store connected</p>
            <p className="text-xs text-green-700 mt-1">
              OAuth completed, webhooks were registered, and your recent Shopify orders were imported into FastFulfill.
            </p>
          </div>
        </div>
      )}

      {oauthStatus === "connected" && oauthWarning && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Shopify connected with a warning</p>
            <p className="text-xs text-amber-700 mt-1">
              {oauthWarningMessage}
              <span className="ml-1 font-mono bg-amber-100 px-1 rounded">({oauthWarning})</span>
            </p>
            {(oauthStep || oauthDetail) && (
              <div className="mt-2 space-y-1">
                {oauthStep && (
                  <p className="text-[11px] text-amber-800">
                    Step:
                    <span className="ml-1 font-mono bg-amber-100 px-1 rounded">{oauthStep}</span>
                  </p>
                )}
                {oauthDetail && (
                  <p className="text-[11px] text-amber-800 break-words">
                    Detail:
                    <span className="ml-1 font-mono bg-amber-100 px-1 rounded">{oauthDetail}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {hasOauthError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Shopify connection failed</p>
            <p className="text-xs text-red-700 mt-1">
              {oauthErrorMessage}
              {oauthReason && (
                <span className="ml-1 font-mono bg-red-100 px-1 rounded">({oauthReason})</span>
              )}
            </p>
            {(oauthStep || oauthDetail) && (
              <div className="mt-2 space-y-1">
                {oauthStep && (
                  <p className="text-[11px] text-red-800">
                    Step:
                    <span className="ml-1 font-mono bg-red-100 px-1 rounded">{oauthStep}</span>
                  </p>
                )}
                {oauthDetail && (
                  <p className="text-[11px] text-red-800 break-words">
                    Detail:
                    <span className="ml-1 font-mono bg-red-100 px-1 rounded">{oauthDetail}</span>
                  </p>
                )}
              </div>
            )}
            {oauthReason === "unauthenticated" && (
              <p className="text-xs text-red-700 mt-2">
                Please <a href="/auth/login" className="underline font-semibold">sign in</a> with your buyer account and then start the Shopify connection again.
              </p>
            )}
          </div>
        </div>
      )}

      {actionError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Sync failed</p>
            <p className="text-xs text-red-700 mt-1">{actionError}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
      SECTION 1 STORE INTEGRATIONS
         ══════════════════════════════════ */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Plug size={18} className="text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Store Integrations</h2>
          {connectedCount > 0 && (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={11} /> {connectedCount} connected
            </span>
          )}
        </div>

        {!loading && connectedCount === 0 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">No store connected yet</p>
              <p className="text-xs text-amber-700 mt-1">
                Connect Shopify below to enable live order sync, automatic fulfillment, and sourcing requests.
              </p>
            </div>
          </div>
        )}

      {/* Stats banner only when connected */}
        {!loading && connectedCount > 0 && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium text-brand-600 uppercase tracking-wider">Connected Stores</p>
              <p className="text-2xl font-bold text-brand-900 mt-0.5">{connectedCount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-brand-600 uppercase tracking-wider">Orders Synced</p>
              <p className="text-2xl font-bold text-brand-900 mt-0.5">
                {integrations.reduce((s, i) => s + i.orders_synced, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-brand-600 uppercase tracking-wider">Auto-Fulfill Active</p>
              <p className="text-2xl font-bold text-brand-900 mt-0.5">
                {integrations.filter((i) => i.auto_fulfill).length}
              </p>
            </div>
          </div>
        )}

        {/* Connected stores */}
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading integrations...
          </div>
        ) : (
          <div className="space-y-3">
            {integrations.map((integration) => {
              const meta       = PLATFORM_META[integration.platform];
              const isSyncing  = syncing === integration.id;
              const isTogg     = toggling === integration.id;
              const isDisconn  = disconnecting === integration.id;
              return (
                <div key={integration.id} className={`rounded-2xl border p-5 ${meta.color}`}>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-base font-bold text-brand-700">
                        {meta.logo}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900">{meta.name}</h3>
                          <StatusBadge status={isSyncing ? "syncing" : integration.status} />
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {integration.store_name} / {integration.store_url}
                        </p>
                        {integration.error_message && (
                          <p className="text-xs text-red-600 mt-1">{integration.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handleSync(integration.id)} disabled={isSyncing}>
                        <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => handleDisconnect(integration.id)}
                        disabled={isDisconn}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        {isDisconn ? <Loader2 size={13} className="animate-spin" /> : null}
                        Disconnect
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/70 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500">Orders Synced</p>
                      <p className="text-lg font-bold text-gray-900">{integration.orders_synced}</p>
                    </div>
                    <div className="bg-white/70 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500">Products Mapped</p>
                      <p className="text-lg font-bold text-gray-900">{integration.products_mapped}</p>
                    </div>
                    <div className="bg-white/70 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500">Last Sync</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {integration.last_sync ? formatDate(integration.last_sync) : "Never"}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">Auto-Fulfill</p>
                      <button
                        onClick={() => handleToggleAutoFulfill(integration.id, integration.auto_fulfill)}
                        disabled={isTogg}
                        className="flex items-center gap-1.5 text-sm font-semibold"
                      >
                        {integration.auto_fulfill ? (
                          <><ToggleRight size={20} className="text-brand-600" /><span className="text-brand-600">On</span></>
                        ) : (
                          <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-500">Off</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Available platforms */}
        {!loading && (
          <div>
            {connectedCount > 0 && (
              <p className="text-xs font-medium text-gray-500 mb-3">Add more stores</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {PLATFORMS.filter((p) => !getConnected(p)).map((platform) => {
                const meta      = PLATFORM_META[platform];
                const isOpening = connectingPlatform === platform;
                const isLive    = platform === LIVE_PLATFORM;
                const isOneClickShopify = platform === LIVE_PLATFORM && shopifyConnectMode === "one_click";
                return (
                  <div key={platform} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-base font-bold text-brand-700">
                        {meta.logo}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1">{meta.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{meta.description}</p>
                    <ul className="space-y-1.5 mb-5">
                      {meta.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 size={12} className="text-green-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>

                    {/* Inline connect form */}
                    {isOpening ? (
                      <form onSubmit={handleConnect} className="space-y-3 border-t border-gray-100 pt-4">
                        <div>
                          <label className="text-xs font-medium text-gray-700">Store Name</label>
                          <input
                            required
                            placeholder="e.g. My Main Store"
                            value={connectForm.store_name}
                            onChange={(e) => setConnectForm({ ...connectForm, store_name: e.target.value })}
                            className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700">Store URL</label>
                          <input
                            required
                            placeholder={meta.urlPlaceholder}
                            value={connectForm.store_url}
                            onChange={(e) => setConnectForm({ ...connectForm, store_url: e.target.value })}
                            className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                          />
                        </div>
                        {connectError && (
                          <p className="text-xs text-red-600">{connectError}</p>
                        )}
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={connectSaving} className="flex-1">
                            {connectSaving ? <Loader2 size={13} className="animate-spin" /> : <Plug size={13} />}
                          {connectSaving ? "Connecting..." : "Connect"}
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setConnectingPlatform(null)}>
                            <X size={13} />
                          </Button>
                        </div>
                      </form>
                    ) : isOneClickShopify ? (
                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        <p className="text-xs text-gray-500">
                          One-click install is enabled. Shopify will identify the store from the official install link, so the merchant does not need to type a store domain here.
                        </p>
                        {connectError && (
                          <p className="text-xs text-red-600">{connectError}</p>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDirectConnect(platform)}
                          disabled={connectSaving}
                        >
                          {connectSaving ? <Loader2 size={13} className="animate-spin" /> : <Plug size={13} />}
                          {connectSaving ? "Redirecting..." : `Connect ${meta.name}`}
                        </Button>
                      </div>
                    ) : !isLive ? (
                      <Button size="sm" variant="outline" className="w-full cursor-not-allowed opacity-70" disabled>
                        Available soon
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => openConnectForm(platform)}>
                        <Plug size={13} /> Connect {meta.name}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Full flow explainer */}
      <section className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={15} className="text-brand-600" /> Full Automated Flow
        </h2>
        <div className="flex flex-wrap items-start gap-2">
          {[
            { n: "1", title: "Store order comes in",       sub: "Shopify" },
            { n: ">" },
            { n: "2", title: "FastFulfill receives it",    sub: "Auto-imported via store integration" },
            { n: ">" },
            { n: "3", title: "Warehouse team fulfills",    sub: "From your stored warehouse stock" },
            { n: ">" },
            { n: "4", title: "Tracking synced back",       sub: "To FastFulfill and your store" },
          ].map((s, i) =>
            s.title ? (
              <div key={i} className="text-center">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mx-auto">
                  {s.n}
                </div>
                <p className="text-xs font-semibold text-gray-900 mt-1 max-w-[90px]">{s.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 max-w-[90px]">{s.sub}</p>
              </div>
            ) : (
              <div key={i} className="text-gray-300 font-bold text-xl pb-6 self-start pt-2">{s.n}</div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
