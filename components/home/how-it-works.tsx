import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    emoji: "🔗",
    title: "Send us a product link",
    description: "Drop a URL, describe the product, or upload a photo. We review it and send you a sourcing quote within 24 hours.",
    badge: "24h turnaround",
    badgeColor: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800",
  },
  {
    number: "02",
    emoji: "🏭",
    title: "We source, sample & QC",
    description: "Your agent negotiates factory pricing, arranges a physical sample, and runs a full inspection before any bulk order.",
    badge: "No Alibaba needed",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  {
    number: "03",
    emoji: "📦",
    title: "Orders ship automatically",
    description: "Connect your Shopify store. Every new order syncs into FastFulfill, gets packed, and ships direct to your customer with full tracking.",
    badge: "7 to 12 day delivery",
    badgeColor: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950" id="how-it-works">
      <div className="container-section">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            The System
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Three steps. Fully automated.
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            From product idea to your customer&apos;s door without touching a single package yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {STEPS.map((step, i) => (
            <div key={i} className="relative flex">
              {/* Arrow between steps */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 items-center justify-center">
                  <ArrowRight size={16} className="text-gray-300 dark:text-gray-600" />
                </div>
              )}

              <div className="flex-1 bg-gray-50 hover:bg-brand-50/40 border border-gray-100 hover:border-brand-200 rounded-2xl p-7 transition-all group dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-brand-900/10 dark:hover:border-brand-800">
                {/* Number + emoji */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-brand-300 shadow-sm flex items-center justify-center text-lg">
                    {step.emoji}
                  </div>
                  <span className="text-xs font-black text-gray-300 dark:text-gray-600 tracking-widest">{step.number}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{step.description}</p>

                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${step.badgeColor}`}>
                  {step.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Shopify sync callout */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200 dark:border-green-900 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-xl shrink-0">🛍️</div>
          <div>
            <p className="text-sm font-bold text-green-900 dark:text-green-300">Shopify orders sync automatically</p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
              Connect your store once. Every new order appears in your FastFulfill dashboard in real time, no manual importing.
            </p>
          </div>
          <div className="sm:ml-auto shrink-0">
            <span className="text-xs font-semibold px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
              Live sync ✓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
