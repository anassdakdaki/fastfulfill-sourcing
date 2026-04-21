"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  MapPin,
  Archive,
  Search,
  Package2,
  LogOut,
  ChevronRight,
  Package,
  Tag,
  FileText,
  Settings,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  userEmail?: string;
  pendingQuotes?: number;
  hasConnectedStore?: boolean;
}

export function Sidebar({ userEmail, pendingQuotes = 0, hasConnectedStore = true }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  };

  const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
    {
      label: "Operations",
      items: [
        { href: "/dashboard",             label: "Overview",     icon: LayoutDashboard },
        { href: "/dashboard/orders",      label: "Orders",       icon: ShoppingCart },
        { href: "/dashboard/fulfillment", label: "Fulfillment",  icon: Package },
        { href: "/dashboard/tracking",    label: "Tracking",     icon: MapPin },
        { href: "/dashboard/inventory",   label: "Inventory",    icon: Archive },
      ],
    },
    {
      label: "Sourcing",
      items: [
        { href: "/dashboard/source", label: "Source Request", icon: Search },
        {
          href:       "/dashboard/quotes",
          label:      "Quotes",
          icon:       Tag,
          badge:      pendingQuotes > 0 ? pendingQuotes : undefined,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
      ],
    },
    {
      label: "Developer",
      items: [
        {
          href:       "/dashboard/integrations",
          label:      "Integrations",
          icon:       Plug,
          badge:      !hasConnectedStore ? 1 : undefined,
          badgeColor: !hasConnectedStore ? "bg-amber-500" : undefined,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-gray-900 dark:text-white text-base">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Package2 size={15} className="text-white" />
          </div>
          FastFulfill
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, badge, badgeColor }) => {
                const isActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "sidebar-link",
                      isActive ? "sidebar-link-active" : "sidebar-link-inactive"
                    )}
                  >
                    <Icon size={17} />
                    <span className="flex-1">{label}</span>
                    {badge !== undefined && !isActive && (
                      <span className={cn("text-xs text-white rounded-full px-1.5 py-0.5 font-semibold", badgeColor ?? "bg-brand-600")}>
                        {badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} className="text-brand-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            "sidebar-link",
            pathname.startsWith("/dashboard/settings") ? "sidebar-link-active" : "sidebar-link-inactive"
          )}
        >
          <Settings size={17} />
          <span className="flex-1">Settings</span>
          {pathname.startsWith("/dashboard/settings") && <ChevronRight size={14} className="text-brand-400" />}
        </Link>
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
        >
          <LogOut size={17} />
          Sign out
        </button>
        {userEmail && (
          <div className="mt-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{userEmail}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Buyer account</p>
            </div>
            <ThemeToggle />
          </div>
        )}
        {!userEmail && (
          <div className="mt-3 flex justify-end px-1">
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  );
}
