import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing" };

const PLANS = [
  {
    name: "Starter",
    price: 0,
    period: "Free forever",
    description: "Perfect for beginner dropshippers testing new products.",
    cta: "Start Free",
    highlight: false,
    features: [
      "3 sourcing requests/month",
      "Order management dashboard",
      "Public shipment tracking",
      "Standard shipping rates",
      "Email support",
      "-",
      "-",
    ],
  },
  {
    name: "Growth",
    price: 49,
    period: "per month",
    description: "For growing stores that need speed, branding, and more volume.",
    cta: "Start Growth",
    highlight: true,
    badge: "Most Popular",
    features: [
      "20 sourcing requests/month",
      "Priority sourcing agent",
      "Private label & custom packaging",
      "Discounted shipping rates (-15%)",
      "Inventory storage (100 units free)",
      "CSV order import",
      "Live chat support",
    ],
  },
  {
    name: "Scale",
    price: 149,
    period: "per month",
    description: "For serious brands shipping high volumes from China.",
    cta: "Start Scale",
    highlight: false,
    features: [
      "Unlimited sourcing requests",
      "Dedicated account manager",
      "Custom branding & inserts",
      "Discounted shipping rates (-25%)",
      "Free warehousing (500 units)",
      "API access & integrations",
      "Priority phone & chat support",
    ],
  },
];

const FAQ = [
  {
    q: "Is there a long-term contract?",
    a: "No. All plans are month-to-month. You can upgrade, downgrade, or cancel at any time.",
  },
  {
    q: "What are the shipping fees?",
    a: "Shipping fees vary by destination, weight, and speed. We show exact quotes before you confirm any shipment. Growth and Scale plans receive automatic discounts.",
  },
  {
    q: "Can I try before committing to a paid plan?",
    a: "Yes, the Starter plan is free forever. You get 3 sourcing requests and full access to the dashboard.",
  },
  {
    q: "Do you support Shopify or WooCommerce?",
    a: "API integrations are available on the Scale plan. Native Shopify and WooCommerce plugins are coming soon.",
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-50 to-brand-50 py-20 border-b border-gray-100 text-center">
        <div className="container-section max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Pricing</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 text-lg">
            Start free. Scale when you&apos;re ready. No hidden fees.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="container-section max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 relative ${
                  plan.highlight
                    ? "border-brand-500 shadow-xl shadow-brand-100 bg-brand-600 text-white"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    {plan.badge}
                  </span>
                )}
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-brand-100" : "text-brand-600"}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                  {plan.price > 0 && (
                    <span className={`text-sm ${plan.highlight ? "text-brand-200" : "text-gray-400"}`}>
                      /{plan.period.split(" ")[1]}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-brand-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
                <Link href="/auth/signup">
                  <Button
                    className={`w-full mb-6 ${
                      plan.highlight
                        ? "bg-white text-brand-700 hover:bg-brand-50"
                        : ""
                    }`}
                    variant={plan.highlight ? "secondary" : "primary"}
                  >
                    {plan.cta} <ArrowRight size={15} />
                  </Button>
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 text-sm ${
                        f === "-"
                          ? plan.highlight ? "text-brand-400 opacity-50" : "text-gray-300"
                          : plan.highlight ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {f !== "-" ? (
                        <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? "text-brand-300" : "text-green-500"}`} />
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            All prices in USD. Shipping and product costs are billed separately based on actual usage.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container-section max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm font-bold text-gray-900 mb-2">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
