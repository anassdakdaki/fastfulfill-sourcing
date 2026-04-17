"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  ShoppingBag,
  Package,
  Zap,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type Step = 1 | 2 | 3;

const VERIFY_STEPS = [
  "Validating API credentials",
  "Connecting to store",
  "Importing order history",
];

const API_KEY_STEPS = [
  'Log in to your WordPress dashboard.',
  'Navigate to WooCommerce → Settings.',
  'Click the Advanced tab.',
  'Select REST API from the sub-menu.',
  'Click Add Key, set permissions to Read/Write, and click Generate API Key.',
  'Copy the Consumer Key and Consumer Secret shown on screen.',
];

function StepIndicator({ current }: { current: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Credentials" },
    { n: 2, label: "Verifying" },
    { n: 3, label: "Connected" },
  ];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map(({ n, label }, idx) => (
        <div key={n} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                current === n
                  ? "bg-[#7f54b3] text-white"
                  : current > n
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {current > n ? <CheckCircle size={14} /> : n}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                current === n ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-px w-8 sm:w-12 transition-colors ${
                current > n ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function WooCommerceIntegrationPage() {
  const [step, setStep] = useState<Step>(1);
  const [storeUrl, setStoreUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [autoFulfill, setAutoFulfill] = useState(true);

  // Simulate verification sequence when on step 2
  useEffect(() => {
    if (step !== 2) return;
    setVerifyProgress(0);

    const t1 = setTimeout(() => setVerifyProgress(1), 500);
    const t2 = setTimeout(() => setVerifyProgress(2), 1000);
    const t3 = setTimeout(() => {
      setVerifyProgress(3);
      setStep(3);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!storeUrl.trim() || !consumerKey.trim() || !consumerSecret.trim()) return;
    setStep(2);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/integrations"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Integrations
      </Link>

      {/* WooCommerce wordmark */}
      <div className="flex items-center gap-3">
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: "1.75rem", color: "#7f54b3" }}
        >
          WooCommerce
        </span>
        <span className="text-gray-300 text-2xl font-light">×</span>
        <span className="text-xl font-bold text-gray-900">FastFulfill</span>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* ── Step 1: Enter credentials ── */}
      {step === 1 && (
        <div className="card p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Connect your WooCommerce store</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your store URL and REST API credentials to get started.
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            {/* Store URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Store URL
              </label>
              <input
                type="url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://your-store.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7f54b3]/30 focus:border-[#7f54b3] transition"
                required
              />
            </div>

            {/* Consumer Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Consumer Key
              </label>
              <input
                type="text"
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7f54b3]/30 focus:border-[#7f54b3] transition"
                required
              />
            </div>

            {/* Consumer Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Consumer Secret
              </label>
              <input
                type="password"
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7f54b3]/30 focus:border-[#7f54b3] transition"
                required
              />
            </div>

            {/* How to get API keys — accordion */}
            <div className="border border-purple-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setAccordionOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-sm font-semibold text-purple-800 hover:bg-purple-100 transition-colors"
              >
                <span>How to get your API keys</span>
                {accordionOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {accordionOpen && (
                <div className="px-4 py-4 bg-white">
                  <ol className="space-y-2.5">
                    {API_KEY_STEPS.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-gray-400 mt-3">
                    Path: WooCommerce → Settings → Advanced → REST API
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: "#7f54b3" }}
            >
              <ShoppingBag size={16} />
              Connect WooCommerce
            </button>
          </form>
        </div>
      )}

      {/* ── Step 2: Verifying ── */}
      {step === 2 && (
        <div className="card p-8 flex flex-col items-center text-center space-y-6">
          <Loader2 size={40} className="animate-spin text-[#7f54b3]" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Verifying connection</h2>
            <p className="text-sm text-gray-500 mt-1">
              Connecting to{" "}
              <span className="font-medium text-gray-800">{storeUrl}</span>...
            </p>
          </div>

          <ul className="w-full text-left space-y-3">
            {VERIFY_STEPS.map((label, idx) => {
              const done = verifyProgress > idx;
              const active = verifyProgress === idx;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-3 text-sm transition-colors ${
                    done
                      ? "text-green-700 font-medium"
                      : active
                      ? "text-gray-800 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {done ? (
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                  ) : active ? (
                    <Loader2 size={16} className="animate-spin text-[#7f54b3] shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                  {label}
                  {done && " ✓"}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Step 3: Connected ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card p-6 text-center space-y-3">
            <CheckCircle size={48} className="text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Store Connected!</h2>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{storeUrl}</span> is now synced with
              FastFulfill.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { label: "Orders imported",    value: "67",     icon: ShoppingBag },
                { label: "Products found",      value: "124",    icon: Package },
                { label: "Webhooks configured", value: "Active", icon: Zap },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-purple-50 rounded-xl py-3 px-2">
                  <Icon size={14} className="text-[#7f54b3] mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-700">{value}</p>
                  <p className="text-xs text-purple-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Configure Settings */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Configure Settings</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Auto-fulfill orders</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automatically fulfill new WooCommerce orders as they arrive.
                </p>
              </div>
              <button
                onClick={() => setAutoFulfill((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold shrink-0"
              >
                {autoFulfill ? (
                  <>
                    <ToggleRight size={28} className="text-[#7f54b3]" />
                    <span style={{ color: "#7f54b3" }}>On</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={28} className="text-gray-400" />
                    <span className="text-gray-500">Off</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/dashboard/integrations"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Integrations
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
