"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, XCircle, Clock, Tag, Calendar, Truck,
  ShieldCheck, Warehouse, Package, AlertCircle, ArrowRight, Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QUOTE_STATUS_COLORS, formatDate, formatCurrency } from "@/lib/utils";
import { loadMyQuotes, respondToQuote } from "@/app/actions/quotes";
import { expireOldQuotes } from "@/app/actions/invoices";
import type { Quote } from "@/types/database";

const MIN_MOQ = 50;

const STATUS_FILTERS = [
  { value: "all",      label: "All"               },
  { value: "pending",  label: "Awaiting Response"  },
  { value: "accepted", label: "Accepted"           },
  { value: "declined", label: "Declined"           },
  { value: "expired",  label: "Expired"            },
];

export default function QuotesPage() {
  const [quotes, setQuotes]   = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [acting, setActing]   = useState<string | null>(null);

  useEffect(() => {
    expireOldQuotes().then(() =>
      loadMyQuotes().then(({ data }) => {
        setQuotes(data as Quote[]);
        setLoading(false);
      })
    );
  }, []);

  async function handleRespond(id: string, status: "accepted" | "declined") {
    setActing(id);
    const { error } = await respondToQuote(id, status);
    if (!error) {
      setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    }
    setActing(null);
  }

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);
  const pending  = quotes.filter((q) => q.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Quotes prepared by FastFulfill for your sourcing requests.
          {pending > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-yellow-700 font-medium">
              <Clock size={13} /> {pending} awaiting your response
            </span>
          )}
        </p>
      </div>

      {/* How accepting works */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider mb-3">What happens when you accept a quote</p>
        <div className="flex flex-wrap items-start gap-3">
          {[
            { icon: CheckCircle2, label: "You confirm",         sub: `Min ${MIN_MOQ} units` },
            { icon: Package,      label: "We procure stock",    sub: "Bulk order placed" },
            { icon: Warehouse,    label: "Stored in warehouse", sub: "Our fulfillment center" },
            { icon: Truck,        label: "Orders ship",         sub: "Automatically, 1-by-1" },
          ].map(({ icon: Icon, label, sub }, i, arr) => (
            <div key={label} className="flex items-center gap-2">
              <div className="text-center">
                <div className="w-8 h-8 rounded-xl bg-white border border-brand-200 flex items-center justify-center mx-auto">
                  <Icon size={14} className="text-brand-600" />
                </div>
                <p className="text-xs font-semibold text-gray-800 mt-1">{label}</p>
                <p className="text-[10px] text-gray-500">{sub}</p>
              </div>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-brand-300 pb-4 shrink-0" />}
            </div>
          ))}
        </div>
        <p className="text-xs text-brand-700 mt-3">
          <ShieldCheck size={11} className="inline mr-1" />
          You never deal with suppliers or shipping. FastFulfill handles everything end-to-end.
        </p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_FILTERS.slice(1).map((s) => (
            <div key={s.value} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{quotes.filter((q) => q.status === s.value).length}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s.value ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s.label}
            {s.value !== "all" && !loading && (
              <span className="ml-1.5 opacity-70">{quotes.filter((q) => q.status === s.value).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Quote cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading your quotes…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={<Tag size={28} />}
            title="No quotes found"
            description="FastFulfill will prepare quotes for your sourcing requests within 24 hours."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((quote) => {
            const isExpired       = new Date(quote.valid_until) < new Date();
            const effectiveStatus = isExpired && quote.status === "pending" ? "expired" : quote.status;
            const belowMoq        = quote.moq > quote.quantity;
            const isActing        = acting === quote.id;

            return (
              <div
                key={quote.id}
                className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${
                  effectiveStatus === "pending"  ? "border-yellow-200" :
                  effectiveStatus === "accepted" ? "border-green-200"  : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">{quote.product_name}</h3>
                      <Badge className={QUOTE_STATUS_COLORS[effectiveStatus]}>
                        {effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)}
                      </Badge>
                      {effectiveStatus === "accepted" && (
                        <Badge className="bg-green-100 text-green-700">
                          <Warehouse size={10} className="mr-1" /> In Warehouse Queue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-brand-500" />
                      Sourced by <span className="font-medium text-gray-700">FastFulfill Sourcing Team</span>
                    </p>
                  </div>

                  {effectiveStatus === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" loading={isActing} onClick={() => handleRespond(quote.id, "accepted")}>
                        <CheckCircle2 size={14} /> Accept & Confirm Stock
                      </Button>
                      <Button size="sm" variant="outline" disabled={isActing} onClick={() => handleRespond(quote.id, "declined")}>
                        <XCircle size={14} /> Decline
                      </Button>
                    </div>
                  )}
                  {effectiveStatus === "accepted" && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                      <CheckCircle2 size={15} /> Confirmed
                    </span>
                  )}
                  {effectiveStatus === "declined" && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                      <XCircle size={15} /> Declined
                    </span>
                  )}
                </div>

                {belowMoq && effectiveStatus === "pending" && (
                  <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800">
                    <AlertCircle size={13} className="shrink-0" />
                    This quote requires a minimum of <span className="font-semibold">{quote.moq} units</span>.
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Tag size={11} /> Unit Price</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.unit_price)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">MOQ: <span className={quote.moq < MIN_MOQ ? "text-red-500 font-semibold" : "font-medium"}>{quote.moq} units</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Truck size={11} /> Shipping & Storage</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(quote.shipping_cost)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Incl. warehouse delivery</p>
                  </div>
                  <div className="bg-brand-50 rounded-xl p-4">
                    <p className="text-xs text-brand-600 font-medium mb-1">Total Cost</p>
                    <p className="text-lg font-bold text-brand-700">{formatCurrency(quote.total_cost)}</p>
                    <p className="text-xs text-brand-500 mt-0.5">{formatCurrency(quote.total_cost / quote.quantity)}/unit landed</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Clock size={11} /> Lead Time</p>
                    <p className="text-lg font-bold text-gray-900">{quote.lead_time_days}d</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={10} /> Valid until {formatDate(quote.valid_until)}</p>
                  </div>
                </div>

                {effectiveStatus === "accepted" && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-green-800 mb-2"><Warehouse size={12} className="inline mr-1" /> What happens next</p>
                    <div className="flex flex-wrap gap-2 text-xs text-green-700">
                      <span className="flex items-center gap-1"><CheckCircle2 size={11} /> Bulk procurement initiated</span>
                      <span className="text-green-300">·</span>
                      <span className="flex items-center gap-1"><Warehouse size={11} /> Stock arriving at fulfillment center</span>
                      <span className="text-green-300">·</span>
                      <span className="flex items-center gap-1"><Truck size={11} /> Orders will auto-ship when stock is ready</span>
                    </div>
                  </div>
                )}

                {quote.notes && (
                  <p className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                    <span className="font-medium text-gray-700">Note:</span> {quote.notes}
                  </p>
                )}
                <p className="mt-3 text-xs text-gray-400">Received {formatDate(quote.created_at)} · Qty: {quote.quantity} units</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
