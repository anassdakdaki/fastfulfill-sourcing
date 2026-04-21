import Link from "next/link";
import { ArrowRight, Clock, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container-section">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-8">
            <Clock size={12} />
            Quotes delivered within 24 hours
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            Ready to cut costs and<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
              ship faster?
            </span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Submit a product. Get a sourcing quote in 24 hours.
            No subscription. No minimum order. No risk.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/auth/signup">
              <Button size="lg" className="shadow-xl shadow-brand-500/20 text-base px-8 h-12 w-full sm:w-auto">
                Request a Free Quote
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-8 h-12 w-full sm:w-auto"
              >
                <Package2 size={18} />
                Order a Sample from $30
              </Button>
            </Link>
          </div>

          {/* Trust bullets */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-400">
            {[
              "No monthly fee",
              "No credit card to start",
              "Quote in 24h or it's free",
              "Shenzhen warehouse",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="text-brand-500">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
