"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { trackPhoneCall } from "@/components/GoogleAnalytics";

export function FloatingCTA() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAutoShown, setHasAutoShown] = useState(false);
  const { profile } = useAdminProfile();

  const businessPhone = profile?.phone || "+44 7541777225";
  const displayPhone = businessPhone.replace(/^\+44\s?/, "0");

  const expandAndCollapse = useCallback((duration = 4000) => {
    setIsExpanded(true);
    const timer = setTimeout(() => setIsExpanded(false), duration);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasAutoShown) return;
    const showTimer = setTimeout(() => {
      setHasAutoShown(true);
      expandAndCollapse(5000);
    }, 1500);
    return () => clearTimeout(showTimer);
  }, [hasAutoShown, expandAndCollapse]);

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50">
      <a
        href={`tel:${businessPhone}`}
        onClick={() => trackPhoneCall("floating_cta")}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="flex items-center h-14 sm:h-16 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:via-red-600 hover:to-orange-700 shadow-2xl hover:shadow-red-500/30 transition-all duration-500 ease-out border-2 border-white/90 group"
        aria-label={`Call now – speak to an engineer ${displayPhone}`}
      >
        {/* Text that slides out to the left */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            isExpanded
              ? "max-w-[260px] sm:max-w-[300px] opacity-100 pl-5 pr-1"
              : "max-w-0 opacity-0 pl-0 pr-0"
          }`}
        >
          <span className="whitespace-nowrap text-white font-semibold text-xs sm:text-sm">
            Call now – speak to an engineer
          </span>
        </div>

        {/* Phone icon circle - always visible */}
        <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" />
          <svg
            className="relative w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300 z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
      </a>
    </div>
  );
}
