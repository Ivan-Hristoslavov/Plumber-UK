"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { DayOffBanner } from "./DayOffBanner";
import { AdminProfile } from "@/lib/admin-profile";
import { useActiveDayOffPeriods } from "@/hooks/useDayOffPeriods";
import { CookieConsent } from "./CookieConsent";

import NavigationNavbar from "./NavigationNavbar";
import FooterMain from './FooterMain';

export default function LayoutMain({
  children,
  adminProfile,
}: {
  children: React.ReactNode;
  adminProfile: AdminProfile | null;
}) {
  const [hasDayOffBanner, setHasDayOffBanner] = useState(false);
  const pathname = usePathname();
  const { activePeriods, loading } = useActiveDayOffPeriods();

  // Check if we're in admin panel
  const isAdminPanel = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!isAdminPanel) {
      setHasDayOffBanner(activePeriods.length > 0);
    }
  }, [isAdminPanel, activePeriods]);

  // If we're in admin panel, render only the children without main layout elements
  if (isAdminPanel) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900" suppressHydrationWarning>
      {/* Sticky header: banner + nav together to avoid any gap */}
      <div className="sticky top-0 z-50">
        <DayOffBanner />
        <NavigationNavbar />
      </div>
      
      {/* Main content with dynamic padding based on banner presence */}
      <main className={`flex-grow transition-all duration-300 ${hasDayOffBanner ? 'pt-0' : 'pt-0'}`}>
        {children}
      </main>
      <FooterMain />
      
      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
