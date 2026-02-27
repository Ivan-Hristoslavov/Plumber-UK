"use client";

import { useState, useEffect } from 'react';
import { useActiveDayOffPeriods, DayOffPeriod } from '@/hooks/useDayOffPeriods';
interface DayOffBannerProps {
  previewPeriod?: Partial<DayOffPeriod>;
  compact?: boolean;
}

export function DayOffBanner({ previewPeriod, compact = false }: DayOffBannerProps) {
  const [activePeriod, setActivePeriod] = useState<DayOffPeriod | null>(null);
  const { activePeriods, loading } = useActiveDayOffPeriods();

  useEffect(() => {
    if (previewPeriod) {
      if (
        previewPeriod.show_banner &&
        previewPeriod.start_date &&
        previewPeriod.end_date &&
        new Date(previewPeriod.start_date) <= new Date(previewPeriod.end_date)
      ) {
        setActivePeriod(previewPeriod as DayOffPeriod);
      } else {
        setActivePeriod(null);
      }
      return;
    }

    if (activePeriods.length > 0) {
      const sortedPeriods = [...activePeriods].sort((a, b) =>
        new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      );
      setActivePeriod(sortedPeriods[0]);
    } else {
      setActivePeriod(null);
    }
  }, [previewPeriod, activePeriods]);

  if (loading && !previewPeriod) return null;
  if (!activePeriod) return null;

  const isPreview = Boolean(previewPeriod);
  const start = new Date(activePeriod.start_date);
  const end = new Date(activePeriod.end_date);
  const dateRange = `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} – ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}`;
  const message = activePeriod.banner_message || activePeriod.title;

  // Compact mode: for AdminDayOffManager preview
  if (compact) {
    return (
      <div
        className="w-full max-w-full rounded-lg overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shadow-lg border border-amber-300/50 py-1 lg:py-2 px-2 sm:px-3 lg:px-4"
        data-day-off-banner
      >
        <div className="flex items-center justify-between gap-2 flex-wrap lg:flex-nowrap">
          <div className="flex items-center gap-1.5 lg:gap-3 min-w-0">
            <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0">
              <svg className="text-white h-2 w-2 lg:h-3 lg:w-3" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-amber-900 uppercase text-[10px] lg:text-xs">Day Off Notice</span>
            <span className="text-amber-900 font-medium text-[10px] lg:text-xs truncate">{message}</span>
          </div>
          <div className="text-amber-800 font-semibold text-[10px] lg:text-xs" suppressHydrationWarning>📅 {dateRange}</div>
        </div>
      </div>
    );
  }

  // Main banner: smaller on mobile only, full size on desktop (no scroll shrink to avoid gap)
  return (
    <div
      className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shadow-lg border-b border-amber-300/50 py-2 md:py-3"
      data-day-off-banner
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile: centered stacked, compact */}
        <div className="flex flex-col items-center text-center md:hidden gap-0.5">
          <div className="flex items-center gap-1.5">
            <div className="bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0 w-4 h-4">
              <svg className="text-white h-2 w-2" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-amber-900 uppercase tracking-wide text-xs">
              Day Off Notice
            </span>
          </div>
          <p className="text-amber-900 font-medium break-words w-full px-1 text-xs">{message}</p>
          <p className="text-amber-800 font-semibold text-[11px]" suppressHydrationWarning>📅 {dateRange}</p>
        </div>

        {/* Desktop: one line, full size */}
        <div className="hidden md:flex items-center justify-between gap-6 lg:gap-8">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0 w-6 h-6">
              <svg className="text-white h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-amber-900 uppercase tracking-wide whitespace-nowrap text-sm">
              Day Off Notice
            </span>
          </div>
          <div className="flex-1 min-w-0 px-4 border-x border-amber-400/60">
            <p className="text-amber-900 font-medium truncate text-sm" title={message}>{message}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-amber-900">📅</span>
            <span className="font-semibold text-amber-900 whitespace-nowrap text-sm" suppressHydrationWarning>{dateRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
