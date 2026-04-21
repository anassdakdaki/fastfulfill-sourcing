import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pt-20 pb-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[700px] h-[700px] rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container-section text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
          For online sellers who want cheaper products and faster shipping
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl md:text-6xl">
          Your Store Orders<br />
          Packed and Shipped from{" "}
          <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            China
          </span>
          <br />
          <span className="text-3xl font-bold text-slate-300 sm:text-4xl md:text-5xl">
            Without the Supplier Chaos
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          Send us a product link. We find the supplier, check the product, pack it, and ship it to your customer. You can connect Shopify, TikTok Shop, Amazon, WooCommerce, or another store.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth/signup">
            <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-brand-500/20">
              Get a Free Product Price
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/pricing">
            <button className="text-sm font-semibold text-slate-300 underline underline-offset-4 transition-colors hover:text-white">
              See simple pricing
            </button>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Clock, text: "Price in 24h" },
            { icon: CheckCircle2, text: "No monthly fee" },
            { icon: Package2, text: "Warehouse in Shenzhen" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
              <Icon size={13} className="text-brand-400" />
              {text}
            </div>
          ))}
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex h-5 flex-1 items-center justify-center rounded-md bg-white/5 text-center font-mono text-xs text-slate-500">
                fastfullfillsourcing.vercel.app/dashboard
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Orders today", value: "24", color: "text-brand-400" },
                { label: "On the way", value: "147", color: "text-blue-400" },
                { label: "Delivered", value: "1,209", color: "text-green-400" },
                { label: "Product prices", value: "8", color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {[
                "Wireless Earbuds - 120 units - Shipped",
                "Yoga Mat - 50 units - Quality check",
                "LED Strip - 200 units - Finding supplier",
              ].map((row) => (
                <div key={row} className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                  {row}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 h-12 w-3/4 -translate-x-1/2 rounded-full bg-brand-600/20 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
