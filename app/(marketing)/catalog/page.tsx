"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DUMMY_CATALOG } from "@/lib/dummy-data";
import type { Metadata } from "next";

const CATEGORIES = ["All", "Gadgets", "Beauty", "Kitchen", "Fitness", "Pets", "Photography"];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = DUMMY_CATALOG.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-50 to-brand-50 py-16 border-b border-gray-100">
        <div className="container-section text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Product Catalog</h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Browse winning products ready to source. Click &ldquo;Request Sourcing&rdquo; to get a quote within 24h.
          </p>
          <div className="mt-8 relative max-w-sm mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
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
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-semibold text-gray-600">No products found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <span className="absolute top-3 left-3 text-xs bg-white/90 backdrop-blur-sm border border-gray-100 px-2 py-1 rounded-full font-medium text-gray-600">
                    {product.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    From <span className="font-semibold text-gray-600">${product.minPrice}</span>/unit | MOQ {product.moq}
                  </p>
                  <Link href="/auth/signup">
                    <Button className="w-full" size="sm">
                      Request Sourcing <ArrowRight size={13} />
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
