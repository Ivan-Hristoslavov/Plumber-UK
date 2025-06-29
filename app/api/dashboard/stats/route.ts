import { NextResponse } from "next/server";

import { supabase } from "../../../../lib/supabase";

// GET - Fetch dashboard statistics
export async function GET() {
  try {
    // Get stats from the view
    const { data: stats, error: statsError } = await supabase
      .from("dashboard_stats")
      .select("*")
      .single();

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 400 });
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (activityError) {
      return NextResponse.json(
        { error: activityError.message },
        { status: 400 },
      );
    }

    // Get upcoming bookings from today onwards (including today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const { data: upcomingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        customer:customers(name, email)
      `,
      )
      .gte("date", today.toISOString().split("T")[0]) // From today onwards
      .in("status", ["pending", "scheduled"]) // Only pending and scheduled bookings
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(10);

    if (bookingsError) {
      return NextResponse.json(
        { error: bookingsError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      stats,
      recentActivity,
      upcomingBookings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
