import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Buyer Account",
  description: "Create a FastFulfill buyer account to request product sourcing, quotes, samples, warehousing, and fulfillment.",
};

export default function BuyerSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
