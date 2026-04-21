import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FulfillmentSidebar from "@/components/fulfillment/fulfillment-sidebar";
import { loadFulfillmentSidebarBadges } from "@/app/actions/fulfillment";

export default async function FulfillmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "fulfillment") redirect("/dashboard");

  const badges = await loadFulfillmentSidebarBadges();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <FulfillmentSidebar
        userEmail={user.email}
        pendingInbound={badges.pendingInbound}
        pendingOrders={badges.pendingOrders}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
