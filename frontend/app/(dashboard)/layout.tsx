'use client';

import { Navbar } from '@/components';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {children}
      </main>
    </>
  );
}
