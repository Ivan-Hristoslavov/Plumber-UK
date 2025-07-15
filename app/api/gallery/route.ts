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
      before_image_url,
      after_image_url,
      image_url, // fallback for compatibility
      project_type,
      location,
      completion_date,
      section_id,
      order, 
      is_active,
      is_featured
    } = body;

    // Use before_image_url and after_image_url, or fallback to image_url
    const beforeUrl = before_image_url || image_url;
    const afterUrl = after_image_url || image_url;

    const { data: galleryItem, error } = await supabase
      .from("gallery")
      .insert({
        title,
        description,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        project_type,
        location,
        completion_date,
        section_id,
        order: order || 0,
        is_active: is_active !== false,
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

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      id,
      title, 
      description, 
      before_image_url,
      after_image_url,
      project_type,
      location,
      completion_date,
      section_id,
      order, 
      is_active,
      is_featured
    } = body;

    const { data: galleryItem, error } = await supabase
      .from("gallery")
      .update({
        title,
        description,
        before_image_url,
        after_image_url,
        project_type,
        location,
        completion_date,
        section_id,
        order: order || 0,
        is_active: is_active !== false,
        is_featured: is_featured || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating gallery item:", error);
      return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
    }

    return NextResponse.json({ galleryItem });
  } catch (error) {
    console.error("Error in gallery PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gallery item ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting gallery item:", error);
      return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in gallery DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 