// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./app/lib/jwt";

export async function middleware(req: NextRequest) {
  const publicPaths = ["/api/auth/login", "/api/auth/signup", "/api/health"];

  // allow public APIs without auth
  if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
  }

  const user = await verifyJWT(token);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  // Attach user to headers for backend APIs
  const headers = new Headers(req.headers);
  headers.set("x-user-id", user._id);
  headers.set("x-tenantId", user.tenantId);
  headers.set("x-user-role", user.role);

  return NextResponse.next({ request: { headers } });
}

// ✅ Apply only to API routes
export const config = {
  matcher: ["/api/:path*"],
};
