'use client';

import { useState } from 'react';

export function BriefingEditor({
  id,
  initialContent,
}: {
  id: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="flex flex-col h-full">
      {/* Action bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-bg-elev">
        <span className="text-xs font-mono text-fg-muted">
          id: <span className="text-fg">{id}</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-sm text-sm border border-border text-fg-muted opacity-60 cursor-not-allowed select-none"
            title="Submit wiring in Stream 8"
          >
            Reject
          </button>
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-sm text-sm bg-good/15 text-good border border-good/30 opacity-60 cursor-not-allowed select-none"
            title="Submit wiring in Stream 8"
          >
            Approve &amp; Publish
          </button>
          <span className="text-xs text-fg-muted/50 ml-1">
            Submit wiring in Stream 8
          </span>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 min-h-0">
        {/* Editor pane */}
        <div className="flex-1 flex flex-col border-r border-border min-w-0">
          <div className="shrink-0 px-4 py-2 border-b border-border bg-bg-elev">
            <span className="text-xs font-mono text-fg-muted tracking-widest uppercase">
              Editor
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-4 bg-bg text-fg font-mono text-sm leading-relaxed resize-none outline-none focus:ring-1 focus:ring-inset focus:ring-accent/40"
            spellCheck={false}
            aria-label="Briefing content"
          />
        </div>

        {/* Preview pane */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="shrink-0 px-4 py-2 border-b border-border bg-bg-elev flex items-center gap-4">
            <span className="text-xs font-mono text-fg-muted tracking-widest uppercase">
              Preview
            </span>
            <span className="text-xs text-fg-muted/50 italic">
              Markdown rendering pending dep install (react-markdown).
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
