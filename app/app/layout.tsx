import { Suspense } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { MobileSidebar } from "@/components/shell/MobileSidebar";
import { CommandPaletteProvider } from "@/components/command/CommandPaletteProvider";
import { SignalsRail } from "@/components/dashboard/SignalsRail";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Suspense
          fallback={<div className="h-12 flex-shrink-0 border-b border-border" />}
        >
          <TopBar />
        </Suspense>
        <main className="flex-1 p-6">{children}</main>
      </div>

      <aside className="hidden xl:flex w-72 flex-shrink-0 flex-col border-l border-border overflow-y-auto">
        <Suspense fallback={null}>
          <SignalsRail />
        </Suspense>
      </aside>

      <MobileSidebar />

      <Suspense fallback={null}>
        <CommandPaletteProvider />
      </Suspense>
    </div>
  );
}
