import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session via Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = !!session?.user;
  const hasRole = !!session?.user?.role;

  const isAuthPage =
    pathname === "/login" || pathname === "/register";
  const isPendingPage = pathname === "/pending";

  // Not authenticated → allow auth pages, redirect everything else to login
  if (!isAuthenticated) {
    if (isAuthPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated but no role
  if (!hasRole) {
    // Already on pending → allow
    if (isPendingPage) return NextResponse.next();
    // On auth pages → redirect to pending
    if (isAuthPage)
      return NextResponse.redirect(new URL("/pending", request.url));
    // On dashboard pages → redirect to pending
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  // Authenticated WITH role
  // Redirect away from auth/pending pages to dashboard
  if (isAuthPage || isPendingPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes including auth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};