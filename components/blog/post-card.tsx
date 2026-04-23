import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { formatBlogCategory } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-950">
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            fill
            unoptimized
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm backdrop-blur dark:bg-gray-950/80 dark:text-brand-300">
            {formatBlogCategory(post.category)}
          </div>
        </div>
      </Link>

      <div className={featured ? "p-6" : "p-5"}>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} />
            {post.readingTime} min read
          </span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h2 className={`${featured ? "text-2xl" : "text-lg"} font-extrabold leading-tight text-gray-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300`}>
            {post.title}
          </h2>
        </Link>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {post.description}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Read article
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
