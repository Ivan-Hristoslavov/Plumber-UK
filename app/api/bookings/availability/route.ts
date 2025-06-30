import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Check time slot availability for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Get all booked time slots for the specified date
    const { data: bookedSlots, error } = await supabase
      .from("bookings")
      .select("time, customer_name, status")
      .eq("date", date)
      .in("status", ["scheduled", "pending", "confirmed"]);

    if (error) {
      console.error("Error fetching booked slots:", error);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    // Return the booked time slots
    const bookedTimes = bookedSlots?.map(slot => ({
      time: slot.time,
      customer: slot.customer_name,
      status: slot.status
    })) || [];

    return NextResponse.json({
      date,
      bookedTimes,
      message: `Found ${bookedTimes.length} booked time slots for ${date}`
    });
  } catch (error) {
    console.error("Unexpected error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 