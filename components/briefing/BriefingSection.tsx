export interface BriefingSectionData {
  title: string;
  body: string;
}

export function BriefingSection({ section }: { section: BriefingSectionData }) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-display font-semibold text-fg-muted uppercase tracking-wider mb-2">
        {section.title}
      </h2>
      <p className="text-sm text-fg leading-relaxed whitespace-pre-line">
        {section.body}
      </p>
    </section>
  );
}
