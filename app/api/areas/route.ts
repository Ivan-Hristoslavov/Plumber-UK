import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: List all active areas for public website
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('admin_areas_cover')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });
  
  if (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
  }
  
  return NextResponse.json(data);
} 