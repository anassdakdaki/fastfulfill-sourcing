import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Private Access",
  description: "Private FastFulfill access for approved supplier and fulfillment accounts.",
  path: "/auth/private-access",
  noIndex: true,
});

export default function PrivateAccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
