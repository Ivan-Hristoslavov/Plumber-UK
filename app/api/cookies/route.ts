import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: cookies, error } = await supabase
      .from("cookies_policy")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching cookies policy:", error);
      return NextResponse.json({ error: "Failed to fetch cookies policy" }, { status: 500 });
    }

    return NextResponse.json(cookies);
  } catch (error) {
    console.error("Error in cookies GET:", error);
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

    // First, try to update existing cookies policy
    const { data: existing, error: fetchError } = await supabase
      .from("cookies_policy")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      // Update existing cookies policy
      const { data: updatedCookies, error: updateError } = await supabase
        .from("cookies_policy")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating cookies policy:", updateError);
        return NextResponse.json({ error: "Failed to update cookies policy" }, { status: 500 });
      }

      return NextResponse.json(updatedCookies);
    } else {
      // Create new cookies policy
      const { data: newCookies, error: createError } = await supabase
        .from("cookies_policy")
        .insert({ content })
        .select()
        .single();

      if (createError) {
        console.error("Error creating cookies policy:", createError);
        return NextResponse.json({ error: "Failed to create cookies policy" }, { status: 500 });
      }

      return NextResponse.json(newCookies);
    }
  } catch (error) {
    console.error("Error in cookies PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
