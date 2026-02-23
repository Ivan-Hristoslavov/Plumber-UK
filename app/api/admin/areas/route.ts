import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET: List all areas
export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('admin_areas_cover')
    .select('*')
    .order('order', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Create new area
export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const supabase = createClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('admin_areas_cover')
    .insert([body])
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// PUT: Update area (expects id in body)
export async function PUT(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const supabase = createClient();
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('admin_areas_cover')
    .update(body)
    .eq('id', body.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE: Delete area (expects id in body)
export async function DELETE(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const supabase = createClient();
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const { error } = await supabase
    .from('admin_areas_cover')
    .delete()
    .eq('id', body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 