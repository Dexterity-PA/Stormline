import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth/require-admin';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <AdminNav />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 border-b border-border px-6 py-3 bg-bg-elev flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG, no benefit from next/image */}
            <img
              src="/brand/logo.svg"
              alt="Stormline"
              width={360}
              height={72}
              className="h-5 w-auto select-none"
            />
            <span className="font-mono text-xs text-accent">ADMIN</span>
          </div>
          <a
            href="/app"
            className="text-xs text-fg-muted hover:text-fg transition-colors"
          >
            ← Back to App
          </a>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
