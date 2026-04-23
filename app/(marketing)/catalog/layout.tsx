import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Product Catalog",
  description: "Browse product ideas FastFulfill can source from China, then request a clear supplier price within 24 hours.",
  path: "/catalog",
  keywords: ["product sourcing catalog", "china product ideas", "request supplier price"],
});

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
