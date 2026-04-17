"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Loader2, Heart,
  Package, Zap, Star, ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";

const STEPS = ["Enter API Key", "Connecting", "Connected"];

const FEATURES = [
  { icon: Heart,   label: "Etsy order sync — new orders imported instantly" },
  { icon: Package, label: "Inventory tracking — listings kept in stock" },
  { icon: Star,    label: "Product catalog mapping for all active listings" },
  { icon: Zap,     label: "Auto-fulfill Etsy orders via FastFulfill" },
];

type StepState = { label: string; done: boolean; active: boolean };

export default function EtsyConnectPage() {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [apiKey, setApiKey] = useState("");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");
  const [autoFulfill, setAutoFulfill] = useState(true);
  const [connectSteps, setConnectSteps] = useState<StepState[]>([
    { label: "Validating Etsy API key",      done: false, active: false },
    { label: "Connecting to your Etsy shop", done: false, active: false },
    { label: "Importing active listings",    done: false, active: false },
  ]);

  function handleConnect() {
    if (!apiKey.trim()) {
      setError("Please enter your Etsy API key.");
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
      setConnectSteps(prev =>
        prev.map((s, idx) => (idx === i ? { ...s, done: true, active: false } : s))
      );
    timers.push(setTimeout(() => activate(0), 200));
    timers.push(setTimeout(() => complete(0), 900));
    timers.push(setTimeout(() => activate(1), 1000));
    timers.push(setTimeout(() => complete(1), 1700));
    timers.push(setTimeout(() => activate(2), 1800));
    timers.push(setTimeout(() => complete(2), 2600));
    timers.push(setTimeout(() => setStage(2), 2900));
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
        <span className="text-3xl font-bold" style={{ color: "#F56400" }}>etsy</span>
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
                  ? { backgroundColor: "#F56400", color: "#fff" }
                  : stage > i
                  ? { backgroundColor: "#fff3e0", color: "#7c2d12" }
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect your Etsy Shop</h2>
            <p className="text-sm text-gray-500">
              Enter your Etsy API key to sync orders and listings with FastFulfill.
            </p>
          </div>

          {/* How to get key */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-900 space-y-1">
            <p className="font-semibold">How to get your Etsy API key</p>
            <ol className="list-decimal list-inside space-y-0.5 text-orange-800">
              <li>Go to <span className="font-mono">etsy.com/developers</span></li>
              <li>Create a new app or select an existing one</li>
              <li>Copy the <strong>Keystring</strong> (API Key)</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etsy API Key (Keystring)</label>
              <input
                type="text"
                placeholder="e.g. a1b2c3d4e5f6g7h8i9j0..."
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="YourEtsyShopName"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: "#fff7ed" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#7c2d12" }}>
              What you&apos;ll unlock
            </p>
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm" style={{ color: "#7c2d12" }}>
                <Icon size={14} className="shrink-0" style={{ color: "#F56400" }} />
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={handleConnect}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#F56400" }}
          >
            Connect Etsy Shop
          </button>
        </div>
      )}

      {/* Stage 1 */}
      {stage === 1 && (
        <div className="card p-10 text-center space-y-6">
          <Loader2 size={52} className="mx-auto animate-spin" style={{ color: "#F56400" }} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting to Etsy…</h2>
            <p className="text-sm text-gray-400 mt-1">Verifying your API key and syncing listings.</p>
          </div>
          <div className="text-left space-y-3 max-w-xs mx-auto">
            {connectSteps.map(s => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                {s.done
                  ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                  : s.active
                  ? <Loader2 size={18} className="animate-spin shrink-0" style={{ color: "#F56400" }} />
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
            <h2 className="text-2xl font-bold text-gray-900">Etsy Shop connected!</h2>
            <p className="text-sm text-gray-500">{shopName || "Your shop"} is now synced with FastFulfill</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Orders Synced",  value: "43" },
              { label: "Listings Found", value: "28" },
              { label: "Status",         value: "Active" },
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
                <p className="text-sm font-medium text-gray-700">Auto-Fulfill Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">Send Etsy orders to FastFulfill automatically</p>
              </div>
              <button onClick={() => setAutoFulfill(v => !v)}>
                {autoFulfill
                  ? <ToggleRight size={30} style={{ color: "#F56400" }} />
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
