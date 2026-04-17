import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SupplierSidebar } from "@/components/supplier/supplier-sidebar";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const demoVal = cookieStore.get("ff_demo_session")?.value;
  const isDemoSupplier = demoVal === "supplier";

  if (isDemoSupplier) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SupplierSidebar userEmail="supplier@fastfullfill.com" />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "supplier") redirect("/dashboard");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SupplierSidebar userEmail={user.email} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
