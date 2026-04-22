import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryFilter } from "@/components/blog/category-filter";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { getAllCategories, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides for sourcing products from China, Shopify fulfillment, shipping times, and ecommerce operations.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const remaining = featured
    ? posts.filter((post) => post.slug !== featured.slug)
    : posts;

  return (
    <div className="bg-white dark:bg-gray-950">
      <section className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-brand-50 py-16 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
        <div className="container-section">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              FastFulfill Blog
            </p>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white md:text-5xl">
              Better sourcing and fulfillment decisions
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-500 dark:text-gray-400">
              Practical guides for sellers who source products from China, ship to customers, and want fewer supplier problems.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto">
                  Request a product price
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full sm:w-auto">
                  See pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-section py-10">
        <CategoryFilter categories={categories} />

        {featured ? (
          <div className="mt-8">
            <PostCard post={featured} featured />
          </div>
        ) : null}

        {remaining.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {remaining.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
