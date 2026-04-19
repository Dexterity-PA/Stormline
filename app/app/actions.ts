"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isKnownIndicatorCode } from "@/lib/queries/dashboard";

const MAX_PINNED = 8;

export type Density = "comfortable" | "compact";

export interface DashboardPrefs {
  pinned: string[];
  density: Density;
}

const PREF_KEY = "prefs";

function emptyPrefs(): DashboardPrefs {
  return { pinned: [], density: "comfortable" };
}

function readPrefs(metadata: unknown): DashboardPrefs {
  if (!metadata || typeof metadata !== "object") return emptyPrefs();
  const candidate = (metadata as Record<string, unknown>)[PREF_KEY];
  if (!candidate || typeof candidate !== "object") return emptyPrefs();
  const obj = candidate as Record<string, unknown>;
  const pinned = Array.isArray(obj.pinned)
    ? obj.pinned.filter((v): v is string => typeof v === "string")
    : [];
  const density: Density =
    obj.density === "compact" ? "compact" : "comfortable";
  return { pinned: pinned.slice(0, MAX_PINNED), density };
}

export async function loadDashboardPrefs(): Promise<DashboardPrefs> {
  const { userId } = await auth();
  if (!userId) return emptyPrefs();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return readPrefs(user.publicMetadata);
}

const PinSchema = z.object({
  code: z
    .string()
    .min(1)
    .refine(isKnownIndicatorCode, { message: "unknown indicator code" }),
});

export async function togglePinAction(formData: FormData): Promise<void> {
  const parsed = PinSchema.parse({ code: formData.get("code") });
  const { userId } = await auth();
  if (!userId) throw new Error("unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prefs = readPrefs(user.publicMetadata);

  const idx = prefs.pinned.indexOf(parsed.code);
  if (idx >= 0) {
    prefs.pinned.splice(idx, 1);
  } else if (prefs.pinned.length < MAX_PINNED) {
    prefs.pinned.unshift(parsed.code);
  } else {
    // Cap reached — silently drop. UI should already prevent this state.
    return;
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...(user.publicMetadata ?? {}),
      [PREF_KEY]: prefs,
    },
  });
  revalidatePath("/app");
}

const DensitySchema = z.object({
  density: z.enum(["comfortable", "compact"]),
});

export async function setDensityAction(formData: FormData): Promise<void> {
  const parsed = DensitySchema.parse({ density: formData.get("density") });
  const { userId } = await auth();
  if (!userId) throw new Error("unauthorized");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prefs = readPrefs(user.publicMetadata);
  prefs.density = parsed.density;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...(user.publicMetadata ?? {}),
      [PREF_KEY]: prefs,
    },
  });
  revalidatePath("/app");
}
