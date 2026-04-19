import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { onboardingState, organizations } from "@/lib/db/schema";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
]);

const isOnboardingGuardedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isOnboardingGuardedRoute(req)) {
    // Fast path: cookie set by completeOnboardingAction
    if (req.cookies.has("sl-ob")) return NextResponse.next();

    const { orgId: clerkOrgId } = await auth();
    if (!clerkOrgId) return NextResponse.next();

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    const [state] = await db
      .select({ step: onboardingState.step })
      .from(onboardingState)
      .where(eq(onboardingState.orgId, org.id))
      .limit(1);

    if (!state || state.step !== "complete") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Cache completed state to skip DB on future /app/* visits
    const res = NextResponse.next();
    res.cookies.set("sl-ob", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
