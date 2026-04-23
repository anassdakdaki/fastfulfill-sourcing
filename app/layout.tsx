import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} Source, Store & Ship from China`,
    template: "%s | FastFulfill",
  },
  description:
    "Find products from China, store them, and ship orders to customers worldwide faster and cheaper.",
  keywords: ["ecommerce", "China products", "shipping", "warehouse", "online sellers"],
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} Source, Store & Ship from China`,
    description:
      "Find products from China, store them, and ship orders to customers worldwide.",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Source, Store & Ship from China`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} Source, Store & Ship from China`,
    description:
      "Find products from China, store them, and ship orders to customers worldwide faster and cheaper.",
    images: [DEFAULT_OG_IMAGE],
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
