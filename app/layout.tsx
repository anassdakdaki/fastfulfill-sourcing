import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "FastFulfill Source, Store & Ship from China",
    template: "%s | FastFulfill",
  },
  description:
    "The all in one ecommerce sourcing and fulfillment platform. Source products from China, manage inventory, and ship to customers worldwide faster and cheaper.",
  keywords: ["dropshipping", "sourcing", "fulfillment", "China", "ecommerce"],
  openGraph: {
    title: "FastFulfill Source, Store & Ship from China",
    description:
      "The all-in-one ecommerce sourcing and fulfillment platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
