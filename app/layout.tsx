import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Stormline",
  description: "Macro intelligence for small and mid-sized businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
