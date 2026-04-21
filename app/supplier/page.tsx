"use client";

import Link from "next/link";
import {
  MessageSquarePlus, FileText, TrendingUp, Clock,
  AlertTriangle, ArrowRight, CheckCircle2, RotateCcw,
} from "lucide-react";
import {
  DUMMY_SOURCING_REQUESTS,
  DUMMY_SENT_QUOTES,
  DUMMY_PROCUREMENT,
} from "@/lib/dummy-data";
import type { SourcingUrgency } from "@/types/database";

const URGENCY_BADGE: Record<SourcingUrgency, string> = {
  normal: "bg-gray-100 text-gray-600",
  high:   "bg-orange-100 text-orange-700",
  rush:   "bg-red-100 text-red-700",
};

function hoursAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SourcingDeskOverview() {
  const newRequests    = DUMMY_SOURCING_REQUESTS.filter((r) => r.status === "new").length;
  const awaitingReply  = DUMMY_SENT_QUOTES.filter((q) => q.status === "awaiting").length;
  const acceptedCount  = DUMMY_SENT_QUOTES.filter((q) => q.status === "accepted").length;
  const estRevenue     = DUMMY_SENT_QUOTES
    .filter((q) => q.status === "accepted")
    .reduce((s, q) => s + q.seller_total, 0);

  // Requests older than 48h with no reply = urgent
  const urgentRequests = DUMMY_SOURCING_REQUESTS.filter((r) => {
    if (r.status !== "new" && r.status !== "reviewing") return false;
    const hours = (Date.now() - new Date(r.created_at).getTime()) / 3_600_000;
    return hours > 24;
  });

  // Recent activity feed (combined, latest first)
  const activity = [
  { id: "a1", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", text: "Seller #3344 accepted quote FF-QTE-0020 for Resistance Band Set", time: "2h ago" },
  { id: "a2", icon: MessageSquarePlus, color: "text-brand-500", bg: "bg-brand-50", text: "New sourcing request from Seller #7703 for Foldable LED Desk Lamp", time: "5h ago" },
  { id: "a3", icon: MessageSquarePlus, color: "text-brand-500", bg: "bg-brand-50", text: "New sourcing request from Seller #4821 for Stainless Steel Bottle", time: "9h ago" },
  { id: "a4", icon: RotateCcw, color: "text-amber-500", bg: "bg-amber-50", text: "Procurement FF-PRC-0008 updated for Resistance Band order confirmed", time: "1d ago" },
  { id: "a5", icon: FileText, color: "text-purple-500", bg: "bg-purple-50", text: "Quote FF-QTE-0021 sent to Seller #1155 for Bamboo Cutting Board Set", time: "1d ago" },
  ];

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Sourcing Desk</p>
          <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review seller requests, send quotes, and track procurement all in one place.
          </p>
        </div>
        <Link
          href="/supplier/requests"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <MessageSquarePlus size={15} />
          New Requests
          {newRequests > 0 && (
            <span className="bg-white text-brand-600 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
              {newRequests}
            </span>
          )}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "New Requests",       value: newRequests,   color: "text-brand-600",  accent: "bg-brand-500",   icon: MessageSquarePlus },
          { label: "Awaiting Reply",      value: awaitingReply, color: "text-amber-700",  accent: "bg-amber-500",   icon: Clock             },
          { label: "Accepted Quotes",     value: acceptedCount, color: "text-green-700",  accent: "bg-green-500",   icon: CheckCircle2      },
          { label: "Est. Revenue",        value: `$${estRevenue.toLocaleString()}`, color: "text-purple-700", accent: "bg-purple-500", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="card p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${s.accent}`} />
            <div className={`w-9 h-9 rounded-xl ${s.accent.replace("bg-", "bg-").replace("500", "50").replace("brand-50", "brand-50")} flex items-center justify-center mb-3`}
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              <s.icon size={17} className={s.color} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Urgent Requests Banner */}
      {urgentRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="font-semibold text-amber-900">
              {urgentRequests.length} request{urgentRequests.length > 1 ? "s" : ""} waiting over 24h. Reply needed
            </h2>
          </div>
          <div className="space-y-2">
            {urgentRequests.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-amber-100">
                <span className="font-mono text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                  {r.ref}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.product_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.seller_ref} · {r.qty_requested} units · {r.target_country}</p>
                </div>
                <span className={`badge shrink-0 ${URGENCY_BADGE[r.urgency]}`}>{r.urgency}</span>
                <span className="text-xs text-gray-400 shrink-0">{hoursAgo(r.created_at)}</span>
                <Link
                  href="/supplier/requests"
                  className="shrink-0 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                >
                  Reply <ArrowRight size={11} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <a.icon size={13} className={a.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{a.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Procurement */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Active Procurement</h2>
            <Link href="/supplier/procurement" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {DUMMY_PROCUREMENT.map((p) => {
              const statusMeta = {
                sourcing:     { label: "Sourcing",     bg: "bg-gray-100",   text: "text-gray-600"  },
                ordered:      { label: "Ordered",      bg: "bg-blue-100",   text: "text-blue-700"  },
                in_transit:   { label: "In Transit",   bg: "bg-amber-100",  text: "text-amber-700" },
                at_warehouse: { label: "At Warehouse", bg: "bg-green-100",  text: "text-green-700" },
              }[p.status];
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.ref} · {p.seller_ref} · {p.qty} units</p>
                  </div>
                  <span className={`badge ${statusMeta.bg} ${statusMeta.text}`}>{statusMeta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
