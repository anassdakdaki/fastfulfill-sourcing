import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PostCTA } from "@/components/blog/post-cta";

const components = {
  a: ({ href = "", children }: { href?: string; children: ReactNode }) => {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return <Link href={href}>{children}</Link>;
  },
  img: ({ src = "", alt = "" }: { src?: string; alt?: string }) => (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={506}
      unoptimized
      className="rounded-2xl"
    />
  ),
  PostCTA,
};

export function PostBody({ content }: { content: string }) {
  return (
    <article className="prose prose-lg prose-gray max-w-none dark:prose-invert prose-headings:font-extrabold prose-a:font-semibold prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:rounded-2xl">
      <MDXRemote source={content} components={components} />
    </article>
  );
}
