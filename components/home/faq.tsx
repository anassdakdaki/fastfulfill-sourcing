"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Do I need to order many products at once?",
    a: "For normal online orders, there is no minimum. We can ship one item at a time. For custom packaging or big orders, the minimum depends on the product and factory. We will explain it before you pay.",
  },
  {
    q: "Which store platforms can I connect?",
    a: "You can connect Shopify, TikTok Shop, Amazon, WooCommerce, and supported custom stores. Once connected, every new order appears in your FastFulfill dashboard automatically. When the order ships, tracking is pushed back to the sales channel where supported.",
  },
  {
    q: "What happens if a product arrives damaged or defective?",
    a: "All orders go through physical inspection in our Shenzhen warehouse before shipping. If defects pass through or occur in transit, we handle the replacement or refund directly. Your customer experience is protected.",
  },
  {
    q: "When do I pay? Is there a monthly fee?",
    a: "There is no monthly subscription. You pay for the product and shipping when you place an order. You see the full price before you confirm.",
  },
  {
    q: "Can I order a sample before placing a bulk order?",
    a: "Yes. We recommend ordering a sample first. We can send one product to you so you can check the quality before buying more.",
  },
  {
    q: "How long does shipping take?",
    a: "Typical delivery times: USA 7 to 12 days, UK 8 to 13 days, EU 9 to 15 days, Australia 10 to 16 days. Faster shipping can be arranged for some products.",
  },
  {
    q: "Do you handle returns?",
    a: "Yes. If an item is defective, we help replace it or solve the issue. Return rules depend on your product and store policy.",
  },
  {
    q: "Can I use my own packaging and branding?",
    a: "Yes. We can help with custom boxes, cards, bags, stickers, and labels. We help arrange this with the factory.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900" id="faq">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Questions before you start
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Simple answers for new sellers before they start.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "shrink-0 text-gray-400 transition-transform duration-200",
                    open === i && "rotate-180 text-brand-600 dark:text-brand-400"
                  )}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-gray-100 dark:border-gray-700">
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
