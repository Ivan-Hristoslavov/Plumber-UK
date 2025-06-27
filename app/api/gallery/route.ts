import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: galleryItems, error } = await supabase
      .from("gallery_items")
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
      before_image_url, 
      after_image_url, 
      project_type, 
      location, 
      completion_date, 
      order, 
      is_featured 
    } = body;

    // Get admin profile ID
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profile")
      .select("id")
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Admin profile not found" }, { status: 404 });
    }

    const { data: galleryItem, error } = await supabase
      .from("gallery_items")
      .insert({
        admin_id: adminProfile.id,
        title,
        description,
        before_image_url,
        after_image_url,
        project_type,
        location,
        completion_date,
        order: order || 0,
        is_featured: is_featured || false,
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