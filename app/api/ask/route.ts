import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnthropicClient, buildAskContext, extractCitedCodes } from '@/lib/ai/ask/handler';
import { countAiQueriesInLastHour, insertAiQuery } from '@/lib/db/queries/ai-queries';

const RATE_LIMIT = 20;
const MODEL = 'claude-sonnet-4-6';

const BodySchema = z
  .object({ question: z.string().min(1).max(500) })
  .strict();

export async function POST(request: Request): Promise<Response> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const raw: unknown = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const queryCount = await countAiQueriesInLastHour(userId);
  if (queryCount >= RATE_LIMIT) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429 });
  }

  const { question } = parsed.data;
  const { org, snapshot, systemPrompt } = await buildAskContext(orgId);

  const encoder = new TextEncoder();
  let fullAnswer = '';
  let tokensIn: number | null = null;
  let tokensOut: number | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = await getAnthropicClient().messages.create({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: question }],
          stream: true,
        });

        for await (const event of messageStream) {
          if (event.type === 'message_start') {
            tokensIn = event.message.usage.input_tokens;
          } else if (event.type === 'message_delta') {
            tokensOut = event.usage.output_tokens;
          } else if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullAnswer += event.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`,
              ),
            );
          }
        }

        const citedCodes = extractCitedCodes(fullAnswer);

        await insertAiQuery({
          orgId: org.id,
          userId,
          question,
          industry: org.industry,
          region: org.regionState,
          inputSnapshot: snapshot,
          answer: fullAnswer,
          citedIndicatorCodes: citedCodes,
          model: `${MODEL}@prompt-ask-v1.0`,
          tokensIn,
          tokensOut,
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'citations', codes: citedCodes })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: 'Generation failed' })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
