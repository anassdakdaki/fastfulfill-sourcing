"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Warehouse,
  LayoutDashboard,
  PackageCheck,
  ClipboardList,
  Archive,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FulfillmentSidebarProps {
  pendingInbound?: number;
  pendingOrders?: number;
}

export default function FulfillmentSidebar({
  pendingInbound = 0,
  pendingOrders = 0,
}: FulfillmentSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_SECTIONS = [
    {
      label: "Warehouse work",
      items: [
        { href: "/fulfillment",          label: "Home",          icon: LayoutDashboard, badge: 0 },
        { href: "/fulfillment/inbound",  label: "Stock arriving", icon: PackageCheck, badge: pendingInbound, badgeColor: "bg-amber-500" },
        { href: "/fulfillment/orders",   label: "Orders to ship", icon: ClipboardList, badge: pendingOrders, badgeColor: "bg-red-500" },
      ],
    },
    {
      label: "Products",
      items: [
        { href: "/fulfillment/inventory", label: "Products in stock", icon: Archive, badge: 0 },
      ],
    },
  ];

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Warehouse size={17} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
              Fulfillment Portal
            </p>
            <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-tight mt-0.5">
              Powered by FastFulfill
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
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
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-slate-700 dark:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
                      <ChevronRight size={14} className="text-brand-400 dark:text-slate-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="h-4 shrink-0 border-t border-gray-100 dark:border-slate-700/60" />
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
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
          <aside className="relative flex h-full w-[18rem] max-w-[86vw] flex-col border-r border-gray-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>
            {navContent}
          </aside>
        </div>
      ) : null}

      <aside className="hidden w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 lg:flex flex-col h-screen sticky top-0">
        {navContent}
    </aside>
    </>
  );
}
