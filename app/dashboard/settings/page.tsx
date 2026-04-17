"use client";

import { useState } from "react";
import { Save, Building2, MapPin, Truck, Bell, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const SHIPPING_PREFS = [
  { value: "air", label: "Air Freight" },
  { value: "sea", label: "Sea Freight" },
  { value: "express", label: "Express (DHL/FedEx)" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-5">
        <span className="text-brand-600">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "Demo User",
    email: "demo@fastfullfill.com",
  });

  const [company, setCompany] = useState({
    name: "Demo Company Ltd.",
    website: "",
    vat_number: "",
  });

  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });

  const [prefs, setPrefs] = useState({
    default_shipping: "air",
    currency: "USD",
  });

  const [notifications, setNotifications] = useState({
    order_updates: true,
    quote_received: true,
    shipment_alerts: true,
    invoice_due: true,
    marketing: false,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account, company, and preferences.</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-sm text-green-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Settings saved successfully.
        </div>
      )}

      {/* Profile */}
      <Section icon={<User size={16} />} title="Profile">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <Button type="button" variant="outline" size="sm">Change Password</Button>
        </div>
      </Section>

      {/* Company */}
      <Section icon={<Building2 size={16} />} title="Company">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            placeholder="Your company name"
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
          />
          <Input
            label="Website"
            type="url"
            placeholder="https://yourcompany.com"
            value={company.website}
            onChange={(e) => setCompany({ ...company, website: e.target.value })}
          />
          <Input
            label="VAT / Tax Number"
            placeholder="Optional"
            value={company.vat_number}
            onChange={(e) => setCompany({ ...company, vat_number: e.target.value })}
          />
        </div>
      </Section>

      {/* Address */}
      <Section icon={<MapPin size={16} />} title="Billing Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Address Line 1"
              placeholder="123 Main Street"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            />
          </div>
          <Input label="City" placeholder="New York" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <Input label="State / Province" placeholder="NY" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
          <Input label="ZIP / Postal Code" placeholder="10001" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
          <Input label="Country" placeholder="United States" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
        </div>
      </Section>

      {/* Preferences */}
      <Section icon={<Truck size={16} />} title="Shipping & Currency Preferences">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Default Shipping Method"
            options={SHIPPING_PREFS}
            value={prefs.default_shipping}
            onChange={(e) => setPrefs({ ...prefs, default_shipping: e.target.value })}
          />
          <Select
            label="Default Currency"
            options={CURRENCY_OPTIONS}
            value={prefs.currency}
            onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell size={16} />} title="Notifications">
        <Toggle label="Order Updates" description="Get notified when your order status changes." checked={notifications.order_updates} onChange={(v) => setNotifications({ ...notifications, order_updates: v })} />
        <Toggle label="Quote Received" description="Alert when a new supplier quote arrives." checked={notifications.quote_received} onChange={(v) => setNotifications({ ...notifications, quote_received: v })} />
        <Toggle label="Shipment Alerts" description="Track shipment milestones and delays." checked={notifications.shipment_alerts} onChange={(v) => setNotifications({ ...notifications, shipment_alerts: v })} />
        <Toggle label="Invoice Due" description="Reminder before invoices become overdue." checked={notifications.invoice_due} onChange={(v) => setNotifications({ ...notifications, invoice_due: v })} />
        <Toggle label="Marketing & Tips" description="Product updates and sourcing tips from FastFulfill." checked={notifications.marketing} onChange={(v) => setNotifications({ ...notifications, marketing: v })} />
      </Section>

      {/* Security */}
      <Section icon={<Shield size={16} />} title="Security">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account.</p>
            </div>
            <Button type="button" variant="outline" size="sm">Enable 2FA</Button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Active Sessions</p>
              <p className="text-xs text-gray-500 mt-0.5">1 active session</p>
            </div>
            <Button type="button" variant="outline" size="sm">View Sessions</Button>
          </div>
        </div>
      </Section>

      <div className="flex gap-3 pb-8">
        <Button type="submit" size="lg">
          <Save size={15} /> Save Changes
        </Button>
      </div>
    </form>
  );
}
