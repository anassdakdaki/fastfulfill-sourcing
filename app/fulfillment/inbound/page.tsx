"use client";

import { useState } from "react";
import { PackageCheck, CheckCircle2, Clock, Truck, Archive } from "lucide-react";
import { DUMMY_INBOUND_SHIPMENTS } from "@/lib/dummy-data";
import type { InboundShipment, InboundStatus } from "@/types/database";

type FilterTab = "all" | InboundStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",        label: "All" },
  { key: "pending",    label: "Pending" },
  { key: "in_transit", label: "In Transit" },
  { key: "arrived",    label: "Arrived" },
  { key: "logged",     label: "Logged" },
];

const STATUS_STYLES: Record<InboundStatus, { badge: string; icon: React.ElementType; label: string }> = {
  pending:    { badge: "bg-gray-100 text-gray-600",   icon: Clock,         label: "Pending"    },
  in_transit: { badge: "bg-blue-100 text-blue-700",   icon: Truck,         label: "In Transit" },
  arrived:    { badge: "bg-amber-100 text-amber-700", icon: PackageCheck,  label: "Arrived"    },
  logged:     { badge: "bg-green-100 text-green-700", icon: CheckCircle2,  label: "Logged"     },
};

export default function InboundStockPage() {
  const [shipments, setShipments] = useState<InboundShipment[]>(DUMMY_INBOUND_SHIPMENTS);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [confirming, setConfirming] = useState<string | null>(null);

  const counts = {
    pending:    shipments.filter((s) => s.status === "pending").length,
    in_transit: shipments.filter((s) => s.status === "in_transit").length,
    arrived:    shipments.filter((s) => s.status === "arrived").length,
    logged:     shipments.filter((s) => s.status === "logged").length,
  };

  const filtered = filter === "all" ? shipments : shipments.filter((s) => s.status === filter);

  function confirmReceipt(id: string) {
    setConfirming(id);
    setTimeout(() => {
      setShipments((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "logged", quantity_received: s.quantity_expected }
            : s
        )
      );
      setConfirming(null);
    }, 800);
  }

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inbound Stock</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track supplier shipments arriving at the warehouse. Confirm receipt to log inventory.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["pending", "in_transit", "arrived", "logged"] as InboundStatus[]).map((s) => {
          const meta = STATUS_STYLES[s];
          return (
            <div key={s} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <meta.icon size={15} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500">{meta.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && counts[tab.key as InboundStatus] > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">
                {counts[tab.key as InboundStatus]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Archive size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No shipments match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Ref</th>
                  <th className="px-5 py-3 text-left font-medium">Product</th>
                  <th className="px-5 py-3 text-left font-medium">SKU</th>
                  <th className="px-5 py-3 text-left font-medium">Expected Qty</th>
                  <th className="px-5 py-3 text-left font-medium">Received Qty</th>
                  <th className="px-5 py-3 text-left font-medium">Expected Date</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => {
                  const meta = STATUS_STYLES[s.status];
                  const isConfirming = confirming === s.id;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                          {s.ref}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{s.product_name}</p>
                        {s.notes && (
                          <p className="text-xs text-amber-600 mt-0.5">⚠ {s.notes}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">{s.sku}</td>
                      <td className="px-5 py-4 text-gray-700">{s.quantity_expected}</td>
                      <td className="px-5 py-4">
                        {s.quantity_received !== null ? (
                          <span className={s.quantity_received < s.quantity_expected ? "text-amber-600 font-medium" : "text-gray-700"}>
                            {s.quantity_received}
                            {s.quantity_received < s.quantity_expected && (
                              <span className="ml-1 text-xs text-amber-500">
                                ({s.quantity_expected - s.quantity_received} short)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {new Date(s.expected_date).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {(s.status === "in_transit" || s.status === "arrived") && (
                          <button
                            onClick={() => confirmReceipt(s.id)}
                            disabled={isConfirming}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              isConfirming
                                ? "bg-green-100 text-green-600 cursor-wait"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {isConfirming ? "Confirming…" : "Confirm Receipt"}
                          </button>
                        )}
                        {s.status === "logged" && (
                          <CheckCircle2 size={18} className="text-green-500" />
                        )}
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
