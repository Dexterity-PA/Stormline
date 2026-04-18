import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border p-4 bg-bg-elev">
        <span className="font-display">Stormline · Admin</span>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
