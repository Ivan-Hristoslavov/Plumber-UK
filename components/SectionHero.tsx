"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAreas, type Area } from "@/hooks/useAreas";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AdminProfileData } from "@/components/AdminProfileData";
import { trackPhoneCall } from "@/components/GoogleAnalytics";
import { responseTimeMinutes } from "@/lib/response-time";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { ButtonWhatsApp } from "@/components/ButtonWhatsApp";
import { BRAND_NAME } from "@/lib/brand";
import { FOUNDING_HREF, FOUNDING_LIMIT } from "@/lib/founding";
import type { Availability } from "@/lib/availability";

const MOBILE_AREAS_LIMIT = 6;
const SKELETON_COUNT = 6;

export function SectionHero({
  availability,
  rating,
  areas: initialAreas,
  foundingLimit = FOUNDING_LIMIT,
}: {
  availability: Availability;
  rating: { average: number; count: number } | null;
  areas?: Area[];
  /** Number of founding places, from the admin's Founding 100 settings. */
  foundingLimit?: number;
}) {
  const { areas, loading: areasLoading } = useAreas(initialAreas);
  const adminProfile = useAdminProfile();
  const { settings: adminSettings } = useAdminSettings();
  const businessPhone = adminProfile?.phone || "+44 7541777225";
  const displayPhone = businessPhone.replace(/^\+44\s?/, "0");
  const responseTimeShort = `${responseTimeMinutes(adminProfile?.response_time)}-minute`;
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mounted]);

  // Autoplay does not reliably fire on its own once the element has been
  // mounted after hydration, so ask explicitly. A rejected promise just means
  // the browser declined, and the poster stays — nothing to handle.
  useEffect(() => {
    if (!mounted) return;
    videoRef.current?.play().catch(() => {});
  }, [mounted]);

  // Check if credentials are available (from public settings / profile)
  const hasGasSafe = adminSettings?.gasSafeRegistered === true;
  const hasInsurance =
    adminSettings?.fullyInsured === true &&
    (adminSettings?.insuranceProvider || adminProfile?.insurance_provider || "").trim() !== "";
  const hasMscCertified = adminSettings?.mcsCertified === true;

  return (
    <section
      className="relative flex items-start justify-center overflow-hidden py-4 sm:py-6 bg-black"
      id="home"
    >
      {/* Background video. The poster is the first frame so the hero is never
          blank while the file loads, and preload="none" keeps it off the
          critical path — it starts fetching once autoplay kicks in rather than
          competing with the markup. Mobile gets a slightly wider crop so the
          subject is not cut off on a narrow viewport.

          It fills the hero on every size. The source is 16:9 against a portrait
          mobile viewport, so covering crops most of the frame width — that is
          the intended look here.

          Note this is a 6.8MB download on every device. Compressing the source
          (720p, shorter loop) would cut roughly 85% of that with no visible
          difference behind the scrim. */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {mounted ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/video-poster.jpg"
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.45] saturate-[0.8]"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/video-poster.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.45] saturate-[0.8]"
          />
        )}
      </div>

      {/* Two-part scrim. The video has bright frames that swallowed light text, so
          the media itself is dimmed above; this adds an even vertical wash plus a
          soft radial pool behind the centred copy — no hard-edged box. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-blue-950/40 to-black/85 z-10" />
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 55%, transparent 80%)",
        }}
      />

      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col items-center">
        {/* Top Row with Emergency Badge and Trust Badges */}
        {/* Rating, availability and trust badges share one row of small pills
            (they used to take two rows, the second with tall badges). */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5 w-full max-w-3xl">
            <AvailabilityBadge availability={availability} />

            {rating && (
              <div className="inline-flex items-center gap-2 rounded-full bg-black/40 border border-white/20 px-3.5 py-1.5 backdrop-blur-md">
                <span className="flex items-center gap-0.5" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.round(rating.average) ? "text-yellow-400" : "text-white/30"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </span>
                <span className="text-sm font-semibold text-white">
                  {rating.average.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-white">
                  ({rating.count} reviews)
                </span>
              </div>
            )}

            {/* Fully Insured - show only when enabled in settings */}
            {mounted && hasInsurance && (
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 px-3.5 py-1.5 backdrop-blur-md">
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-blue-300">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium whitespace-nowrap">
                  Fully Insured
                </span>
              </div>
            )}

            {/* Gas Safe Registered - show only when enabled */}
            {mounted && hasGasSafe && (
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 px-3.5 py-1.5 backdrop-blur-md">
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-green-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium whitespace-nowrap">
                    Gas Safe Registered
                  </span>
                </div>
              )}

            {/* MCS Certified - show only when enabled */}
            {mounted && hasMscCertified && (
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 px-3.5 py-1.5 backdrop-blur-md">
                <img
                  src="/mcs-logo.png"
                  alt="MCS Certified - Microgeneration Certificate Scheme"
                  className="h-5 w-auto object-contain"
                  style={{ maxWidth: "110px" }}
                />
              </div>
            )}

            {/* Years of Experience - Always show */}
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 px-3.5 py-1.5 backdrop-blur-md">
              <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-yellow-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium whitespace-nowrap">
                <AdminProfileData type="years_of_experience" fallback="10+ Years" />
              </span>
            </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-5">
          {/* One h1 carrying both lines: the headline is the Founding 100
              invitation, and the keyword line above it keeps the page's
              "emergency plumber, South West London" signal for search. */}
          <h1 className="mb-3 animate-fade-in-up [text-shadow:0_2px_20px_rgba(0,0,0,0.85)]">
            <span className="block text-blue-300 text-xs sm:text-sm md:text-base font-semibold tracking-[0.18em] uppercase mb-2">
              Emergency Plumber in South West London
            </span>
            <span className="block text-white text-[1.85rem] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight max-w-4xl mx-auto">
              We&apos;re looking for our first{" "}
              <span className="text-blue-300 sm:block">{foundingLimit} founding members</span>
            </span>
          </h1>

          <p
            className="text-base sm:text-lg text-white font-medium mb-4 animate-fade-in-up max-w-2xl mx-auto [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]"
            style={{ animationDelay: "0.2s" }}
          >
            Be one of {foundingLimit} local homeowners building a trusted, long-term relationship with {BRAND_NAME}.
          </p>

          <ul
            className="flex flex-wrap items-center justify-center gap-2 mb-5 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {["Exclusive member rates", "Priority booking", "Cancel anytime"].map((benefit) => (
              <li
                key={benefit}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1 text-sm font-medium text-white"
              >
                <svg className="w-4 h-4 text-blue-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link
              href={FOUNDING_HREF}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-8 sm:px-10 py-3.5 sm:py-4 text-lg font-extrabold tracking-wide uppercase shadow-xl shadow-blue-600/40 ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Be one of the {foundingLimit}
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
              </svg>
            </Link>
          </div>
        </div>

        {/* Standard plumbing stays one tap away for anyone who just needs a
            repair — the programme invitation must not cost those enquiries. */}
        <p
          className="text-center text-sm sm:text-base text-white/90 font-medium mb-3 max-w-2xl mx-auto animate-fade-in-up [text-shadow:0_2px_14px_rgba(0,0,0,0.9)]"
          style={{ animationDelay: "0.5s" }}
        >
          Just need a plumber? Leaks, burst pipes &amp; blockages fixed today — {responseTimeShort} response across Clapham, Balham, Chelsea, Battersea &amp; Wandsworth
        </p>

        {/* CTA Buttons */}
        <div
          className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center items-stretch sm:items-center w-full max-w-4xl mx-auto mb-5 animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <a
            className="group bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg text-lg font-bold whitespace-nowrap transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-xl inline-flex items-center justify-center col-span-2 sm:col-span-1 w-full sm:w-auto"
            href={`tel:${businessPhone}`}
            onClick={() => trackPhoneCall("hero_primary")}
            aria-label={`Call now ${displayPhone}`}
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {displayPhone}
          </a>
          <a
            className="bg-white/10 backdrop-blur-md hover:bg-white/15 text-white px-4 py-3 rounded-lg text-base font-medium whitespace-nowrap transition-all duration-300 border border-white/20 inline-flex items-center justify-center w-full sm:w-auto"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Book Online
          </a>
          <ButtonWhatsApp
            variant="solid"
            label="WhatsApp"
            source="hero_whatsapp"
            className="w-full sm:w-auto px-4 py-3 rounded-lg text-base font-semibold whitespace-nowrap"
          />
        </div>
        {/* Areas We Cover: one row of small links (they keep linking to each
            area page). The response time is already in the line above. */}
        <nav
          aria-labelledby="hero-areas-title"
          className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 id="hero-areas-title" className="w-full sm:w-auto text-center text-sm font-semibold text-white/90 sm:mr-1 [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
            Areas we cover:
          </h2>
          {areasLoading
            ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <span key={index} className="h-7 w-20 rounded-full bg-white/10 animate-pulse" aria-hidden="true" />
              ))
            : (isMobile ? areas.slice(0, MOBILE_AREAS_LIMIT) : areas).map((area) => (
                <Link
                  key={area.id}
                  href={`/areas/${area.slug}`}
                  aria-label={`Emergency plumber in ${area.name} ${area.postcode}`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs sm:text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-blue-400/40 hover:bg-white/20"
                >
                  <svg className="h-3.5 w-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {area.name}
                  <span className="text-blue-200">{area.postcode}</span>
                </Link>
              ))}
        </nav>
      </div>
    </section>
  );
}
