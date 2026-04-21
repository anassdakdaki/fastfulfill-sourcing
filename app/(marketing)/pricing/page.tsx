import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  Sparkles,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "No monthly fee. Ask for product prices for free, order samples from $30, and pay only when products ship.",
};

const PRICING_STEPS = [
  {
    icon: ClipboardCheck,
    name: "Ask for a Product Price",
    price: "$0",
    period: "monthly fee",
    description:
      "Send a product link or photo. We find factory options, estimate shipping, and reply within 24 hours.",
    cta: "Ask for Free Price",
    features: [
      "Free product price request",
      "Factory price estimate",
      "Shipping estimate by country",
      "Minimum order and sample cost check",
      "Product helper review before you buy",
    ],
  },
  {
    icon: PackageCheck,
    name: "Order a Sample",
    price: "From $30",
    period: "sample orders",
    description:
      "Test quality before you commit. We arrange the supplier sample and help you verify the product.",
    cta: "Order Sample",
    features: [
      "Supplier sample coordination",
      "Product quality review",
      "Photos before shipment",
      "Packaging and material check",
      "Direct sample shipping",
    ],
    featured: true,
  },
  {
    icon: Warehouse,
    name: "Pack and Ship Orders",
    price: "Pay per order",
    period: "after approval",
    description:
      "Once you approve a product, we can check it, pack it, ship it, and send tracking.",
    cta: "Start Shipping",
    features: [
      "Factory cost billed per product",
      "Shipping billed by weight and country",
      "Quality check before shipping",
      "Packing and tracking included",
      "Shopify, TikTok, Amazon, and WooCommerce support",
    ],
  },
];

const COST_LINES = [
  {
    label: "Product cost",
    detail: "The factory price we confirm before you approve the order.",
  },
  {
    label: "Shipping cost",
    detail: "Based on destination, weight, service speed, and parcel size.",
  },
  {
    label: "Service fee",
    detail: "A clear fee for product checking, packing, warehouse work, and tracking.",
  },
  {
    label: "Optional custom packaging",
    detail: "Custom boxes, cards, labels, and stickers are priced separately.",
  },
];

const FAQ = [
  {
    q: "Is there a monthly fee?",
    a: "No. FastFulfill has no monthly subscription. You can ask for product prices for free and only pay when you approve a sample, product, or shipment.",
  },
  {
    q: "What does a sample cost?",
    a: "Samples usually start from $30. The final cost depends on the product, supplier, and delivery address. Your agent confirms the cost before you pay.",
  },
  {
    q: "How is each order price calculated?",
    a: "Each order price includes the product cost, shipping cost, and our clear service fee. Stores with many orders can get better rates after review.",
  },
  {
    q: "Do I need to buy many products first?",
    a: "No. We can help with one-by-one orders, samples, and larger stock orders. The right setup depends on your product and sales volume.",
  },
];

export default function PricingPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-gray-50 to-brand-50 py-20 border-b border-gray-100 text-center dark:from-gray-950 dark:to-gray-900 dark:border-gray-800">
        <div className="container-section max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Pricing</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            No monthly fee. Pay when you ship.
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Ask for prices for free, order samples when you are ready, then pay per order when products ship.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container-section max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PRICING_STEPS.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.name}
                  className={`rounded-2xl border p-8 relative flex flex-col ${
                    step.featured
                      ? "border-brand-500 shadow-xl shadow-brand-100 bg-brand-600 text-white dark:shadow-none"
                      : "border-gray-200 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800"
                  }`}
                >
                  {step.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      Popular first step
                    </span>
                  )}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                      step.featured
                        ? "bg-white/[0.15] text-white"
                        : "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <p className={`text-sm font-semibold mb-1 ${step.featured ? "text-brand-100" : "text-brand-600"}`}>
                    {step.name}
                  </p>
                  <div className="mb-2">
                    <span className="text-4xl font-black">{step.price}</span>
                    <p className={`text-sm mt-1 ${step.featured ? "text-brand-100" : "text-gray-400"}`}>
                      {step.period}
                    </p>
                  </div>
                  <p className={`text-sm mb-6 ${step.featured ? "text-brand-100" : "text-gray-500 dark:text-gray-400"}`}>
                    {step.description}
                  </p>
                  <Link href="/auth/signup" className="mt-auto">
                    <Button
                      className={`w-full mb-6 ${
                        step.featured ? "bg-white text-brand-700 hover:bg-brand-50" : ""
                      }`}
                      variant={step.featured ? "secondary" : "primary"}
                    >
                      {step.cta} <ArrowRight size={15} />
                    </Button>
                  </Link>
                  <ul className="space-y-3">
                    {step.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2.5 text-sm ${
                          step.featured ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <CheckCircle2
                          size={16}
                          className={`shrink-0 mt-0.5 ${step.featured ? "text-brand-200" : "text-green-500"}`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
                  What you pay for
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Clear costs before every order
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <Sparkles size={16} className="text-brand-600" />
                No subscription. No credit card to start.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COST_LINES.map((line) => (
                <div key={line.label} className="rounded-xl bg-white border border-gray-100 p-5 dark:bg-gray-950 dark:border-gray-800">
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{line.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{line.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div className="container-section max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 dark:bg-gray-950 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{q}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
