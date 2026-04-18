import { notFound } from "next/navigation";
import type { Metadata } from "next";
import IndustryHero from "@/components/marketing/IndustryHero";
import SampleDashboard from "@/components/marketing/SampleDashboard";
import SampleBriefing from "@/components/marketing/SampleBriefing";
import { INDUSTRY_CONTENT, VALID_SLUGS } from "./content";

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = INDUSTRY_CONTENT[slug];
  if (!content) return {};
  return {
    title: `Stormline for ${content.name} — Macro Intelligence for Operators`,
    description: content.heroSubheadline,
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = INDUSTRY_CONTENT[slug];
  if (!content) notFound();

  return (
    <main style={{ background: "var(--sl-bg)" }}>
      <IndustryHero content={content} />

      <SampleDashboard
        industryName={content.name}
        tiles={content.tiles}
      />

      <SampleBriefing
        industryName={content.name}
        briefing={content.briefing}
      />

      {/* Bottom CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-xs font-mono tracking-widest uppercase text-accent mb-4">
            Get Started
          </p>
          <h2 className="text-3xl font-display font-semibold text-fg">
            See your actual indicators. Read your actual briefing.
          </h2>
          <p className="mt-4 text-fg-muted max-w-xl mx-auto text-sm">
            14-day free trial. No credit card. Cancel any time. Your first
            Monday briefing lands in your inbox the morning after you sign up.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md bg-accent px-8 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {content.ctaText}
            </a>
            <a
              href="/pricing"
              className="text-sm text-fg-muted hover:text-fg transition-colors"
            >
              See pricing →
            </a>
          </div>
          <p className="mt-6 text-xs text-fg-muted">
            Then $199/mo for one industry. Pro plan ($399/mo) adds SMS alerts,
            historical archive, and CSV export.
          </p>
        </div>
      </section>
    </main>
  );
}
