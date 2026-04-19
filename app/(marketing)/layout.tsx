import Nav from '@/components/marketing/Nav'
import Footer from '@/components/marketing/Footer'
import {
  LenisProvider,
  PageIntroWipe,
  ScrollProgressBar,
  SectionNumbers,
  AnnouncementBar,
} from '@/components/motion'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LenisProvider>
      <PageIntroWipe />
      <ScrollProgressBar />
      <SectionNumbers total={14} />
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar
          message="New: weekly operator briefings live for 3 industries"
          href="/pricing"
          cta="See plans"
        />
        <Nav />
        {children}
        <Footer />
      </div>
    </LenisProvider>
  )
}
