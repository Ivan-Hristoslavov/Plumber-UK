import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

// GET - Fetch admin profile
export async function GET() {
  try {
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching admin profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update admin profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .update(body)
      .select()
      .single()

    if (error) {
      console.error('Error updating admin profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 