import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: faqItems, error } = await supabase
      .from("faq_items")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching FAQ items:", error);
      return NextResponse.json({ error: "Failed to fetch FAQ items" }, { status: 500 });
    }

    return NextResponse.json({ faqItems });
  } catch (error) {
    console.error("Error in FAQ GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { question, answer, order, is_active } = body;

    // Get admin profile ID
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profile")
      .select("id")
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Admin profile not found" }, { status: 404 });
    }

    const { data: faqItem, error } = await supabase
      .from("faq_items")
      .insert({
        admin_id: adminProfile.id,
        question,
        answer,
        order: order || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating FAQ item:", error);
      return NextResponse.json({ error: "Failed to create FAQ item" }, { status: 500 });
    }

    return NextResponse.json({ faqItem });
  } catch (error) {
    console.error("Error in FAQ POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 