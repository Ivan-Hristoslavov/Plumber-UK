import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// PUT: update a service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const { id } = await params;
  const supabase = createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('services')
    .update({
      name: body.name,
      description: body.description ?? null,
      price: body.price ?? null,
      duration_minutes: body.duration_minutes ?? null,
      category: body.category ?? null,
      order: body.order ?? 0,
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE: remove a service outright. Switching is_active off is usually the
// better move — it keeps the row and its URL recoverable.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const { id } = await params;
  const supabase = createClient();
  const { error } = await supabase.from('services').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
