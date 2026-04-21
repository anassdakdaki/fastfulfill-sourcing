import {
  Archive,
  BarChart3,
  Lock,
  MapPin,
  PackageCheck,
  Plane,
  SearchCheck,
  ShoppingBag,
  UploadCloud,
  Zap,
} from "lucide-react";
import type { ElementType } from "react";

type FlowItem = {
  icon: ElementType;
  title: string;
  desc: string;
  badge?: string;
  cardClass: string;
  iconClass: string;
  badgeClass: string;
};

const FLOW: FlowItem[] = [
  {
    icon: ShoppingBag,
    title: "Store order placed",
    desc: "Customer buys on your store",
    cardClass: "border-emerald-400/20 bg-emerald-500/[0.08]",
    iconClass: "bg-emerald-400/[0.12] text-emerald-300",
    badgeClass: "bg-emerald-400/[0.12] text-emerald-200",
  },
  {
    icon: UploadCloud,
    title: "FastFulfill receives it",
    desc: "Auto-synced to your dashboard in seconds",
    cardClass: "border-brand-400/25 bg-brand-500/[0.10]",
    iconClass: "bg-brand-400/[0.15] text-brand-200",
    badgeClass: "bg-brand-400/[0.15] text-brand-100",
    badge: "Real-time sync",
  },
  {
    icon: SearchCheck,
    title: "Warehouse checks the product",
    desc: "We pick the item, check it, and prepare it for packing",
    cardClass: "border-purple-400/25 bg-purple-500/[0.10]",
    iconClass: "bg-purple-400/[0.15] text-purple-200",
    badgeClass: "bg-purple-400/[0.15] text-purple-100",
    badge: "Checked every order",
  },
  {
    icon: PackageCheck,
    title: "Packed in your branding",
    desc: "Custom box, inserts, your label",
    cardClass: "border-orange-400/25 bg-orange-500/[0.09]",
    iconClass: "bg-orange-400/[0.15] text-orange-200",
    badgeClass: "bg-orange-400/[0.15] text-orange-100",
    badge: "White-label",
  },
  {
    icon: Plane,
    title: "Ships to your customer",
    desc: "Fast delivery with clear tracking and no confusing steps",
    cardClass: "border-blue-400/25 bg-blue-500/[0.10]",
    iconClass: "bg-blue-400/[0.15] text-blue-200",
    badgeClass: "bg-blue-400/[0.15] text-blue-100",
    badge: "7 to 12 days",
  },
  {
    icon: MapPin,
    title: "Tracking syncs back",
    desc: "Customer gets tracking number automatically",
    cardClass: "border-slate-500/35 bg-slate-800/70",
    iconClass: "bg-slate-700 text-slate-200",
    badgeClass: "bg-slate-700 text-slate-200",
    badge: "Auto-notified",
  },
];

const OUTCOMES = [
  {
    icon: Zap,
    title: "Zero manual work",
    desc: "No manual files, no copy-pasting orders, no long supplier messages.",
  },
  {
    icon: Lock,
    title: "Defects caught before shipping",
    desc: "Physical inspection means unhappy customers stay off your reviews.",
  },
  {
    icon: BarChart3,
    title: "Full visibility at all times",
    desc: "You can see every order status, from product search to delivery.",
  },
];

export function FulfillmentFlow() {
  return (
    <section
      className="relative overflow-hidden bg-gray-950 py-20 text-white sm:py-24"
      id="fulfillment"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />
      <div className="absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-brand-600/10 blur-3xl" />

      <div className="container-section relative">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
            How orders flow
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            From store order to customer door
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Everything is automated. You do not touch a single package because the system handles it end to end.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {FLOW.map(({ icon: Icon, ...item }, index) => (
            <article
              key={item.title}
              className={`relative flex min-h-[210px] flex-col rounded-3xl border p-5 shadow-2xl shadow-black/10 backdrop-blur ${item.cardClass}`}
            >
              {index < FLOW.length - 1 ? (
                <span className="absolute -right-4 top-1/2 z-10 hidden h-px w-8 bg-gradient-to-r from-white/[0.35] to-transparent xl:block" />
              ) : null}

              <div className="mb-5 flex items-start justify-between gap-3">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClass}`}>
                  <Icon size={22} strokeWidth={2.2} />
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-bold text-white/[0.45]">
                  0{index + 1}
                </span>
              </div>

              <h3 className="text-balance text-sm font-extrabold leading-5 text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {item.desc}
              </p>

              {item.badge ? (
                <span className={`mt-auto w-fit rounded-full px-3 py-1 text-xs font-bold ${item.badgeClass}`}>
                  {item.badge}
                </span>
              ) : (
                <span className="mt-auto h-1 w-8 rounded-full bg-emerald-400/[0.35]" />
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {OUTCOMES.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="flex min-h-[118px] gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-brand-200">
                <Icon size={22} strokeWidth={2.2} />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-400">{desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-gray-500">
          <span className="inline-flex items-center gap-2">
            <Archive size={14} />
            Products, quality checks, shipping, and tracking in one flow
          </span>
        </div>
      </div>
    </section>
  );
}
