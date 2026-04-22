import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupplierSidebar } from "@/components/supplier/supplier-sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { AccountMenu } from "@/components/layout/account-menu";
import { loadSupplierSidebarBadges } from "@/app/actions/sourcing-desk";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") redirect("/dashboard");

  const badges = await loadSupplierSidebarBadges();

  return (
    <div className="portal-theme flex h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <SupplierSidebar
        pendingRequests={badges.pendingRequests}
        pendingQuotes={badges.pendingQuotes}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-16 shrink-0 items-center justify-end gap-3 px-8">
          <NotificationBell />
          <AccountMenu
            userEmail={user.email}
            accountName="FastFulfill Ops"
            roleLabel="Supplier team"
            signOutRedirect="/auth/login"
            profileHref="/supplier/profile"
            billingHref="/supplier/quotes"
            notificationsHref="/supplier/settings"
            trackingHref="/supplier/procurement"
            apiHref="/supplier/settings"
            placement="topbar"
          />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
