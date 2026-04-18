"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MessageSquarePlus, ChevronDown, ChevronUp, ExternalLink,
  Calculator, CheckCircle2, X, Clock, Loader2,
} from "lucide-react";
import type { SourcingRequest, SourcingRequestStatus, SourcingUrgency } from "@/types/database";
import {
  loadSourcingRequests,
  markRequestReviewing,
  declineRequest,
  sendQuoteToSeller,
} from "@/app/actions/sourcing-desk";

type FilterTab = "all" | SourcingRequestStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "new",       label: "New"       },
  { key: "reviewing", label: "Reviewing" },
  { key: "quoted",    label: "Quoted"    },
  { key: "accepted",  label: "Accepted"  },
  { key: "declined",  label: "Declined"  },
];

const STATUS_BADGE: Record<SourcingRequestStatus, string> = {
  new:       "bg-brand-100 text-brand-700",
  reviewing: "bg-blue-100 text-blue-700",
  quoted:    "bg-amber-100 text-amber-700",
  accepted:  "bg-green-100 text-green-700",
  declined:  "bg-gray-100 text-gray-500",
};

const URGENCY_BADGE: Record<SourcingUrgency, { badge: string; label: string }> = {
  normal: { badge: "bg-gray-100 text-gray-500",    label: "Normal" },
  high:   { badge: "bg-orange-100 text-orange-700", label: "High"   },
  rush:   { badge: "bg-red-100 text-red-700",       label: "Rush"   },
};

const DEFAULT_MARGIN = 20;

function hoursAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface QuoteForm { ourCost: string; shipping: string; moq: string; leadTime: string; notes: string; }
const EMPTY_FORM: QuoteForm = { ourCost: "", shipping: "", moq: "50", leadTime: "14", notes: "" };

export default function SourcingRequestsPage() {
  const [requests, setRequests] = useState<SourcingRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterTab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [forms, setForms]       = useState<Record<string, QuoteForm>>({});
  const [sent, setSent]         = useState<Record<string, boolean>>({});
  const [sending, setSending]   = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    loadSourcingRequests().then(({ data }) => {
      setRequests(data as SourcingRequest[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => filter === "all" ? requests : requests.filter((r) => r.status === filter),
    [requests, filter]
  );

  const counts = useMemo<Record<FilterTab, number>>(() => ({
    all:       requests.length,
    new:       requests.filter((r) => r.status === "new").length,
    reviewing: requests.filter((r) => r.status === "reviewing").length,
    quoted:    requests.filter((r) => r.status === "quoted").length,
    accepted:  requests.filter((r) => r.status === "accepted").length,
    declined:  requests.filter((r) => r.status === "declined").length,
  }), [requests]);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
    if (!forms[id]) setForms((prev) => ({ ...prev, [id]: { ...EMPTY_FORM } }));
  }

  function updateForm(id: string, field: keyof QuoteForm, val: string) {
    setForms((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_FORM), [field]: val } }));
  }

  async function handleMarkReviewing(id: string) {
    setActionId(id);
    await markRequestReviewing(id);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "reviewing" } : r));
    setActionId(null);
  }

  async function handleSendQuote(req: SourcingRequest) {
    const form = forms[req.id] ?? EMPTY_FORM;
    if (!form.ourCost || parseFloat(form.ourCost) <= 0) return;
    setSending(req.id);

    const { error } = await sendQuoteToSeller(req.id, {
      ourCost:  parseFloat(form.ourCost),
      shipping: parseFloat(form.shipping) || 0,
      moq:      parseInt(form.moq) || 50,
      leadTime: parseInt(form.leadTime) || 14,
      notes:    form.notes,
    });

    if (!error) {
      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: "quoted" } : r));
      setSent((prev) => ({ ...prev, [req.id]: true }));
      setExpanded(null);
    }
    setSending(null);
  }

  async function handleDecline(id: string) {
    setActionId(id);
    await declineRequest(id);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "declined" } : r));
    setExpanded(null);
    setActionId(null);
  }

  function calcMargin(reqId: string, qty: number) {
    const form       = forms[reqId] ?? EMPTY_FORM;
    const cost       = parseFloat(form.ourCost) || 0;
    const ship       = parseFloat(form.shipping) || 0;
    const sellerUnit = cost > 0 ? cost * (1 + DEFAULT_MARGIN / 100) : 0;
    const sellerShip = ship * (1 + DEFAULT_MARGIN / 100);
    const margin     = (sellerUnit - cost) * qty;
    return { cost, sellerUnit, sellerShip, margin };
  }

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sourcing Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review requests from sellers, find a supplier, and send back a quote with your margin built in invisibly.
        </p>
      </div>

      {/* Workflow strip */}
      <div className="flex items-center gap-0 text-xs overflow-x-auto pb-1 select-none">
        {["Seller submits", "You review & source", "Send quote (+20%)", "Seller accepts", "Procurement starts"].map((step, i, arr) => (
          <div key={step} className="flex items-center shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-600 font-medium whitespace-nowrap">
              <span className="w-4 h-4 bg-brand-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
              {step}
            </div>
            {i < arr.length - 1 && <div className="w-4 h-px bg-gray-300 shrink-0 mx-0.5" />}
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
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">{counts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="card py-16 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-400">Loading requests…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card py-16 flex flex-col items-center gap-3">
            <MessageSquarePlus size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No requests in this category.</p>
          </div>
        ) : null}

        {!loading && filtered.map((req) => {
          const isOpen   = expanded === req.id;
          const isSent   = sent[req.id];
          const urgency  = URGENCY_BADGE[req.urgency];
          const form     = forms[req.id] ?? EMPTY_FORM;
          const calc     = calcMargin(req.id, req.qty_requested);
          const canReply = req.status === "new" || req.status === "reviewing";
          const isSending = sending === req.id;
          const isActing  = actionId === req.id;

          return (
            <div key={req.id} className={`card overflow-hidden transition-all ${req.urgency === "rush" ? "border-red-200" : ""}`}>
              {req.urgency === "rush" && req.status === "new" && (
                <div className="bg-red-600 text-white text-xs font-semibold px-5 py-1.5 flex items-center gap-2">
                  ⚡ Rush request — seller expects fast response
                </div>
              )}

              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(req.id)}
              >
                <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md shrink-0">{req.ref}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{req.product_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{req.seller_ref} · {req.qty_requested} units · {req.target_country} · {req.category}</p>
                </div>
                <span className={`badge shrink-0 ${urgency.badge}`}>{urgency.label}</span>
                <span className={`badge shrink-0 ${STATUS_BADGE[req.status]}`}>{req.status}</span>
                <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1 whitespace-nowrap">
                  <Clock size={11} /> {hoursAgo(req.created_at)}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-5 space-y-5">
                  {isSent ? (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span className="text-sm text-green-800 font-medium">Quote sent to {req.seller_ref} — awaiting their response.</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="card p-4 space-y-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Request Details</p>
                          {[
                            ["Seller",   req.seller_ref],
                            ["Quantity", `${req.qty_requested} units`],
                            ["Ship To",  req.target_country],
                            ["Category", req.category],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm">
                              <span className="text-gray-500">{k}</span>
                              <span className="font-medium text-gray-900">{v}</span>
                            </div>
                          ))}
                          {req.product_url && (
                            <a href={req.product_url} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 mt-1"
                               onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={11} /> View product reference link
                            </a>
                          )}
                        </div>
                        {req.notes && (
                          <div className="card p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Seller Notes</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{req.notes}</p>
                          </div>
                        )}
                      </div>

                      {canReply && (
                        <>
                          <div className="card p-5 space-y-4">
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <Calculator size={15} className="text-brand-600" /> Build Your Quote
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                { label: "Your Cost / Unit ($)", field: "ourCost" as const, placeholder: "e.g. 4.50", step: "0.01", hint: "internal only" },
                                { label: "Shipping Cost ($)",    field: "shipping" as const, placeholder: "e.g. 250",  step: "1",    hint: "internal" },
                                { label: "MOQ",                  field: "moq" as const,      placeholder: "50",        step: "1",    hint: "min 50" },
                                { label: "Lead Time (days)",     field: "leadTime" as const,  placeholder: "14",        step: "1",    hint: "" },
                              ].map(({ label, field, placeholder, step, hint }) => (
                                <div key={field}>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    {label} {hint && <span className="text-gray-400 font-normal">{hint}</span>}
                                  </label>
                                  <input
                                    type="number" step={step} min="0" placeholder={placeholder}
                                    value={form[field]}
                                    onChange={(e) => updateForm(req.id, field, e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                  />
                                </div>
                              ))}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Message to Seller</label>
                              <textarea
                                rows={2} placeholder="e.g. Available in 3 colours. OEM logo printing included…"
                                value={form.notes}
                                onChange={(e) => updateForm(req.id, "notes", e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                              />
                            </div>
                          </div>

                          {calc.cost > 0 && (
                            <div className="rounded-2xl bg-gradient-to-r from-brand-50 via-white to-green-50 border border-brand-100 px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-3 flex items-center gap-1.5">
                                <Calculator size={12} /> Live Margin Preview — {DEFAULT_MARGIN}% markup applied
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="bg-white rounded-xl px-4 py-2.5 border border-gray-100 text-center min-w-[90px]">
                                  <p className="text-xs text-gray-400 mb-0.5">Your cost / unit</p>
                                  <p className="font-bold text-gray-900">${calc.cost.toFixed(2)}</p>
                                </div>
                                <span className="text-gray-400 text-base font-bold">→ +{DEFAULT_MARGIN}% →</span>
                                <div className="bg-white rounded-xl px-4 py-2.5 border border-brand-200 text-center min-w-[100px]">
                                  <p className="text-xs text-brand-600 mb-0.5">Seller sees / unit</p>
                                  <p className="font-bold text-brand-700">${calc.sellerUnit.toFixed(2)}</p>
                                </div>
                                <span className="text-gray-400 text-base">×{req.qty_requested}</span>
                                <span className="text-gray-400">=</span>
                                <div className="bg-green-600 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
                                  <p className="text-xs text-green-200 mb-0.5">Your margin</p>
                                  <p className="font-bold text-white">${calc.margin.toFixed(0)}</p>
                                </div>
                              </div>
                              <p className="mt-2.5 text-xs text-gray-400">
                                Your supplier cost and identity are <strong className="text-gray-600">never shown to the seller</strong>.
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            {req.status === "new" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkReviewing(req.id); }}
                                disabled={isActing}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-40 flex items-center gap-2"
                              >
                                {isActing ? <Loader2 size={13} className="animate-spin" /> : null}
                                Mark as Reviewing
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSendQuote(req); }}
                              disabled={!form.ourCost || parseFloat(form.ourCost) <= 0 || isSending}
                              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                            >
                              {isSending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                              Send Quote to {req.seller_ref}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDecline(req.id); }}
                              disabled={isActing}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5"
                            >
                              <X size={13} /> Decline
                            </button>
                          </div>
                        </>
                      )}

                      {!canReply && (
                        <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                          req.status === "accepted" ? "bg-green-50 text-green-800 border border-green-200" :
                          req.status === "declined" ? "bg-gray-100 text-gray-500" :
                          "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          <CheckCircle2 size={14} />
                          {req.status === "accepted" && "Seller accepted this quote — view Procurement for next steps."}
                          {req.status === "quoted"   && "Quote has been sent. Waiting for seller to respond."}
                          {req.status === "declined" && "This request was declined."}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
