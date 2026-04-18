import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
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
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
