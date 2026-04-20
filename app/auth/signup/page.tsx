"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const PERKS = [
  "Source products from verified suppliers",
  "We store & fulfill every order for you",
  "Quote within 24 hours, always",
  "Free to join — no credit card required",
];

export default function SignupPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ full_name: "", company_name: "", email: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  function upd(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options:  {
        data: { full_name: form.full_name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    });

    if (authErr) { setError(authErr.message); setLoading(false); return; }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({
        id:           userId,
        role:         "buyer",
        full_name:    form.full_name || null,
        company_name: form.company_name || null,
      });
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-3 text-sm text-gray-500">
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link href="/auth/login" className="mt-6 inline-block">
            <Button size="lg">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* Left — value prop (desktop only) */}
        <div className="hidden md:block pt-2">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-gray-900 text-lg mb-8">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Package2 size={19} className="text-white" />
            </div>
            FastFulfill
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Source, store &<br />fulfill — on autopilot.
          </h2>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            Tell us what you want to sell. We find the supplier, bulk-order it,
            store it in our warehouse, and ship every customer order for you.
            You never touch the product.
          </p>
          <ul className="mt-6 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-brand-600 shrink-0" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-xs text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
          </p>
        </div>

        {/* Right — form */}
        <div>
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-gray-900 text-lg">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Package2 size={19} className="text-white" />
              </div>
              FastFulfill
            </Link>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {PERKS.slice(0, 2).map((p) => (
                <span key={p} className="flex items-center gap-1 text-xs text-gray-600">
                  <CheckCircle2 size={12} className="text-green-500" /> {p}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Create your buyer account</h1>
            <p className="text-sm text-gray-500 mb-6">Free to join. No credit card required.</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="Jane Smith"
                  value={form.full_name}
                  onChange={(e) => upd("full_name", e.target.value)}
                  required
                  autoComplete="name"
                />
                <Input
                  label="Company (optional)"
                  placeholder="Acme Ltd."
                  value={form.company_name}
                  onChange={(e) => upd("company_name", e.target.value)}
                  autoComplete="organization"
                />
              </div>

              <Input
                label="Email Address *"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => upd("email", e.target.value)}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Password * (min 8 characters)"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => upd("password", e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create Free Account
              </Button>

              <p className="text-xs text-center text-gray-400">
                By signing up you agree to our{" "}
                <a href="/terms" className="underline hover:text-gray-600">Terms</a> and{" "}
                <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
              </p>
            </form>

            <div className="mt-5 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
