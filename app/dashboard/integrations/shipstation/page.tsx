"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Loader2, Truck,
  ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";

const STEPS = ["API Credentials", "Connecting", "Connected"];

const CARRIERS = [
  { id: "usps",   label: "USPS",        flag: "🇺🇸" },
  { id: "fedex",  label: "FedEx",       flag: "🇺🇸" },
  { id: "ups",    label: "UPS",         flag: "🇺🇸" },
  { id: "dhl",    label: "DHL Express", flag: "🌍" },
  { id: "canada", label: "Canada Post", flag: "🇨🇦" },
  { id: "royal",  label: "Royal Mail",  flag: "🇬🇧" },
];

type StepState = { label: string; done: boolean; active: boolean };

export default function ShipStationConnectPage() {
  const [stage, setStage]         = useState<0 | 1 | 2>(0);
  const [apiKey, setApiKey]       = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [carriers, setCarriers]   = useState<string[]>(["usps", "fedex"]);
  const [autoRoute, setAutoRoute] = useState(true);
  const [rateShopping, setRateShopping] = useState(true);
  const [error, setError]         = useState("");
  const [connectSteps, setConnectSteps] = useState<StepState[]>([
    { label: "Validating ShipStation credentials", done: false, active: false },
    { label: "Connecting carrier accounts",        done: false, active: false },
    { label: "Configuring fulfillment rules",      done: false, active: false },
  ]);

  function toggleCarrier(id: string) {
    setCarriers(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function handleConnect() {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setError("Both API Key and API Secret are required.");
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
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Truck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ShipStation</h1>
          <p className="text-xs text-gray-500">Multi-Carrier Shipping × FastFulfill</p>
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
                  ? { backgroundColor: "#4338ca", color: "#fff" }
                  : stage > i
                  ? { backgroundColor: "#e0e7ff", color: "#3730a3" }
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect ShipStation</h2>
            <p className="text-sm text-gray-500">
              Connect your ShipStation account to generate labels and manage shipments across 70+ carriers.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 space-y-1">
            <p className="font-semibold">How to get your API credentials</p>
            <ol className="list-decimal list-inside space-y-0.5 text-indigo-800">
              <li>Log in to ShipStation → <strong>Account Settings</strong></li>
              <li>Go to <strong>API Settings</strong> under Integrations</li>
              <li>Copy your <strong>API Key</strong> and <strong>API Secret</strong></li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="text"
                placeholder="e.g. ab1234cd5678ef90..."
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
              <input
                type="password"
                placeholder="••••••••••••••••••"
                value={apiSecret}
                onChange={e => { setApiSecret(e.target.value); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Active Carriers</p>
            <div className="grid grid-cols-2 gap-2">
              {CARRIERS.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer border rounded-xl px-3 py-2 hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={carriers.includes(c.id)}
                    onChange={() => toggleCarrier(c.id)}
                    className="accent-indigo-600"
                  />
                  <span>{c.flag}</span>
                  <span className="text-sm text-gray-700">{c.label}</span>
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
            style={{ backgroundColor: "#4338ca" }}
          >
            Connect ShipStation
          </button>
        </div>
      )}

      {stage === 1 && (
        <div className="card p-10 text-center space-y-6">
          <Loader2 size={52} className="mx-auto animate-spin text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connecting to ShipStation…</h2>
            <p className="text-sm text-gray-400 mt-1">{carriers.length} carrier{carriers.length !== 1 ? "s" : ""} selected</p>
          </div>
          <div className="text-left space-y-3 max-w-xs mx-auto">
            {connectSteps.map(s => (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                {s.done
                  ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                  : s.active
                  ? <Loader2 size={18} className="animate-spin shrink-0 text-indigo-600" />
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
            <h2 className="text-2xl font-bold text-gray-900">ShipStation connected!</h2>
            <p className="text-sm text-gray-500">{carriers.length} carriers active</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Carriers Active", value: String(carriers.length) },
              { label: "Labels Generated", value: "0" },
              { label: "Status",           value: "Active" },
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
                <p className="text-sm font-medium text-gray-700">Auto-Generate Labels</p>
                <p className="text-xs text-gray-400 mt-0.5">Create shipping labels automatically when orders are packed</p>
              </div>
              <button onClick={() => setAutoRoute(v => !v)}>
                {autoRoute
                  ? <ToggleRight size={30} className="text-indigo-600" />
                  : <ToggleLeft size={30} className="text-gray-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Rate Shopping</p>
                <p className="text-xs text-gray-400 mt-0.5">Automatically pick the cheapest carrier for each order</p>
              </div>
              <button onClick={() => setRateShopping(v => !v)}>
                {rateShopping
                  ? <ToggleRight size={30} className="text-indigo-600" />
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
