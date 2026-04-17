import { PublicLayout } from "@/components/layout/public-layout";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Benefits } from "@/components/home/benefits";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FastFulfill - Source, Store & Ship from China",
};

export default function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <HowItWorks />
      <Benefits />
      <Stats />
      <Testimonials />
      <CtaBanner />
    </PublicLayout>
  );
}
