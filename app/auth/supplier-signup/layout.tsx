import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supplier Signup",
  description: "Apply as a FastFulfill supplier and receive qualified product sourcing requests from ecommerce sellers.",
};

export default function SupplierSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
