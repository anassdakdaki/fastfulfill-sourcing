import Link from "next/link";
import { ArrowLeft, Clock, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";

type IntegrationUnavailableProps = {
  name: string;
  description: string;
};

export function IntegrationUnavailable({ name, description }: IntegrationUnavailableProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/dashboard/integrations"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft size={16} /> Back to Integrations
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
          <PlugZap size={22} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Integration
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <Clock size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Available soon</p>
            <p className="mt-1 text-xs leading-5">
              This action is disabled until the live API flow, token storage, and production sync checks are complete.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/integrations">
            <Button variant="outline">View integrations</Button>
          </Link>
          <Link href="/dashboard/integrations/shopify">
            <Button>Connect Shopify</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
