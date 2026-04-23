import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Comparison } from "@/components/home/comparison";
import { WhatWeSource } from "@/components/home/what-we-source";
import { Benefits } from "@/components/home/benefits";
import { OperationsProof } from "@/components/home/operations-proof";
import { FulfillmentFlow } from "@/components/home/fulfillment-flow";
import { FirstRequest } from "@/components/home/first-request";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CtaBanner } from "@/components/home/cta-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FastFulfill Product Sourcing and Shipping from China | Prices in 24h",
  description:
    "Find products from China, check them in our Shenzhen warehouse, and ship direct to your customers in 7 to 12 days. No monthly fee. Connect Shopify, TikTok Shop, Amazon, WooCommerce, or another store.",
};

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. Hero with headline, single CTA, dashboard mockup */}
      <Hero />

      {/* 2. How it works with 3 steps */}
      <HowItWorks />

      {/* 3. Comparison table vs Zendrop, CJ, and agent */}
      <Comparison />

      {/* 4. Product categories */}
      <WhatWeSource />

      {/* 5. Benefits / features */}
      <Benefits />

      {/* 5b. Operational proof */}
      <OperationsProof />

      {/* 6. Order flow */}
      <FulfillmentFlow />

      {/* 7. First request trust section */}
      <FirstRequest />

      {/* 8. Stats bar */}
      <Stats />

      {/* 9. Testimonials */}
      <Testimonials />

      {/* 10. FAQ */}
      <FAQ />

      {/* 11. CTA banner */}
      <CtaBanner />
    </PublicLayout>
  );
}
