/**
 * "FixMyLeak" is the customer-facing brand and matches the domain; the
 * admin profile's `company_name` holds the registered entity ("PZ Plumbing
 * Ltd"), which belongs on invoices, legal pages and the footer's company line
 * — not in page titles, where two competing names weakened recall.
 */
export const BRAND_NAME = "FixMyLeak";

/** The registered entity, for legal and billing contexts. */
export function legalName(companyName?: string | null): string {
  return companyName?.trim() || BRAND_NAME;
}
