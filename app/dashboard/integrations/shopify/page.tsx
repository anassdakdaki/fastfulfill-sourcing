"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Store,
  ShoppingBag,
  Package,
  Zap,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type Step = 1 | 2 | 3;

const FEATURES = [
  { icon: ShoppingBag, label: "Order sync imports new orders instantly" },
  { icon: Zap,         label: "Auto fulfill ships as soon as an order arrives" },
  { icon: Package,     label: "Inventory tracking keeps stock levels in sync" },
  { icon: Store,       label: "Product catalog maps all listings automatically" },
];

const INSTALL_STEPS = [
  "Authenticating with Shopify",
  "Installing FastFulfill app",
  "Syncing your catalog",
];

function StepIndicator({ current }: { current: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Store URL" },
    { n: 2, label: "Installing" },
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
                  ? "bg-[#96bf48] text-white"
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

export default function ShopifyIntegrationPage() {
  const [step, setStep] = useState<Step>(1);
  const [storeUrl, setStoreUrl] = useState("");
  const [installProgress, setInstallProgress] = useState(0);
  const [autoFulfill, setAutoFulfill] = useState(true);

  // Simulate the install sequence when on step 2
  useEffect(() => {
    if (step !== 2) return;
    setInstallProgress(0);

    const t1 = setTimeout(() => setInstallProgress(1), 600);
    const t2 = setTimeout(() => setInstallProgress(2), 1200);
    const t3 = setTimeout(() => {
      setInstallProgress(3);
      setStep(3);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!storeUrl.trim()) return;
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

      {/* Shopify wordmark */}
      <div className="flex items-center gap-3">
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: "2rem", color: "#96bf48" }}
        >
          shopify
        </span>
        <span className="text-sm font-semibold uppercase tracking-wide text-gray-300">with</span>
        <span className="text-xl font-bold text-gray-900">FastFulfill</span>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

          {/* Step 1: Enter store URL */}
      {step === 1 && (
        <div className="card p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Connect your Shopify store</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your store URL to begin the OAuth authorization flow.
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Store URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="your-store.myshopify.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#96bf48]/40 focus:border-[#96bf48] transition"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You can find this in your Shopify admin URL.
              </p>
            </div>

            {/* What you'll get */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-3">
                What you&apos;ll get
              </p>
              <ul className="space-y-2">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-green-900">
                    <Icon size={14} className="text-[#96bf48] shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: "#96bf48" }}
            >
              <Store size={16} />
              Connect with Shopify
            </button>
          </form>
        </div>
      )}

          {/* Step 2: Installing */}
      {step === 2 && (
        <div className="card p-8 flex flex-col items-center text-center space-y-6">
          <Loader2 size={40} className="animate-spin text-[#96bf48]" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Installing FastFulfill</h2>
            <p className="text-sm text-gray-500 mt-1">
              Connecting to{" "}
              <span className="font-medium text-gray-800">{storeUrl}</span>...
            </p>
          </div>

          <ul className="w-full text-left space-y-3">
            {INSTALL_STEPS.map((label, idx) => {
              const done = installProgress > idx;
              const active = installProgress === idx;
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
                    <Loader2 size={16} className="animate-spin text-[#96bf48] shrink-0" />
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

          {/* Step 3: Connected */}
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
                { label: "Orders synced",    value: "142" },
                { label: "Products imported", value: "89" },
                { label: "Auto-fulfill",      value: "Active" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-green-50 rounded-xl py-3 px-2">
                  <p className="text-lg font-bold text-green-700">{value}</p>
                  <p className="text-xs text-green-600 mt-0.5">{label}</p>
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
                  Automatically fulfill new Shopify orders as they arrive.
                </p>
              </div>
              <button
                onClick={() => setAutoFulfill((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold shrink-0"
              >
                {autoFulfill ? (
                  <>
                    <ToggleRight size={28} className="text-[#96bf48]" />
                    <span className="text-[#96bf48]">On</span>
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
