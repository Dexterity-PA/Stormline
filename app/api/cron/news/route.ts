// app/api/cron/news/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await inngest.send({ name: "news/fetch.requested", data: {} });
  return NextResponse.json({ ok: true, ids: result.ids });
}
