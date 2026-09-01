import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// These prefixes are admin-only (no store page at these URLs)
const ADMIN_ONLY = [
  "/dashboard",
  "/orders",
  "/customers",
  "/payments",
  "/inventory",
  "/purchases",
  "/settings",
  "/storefront",
  "/categories",
  "/admin",
];

function isAdminRoute(pathname: string): boolean {
  // Straightforward admin-only prefixes
  if (ADMIN_ONLY.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }

  // /products is shared: store uses /products/[id] (no trailing segment after id)
  // Admin uses: /products (exact), /products/new, /products/[id]/edit
  if (pathname.startsWith("/products")) {
    if (pathname === "/products") return true;
    if (pathname.startsWith("/products/new")) return true;
    if (/^\/products\/[^/]+\/edit/.test(pathname)) return true;
    // /products/[id] alone = store product detail → NOT protected
    return false;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isAdminRoute(pathname)) return NextResponse.next();

  const token = req.cookies.get("admin-token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  // Run middleware on all non-static, non-api paths
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
