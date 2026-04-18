import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        userEmail={user.email}
        pendingQuotes={pendingQuotes}
        hasConnectedStore={hasConnectedStore}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with notification bell */}
        <div className="flex justify-end items-center px-8 pt-6 pb-0">
          <NotificationBell />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
