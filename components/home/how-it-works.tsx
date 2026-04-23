import {
  ArrowRight,
  CheckCircle2,
  Factory,
  Link2,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import type { ElementType } from "react";

type Step = {
  number: string;
  icon: ElementType;
  iconClass: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: Link2,
    iconClass: "text-brand-300",
    title: "Send us a product link",
    description:
      "Send a product link, product name, or photo. We check it and send you a clear price within 24 hours.",
    badge: "24h turnaround",
    badgeColor:
      "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800",
  },
  {
    number: "02",
    icon: Factory,
    iconClass: "text-purple-300",
    title: "We find, sample, and check it",
    description:
      "Your helper talks to factories, can arrange a sample, and checks the product before you buy more.",
    badge: "No Alibaba needed",
    badgeColor:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  {
    number: "03",
    icon: PackageCheck,
    iconClass: "text-emerald-300",
    title: "Orders ship automatically",
    description:
      "Connect Shopify, TikTok Shop, Amazon, WooCommerce, or your custom store. Every new order syncs into FastFulfill, gets packed, and ships direct to your customer with full tracking.",
    badge: "7 to 12 day delivery",
    badgeColor:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950" id="how-it-works">
      <div className="container-section min-w-0">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            The System
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Three steps. Fully automated.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600 dark:text-gray-400">
            From product idea to your customer&apos;s door without touching a single package yourself.
          </p>
        </div>

        <div className="relative grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative flex min-w-0">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 items-center justify-center">
                    <ArrowRight size={16} className="text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                <div className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-800 dark:hover:bg-brand-900/10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-brand-300 shadow-sm flex items-center justify-center">
                      <Icon size={19} strokeWidth={2.1} className={step.iconClass} />
                    </div>
                    <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-600">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-gray-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mb-5 break-words text-sm leading-relaxed text-gray-700 dark:text-gray-400">
                    {step.description}
                  </p>

                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex min-w-0 flex-col items-start gap-4 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 dark:border-green-900 dark:from-green-950/40 dark:to-emerald-950/40 sm:flex-row sm:items-center">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
            <ShoppingBag size={19} strokeWidth={2.1} className="text-green-700 dark:text-green-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-green-900 dark:text-green-300">
              Store orders sync automatically
            </p>
            <p className="mt-0.5 break-words text-xs text-green-800 dark:text-green-400">
              Connect Shopify, TikTok Shop, Amazon, WooCommerce, or another sales channel once. Every new order appears in your FastFulfill dashboard in real time, no manual importing.
            </p>
          </div>
          <div className="sm:ml-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
              Multi-platform sync
              <CheckCircle2 size={13} strokeWidth={2.3} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
