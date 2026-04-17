"use client";

import { useState, useRef } from "react";
import { Upload, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DUMMY_ORDERS } from "@/lib/dummy-data";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatDate,
  formatCurrency,
} from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/database";

const STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(DUMMY_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState({ product_name: "", quantity: "", destination_country: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.product_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleAddOrder(e: React.FormEvent) {
    e.preventDefault();
    const order: Order = {
      id: `ord_${Date.now()}`,
      user_id: "user_demo",
      product_name: newOrder.product_name,
      quantity: parseInt(newOrder.quantity),
      destination_country: newOrder.destination_country,
      status: "pending",
      tracking_number: null,
      unit_price: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setOrders([order, ...orders]);
    setNewOrder({ product_name: "", quantity: "", destination_country: "" });
    setShowForm(false);
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1);
      const newOrders: Order[] = lines
        .filter((l) => l.trim())
        .map((line, i) => {
          const [product_name, quantity, country] = line.split(",");
          return {
            id: `ord_csv_${i}`,
            user_id: "user_demo",
            product_name: product_name?.trim() || "Unknown",
            quantity: parseInt(quantity) || 1,
            destination_country: country?.trim() || "US",
            status: "pending" as OrderStatus,
            tracking_number: null,
            unit_price: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });
      setOrders([...newOrders, ...orders]);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={15} /> Add Order
          </Button>
        </div>
      </div>

      {/* Add order form */}
      {showForm && (
        <form
          onSubmit={handleAddOrder}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">New Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Product Name"
              placeholder="e.g. Wireless Earbuds"
              value={newOrder.product_name}
              onChange={(e) => setNewOrder({ ...newOrder, product_name: e.target.value })}
              required
            />
            <Input
              label="Quantity"
              type="number"
              placeholder="50"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
              required
              min="1"
            />
            <Input
              label="Destination Country"
              placeholder="United States"
              value={newOrder.destination_country}
              onChange={(e) => setNewOrder({ ...newOrder, destination_country: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button type="submit" size="sm">Create Order</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* CSV hint */}
      <p className="text-xs text-gray-400">
        CSV format: <code className="font-mono bg-gray-100 px-1 rounded">product_name,quantity,country</code> (one per line, with header row)
      </p>

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
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title="No orders found"
            description="Try adjusting your search or filters."
          />
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
                    <td className="px-6 py-4 text-gray-500">{order.destination_country ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.unit_price ? formatCurrency(order.unit_price) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={ORDER_STATUS_COLORS[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                      {order.tracking_number ?? "-"}
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
