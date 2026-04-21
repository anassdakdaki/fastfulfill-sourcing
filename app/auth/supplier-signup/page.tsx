"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { Package2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_OPTIONS = [
  { value: "Electronics", label: "Electronics & Gadgets" },
  { value: "Fashion", label: "Fashion & Apparel" },
  { value: "Beauty", label: "Beauty & Personal Care" },
  { value: "Kitchen", label: "Kitchen & Home" },
  { value: "Fitness", label: "Fitness & Sports" },
  { value: "Pets", label: "Pet Supplies" },
  { value: "Toys", label: "Toys & Kids" },
  { value: "Eco", label: "Eco & Sustainable Products" },
  { value: "Industrial", label: "Industrial & Tools" },
  { value: "Other", label: "Other" },
];

const COUNTRY_OPTIONS = [
  { value: "China", label: "China" },
  { value: "India", label: "India" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Turkey", label: "Turkey" },
  { value: "Mexico", label: "Mexico" },
  { value: "Other", label: "Other" },
];

const PERKS = [
  "Access to global buyer requests",
  "Direct quote submission",
  "Order management tools",
];

export default function SupplierSignupPage() {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [account, setAccount] = useState({ email: "", password: "" });
  const [company, setCompany] = useState({
    full_name: "",
    company_name: "",
    country: "",
    phone: "",
    category: "",
    wechat: "",
    whatsapp: "",
    bio: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signupError } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: {
        data: {
          role: "supplier",
          full_name: company.full_name,
          company_name: company.company_name,
        },
        emailRedirectTo: `${location.origin}/api/auth/callback?next=/supplier`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application received</h2>
          <p className="text-gray-500 mb-2">
            Thanks for applying as a supplier on <strong>FastFulfill</strong>.
          </p>
          <p className="text-gray-500 text-sm">
                    We&apos;ll review your application and send a confirmation to <strong>{account.email}</strong> within 1 to 2 business days.
          </p>
          <Link href="/auth/login" className="mt-6 inline-block">
            <Button variant="outline">Back to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-gray-900 text-lg">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Package2 size={19} className="text-white" />
            </div>
            FastFulfill
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Join as a Supplier</h1>
          <p className="mt-1 text-sm text-gray-500">Connect with global buyers and grow your exports</p>
        </div>

        {/* Perks */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          {PERKS.map((p) => (
            <span key={p} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <CheckCircle2 size={13} className="text-green-500" /> {p}
            </span>
          ))}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                {s}
              </div>
              <span className={`text-sm font-medium ${step === s ? "text-gray-900" : "text-gray-400"}`}>
                {s === 1 ? "Account" : "Company"}
              </span>
              {s < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Account */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                required
                minLength={8}
                autoComplete="new-password"
                hint="Must be at least 8 characters"
              />
              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
            </form>
          )}

          {/* Step 2: Company info */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name *"
                  placeholder="e.g. Kevin Lin"
                  value={company.full_name}
                  onChange={(e) => setCompany({ ...company, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Company Name *"
                  placeholder="e.g. GreenLife Shenzhen Co."
                  value={company.company_name}
                  onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                  required
                />
                <Select
                  label="Country *"
                  options={COUNTRY_OPTIONS}
                  placeholder="Select your country..."
                  value={company.country}
                  onChange={(e) => setCompany({ ...company, country: e.target.value })}
                  required
                />
                <Select
                  label="Main Category *"
                  options={CATEGORY_OPTIONS}
                  placeholder="Select primary category..."
                  value={company.category}
                  onChange={(e) => setCompany({ ...company, category: e.target.value })}
                  required
                />
                <Input
                  label="Phone / WhatsApp"
                  placeholder="+86 138 1234 5678"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                />
                <Input
                  label="WeChat ID"
                  placeholder="e.g. kevinlin_gl"
                  value={company.wechat}
                  onChange={(e) => setCompany({ ...company, wechat: e.target.value })}
                />
              </div>
              <Textarea
                label="Company Bio (optional)"
                placeholder="Tell buyers about your factory, MOQ, certifications, specialties..."
                value={company.bio}
                onChange={(e) => setCompany({ ...company, bio: e.target.value })}
              />

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" loading={loading} className="flex-1" size="lg">
                  Submit Application
                </Button>
              </div>

              <p className="text-xs text-center text-gray-400">
              Your account will be reviewed before activation. Usually 1 to 2 business days.
              </p>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
