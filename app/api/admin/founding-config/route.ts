import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/api-auth";
import { buildFoundingConfig, validateFoundingConfigInput } from "@/lib/founding";
import {
  PLACE_TAKING_STATUSES,
  createMembershipsClient,
  getFoundingConfig,
  isMissingTableError,
} from "@/lib/founding-server";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const config = await getFoundingConfig();
  return NextResponse.json({ config }, { headers: NO_STORE });
}

/**
 * Save the Founding 100 settings the business edits: prices, hourly rates, the
 * number of places, which plans can be joined, and the two opening-hours
 * details. Names, wording and the terms text are deliberately not editable.
 */
export async function PUT(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const checked = validateFoundingConfigInput(body);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });

  try {
    const supabase = createMembershipsClient();

    // Never shrink the programme below the people already in it.
    const { count, error: countError } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .in("status", [...PLACE_TAKING_STATUSES]);

    if (!countError && count !== null && checked.value.limit < count) {
      return NextResponse.json(
        { error: `Places cannot be lower than the ${count} active members. Pause or cancel members first.` },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from("founding_settings")
      .upsert({ id: true, config: checked.value, updated_at: new Date().toISOString() });

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json(
          { error: "The settings table has not been created yet. Run the settings migration first.", setupRequired: true },
          { status: 503 },
        );
      }
      console.error("Admin founding config: save failed", error.code, error.message);
      return NextResponse.json({ error: "Failed to save the settings." }, { status: 500 });
    }

    // Public pages are cached for a minute; show the change straight away.
    for (const path of ["/", "/founding-100", "/founding-100/terms"]) revalidatePath(path);

    return NextResponse.json({ config: buildFoundingConfig(checked.value) });
  } catch (error) {
    console.error("Admin founding config: unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
