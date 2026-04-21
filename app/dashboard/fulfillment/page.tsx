"use client";

import { useState } from "react";
import { Plus, Package, Truck, CheckCircle2, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DUMMY_FULFILLMENT_ORDERS, DUMMY_INVENTORY } from "@/lib/dummy-data";
import {
  FULFILLMENT_STATUS_COLORS,
  FULFILLMENT_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
  DESTINATION_TYPE_LABELS,
  formatDate,
  formatCurrency,
} from "@/lib/utils";
import type { FulfillmentOrder } from "@/types/database";

const DESTINATION_OPTIONS = [
  { value: "amazon_fba", label: "Amazon FBA" },
  { value: "customer", label: "Direct to Customer" },
  { value: "3pl", label: "3PL Warehouse" },
];

const SHIPPING_OPTIONS = [
  { value: "air", label: "Air Freight (~7-12 days)" },
  { value: "sea", label: "Sea Freight (~25-35 days)" },
  { value: "express", label: "Express DHL/FedEx (~3-5 days)" },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft:      <FileText size={14} />,
  processing: <Package size={14} />,
  shipped:    <Truck size={14} />,
  delivered:  <CheckCircle2 size={14} />,
};

export default function FulfillmentPage() {
  const [orders, setOrders] = useState<FulfillmentOrder[]>(DUMMY_FULFILLMENT_ORDERS);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ id: string; product_name: string; sku: string | null; quantity: number; maxQty: number }[]>([]);
  const [form, setForm] = useState({
    destination_type: "",
    destination_address: "",
    shipping_method: "",
  });

  const filtered = orders.filter((o) =>
    o.items.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase())) ||
    o.destination_address.toLowerCase().includes(search.toLowerCase())
  );

  function toggleItem(item: typeof DUMMY_INVENTORY[0]) {
    const exists = selectedItems.find((i) => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { id: item.id, product_name: item.product_name, sku: item.sku, quantity: 1, maxQty: item.quantity }]);
    }
  }

  function updateQty(id: string, qty: number) {
    setSelectedItems(selectedItems.map((i) => i.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxQty)) } : i));
  }

  function handleCreate() {
    const newOrder: FulfillmentOrder = {
      id: `ful_${Date.now()}`,
      user_id: "user_demo",
      items: selectedItems.map((i) => ({ product_name: i.product_name, sku: i.sku, quantity: i.quantity })),
      destination_type: form.destination_type as FulfillmentOrder["destination_type"],
      destination_address: form.destination_address,
      shipping_method: form.shipping_method as FulfillmentOrder["shipping_method"],
      status: "draft",
      estimated_cost: null,
      estimated_delivery: null,
      tracking_number: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setOrders([newOrder, ...orders]);
    setShowForm(false);
    setStep(1);
    setSelectedItems([]);
    setForm({ destination_type: "", destination_address: "", shipping_method: "" });
  }

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fulfillment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ship your inventory to Amazon FBA, 3PLs, or direct customers.</p>
        </div>
        <Button size="sm" onClick={() => { setShowForm(!showForm); setStep(1); }}>
          <Plus size={15} /> New Fulfillment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total, color: "text-gray-900" },
          { label: "Processing", value: stats.processing, color: "text-blue-600" },
          { label: "Shipped", value: stats.shipped, color: "text-purple-600" },
          { label: "Delivered", value: stats.delivered, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Steps */}
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {s}
                </div>
                <span className={`text-sm font-medium ${step === s ? "text-gray-900" : "text-gray-400"}`}>
                  {s === 1 ? "Select Items" : s === 2 ? "Destination" : "Confirm"}
                </span>
                {s < 3 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>

          {/* Step 1: Select inventory */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select items from your inventory to fulfill.</p>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {DUMMY_INVENTORY.map((item) => {
                  const selected = selectedItems.find((i) => i.id === item.id);
                  return (
                    <div key={item.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${selected ? "bg-brand-50" : "bg-white hover:bg-gray-50"}`}>
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => toggleItem(item)}
                        className="w-4 h-4 accent-brand-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-xs text-gray-500">{item.sku} at {item.warehouse_location}. <span className={item.quantity < 50 ? "text-orange-600 font-medium" : ""}>{item.quantity} in stock</span></p>
                      </div>
                      {selected && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            max={item.quantity}
                            value={selected.quantity}
                            onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                            className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-2">
                <Button size="sm" disabled={selectedItems.length === 0} onClick={() => setStep(2)}>
                    Next Destination
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Step 2: Destination */}
          {step === 2 && (
            <div className="space-y-5 max-w-lg">
              <p className="text-sm text-gray-600">Where should we ship your items?</p>
              <Select
                label="Destination Type"
                options={DESTINATION_OPTIONS}
                placeholder="Select destination..."
                value={form.destination_type}
                onChange={(e) => setForm({ ...form, destination_type: e.target.value })}
                required
              />
              <Input
                label="Destination Address"
                placeholder="e.g. Amazon FBA US LGA8, or 12 Oxford St, London"
                value={form.destination_address}
                onChange={(e) => setForm({ ...form, destination_address: e.target.value })}
                required
              />
              <Select
                label="Shipping Method"
                options={SHIPPING_OPTIONS}
                placeholder="Select shipping method..."
                value={form.shipping_method}
                onChange={(e) => setForm({ ...form, shipping_method: e.target.value })}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button size="sm" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button
                  size="sm"
                  disabled={!form.destination_type || !form.destination_address || !form.shipping_method}
                  onClick={() => setStep(3)}
                >
                    Next Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5 max-w-lg">
              <p className="text-sm text-gray-600">Review your fulfillment order before submitting.</p>
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                  {selectedItems.map((i) => (
                    <div key={i.id} className="flex justify-between py-1">
                      <span className="text-gray-700">{i.product_name}</span>
                      <span className="font-medium text-gray-900">x {i.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Destination</span>
                    <span className="font-medium text-gray-900 text-right max-w-[200px]">{form.destination_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-gray-900">{DESTINATION_TYPE_LABELS[form.destination_type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium text-gray-900">{SHIPPING_METHOD_LABELS[form.shipping_method]}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button size="sm" variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button size="sm" onClick={handleCreate}>Create Fulfillment Order</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Search fulfillment orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Package size={28} />} title="No fulfillment orders" description="Create your first fulfillment order above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Items", "Destination", "Type", "Shipping", "Status", "Est. Cost", "Est. Delivery", "Tracking"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-sm font-medium text-gray-900 whitespace-nowrap">
                            {item.product_name} <span className="font-normal text-gray-500">x {item.quantity}</span>
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[180px]">
                      <p className="truncate">{order.destination_address}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{DESTINATION_TYPE_LABELS[order.destination_type]}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{SHIPPING_METHOD_LABELS[order.shipping_method]}</td>
                    <td className="px-6 py-4">
                      <Badge className={FULFILLMENT_STATUS_COLORS[order.status]}>
                        <span className="flex items-center gap-1">
                          {STATUS_ICONS[order.status]}
                          {FULFILLMENT_STATUS_LABELS[order.status]}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {order.estimated_cost ? formatCurrency(order.estimated_cost) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {order.estimated_delivery ? formatDate(order.estimated_delivery) : "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
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
