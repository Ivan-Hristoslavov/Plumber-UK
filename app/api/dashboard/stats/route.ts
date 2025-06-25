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

    // Get upcoming bookings
    const { data: upcomingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        customer:customers(name, email)
      `,
      )
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(5);

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
