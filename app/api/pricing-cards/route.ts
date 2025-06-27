import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: pricingCards, error } = await supabase
      .from("pricing_cards")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching pricing cards:", error);
      return NextResponse.json({ error: "Failed to fetch pricing cards" }, { status: 500 });
    }

    return NextResponse.json({ pricingCards });
  } catch (error) {
    console.error("Error in pricing cards GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { title, subtitle, table_headers, table_rows, notes, order } = body;

    // Get admin profile ID (assuming there's only one admin)
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profile")
      .select("id")
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: "Admin profile not found" }, { status: 404 });
    }

    const { data: pricingCard, error } = await supabase
      .from("pricing_cards")
      .insert({
        admin_id: adminProfile.id,
        title,
        subtitle,
        table_headers: table_headers || ["Column 1", "Column 2", "Column 3"],
        table_rows: table_rows || [],
        notes: notes || [],
        order: order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating pricing card:", error);
      return NextResponse.json({ error: "Failed to create pricing card" }, { status: 500 });
    }

    return NextResponse.json({ pricingCard });
  } catch (error) {
    console.error("Error in pricing cards POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 