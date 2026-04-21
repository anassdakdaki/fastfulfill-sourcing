import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pt-20 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[700px] h-[700px] rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      <div className="container-section text-center">
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Shopify dropshippers with quotes in 24h and shipping in 7 to 12 days
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] max-w-4xl mx-auto">
          Your Shopify Orders<br />
          Fulfilled from{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
            China
          </span>
          <br />
          <span className="text-3xl sm:text-4xl md:text-5xl text-slate-300 font-bold">
            at Factory Price
          </span>
        </h1>

        {/* Sub */}
        <p className="mt-7 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Send us a product link. We source it, inspect it, pack it,
          and ship it directly to your customers. No Alibaba. No WeChat chaos.
          One platform.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signup">
            <Button size="lg" className="shadow-xl shadow-brand-500/20 text-base px-8 h-12">
              Request Free Quote
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/pricing">
            <button className="text-sm font-semibold text-slate-300 hover:text-white transition-colors underline underline-offset-4">
              See pricing with no monthly fee
            </button>
          </Link>
        </div>

        {/* Trust chips */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Clock, text: "Quote within 24h" },
            { icon: CheckCircle2, text: "Free to get started" },
            { icon: Package2, text: "Shenzhen warehouse" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
              <Icon size={13} className="text-brand-400" />
              {text}
            </div>
          ))}
        </div>

        {/* Dashboard mockup hint */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 bg-white/5 rounded-md h-5 text-center text-xs text-slate-500 flex items-center justify-center font-mono">
                fastfullfillsourcing.vercel.app/dashboard
              </div>
            </div>
            {/* Mini dashboard preview */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              {[
                { label: "Orders Today", value: "24", color: "text-brand-400" },
                { label: "In Transit", value: "147", color: "text-blue-400" },
                { label: "Delivered", value: "1,209", color: "text-green-400" },
                { label: "Sourcing", value: "8", color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Wireless Earbuds · 120 units · 🟢 Shipped", "Yoga Mat · 50 units · 🟡 QC Check", "LED Strip · 200 units · 🔵 Sourcing"].map((row) => (
                <div key={row} className="bg-white/3 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400">
                  {row}
                </div>
              ))}
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-brand-600/20 blur-2xl rounded-full" />
        </div>
      </div>
    </section>
  );
}
