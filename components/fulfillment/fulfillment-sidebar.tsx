"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Warehouse,
  LayoutDashboard,
  PackageCheck,
  ClipboardList,
  Archive,
  Settings,
  Truck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FulfillmentSidebarProps {
  userEmail?: string;
  pendingInbound?: number;
  pendingOrders?: number;
}

export default function FulfillmentSidebar({
  userEmail,
  pendingInbound = 0,
  pendingOrders = 0,
}: FulfillmentSidebarProps) {
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
        { href: "/fulfillment",          label: "Overview",      icon: LayoutDashboard, badge: 0 },
        { href: "/fulfillment/inbound",  label: "Inbound Stock", icon: PackageCheck,    badge: pendingInbound, badgeColor: "bg-amber-500" },
        { href: "/fulfillment/orders",   label: "Orders Queue",  icon: ClipboardList,   badge: pendingOrders,  badgeColor: "bg-red-500" },
      ],
    },
    {
      label: "Warehouse",
      items: [
        { href: "/fulfillment/inventory", label: "Inventory", icon: Archive, badge: 0 },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/fulfillment/settings", label: "Settings", icon: Settings, badge: 0 },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
            <Warehouse size={17} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">
              Fulfillment Portal
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Powered by FastFulfill
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, badge, badgeColor }) => {
                const isActive =
                  href === "/fulfillment"
                    ? pathname === "/fulfillment"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon size={17} />
                    <span className="flex-1">{label}</span>
                    {badge > 0 && !isActive && (
                      <span
                        className={cn(
                          "text-xs text-white rounded-full px-1.5 py-0.5 font-semibold leading-none",
                          badgeColor ?? "bg-slate-600"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight size={14} className="text-slate-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: user chip + logout */}
      <div className="px-3 py-4 border-t border-slate-700/60 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800">
          <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
            <Truck size={14} className="text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">Fulfillment Partner</p>
            {userEmail && <p className="text-[10px] text-slate-500 truncate mt-0.5">{userEmail}</p>}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/60 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
