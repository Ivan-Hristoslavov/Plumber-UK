"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type SiteGuidanceItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Short pointers to what changed in the panel, each one opens the screen. */
const WHATS_NEW = [
  {
    title: "Dashboard insights",
    text: "Your next booking, a trend chart and a timeline around now.",
    href: "/admin/dashboard",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Calendar",
    text: "Month, week and day views, status filters and a daily agenda.",
    href: "/admin/calendar",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Booking emails",
    text: "Alerts now go out through Gmail. Send yourself a test of any email.",
    href: "/admin/test-email",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "Services",
    text: "Show or hide the pages for each service on the website.",
    href: "/admin/settings?section=services",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
  {
    title: "WhatsApp button",
    text: "Turn the website's WhatsApp button on or off, or use another number.",
    href: "/admin/settings?section=connections",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    title: "Settings overview",
    text: "Every setting is a card: open one, edit it, go back.",
    href: "/admin/settings",
    icon: "M4 6h16M4 12h16M4 18h7",
  },
];

/** Guides that ship with the panel. Negative ids keep them apart from the database ones. */
const BUILT_IN_GUIDES: SiteGuidanceItem[] = [
  {
    id: -1,
    title: "Booking emails: how they work",
    category: "new",
    sort_order: 1,
    created_at: "",
    updated_at: "",
    content: `## What happens when someone books
Every new booking sends an email alert to the owner with the customer's name, phone, address, date, time and notes.

## Check that it works
- Open **Test Email** in the menu
- Choose an **email type**: a simple test, a booking alert, a payment request or an invoice
- Press **Send test email**. Samples are marked [TEST] and use made-up customer details

## If nothing arrives
- Look in the **Spam** folder first
- Open Test Email and read the box at the top: it shows which address receives the alerts and who they are sent from
- If the test fails, the message under the button is the real reason. Send it to your developer`,
  },
  {
    id: -2,
    title: "Reading the dashboard",
    category: "new",
    sort_order: 2,
    created_at: "",
    updated_at: "",
    content: `## Next booking
The soonest booking that is pending or scheduled, with how long is left. **Call** rings the customer, **Directions** opens the route in Google Maps.

## Chart
Bookings or booked value for the last **14 days** or **12 weeks**. The percentage compares with the period before. Hover or tap a bar for the exact figures. Cancelled bookings are not counted.

## Timeline
Recent bookings above the **Now** marker, upcoming ones below it. The dot colour is the booking status.

## Overview
- **Avg. booking**: average value of bookings that were not cancelled
- **Completion**: completed jobs against cancelled ones
- **Unpaid**: bookings whose payment is still pending
- **Busiest day**: the weekday with the most bookings`,
  },
  {
    id: -3,
    title: "Using the calendar",
    category: "new",
    sort_order: 3,
    created_at: "",
    updated_at: "",
    content: `## Views
Switch between **Month**, **Week** and **Day**. Week and day scroll to the first booking and show a red line for the current time.

## Find a booking
- Tap a day in the month view to see its **agenda** underneath
- Use the status chips at the top to show only pending, scheduled, completed or cancelled
- Tap a booking to see the customer, change its status, call or open the address in Maps

## Edit a booking
Open it and press **Edit** to change the customer, service, date, time, price, address or notes.`,
  },
  {
    id: -4,
    title: "Show or hide services and WhatsApp",
    category: "new",
    sort_order: 4,
    created_at: "",
    updated_at: "",
    content: `## Services
Go to **Settings, Services**. Each service has its own page on the website. **Hide** removes it from the website, the footer and the sitemap without deleting it. You can show it again at any time.

## WhatsApp
Go to **Settings, Integrations**. Switch the WhatsApp button on or off. Leave the number empty to use the business phone number, or enter a different one.`,
  },
  {
    id: -5,
    title: "Using the admin on your phone",
    category: "new",
    sort_order: 5,
    created_at: "",
    updated_at: "",
    content: `## Getting around
The bar at the bottom has **Home, Calendar, Bookings** and **Customers**. **More** opens the full menu from the right side, where your thumb is.

## Put it on your home screen
- iPhone (Safari): press **Share**, then **Add to Home Screen**
- Android (Chrome): open the menu and press **Add to Home screen**

It then opens like an app.`,
  },
  {
    id: -6,
    title: "Booking and payment statuses",
    category: "getting started",
    sort_order: 6,
    created_at: "",
    updated_at: "",
    content: `## Booking status
- **Pending**: a request that still needs your confirmation
- **Scheduled**: confirmed and in the diary
- **Completed**: the job is done
- **Cancelled**: it will not happen. It stays in the list but is not counted in the totals

## Payment status
- **Pending**: not paid yet
- **Paid**: payment received
- **Refunded**: the money was returned`,
  },
];

const label = (category: string) =>
  category === "new" ? "New" : category.charAt(0).toUpperCase() + category.slice(1);

export function AdminSiteGuidance() {
  const [dbItems, setDbItems] = useState<SiteGuidanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<number | null>(BUILT_IN_GUIDES[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("site_guidance")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) console.error("Error loading site guidance:", error);
        else setDbItems(data || []);
      } catch (error) {
        console.error("Error loading site guidance:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allItems = useMemo(() => [...BUILT_IN_GUIDES, ...dbItems], [dbItems]);
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(allItems.map((item) => item.category)))],
    [allItems],
  );

  const filteredItems = allItems.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q || item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group the list by category, keeping "new" first
  const grouped = useMemo(() => {
    const map = new Map<string, SiteGuidanceItem[]>();
    filteredItems.forEach((item) => map.set(item.category, [...(map.get(item.category) || []), item]));
    return Array.from(map.entries()).sort(([a], [b]) => (a === "new" ? -1 : b === "new" ? 1 : 0));
  }, [filteredItems]);

  const active = allItems.find((item) => item.id === activeItem);

  const open = (id: number) => {
    setActiveItem(id);
    // On phones the article sits below the list.
    if (window.innerWidth < 1024) {
      setTimeout(() => articleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-9 w-56 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-28 rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
        <div className="h-72 rounded-2xl bg-gray-200/70 dark:bg-gray-800/70" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Help Center
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Guides for using the admin panel, and what is new
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <svg
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* What's new */}
      {!searchTerm && (
        <section aria-labelledby="whats-new">
          <h2 id="whats-new" className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            What&apos;s new
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {WHATS_NEW.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-start gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-gray-900 dark:text-white">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-gray-500 dark:text-gray-400">{item.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Guides */}
      <section aria-labelledby="guides">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="guides" className="text-sm font-semibold text-gray-900 dark:text-white">
            Guides
          </h2>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  selectedCategory === category
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                {category === "all" ? "All" : label(category)}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
          <nav
            aria-label="Guides"
            className="max-h-80 overflow-y-auto rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:max-h-[34rem]"
          >
            {grouped.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No guides found</p>
            ) : (
              grouped.map(([category, items]) => (
                <div key={category} className="mb-1 last:mb-0">
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 first:pt-2 dark:text-gray-500">
                    {label(category)}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => open(item.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                        activeItem === item.id
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/70"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {item.id < 0 && category === "new" && (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                          New
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </nav>

          <div ref={articleRef} className="mt-4 scroll-mt-20 lg:mt-0">
            {active ? (
              <article className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <header className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:p-6">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {label(active.category)}
                    </span>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {active.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    title="Print this guide"
                    aria-label="Print this guide"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </header>
                <div className="p-5 sm:p-6">
                  <MarkdownRenderer content={active.content} />
                </div>
              </article>
            ) : (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="font-medium text-gray-900 dark:text-white">Select a guide</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Pick a topic from the list to read it here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still stuck */}
      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Still stuck?</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Most problems are quick to check from here.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { href: "/admin/test-email", title: "Emails not arriving", text: "Run the email check" },
            { href: "/admin/settings", title: "Something looks wrong on the site", text: "Review your settings" },
            { href: "/admin/profile", title: "Change your details", text: "Open your profile" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5"
            >
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">{link.title}</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">{link.text}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
