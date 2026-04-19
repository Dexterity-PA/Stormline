import type { Metadata } from 'next'
import Section01Hero from '@/components/landing/sections/Section01Hero'
import Section02Ticker from '@/components/landing/sections/Section02Ticker'
import Section03Indictment from '@/components/landing/sections/Section03Indictment'
import Section04Pillars from '@/components/landing/sections/Section04Pillars'
import Section05Industries from '@/components/landing/sections/Section05Industries'
import Section06SampleBriefing from '@/components/landing/sections/Section06SampleBriefing'
import Section07Pipeline from '@/components/landing/sections/Section07Pipeline'
import Section08WhoItsFor from '@/components/landing/sections/Section08WhoItsFor'
import Section09Comparison from '@/components/landing/sections/Section09Comparison'
import Section10StatsBand from '@/components/landing/sections/Section10StatsBand'
import Section11Pricing from '@/components/landing/sections/Section11Pricing'
import Section12FAQ from '@/components/landing/sections/Section12FAQ'

export const metadata: Metadata = {
  title: 'Stormline — Macro Intelligence for Operators',
  description:
    'Weekly operational briefings, input price dashboards, and event alerts — tuned for restaurants, contractors, and independent retailers. Intelligence, not advice.',
}

export default function LandingPage() {
  return (
    <main>
      <Section01Hero />
      <Section02Ticker />
      <Section03Indictment />
      <Section04Pillars />
      <Section05Industries />
      <Section06SampleBriefing />
      <Section07Pipeline />
      <Section08WhoItsFor />
      <Section09Comparison />
      <Section10StatsBand />
      <Section11Pricing />
      <Section12FAQ />
      {/* Sections 13–14 land in subsequent commits. */}
    </main>
  )
}
