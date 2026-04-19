'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'idle' | 'saving' | 'publishing' | 'saved' | 'error';

export function BriefingEditor({
  id,
  initialContent,
  isPublished = false,
}: {
  id: string;
  initialContent: string;
  isPublished?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/briefings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyMd: content }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function handlePublish() {
    setStatus('publishing');
    setErrorMsg('');
    try {
      // Save edits first
      const saveRes = await fetch(`/api/admin/briefings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyMd: content }),
      });
      if (!saveRes.ok) throw new Error(await saveRes.text());

      const pubRes = await fetch(`/api/admin/briefings/${id}/publish`, {
        method: 'POST',
      });
      if (!pubRes.ok) throw new Error(await pubRes.text());

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Publish failed');
    }
  }

  const busy = status === 'saving' || status === 'publishing' || isPending;

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-bg-elev">
        <span className="text-xs font-mono text-fg-muted">
          id: <span className="text-fg">{id}</span>
        </span>
        <div className="flex items-center gap-3">
          {status === 'error' && (
            <span className="text-xs text-crit font-mono">{errorMsg}</span>
          )}
          {status === 'saved' && (
            <span className="text-xs text-good font-mono">Saved</span>
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={busy || isPublished}
            className="px-3 py-1.5 rounded-sm text-sm border border-border text-fg-muted hover:text-fg hover:border-fg/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => void handlePublish()}
            disabled={busy || isPublished}
            className="px-3 py-1.5 rounded-sm text-sm bg-good/15 text-good border border-good/30 hover:bg-good/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'publishing' ? 'Publishing…' : isPublished ? 'Published' : 'Approve & Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col border-r border-border min-w-0">
          <div className="shrink-0 px-4 py-2 border-b border-border bg-bg-elev">
            <span className="text-xs font-mono text-fg-muted tracking-widest uppercase">
              Editor
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPublished}
            className="flex-1 p-4 bg-bg text-fg font-mono text-sm leading-relaxed resize-none outline-none focus:ring-1 focus:ring-inset focus:ring-accent/40 disabled:opacity-70"
            spellCheck={false}
            aria-label="Briefing content"
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="shrink-0 px-4 py-2 border-b border-border bg-bg-elev">
            <span className="text-xs font-mono text-fg-muted tracking-widest uppercase">
              Preview (raw Markdown)
            </span>
          </div>
          <pre className="flex-1 p-4 text-sm text-fg font-mono leading-relaxed whitespace-pre-wrap overflow-auto">
            {content || (
              <span className="text-fg-muted">No content yet.</span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
