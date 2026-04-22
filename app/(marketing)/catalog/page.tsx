"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATALOG_PRODUCTS } from "@/lib/catalog";

const CATEGORIES = ["All", "Gadgets", "Beauty", "Kitchen", "Fitness", "Pets", "Photography"];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = CATALOG_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-50 to-brand-50 py-16 border-b border-gray-100 dark:from-gray-950 dark:to-gray-900 dark:border-gray-800">
        <div className="container-section text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Product Ideas</h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto dark:text-gray-400">
            Browse product ideas. Click &ldquo;Ask for price&rdquo; and we will send you a clear price within 24 hours.
          </p>
          <div className="mt-8 relative max-w-sm mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container-section py-10">
        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">No products found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <span className="absolute left-2 top-2 rounded-full border border-gray-100 bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-600 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-950/80 dark:text-gray-300 sm:left-3 sm:top-3 sm:text-xs">
                    {product.category}
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="mb-1 text-[13px] font-semibold leading-snug text-gray-900 dark:text-white sm:text-sm">{product.name}</h3>
                  <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500 sm:text-xs">
                    From <span className="font-semibold text-gray-600 dark:text-gray-300">${product.minPrice}</span> each | Minimum order {product.moq}
                  </p>
                  <Link href="/auth/signup">
                    <Button className="w-full px-2 text-xs sm:px-3" size="sm">
                      Ask for Price <ArrowRight size={13} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
