import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('order', { ascending: true })
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const { name, description, price, icon, service_type, order } = body;

    // Get admin profile
    const { data: adminProfile } = await supabase
      .from('admin_profile')
      .select('id')
      .single();

    if (!adminProfile) {
      return NextResponse.json({ error: 'Admin profile not found' }, { status: 404 });
    }

    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        admin_id: adminProfile.id,
        name,
        description,
        price,
        icon,
        service_type,
        order: order || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 