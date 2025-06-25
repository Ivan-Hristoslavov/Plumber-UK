import { NextRequest, NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";

// GET - Fetch all bookings
export async function GET() {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);

      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 },
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);

      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
