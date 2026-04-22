import Link from "next/link";
import { ArrowLeft, Code, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApiAccessPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <Link
        href="/dashboard/integrations"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft size={16} /> Back to Integrations
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-gray-800">
          <Code size={22} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          API access
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Available soon</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          API keys and custom webhooks are not enabled for production accounts yet. Shopify webhooks are handled by the live Shopify integration. We will open public API access after token storage, audit logs, and rate limits are fully wired.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Lock, title: "No fake keys", text: "Production accounts only show tokens after secure storage is ready." },
            { icon: Shield, title: "Safe rollout", text: "Access will include scopes, rotation, and activity logs." },
            { icon: Mail, title: "Need early access?", text: "Contact FastFulfill and we can review your use case." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <item.icon size={18} className="text-brand-600 dark:text-brand-400" />
              <h2 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h2>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact">
            <Button>Contact us</Button>
          </Link>
          <Link href="/dashboard/integrations">
            <Button variant="outline">Connect Shopify</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
