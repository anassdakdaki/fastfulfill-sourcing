"use client";

import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplierSidebarProps {
  pendingRequests?: number;
  pendingQuotes?: number;
}

export function SupplierSidebar({ pendingRequests = 0, pendingQuotes = 0 }: SupplierSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-gray-900 dark:text-white text-base">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Package2 size={15} className="text-white" />
          </div>
          FastFulfill
        </Link>
        <div className="mt-2 flex items-center gap-1.5">
          <Briefcase size={10} className="text-gray-400 dark:text-gray-500" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Sourcing Desk
          </span>
        </div>
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
                  href === "/supplier"
                    ? pathname === "/supplier"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    )}
                  >
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                    {badge > 0 && !isActive && (
                      <span className={cn("text-xs text-white rounded-full px-1.5 py-0.5 font-semibold leading-none", badgeColor ?? "bg-gray-600")}>
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

      <div className="h-4 shrink-0 border-t border-gray-100 dark:border-gray-800" />
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 lg:hidden"
      >
        <Menu size={19} />
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-gray-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[18rem] max-w-[86vw] flex-col border-r border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>
            {navContent}
          </aside>
        </div>
      ) : null}

      <aside className="hidden w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 lg:flex flex-col h-screen sticky top-0">
        {navContent}
    </aside>
    </>
  );
}
