"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Loader2, Video,
  Package, Zap, TrendingUp, ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";

const STEPS = ["Enter Credentials", "Connecting", "Connected"];

const FEATURES = [
  { icon: Video,       label: "TikTok Shop order sync in real-time" },
  { icon: Package,     label: "Inventory sync across TikTok & warehouse" },
  { icon: TrendingUp,  label: "Sales analytics & top-performing products" },
  { icon: Zap,         label: "Auto-fulfill TikTok orders via FastFulfill" },
];

type StepState = { label: string; done: boolean; active: boolean };

export default function TikTokConnectPage() {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [shopId, setShopId] = useState("");
  const [error, setError] = useState("");
  const [autoFulfill, setAutoFulfill] = useState(true);
  const [connectSteps, setConnectSteps] = useState<StepState[]>([
    { label: "Validating TikTok app credentials", done: false, active: false },
    { label: "Connecting to your TikTok Shop",    done: false, active: false },
    { label: "Syncing orders & products",          done: false, active: false },
  ]);

  function handleConnect() {
    if (!appKey.trim() || !appSecret.trim()) {
      setError("App Key and App Secret are required.");
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
        <span className="text-3xl font-bold" style={{ color: "#010101" }}>TikTok</span>
        <span className="text-lg font-semibold text-pink-500">Shop</span>
        <span className="text-gray-400 text-xl font-light ml-1">× FastFulfill</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1 transition-all"
              style={
                stage === i
                  ? { background: "linear-gradient(135deg,#ff0050,#00f2ea)", color: "#fff" }
                  : stage > i
                  ? { backgroundColor: "#fce7f3", color: "#9d174d" }
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect TikTok Shop</h2>
            <p className="text-sm text-gray-500">
              Enter your TikTok for Developers app credentials to begin the connection.
            </p>
          </div>

          {/* Instructions link */}
          <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-xs text-pink-800 space-y-1">
            <p className="font-semibold">How to get your credentials</p>
            <ol className="list-decimal list-inside space-y-0.5 text-pink-700">
              <li>Go to TikTok for Developers → My Apps</li>
              <li>Create or select your app</li>
              <li>Find your App Key and App Secret under &quot;App Info&quot;</li>
              <li>Your Shop ID is in TikTok Seller Center → Account</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Key</label>
              <input
                type="text"
                placeholder="e.g. 6abc123xyz"
                value={appKey}
                onChange={e => { setAppKey(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Secret</label>
              <input
                type="password"
                placeholder="••••••••••••••••••"
                value={appSecret}
                onChange={e => { setAppSecret(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 7123456789012345678"
                value={shopId}
                onChange={e => setShopId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: "#fff0f6" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-pink-800">
              What you&apos;ll unlock
            </p>
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-pink-900">
                <Icon size={14} className="shrink-0 text-pink-500" />
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={handleConnect}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#ff0050,#ff375f)" }}
          >
            Connect TikTok Shop
          </button>
        </div>
      )}

      {/* Stage 1 */}
      {stage === 1 && (
        <div className="card p-10 text-center space-y-6">
          <Loader2 size={52} className="mx-auto animate-spin text-pink-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting to TikTok Shop…</h2>
            <p className="text-sm text-gray-400 mt-1">Verifying credentials and syncing data.</p>
          </div>
          <div className="text-left space-y-3 max-w-xs mx-auto">
            {connectSteps.map(s => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                {s.done
                  ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                  : s.active
                  ? <Loader2 size={18} className="animate-spin shrink-0 text-pink-500" />
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
            <h2 className="text-2xl font-bold text-gray-900">TikTok Shop connected!</h2>
            <p className="text-sm text-gray-500">Orders are now syncing in real-time</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Orders Synced",   value: "76" },
              { label: "Products Found",  value: "31" },
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
                <p className="text-sm font-medium text-gray-700">Auto-Fulfill Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">Send TikTok Shop orders to FastFulfill automatically</p>
              </div>
              <button onClick={() => setAutoFulfill(v => !v)}>
                {autoFulfill
                  ? <ToggleRight size={30} className="text-pink-500" />
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
