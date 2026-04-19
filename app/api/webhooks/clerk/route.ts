export const runtime = "nodejs";

import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { getOrgByClerkId } from "@/lib/db/queries/organizations";

type ClerkWebhookEvent = {
  type: string;
  data: Record<string, unknown>;
};

function getMemberRole(
  clerkRole: unknown,
): "owner" | "member" {
  return clerkRole === "org:admin" ? "owner" : "member";
}

async function handleUserCreated(data: Record<string, unknown>) {
  console.log("[clerk-webhook] user.created", { userId: data.id });
}

async function handleOrganizationCreated(data: Record<string, unknown>) {
  // DB org is created synchronously in provisionDbOrgAction (wizard Step 2), not here.
  // organizations.regionState is NOT NULL and regionState is not available in the
  // organization.created payload — it is only collected in wizard Step 2.
  // This handler is a hook point for future use (e.g., if schema relaxes the constraint).
  console.log("[clerk-webhook] organization.created — DB provisioning deferred to wizard Step 2", {
    clerkOrgId: data.id,
  });
}

async function handleMembershipCreated(data: Record<string, unknown>) {
  const clerkOrgId =
    typeof data.organization === "object" &&
    data.organization !== null &&
    "id" in data.organization
      ? String((data.organization as Record<string, unknown>).id)
      : null;
  const clerkUserId =
    typeof data.public_user_data === "object" &&
    data.public_user_data !== null &&
    "user_id" in data.public_user_data
      ? String((data.public_user_data as Record<string, unknown>).user_id)
      : null;
  const clerkRole =
    typeof data.role === "string" ? data.role : undefined;

  if (!clerkOrgId || !clerkUserId) {
    console.warn("[clerk-webhook] organizationMembership.created missing fields", data);
    return;
  }

  const org = await getOrgByClerkId(clerkOrgId);
  if (!org) {
    // Org not in DB yet (webhook fired before DB provisioning) — safe to skip;
    // the Step 1 server action will create the member row directly.
    console.warn("[clerk-webhook] organizationMembership.created: DB org not found", { clerkOrgId });
    return;
  }

  await db
    .insert(members)
    .values({
      orgId: org.id,
      clerkUserId,
      role: getMemberRole(clerkRole),
    })
    .onConflictDoNothing();

  console.log("[clerk-webhook] member inserted", { orgId: org.id, clerkUserId });
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET not set");
    return new Response("Server misconfiguration", { status: 500 });
  }

  const headerMap = await headers();
  const svixId = headerMap.get("svix-id");
  const svixTimestamp = headerMap.get("svix-timestamp");
  const svixSignature = headerMap.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 401 });
  }

  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  try {
    switch (event.type) {
      case "user.created":
        await handleUserCreated(event.data);
        break;
      case "organization.created":
        await handleOrganizationCreated(event.data);
        break;
      case "organizationMembership.created":
        await handleMembershipCreated(event.data);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[clerk-webhook] handler error", { type: event.type, err });
    return new Response("Internal error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
