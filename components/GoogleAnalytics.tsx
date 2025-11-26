"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Replace with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'G-QPF9F5SRFG';

// Google Ads Conversion ID from environment variables
const GOOGLE_ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;

export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-QPF9F5SRFG') {
      // Track page view when pathname changes
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("config", GA_MEASUREMENT_ID, {
          page_path: pathname,
        });
      }
    }
  }, [pathname]);

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-QPF9F5SRFG') {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}

// Utility function to track custom events
export function trackEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag && GA_MEASUREMENT_ID !== 'G-QPF9F5SRFG') {
    window.gtag("event", eventName, parameters);
  }
}

// Utility function to track form submissions
export function trackFormSubmission(formName: string, success: boolean) {
  trackEvent("form_submit", {
    form_name: formName,
    success: success,
    event_category: "engagement",
    event_label: formName
  });
}

// Utility function to track button clicks
export function trackButtonClick(buttonName: string, location?: string) {
  trackEvent("button_click", {
    button_name: buttonName,
    location: location || "unknown",
    event_category: "engagement",
    event_label: buttonName
  });
}

// Utility function to track scroll depth
export function trackScrollDepth(depth: number) {
  trackEvent("scroll_depth", {
    depth: depth,
    event_category: "engagement",
    event_label: `${depth}%`
  });
}

// Utility function to track phone calls (CRITICAL for conversion tracking)
export function trackPhoneCall(location: string) {
  trackEvent("phone_call", {
    event_category: "conversion",
    event_label: location,
    value: 1
  });
  
  // Also track as Google Ads conversion
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID !== 'G-QPF9F5SRFG' && GOOGLE_ADS_CONVERSION_ID) {
    window.gtag('event', 'conversion', {
      'send_to': GOOGLE_ADS_CONVERSION_ID,
      'value': 1.0,
      'currency': 'GBP'
    });
  }
}

// Declare gtag on window object
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}