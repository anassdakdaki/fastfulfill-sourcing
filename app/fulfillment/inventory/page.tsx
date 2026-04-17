"use client";

import { useState, useMemo } from "react";
import { Search, Archive, TrendingDown, AlertCircle } from "lucide-react";
import { DUMMY_WAREHOUSE_STOCK } from "@/lib/dummy-data";
import type { WarehouseStock } from "@/types/database";

type StockStatus = "healthy" | "low" | "out";

function getStatus(available: number): StockStatus {
  if (available === 0) return "out";
  if (available < 20)  return "low";
  return "healthy";
}

const STATUS_BADGE: Record<StockStatus, string> = {
  healthy: "bg-green-100 text-green-700",
  low:     "bg-amber-100 text-amber-700",
  out:     "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<StockStatus, string> = {
  healthy: "Healthy",
  low:     "Low Stock",
  out:     "Out of Stock",
};

const AVAIL_COLOR: Record<StockStatus, string> = {
  healthy: "text-green-700 font-semibold",
  low:     "text-amber-600 font-semibold",
  out:     "text-red-600 font-semibold",
};

function StockBar({ inStock, reserved }: { inStock: number; reserved: number }) {
  if (inStock === 0) {
    return (
      <div className="w-20 h-2.5 bg-red-200 rounded-full" title="Out of stock" />
    );
  }
  const availPct = ((inStock - reserved) / inStock) * 100;
  const reservedPct = (reserved / inStock) * 100;
  return (
    <div className="w-20 h-2.5 bg-gray-100 rounded-full overflow-hidden flex" title={`${inStock - reserved} available / ${reserved} reserved`}>
      <div className="h-full bg-blue-400" style={{ width: `${reservedPct}%` }} />
      <div className="h-full bg-green-400" style={{ width: `${availPct}%` }} />
    </div>
  );
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const rows = useMemo<(WarehouseStock & { available: number; stockStatus: StockStatus })[]>(() => {
    return DUMMY_WAREHOUSE_STOCK
      .filter(
        (s) =>
          s.product_name.toLowerCase().includes(search.toLowerCase()) ||
          s.sku.toLowerCase().includes(search.toLowerCase())
      )
      .map((s) => ({
        ...s,
        available: s.in_stock - s.reserved,
        stockStatus: getStatus(s.in_stock - s.reserved),
      }));
  }, [search]);

  const totalSKUs  = DUMMY_WAREHOUSE_STOCK.length;
  const totalUnits = DUMMY_WAREHOUSE_STOCK.reduce((sum, s) => sum + s.in_stock, 0);
  const lowStock   = DUMMY_WAREHOUSE_STOCK.filter((s) => getStatus(s.in_stock - s.reserved) === "low" || getStatus(s.in_stock - s.reserved) === "out").length;

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">Live stock levels across all SKUs stored at FastFulfill Warehouse.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Archive size={18} className="text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalSKUs}</p>
            <p className="text-xs text-gray-500 font-medium">Total SKUs</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingDown size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalUnits.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">Total Units</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{lowStock}</p>
            <p className="text-xs text-gray-500 font-medium">Low / Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by product name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-400 rounded-sm" /> Reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-green-400 rounded-sm" /> Available
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Archive size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No SKUs match &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">SKU</th>
                  <th className="px-5 py-3 text-left font-medium">Product</th>
                  <th className="px-5 py-3 text-left font-medium">In Stock</th>
                  <th className="px-5 py-3 text-left font-medium">Reserved</th>
                  <th className="px-5 py-3 text-left font-medium">Available</th>
                  <th className="px-5 py-3 text-left font-medium">Level</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Last Movement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                        {row.sku}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">{row.product_name}</td>
                    <td className="px-5 py-4 text-gray-700">{row.in_stock}</td>
                    <td className="px-5 py-4 text-blue-600">{row.reserved}</td>
                    <td className={`px-5 py-4 ${AVAIL_COLOR[row.stockStatus]}`}>{row.available}</td>
                    <td className="px-5 py-4">
                      <StockBar inStock={row.in_stock} reserved={row.reserved} />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${STATUS_BADGE[row.stockStatus]}`}>
                        {STATUS_LABEL[row.stockStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(row.last_movement).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
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
