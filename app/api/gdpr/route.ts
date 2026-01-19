import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: gdpr, error } = await supabase
      .from("gdpr_policy")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching GDPR policy:", error);
      return NextResponse.json({ error: "Failed to fetch GDPR policy" }, { status: 500 });
    }

    return NextResponse.json(gdpr);
  } catch (error) {
    console.error("Error in GDPR GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // First, try to update existing GDPR policy
    const { data: existing, error: fetchError } = await supabase
      .from("gdpr_policy")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      // Update existing GDPR policy
      const { data: updatedGdpr, error: updateError } = await supabase
        .from("gdpr_policy")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating GDPR policy:", updateError);
        return NextResponse.json({ error: "Failed to update GDPR policy" }, { status: 500 });
      }

      return NextResponse.json(updatedGdpr);
    } else {
      // Create new GDPR policy
      const { data: newGdpr, error: createError } = await supabase
        .from("gdpr_policy")
        .insert({ content })
        .select()
        .single();

      if (createError) {
        console.error("Error creating GDPR policy:", createError);
        return NextResponse.json({ error: "Failed to create GDPR policy" }, { status: 500 });
      }

      return NextResponse.json(newGdpr);
    }
  } catch (error) {
    console.error("Error in GDPR PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
