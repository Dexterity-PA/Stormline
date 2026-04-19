import type { Metadata } from 'next'
import Section01Hero from '@/components/landing/sections/Section01Hero'

export const metadata: Metadata = {
  title: 'Stormline — Macro Intelligence for Operators',
  description:
    'Weekly operational briefings, input price dashboards, and event alerts — tuned for restaurants, contractors, and independent retailers. Intelligence, not advice.',
}

export default function LandingPage() {
  return (
    <main>
      <Section01Hero />
      {/* Sections 02–14 land in subsequent commits. */}
    </main>
  )
}
