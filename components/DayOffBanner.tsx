'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayOffSettings();
    
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem('dayOffBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const autoDisableDayOff = async () => {
    try {
      // Load current settings
      const { data: currentData, error: loadError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'dayOffSettings')
        .single();

      if (loadError) {
        console.error('Error loading current settings for auto-disable:', loadError);
        return;
      }

      // Update settings with isEnabled = false
      const updatedSettings = {
        ...currentData.value,
        isEnabled: false
      };

      await supabase
        .from('admin_settings')
        .upsert({ 
          key: 'dayOffSettings', 
          value: updatedSettings 
        });
      
      console.log('Day off automatically disabled - end date reached');
    } catch (error) {
      console.error('Error auto-disabling day off:', error);
    }
  };

  const loadDayOffSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .eq('key', 'dayOffSettings')
        .single();

      if (error) {
        console.error('Error loading day off settings:', error);
        // If no settings exist, use defaults
        if (error.code === 'PGRST116') {
          console.log('No Day Off settings found, banner will not show');
        }
        setLoading(false);
        return;
      }

      if (data?.value) {
        const dayOffData = data.value;
        const settingsObj = {
          isEnabled: dayOffData.isEnabled || false,
          message: dayOffData.message || 'Limited service hours today. Emergency services available 24/7.',
          startDate: dayOffData.startDate || '',
          endDate: dayOffData.endDate || '',
          showOnAllPages: dayOffData.showOnAllPages || true
        };

        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dayOffBannerDismissed', 'true');
  };

  // Don't show if loading or settings not loaded
  if (loading || !settings) {
    return null;
  }

  // Don't show if not enabled or dismissed
  if (!settings.isEnabled || isDismissed) {
    return null;
  }

  // Check if we're within the date range (if dates are set)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  console.log('DayOffBanner date check:', {
    today: today.toISOString().split('T')[0],
    startDate: settings.startDate,
    endDate: settings.endDate,
    isEnabled: settings.isEnabled
  });
  
  if (settings.startDate) {
    const startDate = new Date(settings.startDate);
    // Show banner one day before start date
    const dayBeforeStart = new Date(startDate);
    dayBeforeStart.setDate(dayBeforeStart.getDate() - 1);
    
    if (today < dayBeforeStart) {
      console.log('Banner not shown: today is more than 1 day before start date');
      return null;
    }
  }
  
  if (settings.endDate) {
    const endDate = new Date(settings.endDate);
    if (today > endDate) {
      console.log('Banner not shown: today is after end date, auto-disabling');
      // Auto-disable day off if end date has passed
      autoDisableDayOff();
      return null;
    }
  }
  
  // Determine if we're showing advance notice or current day off
  const isAdvanceNotice = settings.startDate && today < new Date(settings.startDate);
  const bannerTitle = isAdvanceNotice ? "Upcoming Day Off Notice" : "Day Off Notice";
  const bannerMessage = isAdvanceNotice 
    ? `${settings.message} Starting tomorrow.`
    : settings.message;

  console.log('DayOffBanner will be shown', { isAdvanceNotice });

  return (
    <div className="fixed left-0 right-0 top-[80px] z-[60] bg-gradient-to-r from-yellow-400 to-yellow-300 border-b border-yellow-500 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center flex-1 space-x-3">
            <div className="flex-shrink-0 w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-yellow-900 uppercase">{bannerTitle}</span>
                <span className="text-xs text-yellow-800">{bannerMessage}</span>
                {(settings.startDate || settings.endDate) && (
                  <div className="hidden md:flex items-center bg-yellow-500 bg-opacity-40 rounded px-2 py-0.5">
                    <span className="text-xs font-medium text-yellow-900">
                      📅 {settings.startDate && new Date(settings.startDate).toLocaleDateString('en-GB')}
                      {settings.startDate && settings.endDate && ' - '}
                      {settings.endDate && new Date(settings.endDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-3 flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 hover:text-white transition-all duration-150 flex items-center justify-center"
            aria-label="Dismiss"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 