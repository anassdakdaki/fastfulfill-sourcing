import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageSearch, ShieldCheck, Truck, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROOF_ITEMS = [
  {
    icon: ShieldCheck,
    title: "QC before shipping",
    text: "FastFulfill checks product condition before stock moves into fulfillment, so defects are caught before they reach the customer.",
    image: "/services/product-search.png",
    imageAlt: "Illustration of sourcing and product review workflow",
    chip: "QC notes, sample review, next step",
  },
  {
    icon: Warehouse,
    title: "Warehouse visibility",
    text: "Inventory can be stored in Shenzhen and reviewed inside one flow, instead of asking suppliers for manual updates.",
    image: "/services/warehouse-storage.png",
    imageAlt: "Illustration of warehouse storage and stock visibility",
    chip: "Stock ready, intake confirmed",
  },
  {
    icon: PackageSearch,
    title: "Packing and inserts",
    text: "Packing steps, labels, inserts, and bundled orders are handled before shipment so the order leaves in the right presentation.",
    image: "/services/packing-orders.png",
    imageAlt: "Illustration of packing workflow and packaging setup",
    chip: "Packed, labeled, and prepared",
  },
  {
    icon: Truck,
    title: "Tracking updates",
    text: "After shipment, tracking syncs back so both the seller and the buyer can see delivery progress clearly.",
    image: "/services/global-shipping.png",
    imageAlt: "Illustration of global shipping route and tracking updates",
    chip: "Tracking synced back after shipment",
  },
];

export function OperationsProof() {
  return (
    <section className="bg-white py-24 dark:bg-gray-950">
      <div className="container-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
            Operational Proof
          </p>
          <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white md:text-4xl">
            What buyers should expect to see before trusting fulfillment
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400">
            FastFulfill should feel visible, not opaque. Buyers need proof that product checks, inventory handling, packing, and tracking are actually managed before orders ship.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PROOF_ITEMS.map(({ icon: Icon, title, text, image, imageAlt, chip }) => (
            <article
              key={title}
              className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 42vw, 100vw"
                />
                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {chip}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-950 dark:text-white">{title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">{text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-gray-200 bg-gray-50 px-6 py-8 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
                Why this matters
              </p>
              <p className="mt-3 text-base leading-8 text-gray-700 dark:text-gray-300">
                The difference between a usable fulfillment partner and a risky one is simple: you can see what happens before the package goes out, and you can understand what you are paying for.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                {[
                  "QC before shipment",
                  "Inventory visibility",
                  "Clear packaging steps",
                  "Tracking after dispatch",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-800 dark:bg-gray-950">
                    <CheckCircle2 size={14} className="text-green-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signup">
                <Button>
                  Request Product Pricing
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline">
                  See Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
