import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") redirect("/app");

  return { userId };
}
