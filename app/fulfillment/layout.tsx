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
    <div className="portal-theme flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 lg:h-screen lg:overflow-hidden">
      <FulfillmentSidebar
        pendingInbound={badges.pendingInbound}
        pendingOrders={badges.pendingOrders}
      />
      <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <div className="flex h-16 shrink-0 items-center justify-end gap-2 px-4 sm:gap-3 lg:px-8">
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
        <main className="min-w-0 flex-1 lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
