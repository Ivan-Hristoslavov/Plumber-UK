import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id } = await params;
    
    const { 
      title, 
      description, 
      before_image_url, 
      after_image_url, 
      project_type, 
      location, 
      completion_date, 
      section_id,
      order, 
      is_featured 
    } = body;

    const { data: galleryItem, error } = await supabase
      .from("gallery_items")
      .update({
        title,
        description,
        before_image_url,
        after_image_url,
        project_type,
        location,
        completion_date,
        section_id,
        order,
        is_featured,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    const { error } = await supabase
      .from("gallery_items")
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