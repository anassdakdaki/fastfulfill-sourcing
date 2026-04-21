import Link from "next/link";
import { Search, Warehouse, Package, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Services" };

const SERVICES = [
  {
    icon: Search,
    color: "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300",
    title: "Find Products",
    description:
      "Share a product link, name, or photo. We find factory options, check the price, and can arrange a sample within 24 hours.",
    features: [
      "Clear factory price",
      "Compare supplier options",
      "Sample order support",
      "Product quality check",
      "Minimum order explained",
    ],
  },
  {
    icon: Warehouse,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    title: "Store Products",
    description:
      "Store your products in our warehouses in China and see what is available from your dashboard.",
    features: [
      "Safe storage",
      "See stock count anytime",
      "Product photos and videos",
      "Flexible storage time",
      "Low minimum storage",
    ],
  },
  {
    icon: Package,
    color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
    title: "Pack and Ship Orders",
    description:
      "Send us your orders and we pick, pack, and ship them to your customers. Custom packaging is available.",
    features: [
      "Fast order handling",
      "Custom packaging",
      "Product bundles",
      "Return support",
      "Online store and bulk orders",
    ],
  },
  {
    icon: Globe,
    color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    title: "Global Shipping",
    description:
      "Ship to 40+ countries with tracking. We explain the shipping cost and delivery time before you confirm.",
    features: [
      "No surprise shipping steps",
      "7-15 day fast delivery options",
      "Tracking on every package",
      "Standard and express options",
      "Large order shipping",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-brand-50 py-20 border-b border-gray-100 text-center dark:from-gray-950 dark:to-gray-900 dark:border-gray-800">
        <div className="container-section max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3 dark:text-brand-300">Our Services</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 dark:text-white">
            Everything from Product Search to Delivery
          </h1>
          <p className="text-gray-500 text-lg dark:text-gray-400">
            FastFulfill helps you find products, store them, pack orders, and ship to customers from one place.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg">Get Started Free <ArrowRight size={18} /></Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container-section">
          <div className="space-y-16">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={service.title}
                  className={`flex flex-col gap-10 ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-start`}
                >
                  <div className="flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${service.color}`}>
                      <Icon size={22} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 dark:text-white">{service.title}</h2>
                    <p className="text-gray-500 leading-relaxed mb-6 dark:text-gray-400">{service.description}</p>
                    <Link href="/auth/signup">
                      <Button size="sm">
                        Start <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-8 dark:bg-gray-900 dark:border-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 dark:text-gray-500">
                      What&apos;s included
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
