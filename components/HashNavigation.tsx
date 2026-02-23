"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function HashNavigation() {
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Disable browser scroll restoration so the browser doesn't jump
    // to a remembered position on load/refresh
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // On page load (first visit or refresh), always start at the top.
    // Clear any leftover hash so the scroll-spy starts clean.
    if (window.location.hash) {
      window.history.replaceState(null, "", pathname || "/");
    }
    window.scrollTo(0, 0);

    // Only scroll to a hash when the user clicks a link (triggers hashchange),
    // not on initial page load or refresh.
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const targetId = hash.substring(1);
      const validSections = [
        "home", "services", "about", "our-story", "service-areas",
        "gallery", "faq", "reviews", "contact",
      ];

      if (!validSections.includes(targetId)) return;

      const element = document.getElementById(targetId);
      if (!element) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        const dayOffBanner = document.querySelector("[data-day-off-banner]") as HTMLElement;
        const navbar = document.querySelector("nav");

        let yOffset = -80;
        if (dayOffBanner && dayOffBanner.offsetHeight > 0) {
          yOffset -= dayOffBanner.offsetHeight;
        }
        if (navbar) {
          yOffset -= navbar.offsetHeight;
        }

        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 150);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return null;
}
