"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, RefreshCw, ArrowRight, Eye, EyeOff,
} from "lucide-react";
import { DUMMY_SENT_QUOTES } from "@/lib/dummy-data";
import type { SentQuote, SentQuoteStatus } from "@/types/database";

type FilterTab = "all" | SentQuoteStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",      label: "All"               },
  { key: "awaiting", label: "Awaiting Response"  },
  { key: "accepted", label: "Accepted"           },
  { key: "declined", label: "Declined"           },
  { key: "expired",  label: "Expired"            },
];

const STATUS_META: Record<SentQuoteStatus, { badge: string; icon: React.ElementType; label: string }> = {
  awaiting: { badge: "bg-amber-100 text-amber-800",  icon: Clock,        label: "Awaiting"  },
  accepted: { badge: "bg-green-100 text-green-800",  icon: CheckCircle2, label: "Accepted"  },
  declined: { badge: "bg-red-100 text-red-700",      icon: XCircle,      label: "Declined"  },
  expired:  { badge: "bg-gray-100 text-gray-500",    icon: AlertCircle,  label: "Expired"   },
};

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const d = Math.ceil(diff / 86_400_000);
  if (d < 0) return "Expired";
  if (d === 0) return "Expires today";
  return `${d}d left`;
}

export default function QuotesManagerPage() {
  const [quotes, setQuotes]       = useState<SentQuote[]>(DUMMY_SENT_QUOTES);
  const [filter, setFilter]       = useState<FilterTab>("all");
  const [showInternal, setShowInternal] = useState(false);

  const filtered = useMemo(
    () => filter === "all" ? quotes : quotes.filter((q) => q.status === filter),
    [quotes, filter]
  );

  const counts = useMemo<Record<FilterTab, number>>(() => ({
    all:      quotes.length,
    awaiting: quotes.filter((q) => q.status === "awaiting").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    declined: quotes.filter((q) => q.status === "declined").length,
    expired:  quotes.filter((q) => q.status === "expired").length,
  }), [quotes]);

  const totalMarginAccepted = quotes
    .filter((q) => q.status === "accepted")
    .reduce((s, q) => s + (q.seller_unit_price - q.our_cost) * q.qty, 0);

  function handleStartProcurement(quoteId: string) {
    // In a real app this would create a procurement record; here we just acknowledge
    alert(`Procurement started for quote ${quoteId}. Check the Active Deals page.`);
  }

  function handleResend(quoteId: string) {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? { ...q, status: "awaiting", valid_until: new Date(Date.now() + 7 * 86_400_000).toISOString() }
          : q
      )
    );
  }

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes Sent</h1>
          <p className="mt-1 text-sm text-gray-500">
            All quotes you&apos;ve sent to sellers. Track responses and start procurement on accepted deals.
          </p>
        </div>
        <button
          onClick={() => setShowInternal((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-xl transition-colors"
        >
          {showInternal ? <EyeOff size={13} /> : <Eye size={13} />}
          {showInternal ? "Hide internal costs" : "Show internal costs"}
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Awaiting Response", value: counts.awaiting, color: "text-amber-700",  accent: "bg-amber-500"  },
          { label: "Accepted",          value: counts.accepted, color: "text-green-700",  accent: "bg-green-500"  },
          { label: "Declined",          value: counts.declined, color: "text-red-700",    accent: "bg-red-500"    },
          { label: "Est. Margin Won",   value: `$${totalMarginAccepted.toFixed(0)}`, color: "text-purple-700", accent: "bg-purple-500" },
        ].map((s) => (
          <div key={s.label} className="card p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${s.accent}`} />
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
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
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quotes table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <FileText size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No quotes in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Ref</th>
                  <th className="px-5 py-3 text-left font-medium">Seller</th>
                  <th className="px-5 py-3 text-left font-medium">Product</th>
                  <th className="px-5 py-3 text-left font-medium">Qty</th>
                  <th className="px-5 py-3 text-left font-medium">Seller Price / unit</th>
                  {showInternal && <th className="px-5 py-3 text-left font-medium bg-amber-50">Our Cost</th>}
                  {showInternal && <th className="px-5 py-3 text-left font-medium bg-amber-50">Margin %</th>}
                  <th className="px-5 py-3 text-left font-medium">Lead Time</th>
                  <th className="px-5 py-3 text-left font-medium">Expires</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((q) => {
                  const meta = STATUS_META[q.status];
                  const expiry = daysUntil(q.valid_until);
                  const isExpiringSoon = q.status === "awaiting" && expiry.includes("d left") && parseInt(expiry) <= 2;

                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                          {q.ref}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-700">{q.seller_ref}</td>
                      <td className="px-5 py-4 max-w-[160px]">
                        <p className="font-medium text-gray-900 truncate">{q.product_name}</p>
                        {q.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{q.notes}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700">{q.qty}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">${q.seller_unit_price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">Total: ${q.seller_total.toLocaleString()}</p>
                        </div>
                      </td>
                      {showInternal && (
                        <td className="px-5 py-4 bg-amber-50/50">
                          <p className="font-medium text-amber-800">${q.our_cost.toFixed(2)}</p>
                          <p className="text-xs text-amber-600">+ship ${q.shipping_cost}</p>
                        </td>
                      )}
                      {showInternal && (
                        <td className="px-5 py-4 bg-amber-50/50">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={13} className="text-green-600" />
                            <span className="font-semibold text-green-700">{q.margin_pct}%</span>
                          </div>
                          <p className="text-xs text-green-600 mt-0.5">
                            +${((q.seller_unit_price - q.our_cost) * q.qty).toFixed(0)} margin
                          </p>
                        </td>
                      )}
                      <td className="px-5 py-4 text-gray-600">{q.lead_time_days}d</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium ${
                          expiry === "Expired" ? "text-gray-400"
                          : isExpiringSoon ? "text-red-600 font-semibold"
                          : "text-gray-500"
                        }`}>
                          {expiry}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        {q.status === "accepted" && (
                          <Link
                            href="/supplier/procurement"
                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                          >
                            View Deal <ArrowRight size={11} />
                          </Link>
                        )}
                        {(q.status === "declined" || q.status === "expired") && (
                          <button
                            onClick={() => handleResend(q.id)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                          >
                            <RefreshCw size={11} /> Resend
                          </button>
                        )}
                        {q.status === "awaiting" && isExpiringSoon && (
                          <span className="text-xs text-red-500 font-medium">Expiring soon</span>
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

      {/* Internal costs note */}
      {showInternal && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
          <EyeOff size={13} className="mt-0.5 shrink-0" />
          <span>
            <strong>Internal view active.</strong> The columns highlighted in amber are never visible to sellers.
            Your cost price and supplier identity are always hidden.
          </span>
        </div>
      )}
    </div>
  );
}
