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

// Only /app/* is guarded — /onboarding is intentionally excluded to prevent
// an infinite redirect loop for users who are authed but have no org yet.
const isOnboardingGuardedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isOnboardingGuardedRoute(req)) {
    const { userId, orgId: clerkOrgId } = await auth();

    // Fast path: cookie value must match the current userId (not just presence)
    const cookieValue = req.cookies.get("sl-ob")?.value;
    const isStale = cookieValue !== undefined && (userId === null || cookieValue !== userId);

    if (cookieValue !== undefined && userId !== null && cookieValue === userId) {
      return NextResponse.next();
    }

    // Attach stale-cookie clear to whichever response we return
    const cleared = (res: NextResponse) => {
      if (isStale) res.cookies.delete("sl-ob");
      return res;
    };

    // Authed but no active org → send to onboarding to create one
    if (!clerkOrgId) {
      return cleared(NextResponse.redirect(new URL("/onboarding", req.url)));
    }

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      return cleared(NextResponse.redirect(new URL("/onboarding", req.url)));
    }

    const [state] = await db
      .select({ step: onboardingState.step })
      .from(onboardingState)
      .where(eq(onboardingState.orgId, org.id))
      .limit(1);

    if (!state || state.step !== "complete") {
      return cleared(NextResponse.redirect(new URL("/onboarding", req.url)));
    }

    // Cache completed state to skip DB on future /app/* visits — bound to userId
    const res = NextResponse.next();
    if (userId !== null) {
      res.cookies.set("sl-ob", userId, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
