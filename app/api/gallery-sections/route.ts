import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: gallerySections, error } = await supabase
      .from("gallery_sections")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching gallery sections:", error);
      return NextResponse.json({ error: "Failed to fetch gallery sections" }, { status: 500 });
    }

    return NextResponse.json({ gallerySections });
  } catch (error) {
    console.error("Error in gallery sections GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { name, description, color, order, is_active } = body;

    // Get admin profile ID
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profile")
      .select("id")
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Admin profile not found" }, { status: 404 });
    }

    const { data: gallerySection, error } = await supabase
      .from("gallery_sections")
      .insert({
        admin_id: adminProfile.id,
        name,
        description,
        color: color || "#3B82F6",
        order: order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating gallery section:", error);
      return NextResponse.json({ error: "Failed to create gallery section" }, { status: 500 });
    }

    return NextResponse.json({ gallerySection });
  } catch (error) {
    console.error("Error in gallery sections POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 