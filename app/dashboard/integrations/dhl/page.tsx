"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Loader2,
  Globe, ToggleLeft, ToggleRight, AlertCircle, Zap, Package,
} from "lucide-react";

const STEPS = ["Account ID", "Connecting", "Connected"];

const PRODUCTS = [
  { id: "ecom_parcel",   label: "DHL eCommerce Parcel" },
  { id: "express",       label: "DHL Express Worldwide" },
  { id: "parcel_intl",   label: "DHL Parcel International" },
  { id: "packet_intl",   label: "DHL Packet International" },
];

type StepState = { label: string; done: boolean; active: boolean };

export default function DHLConnectPage() {
  const [stage, setStage]               = useState<0 | 1 | 2>(0);
  const [clientId, setClientId]         = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [selectedProducts, setSelected] = useState<string[]>(["ecom_parcel", "express"]);
  const [autoRoute, setAutoRoute]       = useState(true);
  const [error, setError]               = useState("");
  const [connectSteps, setConnectSteps] = useState<StepState[]>([
    { label: "Authenticating with DHL API Gateway",  done: false, active: false },
    { label: "Activating selected services",          done: false, active: false },
    { label: "Configuring pickup schedules",          done: false, active: false },
  ]);

  function toggleProduct(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function handleConnect() {
    if (!clientId.trim() || !clientSecret.trim()) {
      setError("Client ID and Client Secret are required.");
      return;
    }
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
    timers.push(setTimeout(() => complete(0), 900));
    timers.push(setTimeout(() => activate(1), 1000));
    timers.push(setTimeout(() => complete(1), 1800));
    timers.push(setTimeout(() => activate(2), 1900));
    timers.push(setTimeout(() => complete(2), 2700));
    timers.push(setTimeout(() => setStage(2), 3000));
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
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFCC00" }}>
          <Package size={20} className="text-gray-900" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">DHL eCommerce</h1>
          <p className="text-xs text-gray-500">Global Carrier × FastFulfill</p>
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
                  ? { backgroundColor: "#D40511", color: "#fff" }
                  : stage > i
                  ? { backgroundColor: "#fef9c3", color: "#854d0e" }
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

      {stage === 0 && (
        <div className="card p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect DHL eCommerce</h2>
            <p className="text-sm text-gray-500">
              DHL is ideal for high-volume international shipping, especially EU and Asia destinations.
            </p>
          </div>

          <div className="rounded-xl p-3 text-xs text-amber-900 space-y-1" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a", border: "1px solid" }}>
            <p className="font-semibold">How to get your credentials</p>
            <ol className="list-decimal list-inside space-y-0.5 text-amber-800">
              <li>Go to <strong>developer.dhl.com</strong> → My Apps</li>
              <li>Create a new app and select <strong>eCommerce API</strong></li>
              <li>Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input
                type="text"
                placeholder="e.g. dhl_client_abc123..."
                value={clientId}
                onChange={e => { setClientId(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
              <input
                type="password"
                placeholder="••••••••••••••••••"
                value={clientSecret}
                onChange={e => { setClientSecret(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">DHL Services to activate</p>
            <div className="space-y-2">
              {PRODUCTS.map(p => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="accent-yellow-500"
                  />
                  <span className="text-sm text-gray-700">{p.label}</span>
                  {selectedProducts.includes(p.id) && (
                    <CheckCircle size={13} className="text-yellow-500 ml-auto" />
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

          <button
            onClick={handleConnect}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#D40511" }}
          >
            Connect DHL eCommerce
          </button>
        </div>
      )}

      {stage === 1 && (
        <div className="card p-10 text-center space-y-6">
          <Loader2 size={52} className="mx-auto animate-spin" style={{ color: "#D40511" }} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting to DHL…</h2>
            <p className="text-sm text-gray-400 mt-1">{selectedProducts.length} service{selectedProducts.length !== 1 ? "s" : ""} selected</p>
          </div>
          <div className="text-left space-y-3 max-w-xs mx-auto">
            {connectSteps.map(s => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                {s.done
                  ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                  : s.active
                  ? <Loader2 size={18} className="animate-spin shrink-0" style={{ color: "#D40511" }} />
                  : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 shrink-0" />}
                <span className={s.done ? "text-gray-700" : s.active ? "font-medium text-gray-900" : "text-gray-400"}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="space-y-4">
          <div className="card p-8 text-center space-y-3">
            <CheckCircle size={56} className="mx-auto text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">DHL connected!</h2>
            <p className="text-sm text-gray-500">{selectedProducts.length} services active · 220+ countries</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Services Active",  value: String(selectedProducts.length) },
              { label: "Countries Covered", value: "220+" },
              { label: "Status",            value: "Active" },
            ].map(({ label, value }) => (
              <div key={label} className="card p-4 text-center">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Shipping Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-Route International Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">Send cross-border orders to DHL automatically</p>
              </div>
              <button onClick={() => setAutoRoute(v => !v)}>
                {autoRoute
                  ? <ToggleRight size={30} style={{ color: "#D40511" }} />
                  : <ToggleLeft size={30} className="text-gray-300" />}
              </button>
            </div>
            {autoRoute && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 text-xs text-yellow-800">
                <Zap size={13} className="text-yellow-600 shrink-0" />
                Cross-border orders will be forwarded to DHL automatically.
              </div>
            )}
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
