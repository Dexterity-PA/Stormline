export default function NewBriefingPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-fg">
          Trigger Manual Generation
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Kick off an out-of-cycle briefing draft. Generation wired in Stream 8
          (Inngest). Form is UI-only — no submit action.
        </p>
      </div>

      <form className="space-y-5 border border-border rounded-md bg-bg-elev p-6">
        <div className="space-y-1.5">
          <label htmlFor="industry" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Industry
          </label>
          <select id="industry" disabled className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm cursor-not-allowed opacity-60">
            <option value="restaurant">Restaurant</option>
            <option value="construction">Construction</option>
            <option value="retail">Retail</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="region" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Region
          </label>
          <select id="region" disabled className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm cursor-not-allowed opacity-60">
            <option value="national">National</option>
            <option value="TX">Texas</option>
            <option value="CA">California</option>
            <option value="FL">Florida</option>
            <option value="NY">New York</option>
            <option value="WA">Washington</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="week" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Week of
          </label>
          <input id="week" type="date" disabled defaultValue="2026-04-14" className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm cursor-not-allowed opacity-60" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prompt" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Prompt Version
          </label>
          <select id="prompt" disabled className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm cursor-not-allowed opacity-60">
            <option>briefing-restaurant-v1.2 (active)</option>
            <option>briefing-construction-v1.1 (active)</option>
            <option>briefing-retail-v1.1 (active)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notes" className="block text-xs font-mono text-fg-muted uppercase tracking-wider">
            Notes (optional)
          </label>
          <textarea id="notes" disabled rows={3} placeholder="Context for this manual run…" className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-fg text-sm resize-none cursor-not-allowed opacity-60 placeholder:text-fg-muted" />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled className="px-4 py-2 rounded-md text-sm bg-accent/10 text-accent border border-accent/30 opacity-60 cursor-not-allowed select-none">
            Generate Draft
          </button>
          <span className="text-xs text-fg-muted/60">
            Wired to <code className="font-mono">POST /api/admin/briefings/generate</code> in Stream 8
          </span>
        </div>
      </form>
    </div>
  );
}
