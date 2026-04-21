"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Download, Upload, ClipboardList, CheckCircle2, X, Info, Loader2, Printer, MapPin, User } from "lucide-react";
import type { FulfillmentQueueOrder, FulfillmentQueueStatus } from "@/types/database";
import {
  loadFulfillmentQueue,
  packOrder,
  shipOrder,
  markDelivered,
  bulkImportTracking,
} from "@/app/actions/fulfillment";

type FilterTab = "all" | FulfillmentQueueStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "packed",    label: "Packed"    },
  { key: "shipped",   label: "Shipped"   },
  { key: "delivered", label: "Delivered" },
];

const STATUS_BADGE: Record<FulfillmentQueueStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  packed:    "bg-blue-100 text-blue-700",
  shipped:   "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-500",
};

function escapeCSV(val: string | number | null): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function OrdersQueuePage() {
  const [orders, setOrders]           = useState<FulfillmentQueueOrder[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<FilterTab>("all");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [importSuccess, setImportSuccess]   = useState<string | null>(null);
  const [acting, setActing]           = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFulfillmentQueue().then(({ data }) => {
      setOrders(data as FulfillmentQueueOrder[]);
      setLoading(false);
    });
  }, []);

  const counts = useMemo(() => ({
    all:       orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    packed:    orders.filter((o) => o.status === "packed").length,
    shipped:   orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }), [orders]);

  const filtered = useMemo(
    () => filter === "all" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  // Actions
  async function handlePack(id: string) {
    setActing(id);
    const { error } = await packOrder(id);
    if (!error) setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "packed" } : o));
    setActing(null);
  }

  async function handleShipped(id: string) {
    const tracking = trackingInputs[id]?.trim();
    if (!tracking) return;
    setActing(id);
    const { error } = await shipOrder(id, tracking);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: "shipped", tracking_number: tracking, shipped_at: new Date().toISOString() } : o
        )
      );
      setTrackingInputs((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
    setActing(null);
  }

  async function handleDelivered(id: string) {
    setActing(id);
    const { error } = await markDelivered(id);
    if (!error) setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "delivered" } : o));
    setActing(null);
  }

  // CSV Export
  function handleExport() {
    const header = ["Order Ref", "Product", "SKU", "Qty", "Ship To Country", "Status", "Tracking Number", "Received At"];
    const lines = [
      header.join(","),
      ...filtered.map((o) =>
        [o.ref, o.product_name, o.sku, o.quantity, o.ship_to_country, o.status, o.tracking_number ?? "", new Date(o.received_at).toISOString().split("T")[0]]
          .map(escapeCSV).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fulfillment-orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // CSV Import
  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text  = ev.target?.result as string;
      const lines = text.split("\n").slice(1);
      const updates: { ref: string; tracking_number: string }[] = [];

      lines.forEach((line) => {
        if (!line.trim()) return;
        const cols     = line.split(",");
        const ref      = cols[0]?.trim().replace(/"/g, "");
        const tracking = cols[6]?.trim().replace(/"/g, "");
        if (ref && tracking) updates.push({ ref, tracking_number: tracking });
      });

      const { updated } = await bulkImportTracking(updates);

      // Refresh orders from DB
      const { data } = await loadFulfillmentQueue();
      setOrders(data as FulfillmentQueueOrder[]);
      setImportSuccess(`${updated} order(s) updated with tracking numbers.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fulfillment Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pack and ship orders one by one. Export to CSV or import tracking numbers in bulk.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["pending", "packed", "shipped", "delivered"] as FulfillmentQueueStatus[]).map((s) => (
          <div key={s} className="card p-5">
            <p className={`text-2xl font-bold ${
              s === "pending" ? "text-yellow-700" : s === "packed" ? "text-blue-700" : s === "shipped" ? "text-green-700" : "text-gray-600"
            }`}>
              {counts[s]}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium capitalize">{s}</p>
          </div>
        ))}
      </div>

      {importSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>{importSuccess}</span>
          <button onClick={() => setImportSuccess(null)} className="ml-auto text-green-600 hover:text-green-800"><X size={15} /></button>
        </div>
      )}

      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700">
        <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Workflow:</strong> Export orders as CSV → Fill in tracking numbers in Excel →
          Import back to update order statuses automatically.
        </span>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">{counts[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Upload size={15} /> Import Tracking
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-400">Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <ClipboardList size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No orders in this status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Order Ref</th>
                  <th className="px-5 py-3 text-left font-medium">Product</th>
                  <th className="px-5 py-3 text-left font-medium">Customer</th>
                  <th className="px-5 py-3 text-left font-medium">SKU</th>
                  <th className="px-5 py-3 text-left font-medium">Qty</th>
                  <th className="px-5 py-3 text-left font-medium">Ship To</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Tracking</th>
                  <th className="px-5 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => {
                  const isActing = acting === order.id;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors align-middle">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">{order.ref}</span>
                          <a
                            href={`/fulfillment/orders/${order.id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Print packing slip"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Printer size={13} />
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[140px] truncate">{order.product_name}</td>
                      <td className="px-5 py-3.5">
                        {order.customer_name ? (
                          <div>
                            <p className="text-xs font-medium text-gray-800 flex items-center gap-1">
                              <User size={10} className="text-gray-400" />
                              {order.customer_name}
                            </p>
                            {order.shipping_address && (
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={9} />
                                {(() => {
                                  const addr = order.shipping_address as Record<string, string>;
                                  return [addr.city, addr.state, addr.country].filter(Boolean).join(", ");
                                })()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{order.sku}</td>
                      <td className="px-5 py-3.5 text-gray-700">{order.quantity}</td>
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{order.ship_to_country}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {order.tracking_number ? (
                          <span className="font-mono text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-md">{order.tracking_number}</span>
                        ) : (
                          <span className="text-gray-300 text-xs">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {order.status === "pending" && (
                          <button
                            onClick={() => handlePack(order.id)}
                            disabled={isActing}
                            className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
                          >
                            {isActing && <Loader2 size={11} className="animate-spin" />}
                            Pack
                          </button>
                        )}
                        {order.status === "packed" && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Tracking #"
                              value={trackingInputs[order.id] ?? ""}
                              onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-28 focus:outline-none focus:ring-1 focus:ring-green-400"
                            />
                            <button
                              onClick={() => handleShipped(order.id)}
                              disabled={!trackingInputs[order.id]?.trim() || isActing}
                              className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
                            >
                              {isActing && <Loader2 size={11} className="animate-spin" />}
                              Confirm
                            </button>
                          </div>
                        )}
                        {order.status === "shipped" && (
                          <button
                            onClick={() => handleDelivered(order.id)}
                            disabled={isActing}
                            className="text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-600 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.status === "delivered" && <CheckCircle2 size={17} className="text-green-500" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
