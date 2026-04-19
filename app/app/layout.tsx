export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border p-4">
        <span className="font-display">Stormline</span>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
