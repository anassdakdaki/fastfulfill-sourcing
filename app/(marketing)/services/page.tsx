import Link from "next/link";
import { Search, Warehouse, Package, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Services" };

const SERVICES = [
  {
    icon: Search,
    color: "bg-brand-50 text-brand-600",
    title: "Product Sourcing",
    description:
      "Share a product URL or description and our sourcing team will find the best factory, negotiate price, and arrange samples, all within 24 hours.",
    features: [
      "Factory-direct pricing",
      "Multi-supplier comparison",
      "Sample ordering & QC",
      "Private label support",
      "MOQ negotiation",
    ],
  },
  {
    icon: Warehouse,
    color: "bg-purple-50 text-purple-600",
    title: "Warehousing",
    description:
      "Store your inventory in our strategically located warehouses in Shenzhen, Guangzhou, and Yiwu. Full visibility of stock levels in your dashboard.",
    features: [
      "Secure climate-controlled storage",
      "Real-time inventory tracking",
      "Photo & video documentation",
      "Flexible storage terms",
      "Low minimum storage requirements",
    ],
  },
  {
    icon: Package,
    color: "bg-orange-50 text-orange-600",
    title: "Order Fulfillment",
    description:
      "Send us your orders and we pick, pack, and ship. Custom packaging, branded inserts, and kitting services available.",
    features: [
      "Same-day processing",
      "Custom packaging & branding",
      "Product bundles & kitting",
      "Returns management",
      "B2C & B2B fulfillment",
    ],
  },
  {
    icon: Globe,
    color: "bg-green-50 text-green-600",
    title: "Global Shipping",
    description:
      "Ship to 40+ countries with DDP shipping with no surprise customs fees for your customers. Express options available for 7-day delivery.",
    features: [
      "DDP shipping (duties paid)",
      "7-15 day express delivery",
      "Full tracking on every package",
      "ePacket & standard options",
      "Bulk freight for large orders",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 to-brand-50 py-20 border-b border-gray-100 text-center">
        <div className="container-section max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Our Services</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Everything from Source to Doorstep
          </h1>
          <p className="text-gray-500 text-lg">
            FastFulfill is your all-in-one China operations team for sourcing, storage, fulfillment, and shipping under one roof.
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
      <section className="py-20">
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h2>
                    <p className="text-gray-500 leading-relaxed mb-6">{service.description}</p>
                    <Link href="/auth/signup">
                      <Button size="sm">
                        Start {service.title} <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                      What&apos;s included
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
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
