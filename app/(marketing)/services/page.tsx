import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe,
  Package,
  Search,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBreadcrumbJsonLd, buildMetadata, buildWebPageJsonLd } from "@/lib/seo";

const title = "Services";
const description =
  "Find products, verify suppliers, store inventory, pack orders, and ship to customers from one FastFulfill workflow.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/services",
  keywords: ["product sourcing service", "china fulfillment service", "warehouse and shipping service"],
});

type ServiceItem = {
  icon: typeof Search;
  title: string;
  eyebrow: string;
  description: string;
  bestFor: string;
  result: string;
  image: string;
  imageAlt: string;
  accent: string;
  iconWrap: string;
  included: string[];
  ctaLabel: string;
  href: string;
};

const SERVICES: ServiceItem[] = [
  {
    icon: Search,
    eyebrow: "Product Search",
    title: "Find products before you waste time on the wrong supplier",
    description:
      "Send a product link, photo, or short brief. FastFulfill checks supplier options, confirms pricing, explains MOQ, and helps you decide whether the product is worth testing.",
    bestFor: "Sellers who need landed pricing, sample support, and a fast yes or no before they commit.",
    result: "Get a usable sourcing answer within 24 hours instead of chasing factories yourself.",
    image: "/site-assets/services/product-sourcing-review.png",
    imageAlt: "Sourcing specialist reviewing products and supplier options",
    accent: "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300",
    iconWrap: "bg-brand-600 text-white",
    included: [
      "Factory option comparison",
      "MOQ and sample clarity",
      "Product viability check",
      "Clear product cost estimate",
      "Supplier shortlist with next step",
    ],
    ctaLabel: "Request Product Pricing",
    href: "/auth/signup",
  },
  {
    icon: Warehouse,
    eyebrow: "Warehouse Storage",
    title: "Store inventory in China with live visibility before orders ship",
    description:
      "Hold stock in FastFulfill warehouses and see what is available from your dashboard. This is the layer that lets you ship faster without asking the supplier for updates every day.",
    bestFor: "Stores that want better delivery speed, lower stock confusion, and less supplier dependency.",
    result: "Know what is ready to ship, what is running low, and what is already prepared for fulfillment.",
    image: "/site-assets/services/warehouse-operations.png",
    imageAlt: "Warehouse operations with organized shelves and inventory storage",
    accent: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300",
    iconWrap: "bg-purple-600 text-white",
    included: [
      "Shenzhen warehouse storage",
      "Visible stock count by SKU",
      "Photo and video confirmation",
      "Flexible storage periods",
      "Inventory ready for fulfillment",
    ],
    ctaLabel: "See Fulfillment Pricing",
    href: "/pricing",
  },
  {
    icon: Package,
    eyebrow: "Packing and Fulfillment",
    title: "Pack, label, and ship orders without building your own ops team",
    description:
      "Once you approve the product, FastFulfill picks, checks, packs, and ships orders to your customers. Custom packaging, inserts, bundle assembly, and standard packing flows are all handled in one place.",
    bestFor: "Brands that want fewer ops headaches, cleaner packaging, and better post-purchase delivery experience.",
    result: "Orders move from dashboard to packed shipment without manual back and forth with the supplier.",
    image: "/site-assets/services/packing-fulfillment.png",
    imageAlt: "Order packing and fulfillment workflow at a packing station",
    accent: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
    iconWrap: "bg-orange-600 text-white",
    included: [
      "Pick and pack handling",
      "Custom packaging options",
      "Insert and label support",
      "Bundle assembly",
      "Order-by-order fulfillment flow",
    ],
    ctaLabel: "Start With a Sample",
    href: "/auth/signup",
  },
  {
    icon: Globe,
    eyebrow: "Global Shipping",
    title: "Ship to customers with clear timelines, tracking, and fewer surprises",
    description:
      "FastFulfill explains shipping cost, route, and delivery expectations before you approve the order. Tracking numbers sync back so you and your buyers can see what is happening.",
    bestFor: "Stores that need predictable delivery messaging and fewer support tickets about where the package is.",
    result: "Customers get shipped orders with tracking, and you get fewer delivery-status complaints.",
    image: "/site-assets/proof/tracking-workstation.png",
    imageAlt: "Tracking workstation used to monitor shipping progress",
    accent: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300",
    iconWrap: "bg-green-600 text-white",
    included: [
      "Tracked shipping across 40+ countries",
      "Standard and faster delivery options",
      "Pre-approval shipping explanation",
      "Tracking sync back to store",
      "Large-order routing support",
    ],
    ctaLabel: "Track an Order",
    href: "/tracking",
  },
];

const CONNECTED_FLOW = [
  "You send a product",
  "We source and quote it",
  "Stock is stored and prepared",
  "Orders are packed and shipped",
];

const TRUST_POINTS = [
  {
    icon: Clock3,
    title: "Clear first response",
    text: "Product pricing and sourcing direction are sent within 24 hours for standard requests.",
  },
  {
    icon: ShieldCheck,
    title: "Checks before shipping",
    text: "QC feedback, stock visibility, packaging steps, and tracking are handled inside one flow.",
  },
  {
    icon: CheckCircle2,
    title: "No hidden workflow",
    text: "You see product cost, shipping cost, and service work as separate parts instead of one opaque quote.",
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      <JsonLd
        data={[
          buildWebPageJsonLd({ title, description, path: "/services", type: "CollectionPage" }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        ]}
      />
      <section className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-brand-50 py-20 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
        <div className="container-section">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-brand-600 dark:text-brand-400">
              Our Services
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-gray-950 dark:text-white md:text-6xl">
              One workflow from product search to customer delivery
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400 md:text-lg">
              FastFulfill helps you source products, verify them, store inventory, fulfill orders, and ship with tracking from one connected system.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Request Product Pricing
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See Fulfillment Pricing
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
              {[
                "Prices sent within 24 hours",
                "Inventory stored in Shenzhen",
                "Tracking synced back after shipment",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-section">
          <div className="space-y-8">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              const reverse = index % 2 === 1;

              return (
                <article
                  key={service.title}
                  className={`grid items-center gap-8 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] ${reverse ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="mb-5 flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${service.iconWrap}`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                          {service.eyebrow}
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold leading-tight text-gray-950 dark:text-white md:text-3xl">
                          {service.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-base leading-8 text-gray-600 dark:text-gray-400">
                      {service.description}
                    </p>

                    <div className={`mt-6 rounded-2xl border px-4 py-4 ${service.accent}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                        Best for
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {service.bestFor}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Result
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                        {service.result}
                      </p>
                    </div>

                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {service.included.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                          <CheckCircle2 size={16} className="mt-1 shrink-0 text-green-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link href={service.href}>
                        <Button>
                          {service.ctaLabel}
                          <ArrowRight size={16} />
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button variant="outline">
                          Contact FastFulfill
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-gray-950 shadow-xl shadow-gray-900/10 dark:border-gray-800">
                      <Image
                        src={service.image}
                        alt={service.imageAlt}
                        width={1400}
                        height={900}
                        priority={index === 0}
                        className="h-auto w-full object-cover"
                        sizes="(min-width: 1024px) 42vw, 100vw"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-950">
        <div className="container-section">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
              Connected Workflow
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-950 dark:text-white md:text-4xl">
              These services work together as one operating flow
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-400">
              FastFulfill is strongest when sourcing, storage, fulfillment, and shipping are handled in one chain instead of split across random agents and tools.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {CONNECTED_FLOW.map((step, index) => (
              <div key={step} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
                  Step {index + 1}
                </p>
                <p className="mt-3 text-lg font-bold text-gray-950 dark:text-white">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-section">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
              What Makes It Credible
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-950 dark:text-white md:text-4xl">
              Clear service scope, visible operations, and fewer black-box steps
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-950 dark:text-white">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                  {text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-10 text-center sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
              Next Step
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
              Start with one product and let the system prove itself
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
              The easiest way to test FastFulfill is simple: request one product price, review the quote, order a sample if needed, then move into fulfillment only when you are confident.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Request Product Pricing
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/20 bg-transparent text-white hover:border-white/30 hover:bg-white/10 sm:w-auto"
                >
                  Review Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
