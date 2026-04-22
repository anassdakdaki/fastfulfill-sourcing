import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FulfillmentSidebar from "@/components/fulfillment/fulfillment-sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { AccountMenu } from "@/components/layout/account-menu";
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
    <div className="portal-theme flex h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <FulfillmentSidebar
        pendingInbound={badges.pendingInbound}
        pendingOrders={badges.pendingOrders}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-16 shrink-0 items-center justify-end gap-3 px-8">
          <NotificationBell />
          <AccountMenu
            userEmail={user.email}
            accountName="Warehouse team"
            roleLabel="Fulfillment partner"
            signOutRedirect="/auth/login"
            profileHref="/fulfillment/settings"
            billingHref="/fulfillment/settings"
            notificationsHref="/fulfillment/settings"
            trackingHref="/fulfillment/orders"
            apiHref="/fulfillment/settings"
            placement="topbar"
          />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
