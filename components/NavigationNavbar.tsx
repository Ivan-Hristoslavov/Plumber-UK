"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useScrollDirection } from "@/hooks/useScrollDirection";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { 
    name: "About", 
    href: "#about",
    dropdown: [
      { name: "Our Story", href: "#our-story" },
      { name: "Service Areas", href: "#service-areas" },
      { name: "Gallery", href: "#gallery" }
    ]
  },
  { 
    name: "Support", 
    href: "#faq",
    dropdown: [
      { name: "FAQ", href: "#faq" },
      { name: "Reviews", href: "#reviews" },
    ]
  },
  { name: "Contact", href: "#contact" },
];

export default function NavigationNavbar() {
  const { scrollDirection, isScrolled } = useScrollDirection();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const routerUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const shouldHideNavigation = pathname === "/terms" || pathname === "/privacy";

  useEffect(() => {
    const throttle = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout | null = null;
      let lastExecTime = 0;
      return () => {
        const currentTime = Date.now();
        if (currentTime - lastExecTime > delay) {
          func();
          lastExecTime = currentTime;
        } else {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func();
            lastExecTime = Date.now();
          }, delay - (currentTime - lastExecTime));
        }
      };
    };

    let previousSection = "";

    const handleScrollSpy = () => {
      const allSections = [
        "home", "services", "about", "our-story", "service-areas", "gallery", "faq", "reviews", "contact"
      ];
      let currentSection: string | null = null;
      let minDistance = Infinity;

      allSections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const navbar = document.querySelector("nav");
          const dayOffBanner = document.querySelector("[data-day-off-banner]") as HTMLElement;
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const bannerHeight = dayOffBanner && dayOffBanner.offsetHeight > 0 ? dayOffBanner.offsetHeight : 0;
          const totalOffset = navbarHeight + bannerHeight + 80;

          if (rect.top <= totalOffset && rect.bottom >= totalOffset) {
            const distance = Math.abs(rect.top - totalOffset);
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = section;
            }
          }
        }
      });

      if (currentSection && currentSection !== previousSection) {
        setActiveSection(currentSection);
        previousSection = currentSection;
        if (pathname === "/" && currentSection !== "home") {
          if (routerUpdateTimeoutRef.current) clearTimeout(routerUpdateTimeoutRef.current);
          routerUpdateTimeoutRef.current = setTimeout(() => {
            try { router.replace(`/#${currentSection}`, { scroll: false }); } catch {}
          }, 100);
        }
      }
    };

    const throttledHandleScrollSpy = throttle(handleScrollSpy, 300);
    window.addEventListener("scroll", throttledHandleScrollSpy);
    const mountTimeout = setTimeout(throttledHandleScrollSpy, 200);

    return () => {
      window.removeEventListener("scroll", throttledHandleScrollSpy);
      clearTimeout(mountTimeout);
      if (routerUpdateTimeoutRef.current) clearTimeout(routerUpdateTimeoutRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIsMobileMenuOpen(false);
      setOpenDropdown(null);
      setOpenMobileGroup(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const prevMobileOpenRef = useRef(false);
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const firstFocusable = mobileMenuRef.current.querySelector<HTMLElement>("a[href], button");
      firstFocusable?.focus({ preventScroll: true });
    } else if (prevMobileOpenRef.current && !isMobileMenuOpen) {
      menuButtonRef.current?.focus({ preventScroll: true });
    }
    prevMobileOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
        setOpenMobileGroup(null);
        setActiveSection(targetId);

        if (pathname === "/") {
          router.replace(`/#${targetId}`, { scroll: false });
        } else {
          router.push(`/#${targetId}`);
        }

        const navbar = document.querySelector("nav");
        const dayOffBanner = document.querySelector("[data-day-off-banner]") as HTMLElement;
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const bannerHeight = dayOffBanner && dayOffBanner.offsetHeight > 0 ? dayOffBanner.offsetHeight : 0;
        const totalOffset = navbarHeight + bannerHeight + 30;
        const finalScrollPosition = Math.max(0, element.offsetTop - totalOffset);

        window.scrollTo({ top: finalScrollPosition, behavior: "smooth" });
      }
    }
  };

  const isActiveDropdown = (item: any) => {
    if (!item.dropdown) return false;
    return item.dropdown.some((sub: any) => activeSection === sub.href.substring(1));
  };

  const isLinkActive = (href: string) => activeSection === href.substring(1);

  if (shouldHideNavigation) return null;

  return (
    <>
      {/* ── Mobile slide-in panel ── */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-[visibility] duration-200 ${
          isMobileMenuOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Scrim */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => { setIsMobileMenuOpen(false); setOpenMobileGroup(null); }}
        />

        {/* Panel – slides in from right with smooth spring-like easing */}
        <div
          ref={mobileMenuRef}
          id="mobile-nav-menu"
          className={`absolute top-0 right-0 h-full w-[min(85vw,360px)] bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Menu</span>
            <button
              type="button"
              onClick={() => { setIsMobileMenuOpen(false); setOpenMobileGroup(null); }}
              className="p-2 -mr-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Mobile navigation">
            {navigation.map((item) => {
              if (item.dropdown) {
                const groupActive = isActiveDropdown(item);
                const groupOpen = openMobileGroup === item.name;
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      onClick={() => setOpenMobileGroup((g) => (g === item.name ? null : item.name))}
                      aria-expanded={groupOpen}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors duration-150 ${
                        groupActive
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                          : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      }`}
                    >
                      <span>{item.name}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${groupOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <div className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${groupOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="ml-3 mt-1 mb-2 border-l-2 border-blue-200 dark:border-blue-800 pl-3 space-y-0.5">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={(e) => handleClick(e, sub.href)}
                            className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                              isLinkActive(sub.href)
                                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`block px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors duration-150 ${
                    isLinkActive(item.href)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: theme toggle + CTA */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
            <Link
              href="#contact"
              onClick={(e) => handleClick(e, "#contact")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Book a Service
            </Link>
            <div className="flex justify-center">
              <ThemeToggle size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Navbar bar ── */}
      <nav ref={navRef} className="w-full backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 shadow-lg border-b border-white/20 dark:border-gray-800/30 transition-all duration-300 relative z-50" aria-label="Main navigation">
        <div
          className={`transition-all duration-300 ease-out ${
            isScrolled
              ? "bg-white/95 dark:bg-gray-900/95 py-3 border-b border-blue-100/50 dark:border-gray-700/50"
              : "bg-white/80 dark:bg-gray-900/80 py-4"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link
                className="text-2xl font-bold transition-all duration-300 hover:scale-105 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                href="/"
              >
                FIX MY LEAK
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navigation.map((item) => (
                  <div key={item.name} className="relative group">
                    {item.dropdown ? (
                      <>
                        <button
                          type="button"
                          aria-expanded={openDropdown === item.name}
                          aria-haspopup="true"
                          aria-controls={`nav-dropdown-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                          className={`relative px-4 py-3 text-sm font-semibold transition-all duration-300 rounded-full hover:scale-105 flex items-center gap-1 ${
                            isActiveDropdown(item)
                              ? "text-white bg-blue-600 dark:bg-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-700 dark:hover:bg-blue-600"
                              : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
                          }`}
                          onMouseEnter={() => setOpenDropdown(item.name)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {item.name}
                          <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                          </svg>
                          {isActiveDropdown(item) && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg" />
                          )}
                        </button>

                        <div
                          id={`nav-dropdown-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                          role="menu"
                          className={`absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-blue-100/50 dark:border-gray-600/50 transition-all duration-300 ${
                            openDropdown === item.name ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                          }`}
                          onMouseEnter={() => setOpenDropdown(item.name)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          <div className="py-2">
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                role="menuitem"
                                onClick={(e) => handleClick(e, subItem.href)}
                                className={`block px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                                  isLinkActive(subItem.href)
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        className={`relative px-4 py-3 text-sm font-semibold transition-all duration-300 rounded-full hover:scale-105 ${
                          isLinkActive(item.href)
                            ? "text-white bg-blue-600 dark:bg-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-700 dark:hover:bg-blue-600"
                            : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
                        }`}
                        href={item.href}
                        onClick={(e) => handleClick(e, item.href)}
                      >
                        {item.name}
                        {isLinkActive(item.href) && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg" />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop theme toggle */}
              <div className="hidden lg:block">
                <ThemeToggle size="md" />
              </div>

              {/* Mobile hamburger */}
              <button
                ref={menuButtonRef}
                type="button"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                className="lg:hidden p-2.5 rounded-xl transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
