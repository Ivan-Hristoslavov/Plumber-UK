"use client";

import { useAdminProfile } from "@/components/AdminProfileContext";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { trackPhoneCall } from "@/components/GoogleAnalytics";
import { whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/whatsapp";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.99 2.898 9.825 9.825 0 012.892 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/**
 * Shown unless an admin switches it off in Settings → Connections, since it
 * needs no setup — the number is the business phone. The optional override
 * there covers WhatsApp living on a different line.
 */
export function ButtonWhatsApp({
  variant = "solid",
  label = "WhatsApp us",
  className = "",
  source = "whatsapp",
}: {
  variant?: "solid" | "outline" | "ghost";
  label?: string;
  className?: string;
  source?: string;
}) {
  const profile = useAdminProfile();
  const { settings } = useAdminSettings();

  if (settings?.whatsappEnabled === false) return null;

  const number = (settings?.whatsappNumber as string) || profile?.phone || "+44 7541777225";
  if (!number.trim()) return null;

  const styles = {
    solid:
      "bg-[#25D366] hover:bg-[#1fb855] text-white shadow-lg shadow-[#25D366]/25 border border-transparent",
    outline:
      "bg-transparent hover:bg-[#25D366]/10 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/50",
    ghost:
      "bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm",
  }[variant];

  return (
    <a
      href={whatsappLink(number, WHATSAPP_DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackPhoneCall(source)}
      aria-label={label || "Message us on WhatsApp"}
      className={`inline-flex items-center justify-center font-semibold transition-colors ${
        label ? "gap-2 rounded-xl px-5 py-3" : "rounded-full"
      } ${styles} ${className}`}
    >
      <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
      {label}
    </a>
  );
}
