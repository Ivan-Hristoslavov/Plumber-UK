import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { sendEmail, getAdminRecipient } from "@/lib/sendgrid";
import { requireAdminAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";
import { buildBookingNotificationEmail } from "@/lib/email-builders";

export const dynamic = 'force-dynamic';

// GET - Fetch bookings with pagination
export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching booking count:", countError);
      return NextResponse.json(
        { error: "Failed to fetch booking count" },
        { status: 500 }
      );
    }

    // Get paginated bookings
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new booking with conflict check and email notification
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { limited } = rateLimit(`bookings-post:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const {
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      service,
      date,
      time,
      amount,
      address,
      notes
    } = body;

    // Validate required fields
    if (!customer_name || !service || !date || !time || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, service, date, time, amount" },
        { status: 400 }
      );
    }

    // Check for booking conflicts - same date and time
    const { data: existingBookings, error: conflictError } = await supabase
      .from("bookings")
      .select("id, customer_name, time")
      .eq("date", date)
      .eq("time", time)
      .in("status", ["scheduled", "pending", "confirmed"]);

    if (conflictError) {
      console.error("Error checking booking conflicts:", conflictError);
      return NextResponse.json(
        { error: "Failed to check booking availability" },
        { status: 500 }
      );
    }

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { 
          error: "Time slot already booked", 
          conflict: true,
          message: `This time slot is already booked by ${existingBookings[0].customer_name}. Please select a different time.`
        },
        { status: 409 }
      );
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          customer_id: customer_id || null,
          customer_name,
          customer_email: customer_email || null,
          customer_phone: customer_phone || null,
          service,
          date,
          time,
          amount: parseFloat(amount),
          address: address || null,
          notes: notes || null,
          status: "pending",
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: `Failed to create booking: ${bookingError.message}` },
        { status: 500 }
      );
    }

    // Send email notification to admin
    try {
      await sendBookingNotificationEmail(booking);
      console.log("Booking notification email sent successfully");
    } catch (emailError) {
      console.error("Error sending booking notification email:", emailError);
      // Don't fail the booking creation if email fails
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created successfully"
    });
  } catch (error) {
    console.error("Unexpected error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Function to send booking notification email to admin
async function sendBookingNotificationEmail(booking: any) {
  try {
    // Get admin email from database or environment
    const { email: adminEmail, source, profileError } = await getAdminRecipient();

    if (!adminEmail) {
      console.error(
        "No admin email found for booking notification — set admin_profile.email or ADMIN_EMAIL",
        profileError ? { profileError } : undefined
      );
      return;
    }
    console.log(`Booking notification recipient resolved from ${source}`);

    const { subject, text, html } = buildBookingNotificationEmail(booking);

    await sendEmail({ to: adminEmail, subject, text, html });

  } catch (error) {
    console.error("Error in sendBookingNotificationEmail:", error);
    throw error;
  }
}
