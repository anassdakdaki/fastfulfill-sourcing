import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FileText, MessageSquarePlus, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quote, SourceRequest } from "@/types/database";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200",
  reviewing: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
  quoted: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200",
  approved: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-200",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Requested",
  reviewing: "Reviewing",
  quoted: "Quoted",
  approved: "Accepted",
  rejected: "Issue",
};

async function loadSupplierOverview() {
  const supabase = await createClient();

  const [{ data: requests, error: requestsError }, { data: quotes, error: quotesError }] = await Promise.all([
    supabase
      .from("source_requests")
      .select("*")
      .in("status", ["pending", "reviewing"])
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    requests: (requests ?? []) as SourceRequest[],
    quotes: (quotes ?? []) as Quote[],
    error: requestsError?.message ?? quotesError?.message ?? null,
  };
}

function hoursAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Less than 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function SourcingDeskOverview() {
  const { requests, quotes, error } = await loadSupplierOverview();

  const newRequests = requests.filter((r) => r.status === "pending").length;
  const awaitingReply = quotes.filter((q) => q.status === "pending").length;
  const acceptedCount = quotes.filter((q) => q.status === "accepted").length;
  const estRevenue = quotes
    .filter((q) => q.status === "accepted")
    .reduce((sum, quote) => sum + Number(quote.total_cost ?? 0), 0);

  const urgentRequests = requests.filter((request) => {
    const hours = (Date.now() - new Date(request.created_at).getTime()) / 3_600_000;
    return hours > 24;
  });

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Sourcing Desk</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Command Center</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review real buyer requests, send quotes, and track accepted work.
          </p>
        </div>
        <Link
          href="/supplier/requests"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <MessageSquarePlus size={15} />
          Requests
          {newRequests > 0 && (
            <span className="bg-white text-brand-600 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
              {newRequests}
            </span>
          )}
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "New Requests", value: newRequests, color: "text-brand-600 dark:text-brand-300", accent: "bg-brand-500", icon: MessageSquarePlus },
          { label: "Awaiting Reply", value: awaitingReply, color: "text-amber-700 dark:text-amber-300", accent: "bg-amber-500", icon: Clock },
          { label: "Accepted Quotes", value: acceptedCount, color: "text-green-700 dark:text-green-300", accent: "bg-green-500", icon: CheckCircle2 },
          { label: "Est. Revenue", value: formatCurrency(estRevenue), color: "text-purple-700 dark:text-purple-300", accent: "bg-purple-500", icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accent}`} />
            <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
              <stat.icon size={17} className={stat.color} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {urgentRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-300" />
            <h2 className="font-semibold text-amber-900 dark:text-amber-100">
              {urgentRequests.length} request{urgentRequests.length > 1 ? "s" : ""} waiting over 24h
            </h2>
          </div>
          <div className="space-y-2">
            {urgentRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-amber-100 dark:bg-gray-900 dark:border-amber-900">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{request.product_name ?? "Product request"}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{request.quantity} units | {request.target_country}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{hoursAgo(request.created_at)}</span>
                <Link href="/supplier/requests" className="shrink-0 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                  Reply <ArrowRight size={11} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Open Requests</h2>
          </div>
          {requests.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No open sourcing requests right now.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{request.product_name ?? "Product request"}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {request.quantity} units | {request.target_country} | {formatDate(request.created_at)}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_BADGE[request.status]}`}>{STATUS_LABEL[request.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Quotes</h2>
            <Link href="/supplier/quotes" className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-300 font-medium flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {quotes.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              <FileText size={24} className="mx-auto mb-2 opacity-40" />
              No quotes sent yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {quotes.map((quote) => (
                <div key={quote.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{quote.product_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {quote.quantity} units | {formatCurrency(Number(quote.total_cost))} | {quote.lead_time_days} days
                    </p>
                  </div>
                  <span className={`badge ${quote.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-200" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                    {quote.status === "accepted" ? "Accepted" : quote.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
