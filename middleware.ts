import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const publicRoutes = [
  "/",
  "/search",
  "/product/(.*)",
  "/contact",
  "/faq",
  "/return-policy",
  "/shipping-policy",
  "/sign-in(.*)",
  "/register(.*)",
  "/api/(.*)",
  "/favicon.ico",
  "/_next/(.*)",
  "/images/(.*)",
  "/assets/(.*)",
  "/site.webmanifest"
];

const protectedRoutes = [
  "/orders",
  "/account",
  "/wishlist",
  "/cart",
  "/checkout",
  "/admin/(.*)",
  "/vendor/(.*)"
];

const isPublicRoute = createRouteMatcher(publicRoutes);
const isProtectedRoute = createRouteMatcher(protectedRoutes);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};