import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

// GET - Fetch admin settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    let query = supabase.from('admin_settings').select('*')
    
    if (key) {
      query = query.eq('key', key).single()
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching admin settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update admin setting
export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    
    const { data: setting, error } = await supabase
      .from('admin_settings')
      .upsert({ key, value })
      .select()
      .single()

    if (error) {
      console.error('Error saving admin setting:', error)
      return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
    }

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 