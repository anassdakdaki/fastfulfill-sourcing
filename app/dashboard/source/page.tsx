"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ExternalLink, Warehouse, Package, Truck, ShieldCheck, AlertCircle, CheckCircle, Loader2, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SOURCE_STATUS_COLORS, formatDate } from "@/lib/utils";
import { loadMySourceRequests, submitSourceRequest } from "@/app/actions/source-requests";
import { checkStoreConnected } from "@/app/actions/dashboard";
import type { SourceRequest } from "@/types/database";

const MIN_MOQ = 50;

const COUNTRIES = [
  { value: "United States",  label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada",         label: "Canada" },
  { value: "Australia",      label: "Australia" },
  { value: "Germany",        label: "Germany" },
  { value: "France",         label: "France" },
  { value: "Netherlands",    label: "Netherlands" },
  { value: "Spain",          label: "Spain" },
  { value: "Italy",          label: "Italy" },
  { value: "UAE",            label: "UAE" },
  { value: "Other",          label: "Other" },
];

const HOW_IT_WORKS = [
  { step: "1", icon: Search,      title: "You submit a request",    desc: "Send us a product link or description with your target quantity (min 50 units) and destination." },
  { step: "2", icon: ShieldCheck, title: "We source & quote you",   desc: "Our team finds the best supplier, applies quality checks, and sends you a quote within 24h." },
  { step: "3", icon: Warehouse,   title: "You confirm & we procure",desc: "Once you accept the quote, we bulk-order your stock and store it in our fulfillment warehouse." },
  { step: "4", icon: Truck,       title: "Orders ship automatically",desc: "Every order from your store is fulfilled one-by-one from your warehouse stock by our team." },
];

export default function SourceRequestPage() {
  const [requests, setRequests]       = useState<SourceRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [storeConnected, setStoreConnected] = useState<boolean | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [qtyError, setQtyError]       = useState("");
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    product_url: "", product_name: "", quantity: "", target_country: "", notes: "",
  });

  useEffect(() => {
    Promise.all([
      loadMySourceRequests(),
      checkStoreConnected(),
    ]).then(([{ data }, { connected }]) => {
      setRequests(data as SourceRequest[]);
      setStoreConnected(connected);
      setLoading(false);
    });
  }, []);

  function validateQty(val: string) {
    const n = parseInt(val);
    if (!val) { setQtyError(""); return; }
    if (isNaN(n) || n < MIN_MOQ) {
      setQtyError(`Minimum ${MIN_MOQ} units required.`);
    } else {
      setQtyError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(form.quantity);
    if (!form.quantity || qty < MIN_MOQ) { setQtyError(`Minimum ${MIN_MOQ} units required.`); return; }
    setSubmitting(true);
    setSubmitError("");

    const { error } = await submitSourceRequest({
      product_url: form.product_url,
      product_name: form.product_name,
      quantity: qty,
      target_country: form.target_country,
      notes: form.notes,
    });

    if (error) {
      setSubmitError(error);
      setSubmitting(false);
      return;
    }

    // Reload requests from DB
    const { data } = await loadMySourceRequests();
    setRequests(data as SourceRequest[]);

    setForm({ product_url: "", product_name: "", quantity: "", target_country: "", notes: "" });
    setQtyError("");
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 6000);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Source a Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">Request a product — we source, store, and fulfill it for you.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHowItWorks(v => !v)} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            How it works
          </button>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            disabled={storeConnected === false}
            title={storeConnected === false ? "Connect a store first" : undefined}
          >
            <Plus size={15} /> New Request
          </Button>
        </div>
      </div>

      {showHowItWorks && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">How FastFulfill sourcing works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{step}</div>
                  <Icon size={15} className="text-brand-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store gate — must connect a store before sourcing */}
      {storeConnected === false && (
        <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Plug size={18} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-900">Connect your store first</p>
            <p className="text-xs text-red-700 mt-1">
              You need to connect your Shopify, WooCommerce, Amazon, or TikTok Shop before submitting a
              sourcing request. This lets FastFulfill know where to fulfill orders once your stock arrives.
            </p>
          </div>
          <Link href="/dashboard/integrations" className="shrink-0">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
              <Plug size={13} /> Connect Store
            </Button>
          </Link>
        </div>
      )}

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <Package size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Minimum 50 units required per product</p>
          <p className="text-xs text-amber-700 mt-1">
            FastFulfill sources your products in bulk and stores them in our fulfillment warehouse.
            Orders ship individually to your customers — you never deal with suppliers or logistics.
          </p>
        </div>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Request submitted!</p>
            <p className="text-xs text-green-700 mt-0.5">Our sourcing team will review your request and send you a quote within 24 hours.</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">New Sourcing Request</h2>
          <p className="text-sm text-gray-500 mb-6">
            Paste the product link and we&apos;ll handle sourcing, quality checks, and fulfillment.
            <span className="ml-1 font-medium text-amber-700">Min. 50 units required.</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Product URL *"
              type="url"
              placeholder="https://alibaba.com/product/..."
              value={form.product_url}
              onChange={(e) => setForm({ ...form, product_url: e.target.value })}
              required
              hint="Paste a link from Alibaba, 1688, Temu, Taobao, etc."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Product Name (optional)"
                placeholder="e.g. Wireless Earbuds Pro"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              />
              <div>
                <Input
                  label={`Quantity * (min ${MIN_MOQ})`}
                  type="number"
                  placeholder="e.g. 100"
                  value={form.quantity}
                  onChange={(e) => { setForm({ ...form, quantity: e.target.value }); validateQty(e.target.value); }}
                  required
                  min={String(MIN_MOQ)}
                />
                {qtyError && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{qtyError}</p>}
                {form.quantity && !qtyError && parseInt(form.quantity) >= MIN_MOQ && (
                  <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} />Good — {form.quantity} units</p>
                )}
              </div>
            </div>
            <Select
              label="Destination Country *"
              options={COUNTRIES}
              placeholder="Select destination country..."
              value={form.target_country}
              onChange={(e) => setForm({ ...form, target_country: e.target.value })}
              required
            />
            <Textarea
              label="Notes (optional)"
              placeholder="e.g. Private label needed, custom packaging, specific color variants..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700">After you submit:</p>
              <p>✓ Our team reviews and finds the best source</p>
              <p>✓ We send you a quote within 24h</p>
              <p>✓ You confirm → we order in bulk and store in our warehouse</p>
              <p>✓ Your orders are fulfilled automatically, one-by-one</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                loading={submitting}
                disabled={!!qtyError || !form.quantity || !form.product_url || !form.target_country}
              >
                Submit Request
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Your Requests ({requests.length})</h2>
          <p className="text-xs text-gray-400">All sourced & fulfilled by FastFulfill</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading your requests…
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Search size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">No sourcing requests yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">Submit your first request and we'll get back to you with a quote within 24 hours.</p>
            <Button className="mt-5" size="sm" onClick={() => setShowForm(true)} disabled={storeConnected === false}>
              <Plus size={15} /> New Request
            </Button>
            {storeConnected === false && (
              <p className="text-xs text-gray-400 mt-2">
                <Link href="/dashboard/integrations" className="text-brand-600 hover:underline">Connect your store</Link> to unlock sourcing.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Product", "Qty", "Country", "Status", "Quoted Price", "Date", "Ref"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((req, i) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {req.product_name ?? "—"}
                        {req.product_url && (
                          <a href={req.product_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-600">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className={req.quantity < MIN_MOQ ? "text-red-500 font-medium" : ""}>{req.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{req.target_country}</td>
                    <td className="px-6 py-4">
                      <Badge className={SOURCE_STATUS_COLORS[req.status]}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {req.quoted_price ? `$${req.quoted_price}/unit` : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(req.created_at)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">FF-REQ-{String(i + 1).padStart(4, "0")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
