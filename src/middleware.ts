import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/auth");
  const isVerificationPage = path.startsWith("/auth/email-verification");

  // 🔒 لو مفيش توكن والمستخدم مش في صفحة auth → redirect للّوجين
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ✅ لو في توكن والمستخدم في صفحة auth → رجّعه للـ home
  if (token && isAuthPage && !isVerificationPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/projects/:path*",
    "/board/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/video-editor/:path*",
    "/auth/:path*",
  ],
};
