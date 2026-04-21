"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is the minimum order quantity (MOQ)?",
    a: "For sourcing and fulfillment, there is no minimum. We can handle single unit dropshipping. For bulk orders or private label, MOQs depend on the product and supplier, typically starting at 50 to 200 units. Your agent will clarify this in the quote.",
  },
  {
    q: "How does Shopify integration work?",
    a: "You connect your Shopify store with one click via OAuth. Once connected, every new order automatically appears in your FastFulfill dashboard. When the order ships, the tracking number is pushed back to Shopify and your customer is notified with no manual work needed.",
  },
  {
    q: "What happens if a product arrives damaged or defective?",
    a: "All orders go through physical inspection in our Shenzhen warehouse before shipping. If defects pass through or occur in transit, we handle the replacement or refund directly. Your customer experience is protected.",
  },
  {
    q: "When do I pay? Is there a monthly fee?",
    a: "No monthly subscription. You pay per order fulfilled, plus the product cost. Invoices are issued through the platform and can be paid by card via Stripe. You see the full cost breakdown before confirming any order.",
  },
  {
    q: "Can I order a sample before placing a bulk order?",
    a: "Yes. We strongly recommend it. Your agent can arrange a physical sample from the supplier, shipped to you directly. Sample costs are typically $20 to $80 depending on the product, plus shipping. This is the best way to verify quality before committing.",
  },
  {
    q: "How long does shipping take?",
    a: "Typical delivery times: USA 7 to 12 days, UK 8 to 13 days, EU 9 to 15 days, Australia 10 to 16 days. These are real estimates based on our shipping partners, not the inflated averages you see on other platforms. Express options are available for faster timelines.",
  },
  {
    q: "Do you handle returns?",
    a: "Yes. We work with you to set a return policy based on your product type. For defective items, we reship at no cost. For buyer remorse returns, we can receive and re-inventory at your warehouse. This is handled case by case with your agent.",
  },
  {
    q: "Can I use my own packaging and branding?",
    a: "Absolutely. We offer full white label and private label support with custom boxes, inserts, poly bags, thank you cards, stickers, and hang tags. Packaging artwork is coordinated with the factory by your agent.",
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
            Everything dropshippers ask before trusting a new fulfillment partner.
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
