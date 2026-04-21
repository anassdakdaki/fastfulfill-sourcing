import Link from "next/link";

const CATEGORIES = [
  { emoji: "🎧", name: "Electronics & Gadgets", examples: "Earbuds, LED strips, phone cases, smart home" },
  { emoji: "👗", name: "Fashion & Apparel", examples: "Clothing, accessories, shoes, streetwear" },
  { emoji: "💄", name: "Beauty & Skincare", examples: "Serums, tools, cosmetics, packaging" },
  { emoji: "🏋️", name: "Fitness & Sports", examples: "Resistance bands, mats, weights, gear" },
  { emoji: "🏠", name: "Home & Kitchen", examples: "Organizers, cookware, decor, lighting" },
  { emoji: "🐾", name: "Pet Supplies", examples: "Beds, toys, feeders, grooming tools" },
  { emoji: "👶", name: "Baby & Kids", examples: "Toys, clothing, safety gear, nursery" },
  { emoji: "🌱", name: "Eco & Sustainable", examples: "Reusable products, bamboo, organic packaging" },
  { emoji: "🛠️", name: "Tools & Industrial", examples: "Hand tools, storage, workshop accessories" },
  { emoji: "🎮", name: "Gaming & Hobby", examples: "Controllers, accessories, collectibles" },
];

export function WhatWeSource() {
  return (
    <section className="py-24 bg-white" id="categories">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            Product Categories
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            We source across every niche
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Whether you&apos;re dropshipping one product or building a brand,
            we have factory connections for your niche.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="group bg-gray-50 hover:bg-brand-50 border border-gray-100 hover:border-brand-200 rounded-2xl p-4 transition-all cursor-default"
            >
              <div className="text-3xl mb-3">{cat.emoji}</div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-brand-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">{cat.examples}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t see your category?{" "}
            <Link href="/auth/signup" className="text-brand-600 font-semibold hover:underline">
              Submit a sourcing request
            </Link>{" "}
            — if it&apos;s made in China, we can source it.
          </p>
        </div>
      </div>
    </section>
  );
}
