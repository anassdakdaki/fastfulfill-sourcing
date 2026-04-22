import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { PostBody } from "@/components/blog/post-body";
import { PostCTA } from "@/components/blog/post-cta";
import { PostHeader } from "@/components/blog/post-header";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButtons } from "@/components/blog/share-buttons";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fastfulfill.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: `/blog/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`/blog/${post.slug}/opengraph-image`],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.slug, post.category);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}/blog/${post.slug}/opengraph-image`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: "FastFulfill",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "FastFulfill",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-950">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PostHeader post={post} />
      <main className="container-section py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <ShareButtons title={post.title} url={`${SITE_URL}/blog/${post.slug}`} />
            <PostBody content={post.content} />
          </div>
          <BlogSidebar relatedPosts={relatedPosts} />
        </div>
        <PostCTA variant="quote" />
      </main>
    </div>
  );
}
