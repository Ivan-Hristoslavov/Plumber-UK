"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function HashNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Handle hash navigation on page load
    const handleHashNavigation = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        
        if (hash) {
          const targetId = hash.substring(1);
          const validSections = ["home", "services", "about", "our-story", "service-areas", "gallery", "faq", "reviews", "contact"];
          
          if (validSections.includes(targetId)) {
            const element = document.getElementById(targetId);
            
            if (element) {
              // Small delay to ensure the page is fully loaded
              setTimeout(() => {
                const yOffset = -80; // Adjust based on your navbar height
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }, 100);
            }
          }
        }
      }
    };

    // Handle hash changes (when user navigates with browser back/forward)
    const handleHashChange = () => {
      handleHashNavigation();
    };

    // Initial navigation
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname, router]);

  return null; // This component doesn't render anything
} 