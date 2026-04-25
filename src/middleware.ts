import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/auth");
  const isVerificationPage = path.startsWith("/auth/email-verification");

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

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

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const ALLOWED_PATH = '/lock'; // Change this to your target page

//   // Allow access if it's the target page or essential system files
//   if (pathname === ALLOWED_PATH) {
//     return NextResponse.next();
//   }

//   // Redirect everything else to the allowed page
//   return NextResponse.redirect(new URL(ALLOWED_PATH, request.url));
// }

// // Ensure the middleware doesn't run on static files or API routes
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };
