"use client";

import { useState } from "react";
import { Check, Copy, Linkedin, Twitter } from "lucide-react";

type ShareButtonsProps = {
  title: string;
  url: string;
};

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-900 dark:hover:text-brand-300"
      >
        <Twitter size={14} /> Share
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-900 dark:hover:text-brand-300"
      >
        <Linkedin size={14} /> LinkedIn
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-brand-900 dark:hover:text-brand-300"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
