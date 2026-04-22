import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { getAllTags, getPostsByTagSlug } from "@/lib/blog";

type PageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const tags = await getAllTags();
  const currentTag = tags.find((item) => item.slug === tag);

  return {
    title: `${currentTag?.name ?? tag} Articles`,
    description: `FastFulfill articles tagged ${currentTag?.name ?? tag}.`,
    alternates: { canonical: `/blog/tag/${tag}` },
  };
}

export default async function BlogTagPage({ params }: PageProps) {
  const { tag } = await params;
  const [posts, tags] = await Promise.all([getPostsByTagSlug(tag), getAllTags()]);
  const currentTag = tags.find((item) => item.slug === tag);

  if (posts.length === 0) notFound();

  return (
    <div className="bg-white dark:bg-gray-950">
      <section className="container-section py-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Blog Tag
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
          {currentTag?.name ?? tag}
        </h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
