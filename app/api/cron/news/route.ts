// app/api/cron/news/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(): Promise<NextResponse> {
  const result = await inngest.send({ name: "news/fetch.requested", data: {} });
  console.log("news/fetch.requested sent", result);
  return NextResponse.json({ ok: true, ids: result.ids });
}
