"use client";

import { useState } from "react";
import { PackageCheck, ClipboardList, Truck, CheckCircle2, Archive, AlertTriangle } from "lucide-react";
import {
  DUMMY_FULFILLMENT_QUEUE,
  DUMMY_INBOUND_SHIPMENTS,
} from "@/lib/dummy-data";
import type { FulfillmentQueueOrder, FulfillmentQueueStatus } from "@/types/database";

const STATUS_BADGE: Record<FulfillmentQueueStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  packed:    "bg-blue-100 text-blue-800",
  shipped:   "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-600",
};

export default function FulfillmentOverview() {
  const [orders, setOrders] = useState<FulfillmentQueueOrder[]>(DUMMY_FULFILLMENT_QUEUE);

  const toPack    = orders.filter((o) => o.status === "pending").length;
  const toShip    = orders.filter((o) => o.status === "packed").length;
  const shipped   = orders.filter((o) => o.status === "shipped").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const inboundActive = DUMMY_INBOUND_SHIPMENTS.filter(
    (s) => s.status === "pending" || s.status === "in_transit"
  );

  const priorityQueue = orders
    .filter((o) => o.status === "pending" || o.status === "packed")
    .slice(0, 5);

  function handlePack(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "packed" } : o))
    );
  }

  function handleShipped(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: "shipped", tracking_number: "TRACKING-PENDING", shipped_at: new Date().toISOString() }
          : o
      )
    );
  }

  const stats = [
    { label: "To Pack",       value: toPack,    icon: ClipboardList, accent: "bg-amber-500",  textColor: "text-amber-700",  bg: "bg-amber-50"  },
    { label: "To Ship",       value: toShip,    icon: Truck,         accent: "bg-blue-500",   textColor: "text-blue-700",   bg: "bg-blue-50"   },
    { label: "Shipped Today", value: shipped,   icon: PackageCheck,  accent: "bg-green-500",  textColor: "text-green-700",  bg: "bg-green-50"  },
    { label: "Delivered",     value: delivered, icon: CheckCircle2,  accent: "bg-purple-500", textColor: "text-purple-700", bg: "bg-purple-50" },
  ];

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Warehouse Team 👋</h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s what needs attention today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${s.accent}`} />
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.textColor} />
            </div>
            <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Priority Queue */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-semibold text-gray-900">Priority Pack &amp; Ship Now</h2>
          <span className="ml-auto badge bg-amber-100 text-amber-800">{priorityQueue.length} orders</span>
        </div>
        {priorityQueue.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
              All caught up. No pending or packed orders right now 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Order Ref</th>
                  <th className="px-5 py-3 text-left font-medium">Product</th>
                  <th className="px-5 py-3 text-left font-medium">SKU</th>
                  <th className="px-5 py-3 text-left font-medium">Qty</th>
                  <th className="px-5 py-3 text-left font-medium">Ship To</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {priorityQueue.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                        {order.ref}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[160px] truncate">
                      {order.product_name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{order.sku}</td>
                    <td className="px-5 py-3.5 text-gray-700">{order.quantity}</td>
                    <td className="px-5 py-3.5 text-gray-600">{order.ship_to_country}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_BADGE[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handlePack(order.id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Start Packing
                        </button>
                      )}
                      {order.status === "packed" && (
                        <button
                          onClick={() => handleShipped(order.id)}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Mark Shipped
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inbound Arrivals */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Archive size={16} className="text-slate-500" />
            <h2 className="font-semibold text-gray-900">Expected Inbound Next 7 Days</h2>
          <span className="ml-auto badge bg-slate-100 text-slate-700">{inboundActive.length} shipments</span>
        </div>
        {inboundActive.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">No inbound shipments expected soon.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {inboundActive.map((s) => (
              <div key={s.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md shrink-0">
                  {s.ref}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{s.product_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sku} · {s.quantity_expected} units expected</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  Due {new Date(s.expected_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <span className={`badge shrink-0 ${
                  s.status === "in_transit" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {s.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
