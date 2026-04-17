"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, AlertCircle, RefreshCw, Plug, Key,
  Zap, ArrowRight, ToggleLeft, ToggleRight, Warehouse,
  Truck, Package, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DUMMY_INTEGRATIONS } from "@/lib/dummy-data";
import { formatDate } from "@/lib/utils";
import type { StoreIntegration, IntegrationPlatform } from "@/types/database";

/* ─── Store integration meta ─── */
const PLATFORM_META: Record<IntegrationPlatform, {
  name: string; description: string; logo: string;
  color: string; setupPath: string; features: string[];
}> = {
  shopify: {
    name: "Shopify", logo: "🛍️",
    description: "Sync orders, auto-fulfill Shopify sales, update inventory in real-time.",
    color: "bg-green-50 border-green-200",
    setupPath: "/dashboard/integrations/shopify",
    features: ["Auto-import orders", "Real-time inventory sync", "Auto-fulfill on sale", "Tracking push-back"],
  },
  woocommerce: {
    name: "WooCommerce", logo: "🛒",
    description: "Connect your WordPress store and automate order fulfillment.",
    color: "bg-purple-50 border-purple-200",
    setupPath: "/dashboard/integrations/woocommerce",
    features: ["Order import via REST API", "Product sync", "Fulfillment automation", "Status webhooks"],
  },
  amazon: {
    name: "Amazon Seller", logo: "📦",
    description: "Link your Amazon Seller account for FBA prep and direct fulfillment.",
    color: "bg-yellow-50 border-yellow-200",
    setupPath: "/dashboard/integrations/amazon",
    features: ["FBA shipment creation", "Multi-marketplace", "Inventory alerts", "Order routing"],
  },
  tiktok: {
    name: "TikTok Shop", logo: "🎵",
    description: "Fulfill TikTok Shop orders directly through FastFulfill.",
    color: "bg-pink-50 border-pink-200",
    setupPath: "/dashboard/integrations/tiktok",
    features: ["Order auto-import", "Fast fulfillment SLA", "Returns management", "Tracking sync"],
  },
  etsy: {
    name: "Etsy", logo: "🎨",
    description: "Source and fulfill your Etsy listings with custom packaging.",
    color: "bg-orange-50 border-orange-200",
    setupPath: "/dashboard/integrations/etsy",
    features: ["Listing sync", "Custom packaging", "Order import", "Tracking updates"],
  },
};

/* ─── 3PL / Fulfillment partner meta ─── */
type ThreePLId = "shipbob" | "shipstation" | "easyship" | "dhl";

const THREE_PL_META: Record<ThreePLId, {
  name: string; logo: string; tagline: string;
  color: string; accentColor: string; setupPath: string;
  bestFor: string; apiAvailable: boolean;
  features: string[];
}> = {
  shipbob: {
    name: "ShipBob", logo: "📬",
    tagline: "US, EU, Canada, Australia warehouses",
    color: "bg-blue-50 border-blue-200", accentColor: "#2563eb",
    setupPath: "/dashboard/integrations/shipbob",
    bestFor: "Ideal for US/EU sellers — largest 3PL network with full REST API",
    apiAvailable: true,
    features: [
      "Auto-forward orders on receipt",
      "Real-time inventory at warehouse",
      "Tracking auto-synced back",
      "Multi-warehouse routing",
      "Returns management",
    ],
  },
  shipstation: {
    name: "ShipStation", logo: "🚢",
    tagline: "Connects 70+ carriers — USPS, FedEx, UPS, DHL",
    color: "bg-indigo-50 border-indigo-200", accentColor: "#4338ca",
    setupPath: "/dashboard/integrations/shipstation",
    bestFor: "Best if you use multiple carriers or your own warehouse staff",
    apiAvailable: true,
    features: [
      "Generate labels for 70+ carriers",
      "Batch fulfill multiple orders",
      "Branded packing slips",
      "Automatic tracking updates",
      "Rate shopping across carriers",
    ],
  },
  easyship: {
    name: "Easyship", logo: "✈️",
    tagline: "International shipping — strong for Asia → World",
    color: "bg-cyan-50 border-cyan-200", accentColor: "#0891b2",
    setupPath: "/dashboard/integrations/easyship",
    bestFor: "Best for cross-border — especially sourcing from China/Asia",
    apiAvailable: true,
    features: [
      "DDP (Duties Delivered Paid) pricing",
      "250+ courier options",
      "Asia-origin optimised routing",
      "Live rate comparison",
      "Automated customs docs",
    ],
  },
  dhl: {
    name: "DHL eCommerce", logo: "🟡",
    tagline: "Global network — 220+ countries",
    color: "bg-yellow-50 border-yellow-200", accentColor: "#d97706",
    setupPath: "/dashboard/integrations/dhl",
    bestFor: "Best for high-volume international, especially EU and Asia",
    apiAvailable: true,
    features: [
      "Global last-mile delivery",
      "China Preferred Partner",
      "Landed cost calculator",
      "Parcel tracking API",
      "Pickup scheduling",
    ],
  },
};

const PLATFORMS = Object.keys(PLATFORM_META) as IntegrationPlatform[];
const THREE_PLS  = Object.keys(THREE_PL_META) as ThreePLId[];

/* ─── Dummy connected 3PLs (demo) ─── */
type Connected3PL = { id: ThreePLId; warehouseRegion: string; autoRoute: boolean; ordersRouted: number; connectedAt: string };
const DEMO_3PL: Connected3PL = {
  id: "shipbob", warehouseRegion: "US East", autoRoute: true,
  ordersRouted: 87, connectedAt: "2025-11-01T00:00:00Z",
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
  const [integrations, setIntegrations] = useState<StoreIntegration[]>(DUMMY_INTEGRATIONS);
  const [syncing, setSyncing]           = useState<string | null>(null);
  const [connected3pl, setConnected3pl] = useState<Connected3PL | null>(DEMO_3PL);

  function getConnected(p: IntegrationPlatform) {
    return integrations.find((i) => i.platform === p);
  }

  async function handleSync(id: string) {
    setSyncing(id);
    await new Promise((r) => setTimeout(r, 1800));
    setIntegrations(integrations.map((i) =>
      i.id === id ? { ...i, last_sync: new Date().toISOString(), orders_synced: i.orders_synced + 2 } : i
    ));
    setSyncing(null);
  }

  function handleDisconnect(id: string) {
    setIntegrations(integrations.filter((i) => i.id !== id));
  }

  function toggleAutoFulfill(id: string) {
    setIntegrations(integrations.map((i) =>
      i.id === id ? { ...i, auto_fulfill: !i.auto_fulfill } : i
    ));
  }

  const connectedCount = integrations.length;
  const meta3pl = connected3pl ? THREE_PL_META[connected3pl.id] : null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Connect your stores and fulfillment partners to automate your entire operation.
          </p>
        </div>
        <Link href="/dashboard/integrations/api">
          <Button variant="outline" size="sm">
            <Key size={15} /> API & Webhooks
          </Button>
        </Link>
      </div>

      {/* ══════════════════════════════════
          SECTION 1 — FULFILLMENT PARTNERS
         ══════════════════════════════════ */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Warehouse size={18} className="text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Fulfillment Partners (3PL)</h2>
          {connected3pl && (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={11} /> 1 connected
            </span>
          )}
        </div>

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-sm text-blue-900">
          <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
          <div>
            <p className="font-semibold">How 3PL fulfillment works with FastFulfill</p>
            <p className="text-xs text-blue-800 mt-1">
              After your client confirms a quote, you bulk-order the stock and send it to your 3PL
              partner&apos;s warehouse. When your client gets an order on their store, FastFulfill
              automatically forwards it to the 3PL via API — they pick, pack and ship it. Tracking
              comes back to you and your client automatically. Your client never knows the 3PL exists.
            </p>
          </div>
        </div>

        {/* Connected 3PL */}
        {connected3pl && meta3pl && (
          <div className={`rounded-2xl border p-5 ${meta3pl.color}`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{meta3pl.logo}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900">{meta3pl.name}</h3>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={11} /> Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{connected3pl.warehouseRegion} Warehouse</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={meta3pl.setupPath}>
                  <Button size="sm" variant="outline">Settings</Button>
                </Link>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => setConnected3pl(null)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/70 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">Orders Routed</p>
                <p className="text-lg font-bold text-gray-900">{connected3pl.ordersRouted}</p>
              </div>
              <div className="bg-white/70 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">Warehouse</p>
                <p className="text-sm font-semibold text-gray-900">{connected3pl.warehouseRegion}</p>
              </div>
              <div className="bg-white/70 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">Connected</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(connected3pl.connectedAt)}</p>
              </div>
              <div className="bg-white/70 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Auto-Route Orders</p>
                <button
                  onClick={() => setConnected3pl(prev => prev ? { ...prev, autoRoute: !prev.autoRoute } : null)}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                >
                  {connected3pl.autoRoute ? (
                    <><ToggleRight size={20} className="text-brand-600" /><span className="text-brand-600">On</span></>
                  ) : (
                    <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-500">Off</span></>
                  )}
                </button>
              </div>
            </div>

            {connected3pl.autoRoute && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-800 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <Zap size={13} className="text-green-600 shrink-0" />
                <span>
                  <strong>Auto-route active</strong> — new fulfillment orders are automatically sent
                  to {meta3pl.name} without any manual action required.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Available 3PLs */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-3">
            {connected3pl ? "Other fulfillment partners" : "Choose a fulfillment partner"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THREE_PLS.filter(id => !connected3pl || connected3pl.id !== id).map((id) => {
              const p = THREE_PL_META[id];
              return (
                <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{p.logo}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                        {p.apiAvailable && (
                          <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                            Full API
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{p.tagline}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 bg-gray-50 rounded-xl px-3 py-2 italic">
                    {p.bestFor}
                  </p>
                  <ul className="space-y-1 mb-4">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={11} className="text-green-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.setupPath}>
                    <Button size="sm" className="w-full">
                      <Truck size={13} /> Connect {p.name}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual workflow fallback */}
        {!connected3pl && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Package size={18} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Not ready to connect a 3PL yet?</p>
                <p className="text-xs text-gray-500 mt-1">
                  You can still manage fulfillment manually. Go to <strong>Fulfillment Orders</strong> in
                  the Fulfillment Portal to view orders, update status, and add tracking numbers. Connect
                  a 3PL partner when you&apos;re ready to automate.
                </p>
                <div className="flex gap-3 mt-3">
                  <Link href="/supplier/orders">
                    <Button size="sm" variant="outline">
                      Open Fulfillment Orders <ArrowRight size={13} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════
          SECTION 2 — STORE INTEGRATIONS
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

        {/* Stats banner */}
        {connectedCount > 0 && (
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
        {connectedCount > 0 && (
          <div className="space-y-3">
            {integrations.map((integration) => {
              const meta = PLATFORM_META[integration.platform];
              const isSyncing = syncing === integration.id;
              return (
                <div key={integration.id} className={`rounded-2xl border p-5 ${meta.color}`}>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{meta.logo}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900">{meta.name}</h3>
                          <StatusBadge status={isSyncing ? "syncing" : integration.status} />
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{integration.store_url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handleSync(integration.id)} disabled={isSyncing}>
                        <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Link href={meta.setupPath}><Button size="sm" variant="outline">Settings</Button></Link>
                      <Button size="sm" variant="ghost" onClick={() => handleDisconnect(integration.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
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
                      <button onClick={() => toggleAutoFulfill(integration.id)} className="flex items-center gap-1.5 text-sm font-semibold">
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

        {/* Available stores */}
        <div>
          {connectedCount > 0 && (
            <p className="text-xs font-medium text-gray-500 mb-3">Add more stores</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {PLATFORMS.filter((p) => !getConnected(p)).map((platform) => {
              const meta = PLATFORM_META[platform];
              return (
                <div key={platform} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{meta.logo}</span>
                    <h3 className="text-base font-bold text-gray-900">{meta.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{meta.description}</p>
                  <ul className="space-y-1.5 mb-5">
                    {meta.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={12} className="text-green-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={meta.setupPath}>
                    <Button size="sm" className="w-full"><Plug size={13} /> Connect {meta.name}</Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 3 — FULL FLOW EXPLAINER
         ══════════════════════════════════ */}
      <section className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={15} className="text-brand-600" /> Full Automated Flow
        </h2>
        <div className="flex flex-wrap items-start gap-2">
          {[
            { n: "1", title: "Store order comes in",       sub: "Shopify / WooCommerce / Amazon / TikTok" },
            { n: "→" },
            { n: "2", title: "FastFulfill receives it",    sub: "Auto-imported via store integration" },
            { n: "→" },
            { n: "3", title: "Routed to 3PL",              sub: "ShipBob / ShipStation / Easyship" },
            { n: "→" },
            { n: "4", title: "3PL picks & ships",          sub: "From your stored warehouse stock" },
            { n: "→" },
            { n: "5", title: "Tracking synced back",       sub: "To FastFulfill and your store" },
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
