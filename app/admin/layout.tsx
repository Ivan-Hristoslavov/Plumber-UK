"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { BRAND_NAME } from "@/lib/brand";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <path d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Calendar",
    href: "/admin/calendar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Reviews",
    href: "/admin/reviews",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Day Off",
    href: "/admin/day-off",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Site Guidance",
    href: "/admin/site-guidance",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    name: "Test Email",
    href: "/admin/test-email",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
    ),
  },
];

const bottomTabs = [
  { label: "Home", href: "/admin/dashboard", match: "Dashboard" },
  { label: "Calendar", href: "/admin/calendar", match: "Calendar" },
  { label: "Bookings", href: "/admin/bookings", match: "Bookings" },
  { label: "Customers", href: "/admin/customers", match: "Customers" },
];

const quickActions = [
  {
    label: "New Booking",
    hint: "Create a new booking",
    href: "/admin/bookings",
    icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
    tone: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  },
  {
    label: "Create Invoice",
    hint: "Generate new invoice",
    href: "/admin/invoices",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    label: "Add Customer",
    hint: "Register new customer",
    href: "/admin/customers",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    tone: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    label: "View Reports",
    hint: "Analytics & insights",
    href: "/admin/dashboard",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    tone: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAdminProfile();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminInitials = profile?.name?.trim()
    ? profile.name
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AD"
    : "AD";

  useEffect(() => {
    // Check if we're on the login page
    if (pathname === "/admin/login") {
      setIsLoading(false);
      return;
    }

    // For admin pages, assume authenticated (middleware will handle redirects)
    // Add a small delay to show the loading animation briefly
    const timer = setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  // If we're on the login page, just render the children
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">{children}</div>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-500"
      >
        {/* Soft brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div className="relative flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-2xl bg-blue-500/30 motion-safe:animate-ping"
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/30">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 3.5c-3.2 4-5.5 6.9-5.5 9.8a5.5 5.5 0 0011 0c0-2.9-2.3-5.8-5.5-9.8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
          </div>

          <p className="mt-6 text-sm font-medium text-gray-900 dark:text-white">{BRAND_NAME}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Loading admin panel</p>

          {/* Indeterminate progress bar */}
          <div className="mt-5 h-1 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-full w-1/2 rounded-full bg-blue-600 dark:bg-blue-500 motion-safe:animate-admin-loading" />
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the admin layout
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" />
        </div>
      )}

      {/* Fixed Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 lg:right-auto lg:left-0 z-50 w-72 max-w-[85vw] lg:w-64 bg-white dark:bg-gray-900 border-l lg:border-l-0 lg:border-r border-gray-200/80 dark:border-gray-800 shadow-xl lg:shadow-none transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 lg:px-5 border-b border-gray-200/80 dark:border-gray-800">
          <Link className="flex items-center gap-2.5 min-w-0" href="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 3.5c-3.2 4-5.5 6.9-5.5 9.8a5.5 5.5 0 0011 0c0-2.9-2.3-5.8-5.5-9.8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block text-gray-900 dark:text-white font-semibold text-base truncate">{BRAND_NAME}</span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Admin</span>
            </div>
          </Link>
          <button
            className="lg:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 h-full overflow-y-auto pb-24">
          <div className="space-y-0.5">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && !!pathname?.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.name}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                  )}
                  <span
                    className={`mr-3 transition-colors ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section - Fixed at bottom, refined for mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 border-t border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900">
          
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50"
            onClick={async () => {
              try {
                await fetch("/api/admin/auth", { method: "DELETE" });
                router.push("/admin/login");
              } catch (error) {
                console.error("Logout failed:", error);
                router.push("/admin/login");
              }
            }}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content area with proper margin for fixed sidebar */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white/85 dark:bg-gray-900/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70 border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900 dark:text-white lg:hidden">{BRAND_NAME}</p>
                <p className="hidden text-sm text-gray-500 dark:text-gray-400 lg:block">
                  {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.name || "Plamen Zhelev"}
                </p>
              </div>
              <div
                aria-hidden
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-semibold flex items-center justify-center shadow-sm"
              >
                {adminInitials}
              </div>

              {/* Theme Toggle in Header */}
              <ThemeToggle size="md" />

              {/* Menu on the right, where the thumb is */}
              <button
                type="button"
                aria-label="Open menu"
                className="lg:hidden -mr-1 rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        {(
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 pt-3 sm:pt-4 lg:pt-6">
            <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-1.5 pr-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 hover:shadow transition-all"
                  href={action.href}
                  title={action.hint}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${action.tone}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d={action.icon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-0 transition-colors duration-300">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">{children}</div>
        </main>
      </div>

      {/* Phone tab bar: the four screens used all day, plus the full menu */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-900/90 dark:supports-[backdrop-filter]:bg-gray-900/80 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {bottomTabs.map((tab) => {
            const active = pathname === tab.href || !!pathname?.startsWith(`${tab.href}/`);
            const icon = navigation.find((item) => item.name === tab.match)?.icon;
            return (
              <li key={tab.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 px-1 pb-2 pt-2.5 text-[11px] font-medium transition-colors ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  }`}
                  href={tab.href}
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      active ? "bg-blue-50 dark:bg-blue-500/15" : ""
                    }`}
                  >
                    {icon}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="flex w-full flex-col items-center gap-0.5 px-1 pb-2 pt-2.5 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="flex h-7 w-12 items-center justify-center">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
