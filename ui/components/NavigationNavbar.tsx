'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '#home' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' },
];

export default function NavigationNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hasDayOffBanner, setHasDayOffBanner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if day off banner is enabled
    const checkDayOffBanner = () => {
      const savedSettings = localStorage.getItem('dayOffSettings');
      const dismissed = sessionStorage.getItem('dayOffBannerDismissed');
      
      if (savedSettings && dismissed !== 'true') {
        const settings = JSON.parse(savedSettings);
        if (settings.isEnabled && settings.showOnAllPages) {
          // Check date range
          const now = new Date();
          const startDate = settings.startDate ? new Date(settings.startDate) : null;
          const endDate = settings.endDate ? new Date(settings.endDate) : null;
          
          const isInRange = (!startDate || now >= startDate) && (!endDate || now <= endDate);
          setHasDayOffBanner(isInRange);
        } else {
          setHasDayOffBanner(false);
        }
      } else {
        setHasDayOffBanner(false);
      }
    };

    checkDayOffBanner();
    
    // Listen for storage changes
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
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