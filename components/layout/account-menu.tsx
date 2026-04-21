"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Box,
  ChevronDown,
  Code2,
  CreditCard,
  Globe2,
  HelpCircle,
  Layers,
  LogOut,
  Moon,
  PackageSearch,
  Sun,
  UserCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

type AccountMenuProps = {
  userEmail?: string;
  accountName?: string;
  roleLabel: string;
  signOutRedirect: string;
  profileHref: string;
  billingHref: string;
  notificationsHref: string;
  trackingHref: string;
  apiHref: string;
};

function displayName(userEmail?: string, accountName?: string) {
  if (accountName) return accountName;
  if (!userEmail) return "My account";
  return userEmail.split("@")[0].replace(/[._-]+/g, " ").trim() || "My account";
}

export function AccountMenu({
  userEmail,
  accountName,
  roleLabel,
  signOutRedirect,
  profileHref,
  billingHref,
  notificationsHref,
  trackingHref,
  apiHref,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const name = displayName(userEmail, accountName);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push(signOutRedirect);
  }

  const mainItems = [
    { href: profileHref, label: "Profile", icon: UserCircle2 },
    { href: billingHref, label: "Billing", icon: CreditCard },
    { href: notificationsHref, label: "Notifications", icon: Bell },
    { href: trackingHref, label: "Tracking", icon: Box },
    { href: apiHref, label: "API keys", icon: Code2 },
  ];

  const resourceItems = [
    { href: "/services", label: "How it works", icon: Layers },
    { href: "/catalog", label: "Product ideas", icon: PackageSearch },
    { href: "/services#faq", label: "Help", icon: HelpCircle },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-colors",
          "border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
        )}
      >
        <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brand-700">
          Free
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold">{name}</span>
        <ChevronDown
          size={16}
          className={cn("text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute bottom-14 left-0 z-50 w-80 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 text-white shadow-2xl shadow-black/40">
          <div className="px-7 py-6">
            <p className="truncate text-base font-bold">{userEmail ?? name}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-300">{roleLabel}</p>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-brand-200 hover:text-white"
              >
                Upgrade
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-800 py-4">
            {mainItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-4 px-7 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900"
                onClick={() => setOpen(false)}
              >
                <Icon size={19} className="text-slate-300" />
                <span>{label}</span>
              </Link>
            ))}

            <div className="flex items-center gap-4 px-7 py-3 text-sm font-semibold text-slate-100">
              <Sun size={19} className="text-slate-300" />
              <span className="flex-1">Theme</span>
              <div className="rounded-full bg-slate-800 px-1 py-0.5">
                <ThemeToggle />
              </div>
              <Moon size={17} className="text-slate-400" />
            </div>

            <div className="flex items-center gap-4 px-7 py-3 text-sm font-semibold text-slate-100">
              <Globe2 size={19} className="text-slate-300" />
              <span className="flex-1">Language</span>
              <span className="text-sm text-slate-300">EN</span>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>

          <div className="border-t border-slate-800 py-4">
            {resourceItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-4 px-7 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900"
                onClick={() => setOpen(false)}
              >
                <Icon size={19} className="text-slate-300" />
                <span>{label}</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-4 px-7 py-3 text-left text-sm font-semibold text-red-300 hover:bg-red-950/40"
            >
              <LogOut size={19} />
              <span>Log out</span>
            </button>
          </div>

          <div className="flex gap-5 border-t border-slate-800 px-7 py-4 text-xs text-slate-400">
            <Link href="/privacy" onClick={() => setOpen(false)} className="hover:text-white">
              Privacy
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className="hover:text-white">
              Pricing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
