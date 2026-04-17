import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-600 to-indigo-700">
      <div className="container-section text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Ready to Source Smarter?
        </h2>
        <p className="text-brand-100 text-lg max-w-xl mx-auto mb-10">
          Join 2,400+ sellers who have already cut their sourcing costs and shipping times in half.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-white text-brand-700 hover:bg-brand-50 shadow-lg focus:ring-white"
            >
              Start for Free <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/catalog">
            <Button
              size="lg"
              variant="outline"
              className="border-brand-400 text-white hover:bg-brand-700 hover:border-brand-300 focus:ring-white"
            >
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
