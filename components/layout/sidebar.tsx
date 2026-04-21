"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  MapPin,
  Archive,
  Search,
  Package2,
  ChevronRight,
  Package,
  Tag,
  FileText,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/layout/account-menu";

interface SidebarProps {
  userEmail?: string;
  pendingQuotes?: number;
  hasConnectedStore?: boolean;
}

export function Sidebar({ userEmail, pendingQuotes = 0, hasConnectedStore = true }: SidebarProps) {
  const pathname = usePathname();

  type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  };

  const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
    {
      label: "Daily work",
      items: [
        { href: "/dashboard",             label: "Home",         icon: LayoutDashboard },
        { href: "/dashboard/orders",      label: "Orders",       icon: ShoppingCart },
        { href: "/dashboard/fulfillment", label: "Packing & shipping", icon: Package },
        { href: "/dashboard/tracking",    label: "Track orders", icon: MapPin },
        { href: "/dashboard/inventory",   label: "Products in stock", icon: Archive },
      ],
    },
    {
      label: "Find products",
      items: [
        { href: "/dashboard/source", label: "Ask for a product", icon: Search },
        {
          href:       "/dashboard/quotes",
          label:      "Prices from us",
          icon:       Tag,
          badge:      pendingQuotes > 0 ? pendingQuotes : undefined,
        },
      ],
    },
    {
      label: "Money",
      items: [
        { href: "/dashboard/invoices", label: "Bills", icon: FileText },
      ],
    },
    {
      label: "Stores",
      items: [
        {
          href:       "/dashboard/integrations",
          label:      "Connect stores",
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
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <AccountMenu
          userEmail={userEmail}
          roleLabel="Seller account"
          signOutRedirect="/"
          profileHref="/dashboard/settings"
          billingHref="/dashboard/invoices"
          notificationsHref="/dashboard/settings"
          trackingHref="/dashboard/tracking"
          apiHref="/dashboard/integrations"
        />
      </div>
    </aside>
  );
}
