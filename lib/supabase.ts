import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          service: string
          date: string
          time: string
          status: 'scheduled' | 'completed' | 'cancelled' | 'pending'
          payment_status: 'pending' | 'paid' | 'refunded'
          amount: number
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          service: string
          date: string
          time: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'pending'
          payment_status?: 'pending' | 'paid' | 'refunded'
          amount: number
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          service?: string
          date?: string
          time?: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'pending'
          payment_status?: 'pending' | 'paid' | 'refunded'
          amount?: number
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          created_at?: string
          updated_at?: string
        }
      }
      admin_profile: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          company_name: string | null
          company_address: string | null
          bank_name: string | null
          account_number: string | null
          sort_code: string | null
          gas_safe_number: string | null
          insurance_provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          company_name?: string | null
          company_address?: string | null
          bank_name?: string | null
          account_number?: string | null
          sort_code?: string | null
          gas_safe_number?: string | null
          insurance_provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          company_name?: string | null
          company_address?: string | null
          bank_name?: string | null
          account_number?: string | null
          sort_code?: string | null
          gas_safe_number?: string | null
          insurance_provider?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 