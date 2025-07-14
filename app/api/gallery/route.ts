import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: galleryItems, error } = await supabase
      .from("gallery")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching gallery items:", error);
      return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
    }

    return NextResponse.json({ galleryItems });
  } catch (error) {
    console.error("Error in gallery GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      title, 
      description, 
      image_url, 
      alt_text,
      section_id,
      order, 
      is_active 
    } = body;

    // No need to get admin profile ID since gallery table doesn't have admin_id field

    const { data: galleryItem, error } = await supabase
      .from("gallery")
      .insert({
        title,
        description,
        image_url,
        alt_text,
        section_id,
        order: order || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating gallery item:", error);
      return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
    }

    return NextResponse.json({ galleryItem });
  } catch (error) {
    console.error("Error in gallery POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 