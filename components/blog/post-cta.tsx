import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA_CONTENT = {
  quote: {
    headline: "Get a product price in 24 hours",
    sub: "Send a product link and our China team will check options, shipping, and next steps.",
    cta: "Request free quote",
    href: "/auth/signup",
  },
  pricing: {
    headline: "Start sourcing without a monthly fee",
    sub: "Ask for prices, order samples when ready, then pay only when you approve work.",
    cta: "See pricing",
    href: "/pricing",
  },
  sourcing: {
    headline: "Need help finding a supplier?",
    sub: "FastFulfill can help source products, check quality, pack orders, and send tracking.",
    cta: "Start sourcing",
    href: "/auth/signup",
  },
} as const;

export function PostCTA({
  variant = "quote",
}: {
  variant?: keyof typeof CTA_CONTENT;
}) {
  const cta = CTA_CONTENT[variant];

  return (
    <div className="my-10 rounded-2xl border border-brand-200 bg-brand-50 p-6 not-prose dark:border-brand-800 dark:bg-brand-900/25">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <PackageSearch size={21} />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
              {cta.headline}
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {cta.sub}
            </p>
          </div>
        </div>
        <Link href={cta.href} className="shrink-0">
          <Button className="w-full sm:w-auto">
            {cta.cta}
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
