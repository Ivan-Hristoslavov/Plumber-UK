'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const navigation = [
  { name: 'Home', href: '#home' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' },
];

type DayOffSettings = {
  isEnabled: boolean;
  message: string;
  startDate: string;
  endDate: string;
  dayOffKey?: string;
};

export default function NavigationNavbar() {
  const { scrollDirection, isScrolled } = useScrollDirection();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hasDayOffBanner, setHasDayOffBanner] = useState(false);
  const [dayOffSettings, setDayOffSettings] = useState<DayOffSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check if day off banner is enabled
    const checkDayOffBanner = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('key, value')
          .eq('key', 'dayOffSettings')
          .single();

        if (error) {
          console.error('Error loading day off settings:', error);
          if (error.code === 'PGRST116') {
            console.log('No Day Off settings found');
          }
          setHasDayOffBanner(false);
          return;
        }

        if (!data?.value) {
          setHasDayOffBanner(false);
          return;
        }

        const dayOffData = data.value;
        const settings = {
          isEnabled: dayOffData.isEnabled || false,
          message: dayOffData.message || 'Limited service hours today. Emergency services available 24/7.',
          startDate: dayOffData.startDate || '',
          endDate: dayOffData.endDate || ''
        };

        // Create unique key for this specific day off period
        const dayOffKey = `dayOff_${settings.startDate}_${settings.endDate}`;
        const dismissed = sessionStorage.getItem(`dismissed_${dayOffKey}`);
        
        if (settings.isEnabled && dismissed !== 'true') {
          // Check date range
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          let isInRange = true;
          
          if (settings.startDate) {
            const startDate = new Date(settings.startDate);
            // Show banner one day before start date
            const dayBeforeStart = new Date(startDate);
            dayBeforeStart.setDate(dayBeforeStart.getDate() - 1);
            
            if (today < dayBeforeStart) isInRange = false;
          }
          
          if (settings.endDate) {
            const endDate = new Date(settings.endDate);
            if (today > endDate) isInRange = false;
          }
          
          if (isInRange) {
            setDayOffSettings({...settings, dayOffKey});
            setHasDayOffBanner(true);
          } else {
            setHasDayOffBanner(false);
          }
        } else {
          setHasDayOffBanner(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setHasDayOffBanner(false);
      }
    };

    checkDayOffBanner();
    
    // Clean up old dismissed day off periods (older than 30 days)
    const cleanupOldDismissals = () => {
      const now = new Date();
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('dismissed_dayOff_')) {
          // Extract dates from key: dismissed_dayOff_YYYY-MM-DD_YYYY-MM-DD
          const datePart = key.replace('dismissed_dayOff_', '');
          const endDate = datePart.split('_')[1];
          if (endDate) {
            const dismissedEndDate = new Date(endDate);
            const daysSinceEnd = (now.getTime() - dismissedEndDate.getTime()) / (1000 * 3600 * 24);
            if (daysSinceEnd > 30) {
              sessionStorage.removeItem(key);
            }
          }
        }
      }
    };
    
    cleanupOldDismissals();
    
    // Listen for storage changes (for session dismissal)
    const handleStorageChange = () => {
      checkDayOffBanner();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = navigation.map(item => item.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };



  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Day Off Banner - Integrated */}
      {hasDayOffBanner && (
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 animate-gradient-x">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                                 <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                   {dayOffSettings?.startDate && new Date() < new Date(dayOffSettings.startDate) ? 'Upcoming Day Off' : 'Day Off Notice'}
                 </span>
                 <span className="text-xs text-amber-800 font-medium">{dayOffSettings?.message}</span>
                 {(dayOffSettings?.startDate || dayOffSettings?.endDate) && (
                   <div className="hidden lg:flex items-center bg-amber-500/40 rounded-full px-3 py-1">
                     <span className="text-xs font-semibold text-amber-900">
                       📅 {dayOffSettings?.startDate && `From: ${new Date(dayOffSettings.startDate).toLocaleDateString('en-GB')}`}
                       {dayOffSettings?.startDate && dayOffSettings?.endDate && ' • '}
                       {dayOffSettings?.endDate && `Until: ${new Date(dayOffSettings.endDate).toLocaleDateString('en-GB')}`}
                     </span>
                   </div>
                 )}
              </div>
                             <button 
                 onClick={() => {
                   setHasDayOffBanner(false);
                   if (dayOffSettings?.dayOffKey) {
                     sessionStorage.setItem(`dismissed_${dayOffSettings.dayOffKey}`, 'true');
                   }
                 }}
                className="w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-600 text-amber-900 hover:text-white transition-all duration-200 flex items-center justify-center group"
              >
                <svg className="h-3 w-3 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div
        className={`transition-all duration-700 ease-out ${
          isScrolled || hasDayOffBanner
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl py-3 border-b border-blue-100/50' 
            : 'bg-white/10 backdrop-blur-sm py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-2xl font-bold transition-all duration-500 hover:scale-110 text-blue-600 hover:text-blue-700 drop-shadow-lg"
            >
              FIX MY LEAK
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`relative px-6 py-3 text-sm font-semibold transition-all duration-500 rounded-full hover:scale-110 transform hover:-translate-y-1 ${
                    activeSection === item.href.substring(1)
                      ? 'text-white bg-blue-600 shadow-lg hover:shadow-xl hover:bg-blue-700' 
                      : 'text-blue-600 hover:text-white hover:bg-blue-600 hover:shadow-lg'
                  }`}
                >
                  {item.name}
                  {activeSection === item.href.substring(1) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg" />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-full transition-all duration-500 hover:scale-110 transform hover:-translate-y-1 text-blue-600 hover:text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
            >
              <svg
                className="h-6 w-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: isMobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4 pb-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="flex flex-col space-y-3 p-6 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-blue-100/50">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  handleClick(e, item.href);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-6 py-4 text-base font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 ${
                  activeSection === item.href.substring(1)
                    ? 'text-white bg-blue-600 shadow-lg' 
                    : 'text-blue-600 hover:text-white hover:bg-blue-600 hover:shadow-lg'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.name}
              </Link>
            ))}

          </div>
        </div>
      </div>
    </nav>
  );
} 