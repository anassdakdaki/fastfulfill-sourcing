import React from "react";
import FulfillmentSidebar from "@/components/fulfillment/fulfillment-sidebar";

export default function FulfillmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <FulfillmentSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
