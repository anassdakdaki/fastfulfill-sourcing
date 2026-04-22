import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Shipment",
  description: "Track FastFulfill shipments with a real tracking number and see package updates from warehouse to delivery.",
};

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
