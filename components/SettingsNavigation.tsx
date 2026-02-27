"use client";

import React, { useState, useRef, useEffect } from "react";

export type SettingsTab = {
  id: string;
  name: string;
  icon: React.ReactElement | string;
  description: string;
  category: "business" | "content" | "integrations";
};

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: SettingsTab[];
}

export function SettingsNavigation({ activeTab, onTabChange, tabs }: SettingsNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clickedTab, setClickedTab] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobileMenuOpen]);
  
  const categories = {
    business: { name: "Business", color: "blue", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    content: { name: "Content", color: "green", bgColor: "bg-green-50 dark:bg-green-900/20" },
    integrations: { name: "Integrations", color: "purple", bgColor: "bg-purple-50 dark:bg-purple-900/20" }
  };

  const groupedTabs = tabs.reduce((acc, tab) => {
    if (!acc[tab.category]) {
      acc[tab.category] = [];
    }
    acc[tab.category].push(tab);
    return acc;
  }, {} as Record<string, SettingsTab[]>);

  const handleTabClick = (tabId: string) => {
    // Add click effect
    setClickedTab(tabId);
    
    // Remove click effect after animation
    setTimeout(() => {
      setClickedTab(null);
    }, 150);
    
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <>
      {/* Mobile: dropdown sub-nav - fixed at top */}
      <div ref={dropdownRef} className="lg:hidden fixed top-16 left-3 right-3 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center gap-2.5 h-10 px-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-slide-down-in hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ring-1 ring-gray-200/80 dark:ring-gray-600/50"
          aria-expanded={isMobileMenuOpen}
          aria-haspopup="true"
          aria-label="Settings menu"
        >
          <svg className={`w-[18px] h-[18px] text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isMobileMenuOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[15px] font-medium text-gray-900 dark:text-white truncate flex-1 text-left">{currentTab?.name}</span>
          <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-200 ${isMobileMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden animate-slide-down-in z-50 max-h-[calc(100vh-8rem)] overflow-y-auto ring-1 ring-gray-200/80 dark:ring-gray-600/50">
            {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
              <div key={category} className="px-3 py-1.5">
                <div className="flex items-center gap-2 px-2 mb-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${categories[category as keyof typeof categories].color}-500`}></div>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {categories[category as keyof typeof categories].name}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <span className="text-lg shrink-0">{tab.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate">{tab.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">{tab.description}</span>
                      </div>
                      {activeTab === tab.id && (
                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sidebar - Only shown on desktop */}
      <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
        {/* Desktop Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your business configuration
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="p-6 space-y-6">
          {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-${categories[category as keyof typeof categories].color}-500`}></div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {categories[category as keyof typeof categories].name}
                </h3>
              </div>
              
              <div className="space-y-2">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 group border-2 relative overflow-hidden ${
                      activeTab === tab.id
                        ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    } ${
                      clickedTab === tab.id 
                        ? "scale-95 shadow-inner bg-blue-100 dark:bg-blue-800/50" 
                        : "hover:scale-[1.02] active:scale-95"
                    }`}
                  >
                    {/* Ripple effect */}
                    {clickedTab === tab.id && (
                      <div className="absolute inset-0 bg-blue-200 dark:bg-blue-700 opacity-30 animate-ping"></div>
                    )}
                    
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 group-hover:shadow-md"
                      } ${clickedTab === tab.id ? "scale-110" : ""}`}>
                        <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                          {tab.icon}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white"
                        }`}>
                          {tab.name}
                        </div>
                        <div className={`text-xs mt-1 line-clamp-2 transition-colors duration-200 ${
                          activeTab === tab.id
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                      
                      {activeTab === tab.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
} 