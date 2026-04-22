"use client";

import { useEffect, useRef, useState } from "react";
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
  placement?: "sidebar" | "topbar";
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
  placement = "sidebar",
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const name = displayName(userEmail, accountName);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setLanguageOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push(signOutRedirect);
  }

  const mainItems = [
    { href: profileHref, label: "Profile", icon: UserCircle2 },
    { href: billingHref, label: "Billing", icon: CreditCard },
    { href: notificationsHref, label: "Notifications", icon: Bell },
    { href: trackingHref, label: "Tracking", icon: Box },
    { href: apiHref, label: "API access tokens", icon: Code2 },
  ];

  const resourceItems = [
    { href: "/services", label: "Resources", icon: Layers },
    { href: "/catalog", label: "Blog", icon: PackageSearch },
    { href: "/services#faq", label: "Help center", icon: HelpCircle },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={roleLabel}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-2 rounded-2xl border text-left transition-colors",
          placement === "topbar"
            ? "h-11 max-w-[calc(100vw-5.25rem)] justify-end border-gray-200 bg-white px-3 text-gray-950 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 sm:min-w-[220px]"
            : "w-full border-slate-700 bg-slate-900 px-3 py-2.5 text-white hover:bg-slate-800"
        )}
      >
        <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brand-700 dark:bg-brand-200 dark:text-brand-900">
          Free
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold">{name}</span>
        <ChevronDown
          size={15}
          className={cn("text-gray-500 transition-transform dark:text-slate-400", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 w-[300px] overflow-hidden rounded-2xl border bg-white text-gray-950 shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:text-white",
            placement === "topbar"
              ? "right-0 top-12 w-[calc(100vw-1rem)] shadow-gray-900/10 dark:shadow-black/40 sm:w-[300px]"
              : "bottom-14 left-0 border-gray-200 shadow-gray-900/10 dark:shadow-black/40"
          )}
        >
          <div className="px-5 py-4">
            <p className="truncate text-sm font-bold">{userEmail ?? name}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-white"
              >
                Upgrade
              </Link>
            </div>
          </div>

          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto border-t border-gray-200 dark:border-gray-800">
          <div className="py-2">
            {mainItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-slate-100 dark:hover:bg-slate-900"
                onClick={() => setOpen(false)}
              >
                <Icon size={17} className="text-gray-600 dark:text-slate-300" />
                <span>{label}</span>
              </Link>
            ))}

            <div className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-slate-100">
              <Sun size={17} className="text-gray-600 dark:text-slate-300" />
              <span className="flex-1">Theme</span>
              <div className="rounded-full bg-gray-100 px-1 py-0.5 dark:bg-slate-800">
                <ThemeToggle />
              </div>
              <Moon size={15} className="text-gray-500 dark:text-slate-400" />
            </div>

            <div className="relative flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-slate-100">
              <Globe2 size={17} className="text-gray-600 dark:text-slate-300" />
              <span className="flex-1">Language</span>
              <button
                type="button"
                onClick={() => setLanguageOpen((value) => !value)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <span>EN</span>
                <ChevronDown size={14} className={cn("text-gray-500 transition-transform dark:text-slate-500", languageOpen && "rotate-180")} />
              </button>
              {languageOpen && (
                <div className="absolute right-5 top-10 z-10 w-40 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                  {["English", "Portuguese", "German", "French", "Chinese"].map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => setLanguageOpen(false)}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      {language}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 py-2 dark:border-gray-800">
            {resourceItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-slate-100 dark:hover:bg-slate-900"
                onClick={() => setOpen(false)}
              >
                <Icon size={17} className="text-gray-600 dark:text-slate-300" />
                <span>{label}</span>
              </Link>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex gap-5 border-t border-gray-200 px-5 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-slate-400">
            <Link href="/pricing" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white">
              Privacy policy
            </Link>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
