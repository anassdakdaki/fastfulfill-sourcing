import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Track Your Shipment",
  description: "Track FastFulfill shipments with a real tracking number and see package updates from warehouse to delivery.",
  path: "/tracking",
  keywords: ["order tracking", "shipment tracking", "track package from china"],
});

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
