// app/api/inngest/route.ts
export const runtime = "nodejs";

import { serve } from "inngest/next";
import { inngest, functions } from "@/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
