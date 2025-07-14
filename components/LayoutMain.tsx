"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { DayOffBanner } from "./DayOffBanner";
import { AdminProfile } from "@/lib/admin-profile";

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

  // Check if we're in admin panel
  const isAdminPanel = pathname?.startsWith("/admin");

  useEffect(() => {
    const checkDayOffBanner = async () => {
      try {
        const response = await fetch('/api/admin/day-off');
        const periods = await response.json();
        
        const today = new Date();
        const activePeriod = periods.find((p: any) => {
          if (!p.show_banner) return false;
          const start = new Date(p.start_date);
          const end = new Date(p.end_date);
          return today >= start && today <= end;
        });
        
        setHasDayOffBanner(!!activePeriod);
      } catch (error) {
        setHasDayOffBanner(false);
      }
    };

    if (!isAdminPanel) {
      checkDayOffBanner();
    }
  }, [isAdminPanel]);

  // If we're in admin panel, render only the children without main layout elements
  if (isAdminPanel) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Day Off Banner - Always at the top */}
      <DayOffBanner />
      
      {/* Navigation - Positioned below sticky banner */}
      <div className={`sticky z-40 transition-all duration-300 ${hasDayOffBanner ? 'top-[48px]' : 'top-0'}`}>
        <NavigationNavbar />
      </div>
      
      {/* Main content with dynamic padding based on banner presence */}
      <main className={`flex-grow transition-all duration-300 ${hasDayOffBanner ? 'pt-0' : 'pt-0'}`}>
        {children}
      </main>
      <FooterMain />
    </div>
  );
}
