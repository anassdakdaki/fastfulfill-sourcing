import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl sm:h-[500px] sm:w-[500px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl sm:h-[400px] sm:w-[400px]" />
      </div>

      <div className="container-section">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400">
            <Clock size={12} />
            Product prices sent within 24 hours
          </div>

          <h2 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Ready to pay less and<br />
            <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
              ship faster?
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-lg text-slate-400">
            Send us a product. Get a clear price in 24 hours. No subscription. No minimum order. No risk.
          </p>

          <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 w-full px-8 text-base shadow-xl shadow-brand-500/20 sm:w-auto">
                Request Product Pricing
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-white/20 bg-transparent px-8 text-base text-white hover:border-white/30 hover:bg-white/10 sm:w-auto"
              >
                <Package2 size={18} />
                Order a Sample
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-400">
            {[
              "No monthly fee",
              "No credit card to start",
              "Price in 24h or it is free",
              "Warehouse in Shenzhen",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
