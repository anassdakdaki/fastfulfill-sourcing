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
    <div className="portal-theme flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 lg:h-screen lg:overflow-hidden">
      <Sidebar
        pendingQuotes={pendingQuotes}
        hasConnectedStore={hasConnectedStore}
      />
      <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden">
        <div className="flex h-16 shrink-0 items-center justify-end gap-2 px-4 sm:gap-3 lg:px-8">
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
        <main className="min-w-0 flex-1 lg:overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
