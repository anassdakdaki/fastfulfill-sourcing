"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, DollarSign, Package, CheckCircle2,
  BarChart2, Loader2, ArrowUpRight, ShieldCheck,
} from "lucide-react";
import { loadSentQuotes, loadProcurement } from "@/app/actions/sourcing-desk";
import { formatCurrency } from "@/lib/utils";

type Quote = {
  id: string; ref: string; product_name: string; our_cost: number; shipping_cost: number;
  seller_unit_price: number; seller_total: number; margin_pct: number; qty: number;
  moq: number; status: string; sent_at: string; valid_until: string; notes: string | null;
};

type Procurement = {
  id: string; product_name: string; status: string; qty: number;
  total_cost: number; created_at: string;
};

export default function SupplierAnalyticsPage() {
  const [quotes,     setQuotes]     = useState<Quote[]>([]);
  const [procure,    setProcure]    = useState<Procurement[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([loadSentQuotes(), loadProcurement()]).then(([q, p]) => {
      setQuotes(q.data as Quote[]);
      setProcure(p.data as Procurement[]);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const accepted       = quotes.filter((q) => q.status === "accepted");
    const declined       = quotes.filter((q) => q.status === "declined");
    const awaiting       = quotes.filter((q) => q.status === "awaiting");
    const totalRevenue   = accepted.reduce((s, q) => s + Number(q.seller_total), 0);
    const totalCost      = accepted.reduce((s, q) => s + (Number(q.our_cost) * q.qty + Number(q.shipping_cost)), 0);
    const grossProfit    = totalRevenue - totalCost;
    const avgMargin      = accepted.length
      ? accepted.reduce((s, q) => s + Number(q.margin_pct), 0) / accepted.length
      : 0;
    const conversionRate = quotes.length
      ? Math.round((accepted.length / quotes.length) * 100)
      : 0;

    // Top products by revenue
    const byProduct: Record<string, { name: string; revenue: number; count: number }> = {};
    for (const q of accepted) {
      if (!byProduct[q.product_name]) byProduct[q.product_name] = { name: q.product_name, revenue: 0, count: 0 };
      byProduct[q.product_name].revenue += Number(q.seller_total);
      byProduct[q.product_name].count++;
    }
    const topProducts = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return {
      totalQuotes: quotes.length, accepted: accepted.length, declined: declined.length,
      awaiting: awaiting.length, totalRevenue, totalCost, grossProfit, avgMargin,
      conversionRate, topProducts,
    };
  }, [quotes]);

  const procStats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const p of procure) { byStatus[p.status] = (byStatus[p.status] ?? 0) + 1; }
    const totalProcurementValue = procure.reduce((s, p) => s + Number(p.total_cost), 0);
    return { byStatus, totalProcurementValue };
  }, [procure]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" /> Loading analytics...
      </div>
    );
  }

  const PROC_STATUS_LABELS: Record<string, string> = {
    sourcing: "Sourcing", ordered: "Ordered", in_transit: "In Transit", at_warehouse: "At Warehouse",
  };
  const PROC_STATUS_COLORS: Record<string, string> = {
    sourcing: "bg-yellow-100 text-yellow-700", ordered: "bg-blue-100 text-blue-700",
    in_transit: "bg-purple-100 text-purple-700", at_warehouse: "bg-green-100 text-green-700",
  };

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Revenue, margins, and deal performance at a glance.</p>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1"><DollarSign size={10} /> Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">From accepted quotes</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1"><TrendingUp size={10} /> Gross Profit</p>
          <p className={`text-2xl font-bold mt-1 ${stats.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(stats.grossProfit)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Revenue − Cost</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={10} /> Avg Margin</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">{stats.avgMargin.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-0.5">On accepted deals</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Conversion Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.conversionRate}%</p>
          <p className="text-xs text-gray-400 mt-0.5">{stats.accepted} of {stats.totalQuotes} quotes accepted</p>
        </div>
      </div>

      {/* Quote funnel + Procurement pipeline */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quote Funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart2 size={15} className="text-brand-600" /> Quote Funnel
          </h2>
          {[
            { label: "Total Sent",  value: stats.totalQuotes, color: "bg-gray-200", pct: 100 },
            { label: "Awaiting",    value: stats.awaiting,    color: "bg-amber-400", pct: stats.totalQuotes ? Math.round(stats.awaiting / stats.totalQuotes * 100) : 0 },
            { label: "Accepted",    value: stats.accepted,    color: "bg-green-500", pct: stats.totalQuotes ? Math.round(stats.accepted / stats.totalQuotes * 100) : 0 },
            { label: "Declined",    value: stats.declined,    color: "bg-red-400",   pct: stats.totalQuotes ? Math.round(stats.declined / stats.totalQuotes * 100) : 0 },
          ].map(({ label, value, color, pct }) => (
            <div key={label} className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className="text-gray-900 font-bold">{value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Procurement Pipeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Package size={15} className="text-brand-600" /> Procurement Pipeline
          </h2>
          <div className="mb-4 p-3 bg-brand-50 rounded-xl">
            <p className="text-xs text-brand-600 font-medium">Total Procurement Value</p>
            <p className="text-xl font-bold text-brand-700 mt-0.5">{formatCurrency(procStats.totalProcurementValue)}</p>
          </div>
          {Object.entries(PROC_STATUS_LABELS).map(([key, label]) => {
            const count = procStats.byStatus[key] ?? 0;
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PROC_STATUS_COLORS[key]}`}>{label}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <ArrowUpRight size={15} className="text-brand-600" /> Top Products by Revenue
          </h2>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => {
              const maxRev = stats.topProducts[0].revenue;
              const pct    = maxRev ? Math.round((p.revenue / maxRev) * 100) : 0;
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-brand-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-brand-600">{i + 1}</span>
                      <span className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</span>
                    </span>
                    <span className="text-gray-900 font-bold text-xs">{formatCurrency(p.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent accepted quotes table */}
      {stats.accepted > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Accepted Deals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Product", "Qty", "Our Cost", "Seller Price", "Margin", "Revenue"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.filter((q) => q.status === "accepted").map((q) => {
                  const margin = Number(q.margin_pct);
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900 max-w-[160px] truncate">{q.product_name}</td>
                      <td className="px-6 py-3 text-gray-600">{q.qty}</td>
                      <td className="px-6 py-3 text-gray-600">{formatCurrency(Number(q.our_cost))}</td>
                      <td className="px-6 py-3 text-gray-600">{formatCurrency(Number(q.seller_unit_price))}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${margin >= 20 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-3 font-bold text-gray-900">{formatCurrency(Number(q.seller_total))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
