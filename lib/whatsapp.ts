/**
 * wa.me expects a bare international number: digits only, no plus, no spaces.
 * UK numbers are stored either as "+447541777225" or in the "07541777225"
 * local form, so normalise both to the 44-prefixed international form.
 */
export function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("44")) return digits;
  if (digits.startsWith("0")) return `44${digits.slice(1)}`;

  return digits;
}

export function whatsappLink(phone: string, message?: string): string {
  const base = `https://wa.me/${whatsappNumber(phone)}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Prefilled so the first message already says where they are and what is wrong —
 * the two things needed to quote or dispatch.
 */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I need a plumber. My postcode is: \nThe problem is: ";
