import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes: custom session cookie ──────────────────────────
  const isAdminRoute =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  if (isAdminRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "";
    if (!isValidAdminSession(token)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Public routes: refresh Supabase session ───────────────────────
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Auth signout route — always pass through (handled by route handler)
  if (pathname === "/auth/signout") {
    return NextResponse.next();
  }

  // Gallery requires auth — redirect to /login if no session
  if (pathname === "/" && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in — skip login page
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
