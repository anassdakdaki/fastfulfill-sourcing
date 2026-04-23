import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { Button } from "@/components/ui/button";

export function BlogSidebar({ relatedPosts }: { relatedPosts: BlogPost[] }) {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
          Ready to source products?
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Send us a product link and get a clear supplier and shipping price.
        </p>
        <Link href="/auth/signup" className="mt-4 block">
          <Button className="w-full" size="sm">
            Request Product Pricing
            <ArrowRight size={15} />
          </Button>
        </Link>
      </div>

      {relatedPosts.length > 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            Related articles
          </h2>
          <div className="mt-4 space-y-4">
            {relatedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <p className="text-sm font-bold leading-5 text-gray-800 group-hover:text-brand-700 dark:text-gray-200 dark:group-hover:text-brand-300">
                  {post.title}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {post.readingTime} min read
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
