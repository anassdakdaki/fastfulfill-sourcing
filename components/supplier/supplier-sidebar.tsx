"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquarePlus,
  FileText,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronRight,
  Package2,
  Briefcase,
  Users,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SupplierSidebarProps {
  userEmail?: string;
  pendingRequests?: number;
  pendingQuotes?: number;
}

export function SupplierSidebar({ userEmail, pendingRequests = 0, pendingQuotes = 0 }: SupplierSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const NAV_SECTIONS = [
    {
      label: "Operations",
      items: [
        { href: "/supplier",              label: "Overview",          icon: LayoutDashboard, badge: 0 },
        { href: "/supplier/requests",     label: "Sourcing Requests", icon: MessageSquarePlus, badge: pendingRequests, badgeColor: "bg-brand-500" },
        { href: "/supplier/quotes",       label: "Quotes Sent",       icon: FileText,          badge: pendingQuotes,   badgeColor: "bg-amber-500" },
      ],
    },
    {
      label: "Procurement",
      items: [
        { href: "/supplier/procurement",  label: "Active Deals",      icon: ShoppingCart, badge: 0 },
        { href: "/supplier/contacts",     label: "Supplier Contacts", icon: Users,    badge: 0 },
      { href: "/supplier/analytics",    label: "Analytics",         icon: BarChart2, badge: 0 },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/supplier/settings",     label: "Settings",          icon: Settings, badge: 0 },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-gray-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-base">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Package2 size={15} className="text-white" />
          </div>
          FastFulfill
        </Link>
        <div className="mt-2 flex items-center gap-1.5">
          <Briefcase size={10} className="text-gray-500" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Sourcing Desk
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, badge, badgeColor }) => {
                const isActive =
                  href === "/supplier"
                    ? pathname === "/supplier"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                    {badge > 0 && !isActive && (
                      <span className={cn("text-xs text-white rounded-full px-1.5 py-0.5 font-semibold leading-none", badgeColor ?? "bg-gray-600")}>
                        {badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} className="text-brand-300" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-0.5">
        {userEmail && (
          <div className="mb-2 px-3 py-2.5 rounded-xl bg-gray-800">
            <p className="text-xs font-semibold text-gray-200 truncate">FastFulfill Ops</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{userEmail}</p>
            <div className="flex items-center gap-1 mt-1">
              <Briefcase size={10} className="text-brand-400" />
              <p className="text-xs text-brand-400 font-medium">Sourcing Team</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
