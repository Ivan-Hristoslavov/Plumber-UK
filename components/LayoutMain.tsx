"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import NavigationNavbar from "./NavigationNavbar";
import { ButtonCallNow } from "./ButtonCallNow";
import { AdminProfileData } from "@/components/AdminProfileData";

import { supabase } from "@/lib/supabase";

export default function LayoutMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasDayOffBanner, setHasDayOffBanner] = useState(false);
  const pathname = usePathname();

  // Check if we're in admin panel
  const isAdminPanel = pathname?.startsWith("/admin");

  useEffect(() => {
    const checkDayOffSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_settings")
          .select("key, value")
          .eq("key", "dayOffSettings")
          .single();

        if (error) {
          console.error("Error loading day off settings:", error);
          // If no settings exist, don't show banner
          if (error.code === "PGRST116") {
            console.log("No Day Off settings found, banner will not show");
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
          startDate: dayOffData.startDate || "",
          endDate: dayOffData.endDate || "",
        };

        // Check if banner should be shown
        const dayOffKey = `dayOff_${settings.startDate}_${settings.endDate}`;
        const dismissed = sessionStorage.getItem(`dismissed_${dayOffKey}`);

        if (settings.isEnabled && dismissed !== "true") {
          // Check date range if set
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          let withinRange = true;

          if (settings.startDate) {
            const startDate = new Date(settings.startDate);
            // Show banner one day before start date
            const dayBeforeStart = new Date(startDate);

            dayBeforeStart.setDate(dayBeforeStart.getDate() - 1);

            if (today < dayBeforeStart) withinRange = false;
          }

          if (settings.endDate) {
            const endDate = new Date(settings.endDate);

            if (today > endDate) withinRange = false;
          }

          setHasDayOffBanner(withinRange);
        } else {
          setHasDayOffBanner(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setHasDayOffBanner(false);
      }
    };

    checkDayOffSettings();

    // Listen for storage changes (for session dismissal)
    const handleStorageChange = () => checkDayOffSettings();

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // If we're in admin panel, render only the children without main layout elements
  if (isAdminPanel) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-500">
      <NavigationNavbar />
      <main
        className={`flex-grow transition-all duration-300 ${hasDayOffBanner ? "pt-[112px]" : "pt-20"}`}
      >
        {children}
      </main>
      <ButtonCallNow />

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full" />
          <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full" />
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  FixMyLeak
                </h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Professional plumbing services across London. Available 24/7 for
                emergency repairs. Licensed, insured, and committed to quality
                workmanship.
              </p>
              <div className="flex space-x-4">
                <a
                  className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors"
                  href="#"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors"
                  href="#"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a
                  className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors"
                  href="#"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                    href="#services"
                  >
                    Our Services
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                    href="#about"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                    href="#pricing"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                    href="#contact"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                    href="/blog"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Contact Info
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <div>
                    <p className="text-gray-300">Emergency 24/7</p>
                    <p className="text-white font-semibold">
                      <AdminProfileData type="phone" fallback="0800 123 4567" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <div>
                    <p className="text-gray-300">Email Us</p>
                    <p className="text-white">
                      <AdminProfileData type="email" fallback="hello@fixmyleak.com" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                    <path
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <div>
                    <p className="text-gray-300">Service Area</p>
                    <p className="text-white">Greater London</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} <AdminProfileData type="company_name" fallback="FixMyLeak" />. All rights reserved. Licensed & Insured
                Plumbers.
              </p>
              <p className="text-gray-400 text-sm">
                Developed by{" "}
                <a
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  href="https://serenity.rapid-frame.co.uk/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Serenity Web Studio
                </a>
              </p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                href="/privacy"
              >
                Privacy Policy
              </a>
              <a
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                href="/terms"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />
      </footer>
    </div>
  );
}
