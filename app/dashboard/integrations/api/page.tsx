"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Key, Plus, Copy, Trash2, CheckCircle,
  Globe, Eye, EyeOff, Code, RefreshCw, Shield,
} from "lucide-react";
import { DUMMY_API_KEYS, DUMMY_WEBHOOKS } from "@/lib/dummy-data";
import type { ApiKey as DBApiKey, Webhook as DBWebhook } from "@/types/database";

// Local UI shape extends DB fields with display only concerns
type UIApiKey = {
  id: string;
  name: string;       // maps from DBApiKey.label
  keyPreview: string; // maps from DBApiKey.key_preview
  fullKey: string;    // maps from DBApiKey.full_key (only shown on create / reveal)
  created_at: string;
  last_used: string | null;
  permissions: string[]; // UI-only, not in DB yet
};

type UIWebhook = {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  last_triggered: string | null;
};

function dbKeyToUI(k: DBApiKey, perms = ["read", "write"]): UIApiKey {
  return {
    id: k.id,
    name: k.label,
    keyPreview: k.key_preview,
    fullKey: k.full_key,
    created_at: k.created_at,
    last_used: k.last_used,
    permissions: perms,
  };
}

function dbWebhookToUI(w: DBWebhook): UIWebhook {
  return {
    id: w.id,
    url: w.url,
    events: w.events,
    status: w.status,
    last_triggered: w.last_triggered,
  };
}

const WEBHOOK_EVENTS = [
  { value: "order.created",    label: "Order Created",      desc: "Fires when a new order is placed" },
  { value: "order.fulfilled",  label: "Order Fulfilled",    desc: "Fires when an order is shipped" },
  { value: "order.cancelled",  label: "Order Cancelled",    desc: "Fires when an order is cancelled" },
  { value: "quote.received",   label: "Quote Received",     desc: "Fires when FastFulfill sends a quote" },
  { value: "invoice.issued",   label: "Invoice Issued",     desc: "Fires when an invoice is created" },
  { value: "inventory.low",    label: "Inventory Low",      desc: "Fires when stock drops below threshold" },
];

const CODE_EXAMPLES: Record<string, string> = {
  js: `const res = await fetch("https://api.fastfullfill.com/v1/orders", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
});
const { orders } = await res.json();`,
  python: `import requests

resp = requests.get(
  "https://api.fastfullfill.com/v1/orders",
  headers={"Authorization": "Bearer YOUR_API_KEY"},
)
orders = resp.json()["orders"]`,
  curl: `curl https://api.fastfullfill.com/v1/orders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
};


export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<UIApiKey[]>(DUMMY_API_KEYS.map(k => dbKeyToUI(k)));
  const [webhooks, setWebhooks] = useState<UIWebhook[]>(DUMMY_WEBHOOKS.map(dbWebhookToUI));

  // API key creation
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(["read"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Webhook creation
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [newWHUrl, setNewWHUrl] = useState("");
  const [newWHEvents, setNewWHEvents] = useState<string[]>([]);

  // UI state
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [codeTab, setCodeTab] = useState<"js" | "python" | "curl">("js");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function togglePermission(perm: string) {
    setNewKeyPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  }

  function toggleEvent(ev: string) {
    setNewWHEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  }

  function createApiKey() {
    if (!newKeyName.trim()) return;
    const raw     = "ff_live_" + Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14);
    const preview = raw.slice(0, 10) + "•".repeat(20) + raw.slice(-4);
    const newKey: UIApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      keyPreview: preview,
      fullKey: raw,
      created_at: new Date().toISOString(),
      last_used: null,
      permissions: newKeyPerms,
    };
    setApiKeys(prev => [newKey, ...prev]);
    setCreatedKey(raw);
    setNewKeyName("");
    setNewKeyPerms(["read"]);
    setShowNewKey(false);
  }

  function deleteKey(id: string) {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    setDeleteConfirm(null);
  }

  function createWebhook() {
    if (!newWHUrl.trim() || newWHEvents.length === 0) return;
    const wh: UIWebhook = {
      id: Date.now().toString(),
      url: newWHUrl,
      events: newWHEvents,
      status: "active",
      last_triggered: null,
    };
    setWebhooks(prev => [wh, ...prev]);
    setNewWHUrl("");
    setNewWHEvents([]);
    setShowNewWebhook(false);
  }

  function deleteWebhook(id: string) {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  }

  function toggleWebhookStatus(id: string) {
    setWebhooks(prev =>
      prev.map(w =>
        w.id === id ? { ...w, status: w.status === "active" ? "inactive" : "active" } : w
      )
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/integrations"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Back to Integrations
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
          <Code size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">API Keys & Webhooks</h1>
          <p className="text-sm text-gray-500">Manage programmatic access to FastFulfill</p>
        </div>
      </div>

      {/* Created key banner */}
      {createdKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
              <CheckCircle size={16} /> New API key created. Copy it now, it won&apos;t be shown again
          </div>
          <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
            <code className="flex-1 text-xs font-mono text-gray-800 break-all">{createdKey}</code>
            <button
              onClick={() => copyToClipboard(createdKey, "created")}
              className="shrink-0 text-gray-500 hover:text-gray-800"
            >
              {copied === "created" ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)} className="text-xs text-green-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* API Keys section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">API Keys</h2>
            <span className="badge bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {apiKeys.length}
            </span>
          </div>
          <button
            onClick={() => setShowNewKey(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            <Plus size={14} /> New Key
          </button>
        </div>

        {/* New key form */}
        {showNewKey && (
          <div className="card p-5 space-y-4 border-2 border-dashed border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Create API Key</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Key Name</label>
              <input
                type="text"
                placeholder="e.g. Production, Staging, Webhook Server"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {["read", "write", "orders", "inventory", "webhooks"].map(p => (
                  <button
                    key={p}
                    onClick={() => togglePermission(p)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      newKeyPerms.includes(p)
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createApiKey}
                disabled={!newKeyName.trim()}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Generate Key
              </button>
              <button
                onClick={() => setShowNewKey(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Keys list */}
        <div className="space-y-3">
          {apiKeys.length === 0 && (
            <div className="card p-8 text-center text-sm text-gray-400">
              No API keys yet. Create one to get started.
            </div>
          )}
          {apiKeys.map(k => (
            <div key={k.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{k.name}</p>
                    {k.permissions.map(p => (
                      <span key={p} className="badge bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {new Date(k.created_at).toLocaleDateString()} ·{" "}
                    {k.last_used ? `Last used ${new Date(k.last_used).toLocaleDateString()}` : "Never used"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setRevealedKeys(prev => {
                      const n = new Set(prev);
                      if (n.has(k.id)) {
                        n.delete(k.id);
                      } else {
                        n.add(k.id);
                      }
                      return n;
                    })}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title={revealedKeys.has(k.id) ? "Hide" : "Reveal"}
                  >
                    {revealedKeys.has(k.id) ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(k.fullKey, k.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title="Copy"
                  >
                    {copied === k.id ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                  {deleteConfirm === k.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteKey(k.id)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(k.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 font-mono text-xs">
                <span className="text-gray-700 break-all">
                  {revealedKeys.has(k.id) ? k.fullKey : k.keyPreview}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Webhooks section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">Webhooks</h2>
            <span className="badge bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {webhooks.length}
            </span>
          </div>
          <button
            onClick={() => setShowNewWebhook(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            <Plus size={14} /> Add Endpoint
          </button>
        </div>

        {/* New webhook form */}
        {showNewWebhook && (
          <div className="card p-5 space-y-4 border-2 border-dashed border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Add Webhook Endpoint</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint URL</label>
              <input
                type="url"
                placeholder="https://your-server.com/webhooks/fastfullfill"
                value={newWHUrl}
                onChange={e => setNewWHUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Events to subscribe</p>
              <div className="space-y-2">
                {WEBHOOK_EVENTS.map(ev => (
                  <label key={ev.value} className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newWHEvents.includes(ev.value)}
                      onChange={() => toggleEvent(ev.value)}
                      className="mt-0.5 accent-gray-900"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{ev.label}</p>
                      <p className="text-xs text-gray-400">{ev.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createWebhook}
                disabled={!newWHUrl.trim() || newWHEvents.length === 0}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Add Endpoint
              </button>
              <button
                onClick={() => setShowNewWebhook(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Webhooks list */}
        <div className="space-y-3">
          {webhooks.length === 0 && (
            <div className="card p-8 text-center text-sm text-gray-400">
              No webhooks yet. Add an endpoint to receive event notifications.
            </div>
          )}
          {webhooks.map(wh => (
            <div key={wh.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono text-gray-800 truncate max-w-xs">{wh.url}</code>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        wh.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {wh.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {wh.last_triggered
                      ? `Last triggered ${new Date(wh.last_triggered).toLocaleDateString()}`
                      : "Never triggered"}{" "}
                    · {wh.events.length} event{wh.events.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleWebhookStatus(wh.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title={wh.status === "active" ? "Disable" : "Enable"}
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wh.events.map(ev => (
                  <span key={ev} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-mono">
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code examples */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Code size={18} className="text-gray-600" />
          <h2 className="text-base font-semibold text-gray-900">Code Examples</h2>
        </div>
        <div className="card overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(["js", "python", "curl"] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setCodeTab(lang)}
                className={`px-5 py-3 text-xs font-semibold transition-colors ${
                  codeTab === lang
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {lang === "js" ? "JavaScript" : lang === "python" ? "Python" : "cURL"}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => copyToClipboard(CODE_EXAMPLES[codeTab], "code")}
              className="px-4 text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1.5"
            >
              {copied === "code" ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
              Copy
            </button>
          </div>
          <pre className="p-5 bg-gray-950 text-green-400 text-xs overflow-x-auto leading-relaxed">
            <code>{CODE_EXAMPLES[codeTab]}</code>
          </pre>
        </div>
      </section>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-900">
          <p className="font-semibold mb-0.5">Keep your API keys secure</p>
          <p className="text-xs text-amber-800">
            Never expose API keys in client-side code or public repositories. Rotate keys immediately if
            you suspect they have been compromised. FastFulfill will never ask you for your key.
          </p>
        </div>
      </div>
    </div>
  );
}
