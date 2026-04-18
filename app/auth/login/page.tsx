"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
  { label: "Buyer demo",       email: "demo@fastfullfill.com",        password: "demo1234",        role: "buyer" },
  { label: "Supplier demo",    email: "supplier@fastfullfill.com",    password: "supplier1234",    role: "supplier" },
  { label: "Fulfillment demo", email: "fulfillment@fastfullfill.com", password: "fulfill1234",     role: "fulfillment" },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role ?? "buyer";
      const dest =
        role === "supplier"    ? "/supplier" :
        role === "fulfillment" ? "/fulfillment" :
        "/dashboard";
      router.push(dest);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-gray-900 text-lg">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Package2 size={19} className="text-white" />
            </div>
            FastFulfill
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign up as buyer
              </Link>
              {" "}·{" "}
              <Link href="/auth/supplier-signup" className="font-semibold text-brand-600 hover:text-brand-700">
                Join as supplier
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-5 bg-white rounded-2xl border border-dashed border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => { setEmail(d.email); setPassword(d.password); }}
                className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs hover:bg-brand-50 hover:border-brand-200 transition-colors"
              >
                <span className="font-semibold text-gray-700">{d.label}</span>
                <span className="text-gray-400 font-mono">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
