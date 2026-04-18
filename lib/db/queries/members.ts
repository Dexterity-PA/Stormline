import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Member = InferSelectModel<typeof members>;

export const UpdateNotificationPrefsInput = z.object({
  emailBriefing: z.boolean().optional(),
  emailAlerts: z.boolean().optional(),
  smsAlerts: z.boolean().optional(),
  phone: z.string().nullable().optional(),
});
export type UpdateNotificationPrefsInput = z.infer<
  typeof UpdateNotificationPrefsInput
>;

export async function getMember(id: string): Promise<Member | undefined> {
  const [row] = await db
    .select()
    .from(members)
    .where(eq(members.id, id))
    .limit(1);
  return row;
}

export async function getMemberByClerkAndOrg(
  clerkUserId: string,
  orgId: string,
): Promise<Member | undefined> {
  const [row] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.clerkUserId, clerkUserId), eq(members.orgId, orgId)),
    )
    .limit(1);
  return row;
}

export async function listMembersByOrg(orgId: string): Promise<Member[]> {
  return db.select().from(members).where(eq(members.orgId, orgId));
}

export async function updateNotificationPrefs(
  id: string,
  input: UpdateNotificationPrefsInput,
): Promise<Member> {
  const parsed = UpdateNotificationPrefsInput.parse(input);
  const [row] = await db
    .update(members)
    .set(parsed)
    .where(eq(members.id, id))
    .returning();
  if (!row) throw new Error(`Member ${id} not found`);
  return row;
}
