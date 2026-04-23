"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, Search, ChevronRight, CheckCircle2,
  Package, Truck, Warehouse, Loader2, ExternalLink,
} from "lucide-react";
import type { ProcurementItem, ProcurementStatus } from "@/types/database";
import { loadProcurement, advanceProcurementStatus } from "@/app/actions/sourcing-desk";

const PIPELINE: { key: ProcurementStatus; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "sourcing",     label: "Sourcing",    icon: Search,   color: "text-gray-600",  bg: "bg-gray-100"  },
  { key: "ordered",      label: "Ordered",     icon: Package,  color: "text-blue-700",  bg: "bg-blue-100"  },
  { key: "in_transit",   label: "In Transit",  icon: Truck,    color: "text-amber-700", bg: "bg-amber-100" },
  { key: "at_warehouse", label: "At Warehouse",icon: Warehouse,color: "text-green-700", bg: "bg-green-100" },
];

const STATUS_CTA: Record<ProcurementStatus, string | null> = {
  sourcing:     "Mark as Ordered",
  ordered:      "Mark In Transit",
  in_transit:   "Confirm at Warehouse",
  at_warehouse: null,
};

function PipelineBar({ status }: { status: ProcurementStatus }) {
  const idx = PIPELINE.findIndex((p) => p.key === status);
  return (
    <div className="flex items-center gap-1">
      {PIPELINE.map((step, i) => {
        const done = i < idx; const current = i === idx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              current ? `${step.bg} ${step.color} ring-1 ring-current/30` : done ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-300"
            }`}>
              {done ? <CheckCircle2 size={11} /> : <Icon size={11} />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < PIPELINE.length - 1 && <ChevronRight size={11} className={i < idx ? "text-green-400" : "text-gray-200"} />}
          </div>
        );
      })}
    </div>
  );
}

export default function ProcurementPage() {
  const [items, setItems]           = useState<ProcurementItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<"all" | ProcurementStatus>("all");
  const [showSupplier, setShowSupplier] = useState(false);
  const [advancing, setAdvancing]   = useState<string | null>(null);

  useEffect(() => {
    loadProcurement().then(({ data }) => {
      setItems(data as ProcurementItem[]);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? items : items.filter((p) => p.status === filter);

  const counts = {
    sourcing:     items.filter((p) => p.status === "sourcing").length,
    ordered:      items.filter((p) => p.status === "ordered").length,
    in_transit:   items.filter((p) => p.status === "in_transit").length,
    at_warehouse: items.filter((p) => p.status === "at_warehouse").length,
  };

  async function handleAdvance(id: string, currentStatus: string) {
    setAdvancing(id);
    const { error } = await advanceProcurementStatus(id, currentStatus);
    if (!error) {
      const nextMap: Record<string, ProcurementStatus> = {
        sourcing: "ordered", ordered: "in_transit", in_transit: "at_warehouse",
      };
      const next = nextMap[currentStatus] as ProcurementStatus;
      setItems((prev) => prev.map((p) => p.id !== id ? p : {
        ...p,
        status: next,
        ordered_at: next === "ordered" ? new Date().toISOString() : p.ordered_at,
        eta: next === "ordered" ? new Date(Date.now() + 14 * 86_400_000).toISOString() : p.eta,
      }));
    }
    setAdvancing(null);
  }

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Deals Procurement</h1>
          <p className="mt-1 text-sm text-gray-500">Track every accepted deal from sourcing through to warehouse arrival.</p>
        </div>
        <button onClick={() => setShowSupplier((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-xl transition-colors">
          {showSupplier ? "Hide supplier info" : "Show supplier info"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {PIPELINE.map((step) => {
          const Icon = step.icon;
          return (
            <button key={step.key} onClick={() => setFilter((f) => f === step.key ? "all" : step.key)}
              className={`card p-4 text-left transition-all hover:shadow-md ${filter === step.key ? "ring-2 ring-brand-400" : ""}`}>
              <div className={`w-8 h-8 rounded-lg ${step.bg} flex items-center justify-center mb-2`}>
                <Icon size={16} className={step.color} />
              </div>
              <p className={`text-xl font-bold ${step.color}`}>{counts[step.key]}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{step.label}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="card py-16 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-400">Loading procurement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card py-16 flex flex-col items-center gap-3">
            <ShoppingCart size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400">No procurement items in this stage.</p>
          </div>
        ) : null}

        {!loading && filtered.map((item) => {
          const cta        = STATUS_CTA[item.status];
          const statusMeta = PIPELINE.find((p) => p.key === item.status)!;
          const Icon       = statusMeta.icon;
          const isAdv      = advancing === item.id;

          return (
            <div key={item.id} className={`card overflow-hidden ${item.status === "at_warehouse" ? "border-green-200" : ""}`}>
              {item.status === "at_warehouse" && (
                <div className="bg-green-600 text-white text-xs font-semibold px-5 py-1.5 flex items-center justify-between">
                <span>Received at warehouse and ready to log into fulfillment inventory</span>
                  <Link href="/fulfillment/inbound" className="flex items-center gap-1 underline underline-offset-2 hover:no-underline">
                    Open Fulfillment Portal <ExternalLink size={10} />
                  </Link>
                </div>
              )}

              <div className="px-5 py-5">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className={`w-10 h-10 rounded-xl ${statusMeta.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={statusMeta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">{item.ref}</span>
                      <span className="text-xs text-gray-400">{item.seller_ref}</span>
                      <span className={`badge ${statusMeta.bg} ${statusMeta.color}`}>{statusMeta.label}</span>
                    </div>
                    <h3 className="mt-1.5 font-semibold text-gray-900">{item.product_name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                      <span>SKU: <span className="font-mono text-gray-700">{item.sku}</span></span>
                      <span>Qty: <strong className="text-gray-800">{item.qty} units</strong></span>
                      {item.eta && <span>ETA: <strong className="text-gray-800">{new Date(item.eta).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong></span>}
                      {item.ordered_at && <span>Ordered: {new Date(item.ordered_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                    </div>
                    {showSupplier && (
                      <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs">
                        <span className="text-amber-600 font-medium">🔒 Internal:</span>
                        <span className="text-amber-800 font-semibold">{item.supplier_name}</span>
                        <span className="text-amber-600">· ${Number(item.supplier_cost).toFixed(2)}/unit</span>
                      </div>
                    )}
                    {item.notes && <p className="mt-2 text-xs text-gray-400 italic">{item.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <PipelineBar status={item.status} />
                    {cta && (
                      <button
                        onClick={() => handleAdvance(item.id, item.status)}
                        disabled={isAdv}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        {isAdv ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
                        {cta}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
