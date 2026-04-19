import Link from "next/link";
import type { IndustryContent } from "@/app/(marketing)/industries/[slug]/content";

type Props = {
  content: IndustryContent;
};

export default function IndustryHero({ content }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-mono tracking-widest uppercase text-accent">
            Stormline for {content.name}
          </p>

          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-fg sm:text-5xl sm:leading-tight">
            {content.heroHeadline}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-fg-muted">
            {content.heroSubheadline}
          </p>

          <p className="mt-3 text-sm text-fg-muted">
            {content.personaDesc}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {content.ctaText}
            </Link>
            <span className="text-sm text-fg-muted">
              No credit card required. 14-day full access.
            </span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-12 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-display font-semibold text-fg">
              Monday 6am
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              Briefing in your inbox before you open
            </p>
          </div>
          <div>
            <p className="text-2xl font-display font-semibold text-fg">
              600–900 words
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              Signal + so-what, no jargon
            </p>
          </div>
          <div>
            <p className="text-2xl font-display font-semibold text-fg">
              FRED · EIA · BLS
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              Every claim linked to its source
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
