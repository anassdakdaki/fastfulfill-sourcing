"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ToggleLeft, ToggleRight, LogOut, Shield } from "lucide-react";

interface Toggle {
  key: string;
  label: string;
  description: string;
  value: boolean;
}

const DEFAULT_NOTIFICATIONS: Toggle[] = [
  { key: "new_inbound",  label: "New Inbound Shipment Alert",      description: "Notify when a new inbound is scheduled.",         value: true  },
  { key: "pack_ready",   label: "Order Ready to Pack",             description: "Notify when a new order enters the queue.",       value: true  },
  { key: "low_stock",    label: "Low Stock Warning (< 20 units)",  description: "Notify when a SKU drops below threshold.",        value: true  },
  { key: "daily_email",  label: "Daily Summary Email",             description: "Receive an end-of-day operations summary.",       value: false },
];

const DEFAULT_CSV: Toggle[] = [
  { key: "auto_ship",   label: "Auto-mark orders shipped on import", description: "Orders with tracking numbers become 'shipped' on CSV import.", value: true  },
  { key: "buyer_ref",   label: "Include buyer reference in export",   description: "", value: false },
];

function ToggleRow({
  label,
  description,
  value,
  onChange,
  disabled,
  disabledNote,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  disabledNote?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-4 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && !disabledNote && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
        {disabledNote && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Shield size={11} className="text-gray-400" />
            {disabledNote}
          </p>
        )}
      </div>
      <button
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`shrink-0 transition-colors ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        aria-label={value ? "Disable" : "Enable"}
      >
        {value
          ? <ToggleRight size={28} className="text-green-500" />
          : <ToggleLeft  size={28} className="text-gray-300"  />
        }
      </button>
    </div>
  );
}

export default function FulfillmentSettingsPage() {
  // Profile
  const [warehouseName, setWarehouseName] = useState("FastFulfill Warehouse SHZ");
  const [location, setLocation]           = useState("Shenzhen, China");
  const [contactEmail, setContactEmail]   = useState("ops@fastfullfill.com");
  const [profileSaved, setProfileSaved]   = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<Toggle[]>(DEFAULT_NOTIFICATIONS);

  // CSV
  const [csvToggles, setCSVToggles] = useState<Toggle[]>(DEFAULT_CSV);
  const [csvDelimiter, setCSVDelimiter]     = useState(",");
  const [csvSaved, setCSVSaved]             = useState(false);

  function saveProfile() {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function saveCSV() {
    setCSVSaved(true);
    setTimeout(() => setCSVSaved(false), 2500);
  }

  function toggleNotif(key: string) {
    setNotifs((prev) => prev.map((n) => n.key === key ? { ...n, value: !n.value } : n));
  }

  function toggleCSV(key: string) {
    setCSVToggles((prev) => prev.map((n) => n.key === key ? { ...n, value: !n.value } : n));
  }

  return (
    <div className="py-8 px-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your warehouse profile, notifications, and export preferences.</p>
      </div>

      {/* Warehouse Profile */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Warehouse Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse Name</label>
            <input
              type="text"
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveProfile}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save Changes
          </button>
          {profileSaved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 size={15} /> Saved!
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Notifications</h2>
        <p className="text-xs text-gray-400 mb-2">Control which events trigger alerts for your team.</p>
        <div className="divide-y divide-gray-100">
          {notifs.map((n) => (
            <ToggleRow
              key={n.key}
              label={n.label}
              description={n.description}
              value={n.value}
              onChange={() => toggleNotif(n.key)}
            />
          ))}
        </div>
      </div>

      {/* CSV Settings */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">CSV Settings</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Default CSV Delimiter</label>
          <select
            value={csvDelimiter}
            onChange={(e) => setCSVDelimiter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value=","  >Comma (,)</option>
            <option value=";"  >Semicolon (;)</option>
            <option value="\t" >Tab</option>
          </select>
        </div>
        <div className="divide-y divide-gray-100">
          {csvToggles.map((n) => {
            if (n.key === "buyer_ref") {
              return (
                <ToggleRow
                  key={n.key}
                  label={n.label}
                  description={n.description}
                  value={false}
                  onChange={() => {}}
                  disabled
                  disabledNote="Buyer identity is always anonymised for privacy."
                />
              );
            }
            return (
              <ToggleRow
                key={n.key}
                label={n.label}
                description={n.description}
                value={n.value}
                onChange={() => toggleCSV(n.key)}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveCSV}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save CSV Settings
          </button>
          {csvSaved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 size={15} /> Saved!
            </span>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Account</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <p className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
              fulfillment@fastfullfill.com
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <span className="badge bg-green-100 text-green-700">Fulfillment Partner</span>
          </div>
        </div>
        <Link
          href="/auth/demo-logout"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-xl transition-colors border border-red-100"
        >
          <LogOut size={15} />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
