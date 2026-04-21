import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupplierSidebar } from "@/components/supplier/supplier-sidebar";
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <SupplierSidebar
        userEmail={user.email}
        pendingRequests={badges.pendingRequests}
        pendingQuotes={badges.pendingQuotes}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
