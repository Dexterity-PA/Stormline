'use client';

import { useState } from 'react';
import { AnswerPanel } from '@/components/ask/AnswerPanel';

const EXAMPLES = [
  'What do current input prices mean for my margins?',
  'How is Fed policy affecting my borrowing costs?',
] as const;

type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'citations'; codes: string[] }
  | { type: 'done' }
  | { type: 'error'; message: string };

export function AskStormline() {
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [citedCodes, setCitedCodes] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || isLoading) return;

    setQuestion(trimmed);
    setInput('');
    setAnswer('');
    setCitedCodes([]);
    setIsOpen(true);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok || !res.body) {
        const fallback =
          res.status === 429
            ? 'Rate limit reached (20 questions/hour). Please try again later.'
            : 'Unable to answer at this time. Please try again.';
        setAnswer(fallback);
        setIsLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6)) as StreamEvent;
            if (evt.type === 'delta') {
              setAnswer((prev) => prev + evt.text);
            } else if (evt.type === 'citations') {
              setCitedCodes(evt.codes);
            } else if (evt.type === 'done') {
              setIsLoading(false);
            } else if (evt.type === 'error') {
              setAnswer('Unable to answer at this time. Please try again.');
              setIsLoading(false);
            }
          } catch {
            // malformed event — skip
          }
        }
      }
    } catch {
      setAnswer('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="px-3 py-3 border-t border-border">
        <p className="text-xs text-fg-muted font-medium mb-2 px-1">Ask Stormline</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(input);
          }}
          className="flex gap-1"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a market question…"
            className="flex-1 min-w-0 text-xs bg-bg-elev border border-border rounded-sm px-2 py-1.5 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-accent"
            disabled={isLoading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="text-xs px-2 py-1.5 bg-accent text-white rounded-sm disabled:opacity-40 hover:opacity-90 flex-shrink-0"
            aria-label="Submit question"
          >
            {isLoading ? '…' : '→'}
          </button>
        </form>
        <div className="mt-2 space-y-0.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => void submit(ex)}
              disabled={isLoading}
              className="w-full text-left text-xs text-fg-muted hover:text-fg truncate px-1 py-0.5 rounded-sm hover:bg-bg-elev transition-colors disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <AnswerPanel
          question={question}
          answer={answer}
          citedCodes={citedCodes}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
