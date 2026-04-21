"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquarePlus,
  FileText,
  ShoppingCart,
  ChevronRight,
  Package2,
  Briefcase,
  Users,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/layout/account-menu";

interface SupplierSidebarProps {
  userEmail?: string;
  pendingRequests?: number;
  pendingQuotes?: number;
}

export function SupplierSidebar({ userEmail, pendingRequests = 0, pendingQuotes = 0 }: SupplierSidebarProps) {
  const pathname = usePathname();

  const NAV_SECTIONS = [
    {
      label: "New work",
      items: [
        { href: "/supplier",              label: "Home",              icon: LayoutDashboard, badge: 0 },
        { href: "/supplier/requests",     label: "Product requests",  icon: MessageSquarePlus, badge: pendingRequests, badgeColor: "bg-brand-500" },
        { href: "/supplier/quotes",       label: "Prices sent",       icon: FileText,          badge: pendingQuotes,   badgeColor: "bg-amber-500" },
      ],
    },
    {
      label: "Suppliers",
      items: [
        { href: "/supplier/procurement",  label: "Active orders",     icon: ShoppingCart, badge: 0 },
        { href: "/supplier/contacts",     label: "Supplier list",     icon: Users, badge: 0 },
        { href: "/supplier/analytics",    label: "Numbers",           icon: BarChart2, badge: 0 },
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
      <div className="px-3 py-4 border-t border-gray-800">
        <AccountMenu
          userEmail={userEmail}
          accountName="FastFulfill Ops"
          roleLabel="Supplier team"
          signOutRedirect="/auth/login"
          profileHref="/supplier/profile"
          billingHref="/supplier/quotes"
          notificationsHref="/supplier/settings"
          trackingHref="/supplier/procurement"
          apiHref="/supplier/settings"
        />
      </div>
    </aside>
  );
}
