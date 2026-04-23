import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to FastFulfill.",
  path: "/auth/supplier-signup",
  noIndex: true,
});

export default function SupplierSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
