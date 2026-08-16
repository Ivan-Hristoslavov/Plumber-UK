import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET: every service, including inactive ones — the admin needs to see what is
// switched off in order to switch it back on. The public /api/services returns
// only active rows.
export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: create a service
export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const supabase = createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('services')
    .insert([
      {
        name: body.name,
        description: body.description ?? null,
        price: body.price ?? null,
        duration_minutes: body.duration_minutes ?? null,
        category: body.category ?? null,
        order: body.order ?? 0,
        is_active: body.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
