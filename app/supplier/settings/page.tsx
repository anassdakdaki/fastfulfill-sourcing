"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ToggleLeft, ToggleRight, LogOut, Shield, Percent, Clock, Bell } from "lucide-react";

interface ToggleItem {
  key: string;
  label: string;
  description: string;
  value: boolean;
}

const DEFAULT_NOTIFS: ToggleItem[] = [
  { key: "new_request",  label: "New Sourcing Request",    description: "Alert when a seller submits a new request.",       value: true  },
  { key: "quote_accept", label: "Quote Accepted",          description: "Alert when a seller accepts your quote.",          value: true  },
  { key: "quote_decline",label: "Quote Declined",          description: "Alert when a seller declines your quote.",         value: true  },
  { key: "daily_digest", label: "Daily Digest Email",      description: "End-of-day summary of all requests and activity.", value: false },
];

function ToggleRow({
  label, description, value, onChange,
}: { label: string; description: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button onClick={onChange} className="shrink-0">
        {value
          ? <ToggleRight size={28} className="text-brand-600" />
          : <ToggleLeft  size={28} className="text-gray-300"  />
        }
      </button>
    </div>
  );
}

export default function SourcingSettingsPage() {
  // Team profile
  const [teamName, setTeamName]     = useState("FastFulfill Sourcing Desk");
  const [contactEmail, setContactEmail] = useState("sourcing@fastfullfill.com");
  const [profileSaved, setProfileSaved] = useState(false);

  // Pricing defaults
  const [defaultMargin, setDefaultMargin] = useState("20");
  const [quoteExpiry, setQuoteExpiry]     = useState("7");
  const [pricingSaved, setPricingSaved]   = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<ToggleItem[]>(DEFAULT_NOTIFS);

  // Templates
  const [templates, setTemplates] = useState({
    reviewing: "Hi! We've received your request and are sourcing the best options. We'll get back to you within 24 hours.",
    declined:  "Thank you for your request. Unfortunately we're unable to source this product at the required quantity/price. Please contact us to discuss alternatives.",
  });
  const [templatesSaved, setTemplatesSaved] = useState(false);

  function save(setSaved: (v: boolean) => void) {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="py-8 px-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your sourcing team profile, margin defaults, and notification preferences.</p>
      </div>

      {/* Team Profile */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Team Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Name</label>
            <input
              type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
            <input
              type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => save(setProfileSaved)}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save Profile
          </button>
          {profileSaved && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 size={15} /> Saved!</span>}
        </div>
      </div>

      {/* Pricing Defaults */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Percent size={16} className="text-brand-600" />
          <h2 className="text-base font-semibold text-gray-900">Pricing Defaults</h2>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          These apply to all new quotes. You can override them per-quote in the Requests page.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Default Margin (%)
            </label>
            <div className="relative">
              <input
                type="number" min="0" max="100" step="1"
                value={defaultMargin} onChange={(e) => setDefaultMargin(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              e.g. 20% → $4.00 cost becomes $4.80 seller price
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Clock size={13} className="text-gray-400" /> Quote Expiry (days)
            </label>
            <input
              type="number" min="1" max="30"
              value={quoteExpiry} onChange={(e) => setQuoteExpiry(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <p className="text-xs text-gray-400 mt-1">Quotes auto-expire after this many days.</p>
          </div>
        </div>
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm text-brand-800">
          <strong>Live preview:</strong> With {defaultMargin}% margin, a product costing $10.00 per unit
          will be quoted to the seller at <strong>${(10 * (1 + parseFloat(defaultMargin || "0") / 100)).toFixed(2)}</strong> per unit.
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => save(setPricingSaved)}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save Pricing Defaults
          </button>
          {pricingSaved && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 size={15} /> Saved!</span>}
        </div>
      </div>

      {/* Auto-reply Templates */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Auto-reply Templates</h2>
        <p className="text-xs text-gray-400 -mt-2">
          These messages are sent automatically to sellers when you update a request status.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reviewing — sent when you mark a request as &quot;Reviewing&quot;
            </label>
            <textarea
              rows={3} value={templates.reviewing}
              onChange={(e) => setTemplates((t) => ({ ...t, reviewing: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Declined — sent when you decline a request
            </label>
            <textarea
              rows={3} value={templates.declined}
              onChange={(e) => setTemplates((t) => ({ ...t, declined: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => save(setTemplatesSaved)}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save Templates
          </button>
          {templatesSaved && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 size={15} /> Saved!</span>}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={15} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        </div>
        <p className="text-xs text-gray-400 mb-2">Control which events alert your sourcing team.</p>
        <div className="divide-y divide-gray-100">
          {notifs.map((n) => (
            <ToggleRow
              key={n.key}
              label={n.label}
              description={n.description}
              value={n.value}
              onChange={() => setNotifs((prev) => prev.map((x) => x.key === n.key ? { ...x, value: !x.value } : x))}
            />
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500 flex items-start gap-2">
        <Shield size={13} className="shrink-0 mt-0.5 text-gray-400" />
        <span>
          <strong className="text-gray-700">Privacy guarantee:</strong> Supplier names, unit costs, and sourcing details
          are never exposed to sellers. Buyer identities are never exposed to suppliers.
          FastFulfill operates as the anonymous middleman on all transactions.
        </span>
      </div>

      {/* Account */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Account</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-gray-500">
              supplier@fastfullfill.com
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <span className="badge bg-brand-100 text-brand-700">Sourcing Team</span>
          </div>
        </div>
        <Link
          href="/auth/demo-logout"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-xl transition-colors border border-red-100"
        >
          <LogOut size={15} /> Sign Out
        </Link>
      </div>
    </div>
  );
}
