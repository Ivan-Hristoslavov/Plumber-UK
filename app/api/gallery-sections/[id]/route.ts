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
    
    const { name, description, color, order, is_active } = body;

    const { data: gallerySection, error } = await supabase
      .from("gallery_sections")
      .update({
        name,
        description,
        color,
        order,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating gallery section:", error);
      return NextResponse.json({ error: "Failed to update gallery section" }, { status: 500 });
    }

    return NextResponse.json({ gallerySection });
  } catch (error) {
    console.error("Error in gallery section PUT:", error);
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
      .from("gallery_sections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting gallery section:", error);
      return NextResponse.json({ error: "Failed to delete gallery section" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in gallery section DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 