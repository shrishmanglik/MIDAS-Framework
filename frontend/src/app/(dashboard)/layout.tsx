"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <DisclaimerBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto px-4 py-6 pb-20 sm:px-6 lg:pb-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
}
