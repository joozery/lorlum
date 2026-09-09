import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

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
  "/finance",
];

function isAdminRoute(pathname: string): boolean {
  if (ADMIN_ONLY.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }

  if (pathname.startsWith("/products")) {
    if (pathname === "/products") return true;
    if (pathname.startsWith("/products/new")) return true;
    if (/^\/products\/[^/]+\/edit/.test(pathname)) return true;
    return false;
  }

  return false;
}

export async function proxy(req: NextRequest) {
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
