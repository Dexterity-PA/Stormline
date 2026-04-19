import type { Metadata } from 'next'
import Section01Hero from '@/components/landing/sections/Section01Hero'
import Section02Ticker from '@/components/landing/sections/Section02Ticker'
import Section03Indictment from '@/components/landing/sections/Section03Indictment'
import Section04Pillars from '@/components/landing/sections/Section04Pillars'
import Section05Industries from '@/components/landing/sections/Section05Industries'
import Section06SampleBriefing from '@/components/landing/sections/Section06SampleBriefing'

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
      {/* Sections 07–14 land in subsequent commits. */}
    </main>
  )
}
