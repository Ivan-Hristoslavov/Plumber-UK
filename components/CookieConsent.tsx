"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowBanner(false);
    // Trigger custom event so GoogleAnalytics can react
    window.dispatchEvent(new CustomEvent("cookieConsentChanged"));
    // Reload to ensure scripts load properly
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowBanner(false);
    // Trigger custom event
    window.dispatchEvent(new CustomEvent("cookieConsentChanged"));
    // Reload to ensure scripts don't load
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleCustomize = () => {
    // For now, just accept all - can be expanded later
    handleAccept();
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
        {/* Kept to a single compact row: on mobile this banner sits on top of the
            hero CTAs, so every extra line of copy is a lost call. */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-row items-center justify-between gap-3">
            <p className="flex-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-snug">
              We use cookies to analyse traffic.{" "}
              <Link
                href="/cookies"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Learn more
              </Link>
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleReject}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
