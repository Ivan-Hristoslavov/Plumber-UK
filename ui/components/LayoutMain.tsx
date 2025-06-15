'use client';

import NavigationNavbar from './NavigationNavbar';
import { ButtonCallNow } from './ButtonCallNow';
import { DayOffBanner } from './DayOffBanner';
import { useState, useEffect } from 'react';

export default function LayoutMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasDayOffBanner, setHasDayOffBanner] = useState(false);

  useEffect(() => {
    const checkDayOffSettings = () => {
      const savedSettings = localStorage.getItem('dayOffSettings');
      const dismissed = sessionStorage.getItem('dayOffBannerDismissed');
      
      if (savedSettings && dismissed !== 'true') {
        const settings = JSON.parse(savedSettings);
        if (settings.isEnabled && settings.showOnAllPages) {
          // Check date range if set
          const now = new Date();
          const startDate = settings.startDate ? new Date(settings.startDate) : null;
          const endDate = settings.endDate ? new Date(settings.endDate) : null;
          
          const withinRange = (!startDate || now >= startDate) && (!endDate || now <= endDate);
          setHasDayOffBanner(withinRange);
        } else {
          setHasDayOffBanner(false);
        }
      } else {
        setHasDayOffBanner(false);
      }
    };

    checkDayOffSettings();
    
    // Listen for storage changes
    const handleStorageChange = () => checkDayOffSettings();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <DayOffBanner />
      <NavigationNavbar />
      <main className={`flex-grow ${hasDayOffBanner ? 'pt-32' : 'pt-16'} transition-all duration-300`}>
        {children}
      </main>
      <ButtonCallNow />
      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">FIX MY LEAK</h3>
              <p className="text-gray-300">
                Professional plumbing services available 24/7 across the United Kingdom.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Phone: 0800 123 4567<br />
                Email: info@plumbe-uk.com<br />
                Emergency: Available 24/7
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/services" className="text-gray-300 hover:text-white">Services</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
                <li><a href="/faq" className="text-gray-300 hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-center text-gray-400">
                &copy; {new Date().getFullYear()} FIX MY LEAK. All rights reserved.
              </p>
              <p className="text-center text-gray-400">
                Designed by{' '}
                <a
                  href="https://google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  Serenity
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 