import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-brand-50 pt-20 pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="container-section text-center">
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Trusted by 2,400+ ecommerce sellers
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto">
          Source, Store & Ship Your Products from{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">
            China
          </span>{" "}
          - Faster & Cheaper
        </h1>

        {/* Sub */}
        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Your personal sourcing agent in China. We find the products, negotiate prices, handle quality control, and ship directly to your customers.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signup">
            <Button size="lg" className="shadow-lg shadow-brand-200">
              Start Sourcing Free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <button className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors group">
            <span className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-brand-300 transition-colors">
              <Play size={14} className="ml-0.5 text-gray-600 group-hover:text-brand-600" />
            </span>
            Watch 2-min demo
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <strong className="text-gray-700">4.9/5</strong> from 800+ reviews
          </span>
          <span>|</span>
          <span><strong className="text-gray-700">$12M+</strong> in products sourced</span>
          <span>|</span>
          <span><strong className="text-gray-700">40+ countries</strong> served</span>
        </div>
      </div>
    </section>
  );
}
