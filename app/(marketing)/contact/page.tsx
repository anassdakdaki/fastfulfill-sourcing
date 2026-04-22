import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MessageSquare, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact FastFulfill",
  description: "Contact FastFulfill for product sourcing, Shopify fulfillment, warehousing, packaging, and shipping questions.",
};

export default function ContactPage() {
  return (
    <main className="bg-white dark:bg-gray-950">
      <section className="container-section max-w-4xl py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Contact</p>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">Talk to FastFulfill</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Send us your product link, destination country, target quantity, and packaging needs. We will review supplier options and tell you the next step.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icon: PackageSearch, title: "Product sourcing", text: "Send one product link or a short description." },
            { icon: MessageSquare, title: "Existing account", text: "Use your dashboard request history when possible." },
            { icon: Mail, title: "Email", text: "support@fastfulfill.com" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
              <item.icon size={20} className="text-brand-600 dark:text-brand-400" />
              <h2 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/auth/signup">
            <Button>Start sourcing</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline">See pricing</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
