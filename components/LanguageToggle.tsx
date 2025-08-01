"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { FlagIcon } from "./FlagIcon";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bg" : "en");
  };

  return (
    <div className="relative group">
      {/* Main Toggle Button - Switch Style */}
      <button
        onClick={toggleLanguage}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-9 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-110 overflow-hidden"
        aria-label="Toggle language"
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse opacity-75"></div>
        
        {/* Switch Track with better styling */}
        <div className="absolute inset-1 bg-white/30 dark:bg-black/30 rounded-full backdrop-blur-sm border border-white/20 dark:border-white/10"></div>
        
        {/* Switch Handle with improved design */}
        <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-700 transform ${
          language === "bg" ? "translate-x-8" : "translate-x-0"
        } group-hover:shadow-xl`}>
          {/* English Flag */}
          <div className={`absolute inset-0 m-auto transition-all duration-700 ${
            language === "en" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"
          }`}>
            <FlagIcon country="en" className="w-5 h-5" />
          </div>

          {/* Bulgarian Flag */}
          <div className={`absolute inset-0 m-auto transition-all duration-700 ${
            language === "bg" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 rotate-90"
          }`}>
            <FlagIcon country="bg" className="w-5 h-5" />
          </div>
        </div>

        {/* Enhanced Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-700"></div>
        
        {/* Multiple Sparkle effects */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-ping"></div>
        <div className="absolute bottom-1 right-2 w-1 h-1 bg-white rounded-full opacity-40 animate-ping" style={{animationDelay: '0.3s'}}></div>
      </button>

      {/* Language Indicator with better animation */}
      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all duration-500 ${
        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        {language === "en" ? "English" : "Български"}
        {/* Arrow pointing up */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
      </div>
    </div>
  );
} 