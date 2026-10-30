import { createClient } from "@/lib/supabase/server";

/**
 * Credentials the site is allowed to claim in search results and page copy.
 *
 * "Gas Safe registered" is a legal claim: advertising it without being on the
 * register is misleading, and the register's name is protected. So the wording
 * follows the admin settings (the same switches that drive the hero badges)
 * instead of being typed into metadata, and defaults to claiming nothing.
 */
export type PublicCredentials = {
  gasSafeRegistered: boolean;
  fullyInsured: boolean;
};

const NONE: PublicCredentials = { gasSafeRegistered: false, fullyInsured: false };

/** Settings are stored as JSON and can arrive as true, "true" or '"true"'. */
function isTrue(raw: unknown): boolean {
  let value = raw;
  for (let i = 0; i < 2 && typeof value === "string"; i++) {
    try {
      value = JSON.parse(value);
    } catch {
      break;
    }
  }
  return value === true || value === "true";
}

export async function getPublicCredentials(): Promise<PublicCredentials> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["gasSafeRegistered", "fullyInsured"]);

    if (error || !data) return NONE;

    const byKey = Object.fromEntries(data.map((row: { key: string; value: unknown }) => [row.key, row.value]));
    return {
      gasSafeRegistered: isTrue(byKey.gasSafeRegistered),
      fullyInsured: isTrue(byKey.fullyInsured),
    };
  } catch {
    return NONE;
  }
}

/**
 * A closing sentence for a meta description, with its leading space, or an
 * empty string when there is nothing to claim: " Gas Safe registered, fully insured."
 */
export function credentialsSentence(credentials: PublicCredentials): string {
  const parts: string[] = [];
  if (credentials.gasSafeRegistered) parts.push("Gas Safe registered");
  if (credentials.fullyInsured) parts.push("fully insured");
  if (parts.length === 0) return "";
  const sentence = parts.join(", ");
  return ` ${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}
