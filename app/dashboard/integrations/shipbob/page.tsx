"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Loader2, Warehouse,
  Truck, Package, Zap, ToggleLeft, ToggleRight,
  AlertCircle, Globe, RefreshCw,
} from "lucide-react";

const STEPS = ["API Credentials", "Connecting", "Connected"];

const WAREHOUSES = [
  { code: "US-EAST",  label: "US East (Harrisburg, PA)", flag: "🇺🇸" },
  { code: "US-WEST",  label: "US West (Moreno Valley, CA)", flag: "🇺🇸" },
  { code: "EU",       label: "EU (Warsaw, Poland)", flag: "🇵🇱" },
  { code: "CA",       label: "Canada (Toronto, ON)", flag: "🇨🇦" },
  { code: "AUS",      label: "Australia (Melbourne)", flag: "🇦🇺" },
];

const FEATURES = [
  { icon: Truck,    label: "Auto-forward orders on receipt" },
  { icon: Warehouse,label: "Real-time inventory at warehouse" },
  { icon: RefreshCw,label: "Tracking auto-synced back to platform" },
  { icon: Globe,    label: "Multi-warehouse & multi-region routing" },
  { icon: Zap,      label: "Returns management built-in" },
];

type StepState = { label: string; done: boolean; active: boolean };

export default function ShipBobConnectPage() {
  const [stage, setStage]             = useState<0 | 1 | 2>(0);
  const [apiKey, setApiKey]           = useState("");
  const [selectedWH, setSelectedWH]  = useState<string[]>(["US-EAST"]);
  const [autoRoute, setAutoRoute]     = useState(true);
  const [error, setError]             = useState("");
  const [connectSteps, setConnectSteps] = useState<StepState[]>([
    { label: "Authenticating with ShipBob API",      done: false, active: false },
    { label: "Linking warehouse locations",           done: false, active: false },
    { label: "Importing existing inventory snapshot", done: false, active: false },
  ]);

  function toggleWH(code: string) {
    setSelectedWH(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  }

  function handleConnect() {
    if (!apiKey.trim()) { setError("Please enter your ShipBob API key."); return; }
    if (selectedWH.length === 0) { setError("Select at least one warehouse."); return; }
    setError("");
    setStage(1);
  }

  useEffect(() => {
    if (stage !== 1) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const activate = (i: number) =>
      setConnectSteps(prev => prev.map((s, idx) => ({ ...s, active: idx === i })));
    const complete = (i: number) =>
      setConnectSteps(prev => prev.map((s, idx) => idx === i ? { ...s, done: true, active: false } : s));
    timers.push(setTimeout(() => activate(0), 200));
    timers.push(setTimeout(() => complete(0), 1100));
    timers.push(setTimeout(() => activate(1), 1200));
    timers.push(setTimeout(() => complete(1), 2000));
    timers.push(setTimeout(() => activate(2), 2100));
    timers.push(setTimeout(() => complete(2), 3100));
    timers.push(setTimeout(() => setStage(2), 3400));
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
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Package size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ShipBob</h1>
          <p className="text-xs text-gray-500">3PL Fulfillment Partner × FastFulfill</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1 transition-all"
              style={
                stage === i
                  ? { backgroundColor: "#2563eb", color: "#fff" }
                  : stage > i
                  ? { backgroundColor: "#dbeafe", color: "#1e40af" }
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

      {/* Stage 0 */}
      {stage === 0 && (
        <div className="card p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect ShipBob</h2>
            <p className="text-sm text-gray-500">
              Enter your ShipBob API token and select which warehouses to route orders to.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 space-y-1">
            <p className="font-semibold">How to get your API token</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-800">
              <li>Log in to your ShipBob Merchant Portal</li>
              <li>Go to <strong>Integrations → API Tokens</strong></li>
              <li>Click <strong>Generate New Token</strong>, copy it here</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ShipBob API Token</label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••••••"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setError(""); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Warehouse Locations</p>
            <div className="space-y-2">
              {WAREHOUSES.map(w => (
                <label key={w.code} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedWH.includes(w.code)}
                    onChange={() => toggleWH(w.code)}
                    className="accent-blue-600"
                  />
                  <span className="text-lg">{w.flag}</span>
                  <span className={`text-sm ${selectedWH.includes(w.code) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                    {w.label}
                  </span>
                  {selectedWH.includes(w.code) && (
                    <CheckCircle size={14} className="text-blue-500 ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: "#eff6ff" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-3">
              What you&apos;ll unlock
            </p>
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-blue-900">
                <Icon size={14} className="shrink-0 text-blue-500" />
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={handleConnect}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#2563eb" }}
          >
            Connect ShipBob
          </button>
        </div>
      )}

      {/* Stage 1 */}
      {stage === 1 && (
        <div className="card p-10 text-center space-y-6">
          <Loader2 size={52} className="mx-auto animate-spin text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting to ShipBob…</h2>
            <p className="text-sm text-gray-400 mt-1">{selectedWH.length} warehouse{selectedWH.length > 1 ? "s" : ""} selected</p>
          </div>
          <div className="text-left space-y-3 max-w-xs mx-auto">
            {connectSteps.map(s => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                {s.done
                  ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                  : s.active
                  ? <Loader2 size={18} className="animate-spin shrink-0 text-blue-600" />
                  : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 shrink-0" />}
                <span className={s.done ? "text-gray-700" : s.active ? "font-medium text-gray-900" : "text-gray-400"}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2 */}
      {stage === 2 && (
        <div className="space-y-4">
          <div className="card p-8 text-center space-y-3">
            <CheckCircle size={56} className="mx-auto text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">ShipBob connected!</h2>
            <p className="text-sm text-gray-500">
              {selectedWH.length} warehouse{selectedWH.length > 1 ? "s" : ""} linked
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Orders Routed",  value: "0" },
              { label: "Warehouses",     value: String(selectedWH.length) },
              { label: "Status",         value: "Active" },
            ].map(({ label, value }) => (
              <div key={label} className="card p-4 text-center">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Fulfillment Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-Route Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Automatically send new orders to ShipBob without manual action
                </p>
              </div>
              <button onClick={() => setAutoRoute(v => !v)}>
                {autoRoute
                  ? <ToggleRight size={30} className="text-blue-600" />
                  : <ToggleLeft size={30} className="text-gray-300" />}
              </button>
            </div>
            {autoRoute && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-800">
                <Zap size={13} className="text-blue-500 shrink-0" />
                Orders will be forwarded to ShipBob automatically within seconds of arriving in FastFulfill.
              </div>
            )}
          </div>

          <div className="card p-5 space-y-2">
            <h3 className="text-sm font-semibold text-gray-800">Linked Warehouses</h3>
            {WAREHOUSES.filter(w => selectedWH.includes(w.code)).map(w => (
              <div key={w.code} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={14} className="text-green-500" />
                <span>{w.flag}</span>
                <span>{w.label}</span>
              </div>
            ))}
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
