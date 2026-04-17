"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Loader2, Package,
  Zap, ToggleLeft, ToggleRight, Globe, ShoppingCart, AlertCircle,
} from "lucide-react";

const STEPS = ["Select Marketplace", "Authorizing", "Connected"];

const MARKETPLACES = [
  { code: "US", label: "Amazon.com (US)",        flag: "🇺🇸" },
  { code: "UK", label: "Amazon.co.uk (UK)",       flag: "🇬🇧" },
  { code: "DE", label: "Amazon.de (Germany)",     flag: "🇩🇪" },
  { code: "FR", label: "Amazon.fr (France)",      flag: "🇫🇷" },
  { code: "CA", label: "Amazon.ca (Canada)",      flag: "🇨🇦" },
  { code: "AU", label: "Amazon.com.au (AU)",      flag: "🇦🇺" },
  { code: "JP", label: "Amazon.co.jp (Japan)",    flag: "🇯🇵" },
  { code: "AE", label: "Amazon.ae (UAE)",         flag: "🇦🇪" },
];

const FEATURES = [
  { icon: ShoppingCart, label: "Amazon order sync — auto-import FBM orders" },
  { icon: Package,      label: "Inventory sync — keep stock aligned with Amazon" },
  { icon: Globe,        label: "Multi-marketplace support" },
  { icon: Zap,          label: "Auto-fulfill FBM orders via FastFulfill" },
];

type StepState = { label: string; done: boolean; active: boolean };

export default function AmazonConnectPage() {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [selected, setSelected] = useState<string[]>(["US"]);
  const [autoFulfill, setAutoFulfill] = useState(true);
  const [connectSteps, setConnectSteps] = useState<StepState[]>([
    { label: "Redirecting to Amazon Seller Central", done: false, active: false },
    { label: "Authorizing FastFulfill access",       done: false, active: false },
    { label: "Importing order history",               done: false, active: false },
  ]);

  function toggleMarket(code: string) {
    setSelected(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  }

  useEffect(() => {
    if (stage !== 1) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const activate = (i: number) =>
      setConnectSteps(prev => prev.map((s, idx) => ({ ...s, active: idx === i })));
    const complete = (i: number) =>
      setConnectSteps(prev =>
        prev.map((s, idx) => (idx === i ? { ...s, done: true, active: false } : s))
      );
    timers.push(setTimeout(() => activate(0), 200));
    timers.push(setTimeout(() => complete(0), 1000));
    timers.push(setTimeout(() => activate(1), 1100));
    timers.push(setTimeout(() => complete(1), 2000));
    timers.push(setTimeout(() => activate(2), 2100));
    timers.push(setTimeout(() => complete(2), 3000));
    timers.push(setTimeout(() => setStage(2), 3300));
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Link
        href="/dashboard/integrations"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ArrowLeft size={16} /> Back to Integrations
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-bold" style={{ color: "#FF9900" }}>amazon</span>
        <span className="text-gray-400 text-xl font-light">× FastFulfill</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1 transition-all"
              style={
                stage === i
                  ? { backgroundColor: "#FF9900", color: "#fff" }
                  : stage > i
                  ? { backgroundColor: "#fef3c7", color: "#92400e" }
                  : { backgroundColor: "#f3f4f6", color: "#9ca3af" }
              }
            >
              {stage > i && <CheckCircle size={11} />}
              {s}
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Stage 0 — Select marketplaces */}
      {stage === 0 && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect Amazon Seller Central</h2>
            <p className="text-sm text-gray-500">
              Select the marketplaces you sell on, then authorize via Seller Central.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Your Marketplaces</p>
            <div className="grid grid-cols-2 gap-2">
              {MARKETPLACES.map(m => (
                <button
                  key={m.code}
                  onClick={() => toggleMarket(m.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    selected.includes(m.code)
                      ? "border-amber-400 bg-amber-50 text-amber-900 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{m.flag}</span>
                  <span className="truncate text-xs">{m.label}</span>
                  {selected.includes(m.code) && (
                    <CheckCircle size={12} className="text-amber-500 ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
            {selected.length === 0 && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> Select at least one marketplace.
              </p>
            )}
          </div>

          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: "#fffbeb" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#92400e" }}>
              What you&apos;ll unlock
            </p>
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm" style={{ color: "#78350f" }}>
                <Icon size={14} className="shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={() => selected.length > 0 && setStage(1)}
            disabled={selected.length === 0}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#FF9900" }}
          >
            Authorize with Amazon Seller Central
          </button>
        </div>
      )}

      {/* Stage 1 — Authorizing */}
      {stage === 1 && (
        <div className="card p-10 text-center space-y-6">
          <Loader2 size={52} className="mx-auto animate-spin" style={{ color: "#FF9900" }} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting to Amazon…</h2>
            <p className="text-sm text-gray-400 mt-1">
              {selected.length} marketplace{selected.length > 1 ? "s" : ""} selected
            </p>
          </div>
          <div className="text-left space-y-3 max-w-xs mx-auto">
            {connectSteps.map(s => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                {s.done
                  ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                  : s.active
                  ? <Loader2 size={18} className="animate-spin shrink-0" style={{ color: "#FF9900" }} />
                  : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 shrink-0" />}
                <span className={s.done ? "text-gray-700" : s.active ? "font-medium text-gray-900" : "text-gray-400"}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2 — Connected */}
      {stage === 2 && (
        <div className="space-y-4">
          <div className="card p-8 text-center space-y-3">
            <CheckCircle size={56} className="mx-auto text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Amazon connected!</h2>
            <p className="text-sm text-gray-500">
              {selected.length} marketplace{selected.length > 1 ? "s" : ""} synced
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Orders Imported", value: "318" },
              { label: "SKUs Mapped",     value: "54" },
              { label: "Status",          value: "Active" },
            ].map(({ label, value }) => (
              <div key={label} className="card p-4 text-center">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Integration Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-Fulfill FBM Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">Send FBM orders to FastFulfill automatically</p>
              </div>
              <button onClick={() => setAutoFulfill(v => !v)}>
                {autoFulfill
                  ? <ToggleRight size={30} style={{ color: "#FF9900" }} />
                  : <ToggleLeft size={30} className="text-gray-300" />}
              </button>
            </div>
          </div>
          <Link
            href="/dashboard/integrations"
            className="block w-full text-center py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Integrations
          </Link>
        </div>
      )}
    </div>
  );
}
