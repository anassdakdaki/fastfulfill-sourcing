import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    name: "Electronics & Gadgets",
    examples: "Earbuds, LED strips, phone cases, smart home",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Fashion & Apparel",
    examples: "Clothing, accessories, shoes, streetwear",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Beauty & Skincare",
    examples: "Serums, tools, cosmetics, packaging",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Fitness & Sports",
    examples: "Resistance bands, mats, weights, gear",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Home & Kitchen",
    examples: "Organizers, cookware, decor, lighting",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Pet Supplies",
    examples: "Beds, toys, feeders, grooming tools",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Baby & Kids",
    examples: "Toys, clothing, safety gear, nursery",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Eco & Sustainable",
    examples: "Reusable products, bamboo, organic packaging",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Tools & Industrial",
    examples: "Hand tools, storage, workshop accessories",
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Gaming & Hobby",
    examples: "Controllers, accessories, collectibles",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=640&q=80",
  },
];

export function WhatWeSource() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950" id="categories">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            Product Types
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            We can find many types of products
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Whether you sell one product or many products, we help you find good suppliers in China.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="group overflow-hidden bg-white hover:bg-brand-50 border border-gray-100 hover:border-brand-200 rounded-xl shadow-sm transition-all cursor-default dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-brand-900/20 dark:hover:border-brand-800"
            >
              <div className="relative h-24 bg-gray-100 dark:bg-gray-800 sm:h-28">
                <Image
                  src={cat.image}
                  alt={`${cat.name} products`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="mb-1 text-[13px] font-bold leading-5 text-gray-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300 sm:text-sm">
                  {cat.name}
                </h3>
                <p className="text-[11px] leading-5 text-gray-500 dark:text-gray-400 sm:text-xs sm:leading-relaxed">
                  {cat.examples}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t see your category?{" "}
            <Link href="/auth/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Ask us to find it
            </Link>{" "}
            If it is made in China, we can help find it.
          </p>
        </div>
      </div>
    </section>
  );
}
