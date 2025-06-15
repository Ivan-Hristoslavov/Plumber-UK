'use client';

import { useState, useEffect } from 'react';

type DayOffSettings = {
  isEnabled: boolean;
  message: string;
  startDate: string;
  endDate: string;
  showOnAllPages: boolean;
};

export function DayOffBanner() {
  const [settings, setSettings] = useState<DayOffSettings | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('dayOffSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('dayOffBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dayOffBannerDismissed', 'true');
  };

  // Don't show if settings not loaded, not enabled, dismissed, or not set to show on all pages
  if (!settings || !settings.isEnabled || isDismissed || !settings.showOnAllPages) {
    return null;
  }

  // Check if we're within the date range (if dates are set)
  const now = new Date();
  const startDate = settings.startDate ? new Date(settings.startDate) : null;
  const endDate = settings.endDate ? new Date(settings.endDate) : null;

  if (startDate && now < startDate) return null;
  if (endDate && now > endDate) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 border-b border-yellow-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-start flex-1">
            <svg className="h-5 w-5 text-yellow-800 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Day Off Notice</h3>
              <p className="mt-1 text-sm text-yellow-700">{settings.message}</p>
              {(settings.startDate || settings.endDate) && (
                <p className="mt-1 text-xs text-yellow-600">
                  {settings.startDate && `From: ${new Date(settings.startDate).toLocaleDateString()}`}
                  {settings.startDate && settings.endDate && ' - '}
                  {settings.endDate && `Until: ${new Date(settings.endDate).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 p-1 rounded-md text-yellow-800 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-600"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 