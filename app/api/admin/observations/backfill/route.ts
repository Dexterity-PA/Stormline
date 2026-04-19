import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { inngest } from "@/inngest/client";

const BodySchema = z
  .object({
    indicatorCode: z.string().min(1).optional(),
    yearsBack: z.number().int().positive().max(50).optional(),
  })
  .strict();

export async function POST(request: Request): Promise<NextResponse> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const role = (sessionClaims?.metadata as { role?: string } | undefined)
    ?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const raw: unknown = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { ids } = await inngest.send({
    name: "admin/observations.backfill",
    data: parsed.data,
  });

  return NextResponse.json(
    {
      enqueued: true,
      eventIds: ids,
      payload: parsed.data,
    },
    { status: 202 },
  );
}
