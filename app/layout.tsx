import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fastfulfill.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FastFulfill Source, Store & Ship from China",
    template: "%s | FastFulfill",
  },
  description:
    "Find products from China, store them, and ship orders to customers worldwide faster and cheaper.",
  keywords: ["ecommerce", "China products", "shipping", "warehouse", "online sellers"],
  openGraph: {
    title: "FastFulfill Source, Store & Ship from China",
    description:
      "Find products from China, store them, and ship orders to customers worldwide.",
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
