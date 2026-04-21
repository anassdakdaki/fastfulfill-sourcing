import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Comparison } from "@/components/home/comparison";
import { WhatWeSource } from "@/components/home/what-we-source";
import { Benefits } from "@/components/home/benefits";
import { FulfillmentFlow } from "@/components/home/fulfillment-flow";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CtaBanner } from "@/components/home/cta-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FastFulfill – Shopify Fulfillment from China | Quotes in 24h",
  description:
    "Source products from China, inspect them in our Shenzhen warehouse, and ship direct to your customers in 7–12 days. No monthly fee. Connect your Shopify store and automate fulfillment.",
};

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. Hero — headline, single CTA, dashboard mockup */}
      <Hero />

      {/* 2. How it works — 3 steps */}
      <HowItWorks />

      {/* 3. Comparison table — vs Zendrop / CJ / agent */}
      <Comparison />

      {/* 4. Product categories */}
      <WhatWeSource />

      {/* 5. Benefits / features */}
      <Benefits />

      {/* 6. Fulfillment flow — how Shopify orders move */}
      <FulfillmentFlow />

      {/* 7. Stats bar */}
      <Stats />

      {/* 8. Testimonials */}
      <Testimonials />

      {/* 9. FAQ */}
      <FAQ />

      {/* 10. CTA banner */}
      <CtaBanner />
    </PublicLayout>
  );
}
