import type { Metadata } from "next";
import { AuthHeaderLayout } from "@/components/layout/auth-header-layout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to your FastFulfill seller account.",
  path: "/auth/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AuthHeaderLayout>{children}</AuthHeaderLayout>;
}
