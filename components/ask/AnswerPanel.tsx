'use client';

interface AnswerPanelProps {
  question: string;
  answer: string;
  citedCodes: string[];
  isLoading: boolean;
  onClose: () => void;
}

export function AnswerPanel({
  question,
  answer,
  citedCodes,
  isLoading,
  onClose,
}: AnswerPanelProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-bg border-l border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-fg">Ask Stormline</h2>
          <button
            onClick={onClose}
            className="text-fg-muted hover:text-fg transition-colors text-xl leading-none"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        <div className="px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
          <p className="text-xs text-fg-muted uppercase tracking-wider font-medium mb-1">
            Question
          </p>
          <p className="text-sm text-fg">{question}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-xs text-fg-muted uppercase tracking-wider font-medium mb-3">
            Analysis
          </p>
          {answer ? (
            <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">
              {answer}
              {isLoading && (
                <span className="inline-block w-0.5 h-4 bg-accent/70 ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-sm text-fg-muted">
              <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Analyzing indicator data…
            </div>
          ) : null}
        </div>

        {citedCodes.length > 0 && (
          <div className="px-5 py-4 border-t border-border flex-shrink-0">
            <p className="text-xs text-fg-muted uppercase tracking-wider font-medium mb-2">
              Referenced Indicators
            </p>
            <div className="flex flex-wrap gap-1.5">
              {citedCodes.map((code) => (
                <a
                  key={code}
                  href={`/app/indicators/${encodeURIComponent(code)}`}
                  className="inline-flex items-center text-xs bg-bg-elev border border-border text-fg-muted hover:text-fg hover:border-accent rounded-sm px-2 py-0.5 transition-colors"
                >
                  {code}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
