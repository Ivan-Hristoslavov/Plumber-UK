"use client";

import { useEffect, useState } from "react";

import { useAdminProfile } from "@/components/AdminProfileContext";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { trackPhoneCall } from "@/components/GoogleAnalytics";
import { whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/whatsapp";

/**
 * The persistent call and WhatsApp buttons, bottom-right.
 *
 * Three things shaped the behaviour:
 *
 * - They stay hidden until the hero has scrolled past. The hero already offers
 *   Call, Book and WhatsApp, and floating buttons on top of those is exactly
 *   what made the old FloatingCTA collide with the hero CTA.
 * - They lift above the cookie banner while it is showing, measured rather than
 *   assumed — that overlap previously buried the call button entirely.
 * - Only the call button pulses. Two competing animations cancel each other
 *   out; the phone is the action worth drawing the eye to.
 */
export function FloatingActions() {
  const profile = useAdminProfile();
  const { settings } = useAdminSettings();
  const [visible, setVisible] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const measure = () => {
      const banner = document.querySelector("[data-cookie-banner]");
      setBannerHeight(banner ? banner.getBoundingClientRect().height : 0);
    };
    measure();

    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const businessPhone = profile?.phone || "+44 7541777225";
  const displayPhone = businessPhone.replace(/^\+44\s?/, "0");

  const whatsappOn = settings?.whatsappEnabled !== false;
  const whatsappNumber = (settings?.whatsappNumber as string) || businessPhone;

  return (
    <div
      style={{ bottom: `${bannerHeight + 24}px` }}
      className={`fixed right-4 sm:right-6 z-40 flex flex-col items-end gap-3 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
      }`}
    >
      {whatsappOn && whatsappNumber.trim() && (
        <a
          href={whatsappLink(whatsappNumber, WHATSAPP_DEFAULT_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackPhoneCall("floating_whatsapp")}
          aria-label="Message us on WhatsApp"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1fb855] shadow-xl shadow-black/20 ring-4 ring-white/80 dark:ring-gray-900/80 transition-colors"
        >
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.99 2.898 9.825 9.825 0 012.892 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}

      <a
        href={`tel:${businessPhone}`}
        onClick={() => trackPhoneCall("floating_call")}
        aria-label={`Call now ${displayPhone}`}
        className="call-pulse group flex items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-red-600 shadow-xl shadow-red-900/30 ring-4 ring-white/80 dark:ring-gray-900/80 transition-colors"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </a>
    </div>
  );
}
