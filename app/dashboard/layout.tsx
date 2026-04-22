import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { AccountMenu } from "@/components/layout/account-menu";
import { loadSidebarBadges } from "@/app/actions/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { pendingQuotes, hasConnectedStore } = await loadSidebarBadges();

  return (
    <div className="portal-theme flex h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar
        pendingQuotes={pendingQuotes}
        hasConnectedStore={hasConnectedStore}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-16 shrink-0 items-center justify-end gap-3 px-8">
          <NotificationBell />
          <AccountMenu
            userEmail={user.email}
            roleLabel="Seller account"
            signOutRedirect="/"
            profileHref="/dashboard/settings"
            billingHref="/dashboard/invoices"
            notificationsHref="/dashboard/settings"
            trackingHref="/dashboard/tracking"
            apiHref="/dashboard/integrations"
            placement="topbar"
          />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
