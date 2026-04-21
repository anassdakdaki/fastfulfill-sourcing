"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ShoppingCart, Plug, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadMyOrders } from "@/app/actions/dashboard";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatDate,
  formatCurrency,
} from "@/lib/utils";
import type { Order } from "@/types/database";

const STATUSES: { value: string; label: string }[] = [
  { value: "all",        label: "All"        },
  { value: "pending",    label: "Pending"    },
  { value: "processing", label: "Processing" },
  { value: "fulfilled",  label: "Fulfilled"  },
  { value: "shipped",    label: "Shipped"    },
  { value: "delivered",  label: "Delivered"  },
];

export default function OrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadMyOrders().then(({ data }) => {
      setOrders(data as Order[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() =>
    orders.filter((o) => {
      const matchSearch = o.product_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    }),
    [orders, search, statusFilter]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-sm text-blue-900">
        <ShoppingCart size={16} className="shrink-0 mt-0.5 text-blue-500" />
        <div>
          <p className="font-semibold">Orders are imported automatically from your connected stores.</p>
          <p className="text-xs text-blue-800 mt-1">
            When a customer places an order in your Shopify store, FastFulfill
            automatically receives it and starts the fulfillment process.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          <Filter size={14} className="text-gray-400 ml-2" />
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-400">Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <ShoppingCart size={32} className="text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No orders yet</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Orders will appear here automatically once you connect your store and customers start buying.
            </p>
            <Link href="/dashboard/integrations">
              <Button size="sm" className="mt-2">
                <Plug size={13} /> Connect a Store
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2">
            <Search size={28} className="text-gray-300" />
            <p className="text-sm text-gray-400">No orders match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Product", "Qty", "Country", "Unit Price", "Status", "Date", "Tracking"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{order.product_name}</td>
                    <td className="px-6 py-4 text-gray-600">{order.quantity}</td>
                      <td className="px-6 py-4 text-gray-500">{order.destination_country ?? "Not set"}</td>
                    <td className="px-6 py-4 text-gray-500">
                        {order.unit_price ? formatCurrency(order.unit_price) : "Not set"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {order.tracking_number ?? "Not set"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
