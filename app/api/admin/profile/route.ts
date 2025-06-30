import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch admin profile
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching admin profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update admin profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // First get the current profile to get the ID
    const { data: currentProfile, error: fetchError } = await supabase
      .from("admin_profile")
      .select("id")
      .single();

    if (fetchError) {
      console.error("Error fetching current profile:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch current profile" },
        { status: 500 },
      );
    }

    // Update the profile using the ID
    const { data: profile, error } = await supabase
      .from("admin_profile")
      .update(body)
      .eq("id", currentProfile.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating admin profile:", error);

      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
