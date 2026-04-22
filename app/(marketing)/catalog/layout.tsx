import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Catalog",
  description: "Browse product ideas FastFulfill can source from China, then request a clear supplier price within 24 hours.",
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
