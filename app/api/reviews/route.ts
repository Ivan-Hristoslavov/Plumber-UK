import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all');
  
  let query = supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
    
  // If not admin mode, only get approved reviews
  if (!all) {
    query = query.eq("is_approved", true);
  }
  
  const { data: reviews, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  const { name, email, message, rating } = body;
  if (!name || !message || typeof rating !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("reviews")
    .insert({ name, email, message, rating })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ review: data });
} 