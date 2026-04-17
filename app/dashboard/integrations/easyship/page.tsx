"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Loader2, Plane,
  Globe, DollarSign, ToggleLeft, ToggleRight, AlertCircle, Zap,
} from "lucide-react";

const STEPS = ["API Key", "Connecting", "Connected"];

const ORIGINS = [
  { code: "CN", label: "China",       flag: "🇨🇳" },
  { code: "HK", label: "Hong Kong",   flag: "🇭🇰" },
  { code: "TW", label: "Taiwan",      flag: "🇹🇼" },
  { code: "SG", label: "Singapore",   flag: "🇸🇬" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
];

const FEATURES = [
  { icon: Plane,       label: "250+ courier options worldwide" },
  { icon: DollarSign,  label: "DDP pricing — duties included in buyer cost" },
  { icon: Globe,       label: "Asia-origin optimised shipping routes" },
  { icon: Zap,         label: "Automated customs documentation" },
  { icon: CheckCircle, label: "Live rate comparison across all couriers" },
];

type StepState = { label: string; done: boolean; active: boolean };

export default function EasyshipConnectPage() {
  const [stage, setStage]         = useState<0 | 1 | 2>(0);
  const [apiKey, setApiKey]       = useState("");
  const [origin, setOrigin]       = useState("CN");
  const [ddp, setDdp]             = useState(true);
  const [autoRoute, setAutoRoute] = useState(true);
  const [error, setError]         = useState("");
  const [connectSteps, setConnectSteps] = useState<StepState[]>([
    { label: "Authenticating with Easyship API",    done: false, active: false },
    { label: "Loading available couriers",           done: false, active: false },
    { label: "Configuring rate & routing rules",     done: false, active: false },
  ]);

  function handleConnect() {
    if (!apiKey.trim()) { setError("Please enter your Easyship API key."); return; }
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
    timers.push(setTimeout(() => complete(1), 1700));
    timers.push(setTimeout(() => activate(2), 1800));
    timers.push(setTimeout(() => complete(2), 2600));
    timers.push(setTimeout(() => setStage(2), 2900));
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  const originLabel = ORIGINS.find(o => o.code === origin);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Link
        href="/dashboard/integrations"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ArrowLeft size={16} /> Back to Integrations
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center">
          <Plane size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Easyship</h1>
          <p className="text-xs text-gray-500">International Shipping × FastFulfill</p>
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
                  ? { backgroundColor: "#0891b2", color: "#fff" }
                  : stage > i
                  ? { backgroundColor: "#cffafe", color: "#0e7490" }
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect Easyship</h2>
            <p className="text-sm text-gray-500">
              Best for cross-border shipping, especially if you&apos;re sourcing from China or Asia.
              Includes DDP pricing and automated customs docs.
            </p>
          </div>

          <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-3 text-xs text-cyan-900 space-y-1">
            <p className="font-semibold">How to get your API key</p>
            <ol className="list-decimal list-inside space-y-0.5 text-cyan-800">
              <li>Log in to your Easyship dashboard</li>
              <li>Go to <strong>Settings → API</strong></li>
              <li>Click <strong>Generate New API Key</strong> and copy it</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Easyship API Key</label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setError(""); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Ship-From Country</label>
            <div className="grid grid-cols-3 gap-2">
              {ORIGINS.map(o => (
                <button
                  key={o.code}
                  onClick={() => setOrigin(o.code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                    origin === o.code
                      ? "border-cyan-400 bg-cyan-50 text-cyan-900 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{o.flag}</span>
                  <span className="text-xs truncate">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: "#ecfeff" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800 mb-3">
              What you&apos;ll unlock
            </p>
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-cyan-900">
                <Icon size={14} className="shrink-0 text-cyan-500" />
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={handleConnect}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#0891b2" }}
          >
            Connect Easyship
          </button>
        </div>
      )}

      {stage === 1 && (
        <div className="card p-10 text-center space-y-6">
          <Loader2 size={52} className="mx-auto animate-spin text-cyan-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting to Easyship…</h2>
            <p className="text-sm text-gray-400 mt-1">Origin: {originLabel?.flag} {originLabel?.label}</p>
          </div>
          <div className="text-left space-y-3 max-w-xs mx-auto">
            {connectSteps.map(s => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                {s.done
                  ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                  : s.active
                  ? <Loader2 size={18} className="animate-spin shrink-0 text-cyan-600" />
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
            <h2 className="text-2xl font-bold text-gray-900">Easyship connected!</h2>
            <p className="text-sm text-gray-500">
              {originLabel?.flag} {originLabel?.label} → World
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Couriers Active", value: "250+" },
              { label: "Labels Created",  value: "0" },
              { label: "Status",          value: "Active" },
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
                <p className="text-sm font-medium text-gray-700">DDP Pricing</p>
                <p className="text-xs text-gray-400 mt-0.5">Include duties & taxes in the shipping cost shown to buyers</p>
              </div>
              <button onClick={() => setDdp(v => !v)}>
                {ddp
                  ? <ToggleRight size={30} className="text-cyan-600" />
                  : <ToggleLeft size={30} className="text-gray-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-Select Cheapest Rate</p>
                <p className="text-xs text-gray-400 mt-0.5">Automatically choose the best rate for each shipment</p>
              </div>
              <button onClick={() => setAutoRoute(v => !v)}>
                {autoRoute
                  ? <ToggleRight size={30} className="text-cyan-600" />
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
