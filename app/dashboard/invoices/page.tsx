"use client";

import { useState } from "react";
import { Download, FileText, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DUMMY_INVOICES } from "@/lib/dummy-data";
import { INVOICE_STATUS_COLORS, formatDate, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types/database";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "issued", label: "Issued" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(DUMMY_INVOICES);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = invoices.filter((inv) => {
    const matchFilter = filter === "all" || inv.status === filter;
    const matchSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices.filter((i) => i.status === "issued" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-500 mt-0.5">Billing history for your orders and sourcing fees.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-5 ${overdue > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</p>
          <p className={`text-2xl font-bold mt-1 ${overdue > 0 ? "text-red-600" : "text-gray-900"}`}>{overdue}</p>
          {overdue > 0 && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
              <AlertTriangle size={11} /> Action required
            </p>
          )}
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s.value ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="No invoices found" description="Invoices will appear here after your first order." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Invoice", "Description", "Subtotal", "Shipping", "Total", "Status", "Issued", "Due", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => (
                  <tr key={inv.id} className={`transition-colors ${inv.status === "overdue" ? "bg-red-50/40 hover:bg-red-50" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-[220px]">
                      <p className="truncate">{inv.description}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatCurrency(inv.subtotal)}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatCurrency(inv.shipping_cost)}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{formatCurrency(inv.total)}</td>
                    <td className="px-6 py-4">
                      <Badge className={INVOICE_STATUS_COLORS[inv.status]}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(inv.issued_at)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${inv.status === "overdue" ? "text-red-600" : "text-gray-500"}`}>
                      {formatDate(inv.due_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert(`Downloading ${inv.invoice_number}...`)}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        <Download size={14} />
                      </Button>
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
