import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEMO_COOKIE = "ff_demo_session";
// values: "buyer" | "supplier" | "fulfillment" | "1" (legacy buyer)

function demoDest(role: string) {
  if (role === "supplier") return "/supplier";
  if (role === "fulfillment") return "/fulfillment";
  return "/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Demo logout ───────────────────────────────────────────────────────────
  if (pathname === "/auth/demo-logout") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    const res = NextResponse.redirect(url);
    res.cookies.delete(DEMO_COOKIE);
    return res;
  }

  // ── Demo mode bypass ──────────────────────────────────────────────────────
  const demoRole = request.cookies.get(DEMO_COOKIE)?.value; // "buyer" | "supplier" | "fulfillment" | "1"
  const isDemo = !!demoRole;
  const isDemoBuyer       = demoRole === "buyer" || demoRole === "1";
  const isDemoSupplier    = demoRole === "supplier";
  const isDemoFulfillment = demoRole === "fulfillment";

  if (isDemo) {
    // Redirect demo users away from auth pages
    if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup") || pathname.startsWith("/auth/supplier-signup")) {
      const url = request.nextUrl.clone();
      url.pathname = demoDest(demoRole!);
      return NextResponse.redirect(url);
    }
    // Block cross-portal access
    if (!isDemoBuyer && pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = demoDest(demoRole!);
      return NextResponse.redirect(url);
    }
    if (!isDemoSupplier && pathname.startsWith("/supplier")) {
      const url = request.nextUrl.clone();
      url.pathname = demoDest(demoRole!);
      return NextResponse.redirect(url);
    }
    if (!isDemoFulfillment && pathname.startsWith("/fulfillment")) {
      const url = request.nextUrl.clone();
      url.pathname = demoDest(demoRole!);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  // ── Real Supabase auth ────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — protect all portals
  if (!user) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/supplier") ||
      pathname.startsWith("/fulfillment")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Logged in — fetch role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "buyer";

  // Redirect away from auth pages
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup") || pathname.startsWith("/auth/supplier-signup")) {
    const url = request.nextUrl.clone();
    url.pathname = role === "supplier" ? "/supplier" : role === "fulfillment" ? "/fulfillment" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // Role enforcement
  if (role !== "buyer" && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = role === "supplier" ? "/supplier" : "/fulfillment";
    return NextResponse.redirect(url);
  }
  if (role !== "supplier" && pathname.startsWith("/supplier")) {
    const url = request.nextUrl.clone();
    url.pathname = role === "fulfillment" ? "/fulfillment" : "/dashboard";
    return NextResponse.redirect(url);
  }
  if (role !== "fulfillment" && pathname.startsWith("/fulfillment")) {
    const url = request.nextUrl.clone();
    url.pathname = role === "supplier" ? "/supplier" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
