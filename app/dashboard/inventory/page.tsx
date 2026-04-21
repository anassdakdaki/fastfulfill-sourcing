"use client";

import { useState } from "react";
import { Archive, Search, AlertTriangle, Warehouse, Info } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { DUMMY_INVENTORY } from "@/lib/dummy-data";
import { formatDate } from "@/lib/utils";

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const filtered = DUMMY_INVENTORY.filter((item) =>
    item.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (item.sku?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const totalUnits = DUMMY_INVENTORY.reduce((s, i) => s + i.quantity, 0);
  const lowStock   = DUMMY_INVENTORY.filter((i) => i.quantity < 50).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Warehouse size={16} className="text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              FastFulfill Warehouse
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalUnits.toLocaleString()} units stored across {DUMMY_INVENTORY.length} products at our fulfillment center
          </p>
        </div>
      </div>

      {/* Warehouse model note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-xs text-blue-800">
        <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
        <span>
          This is stock stored at the <strong>FastFulfill Fulfillment Center</strong> on your behalf.
          Stock is added when you confirm a sourcing quote (min 50 units). Customer orders ship
            automatically from this warehouse. You never manage logistics directly.
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total SKUs</p>
          <p className="text-2xl font-bold text-gray-900">{DUMMY_INVENTORY.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Units</p>
          <p className="text-2xl font-bold text-gray-900">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Low Stock Items</p>
          <p className={`text-2xl font-bold ${lowStock > 0 ? "text-orange-600" : "text-green-600"}`}>{lowStock}</p>
          {lowStock > 0 && (
            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
              <AlertTriangle size={11} /> Below 50 units
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Search products or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Archive size={28} />}
            title="No inventory found"
            description="Try adjusting your search."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Product", "SKU", "Quantity", "Warehouse", "Last Updated"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.product_name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku ?? "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${item.quantity < 50 ? "text-orange-600" : "text-gray-900"}`}>
                          {item.quantity.toLocaleString()}
                        </span>
                        {item.quantity < 50 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.warehouse_location ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(item.updated_at)}</td>
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
