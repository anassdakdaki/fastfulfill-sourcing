"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
  { label: "Supplier demo", email: "supplier@fastfullfill.com", password: "supplier1234", role: "supplier" },
  { label: "Fulfillment demo", email: "fulfillment@fastfullfill.com", password: "fulfill1234", role: "fulfillment" },
];

const SHOW_DEMO_ACCOUNTS = process.env.NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS === "true";

function PrivateAccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const redirectTo = searchParams.get("redirectTo");

  function safeRedirect(fallback: string) {
    if (!redirectTo?.startsWith("/") || redirectTo.startsWith("//")) {
      return fallback;
    }

    return redirectTo;
  }

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
        role === "supplier" ? safeRedirect("/supplier") :
        role === "fulfillment" ? safeRedirect("/fulfillment") :
        safeRedirect("/dashboard");

      router.push(dest);
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <Package2 size={19} className="text-white" />
            </div>
            FastFulfill
          </Link>
          <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            <LockKeyhole size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Private access</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            For approved supplier and fulfillment accounts only.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            This page is shared privately by FastFulfill for supplier and fulfillment access.
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-5 text-center dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need access? Contact FastFulfill directly.
            </p>
          </div>
        </div>

        {SHOW_DEMO_ACCOUNTS && (
          <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Private demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.password); }}
                  className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-900/30"
                >
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{d.label}</span>
                  <span className="font-mono text-gray-400 dark:text-gray-500">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PrivateAccessPage() {
  return (
    <Suspense fallback={null}>
      <PrivateAccessContent />
    </Suspense>
  );
}
