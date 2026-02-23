import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('day_off_periods')
    .select('*')
    .order('start_date', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('CDN-Cache-Control', 'no-store');
  response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
  return response;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('day_off_periods')
    .insert([body])
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// PUT: Update day off period (expects id in body)
export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('day_off_periods')
    .update(body)
    .eq('id', body.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE: Delete day off period (expects id in body)
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const { error } = await supabase
    .from('day_off_periods')
    .delete()
    .eq('id', body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 