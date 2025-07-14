import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  company_name?: string;
  company_address?: string;
  about?: string;
  bank_name?: string;
  account_number?: string;
  sort_code?: string;
  gas_safe_number?: string;
  insurance_provider?: string;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customer_type: 'individual' | 'company';
  company_name?: string;
  vat_number?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  service: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  payment_status: 'pending' | 'paid' | 'refunded';
  amount: number;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  booking_id?: string;
  customer_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  sent_date?: string;
  paid_date?: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_vat_number?: string;
  notes?: string;
  image_attachments?: any; // JSONB field
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  booking_id?: string;
  customer_id?: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'cheque';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_date: string;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type PricingCard = {
  id: number;
  admin_id: string;
  title: string;
  subtitle?: string;
  table_headers: string[];
  table_rows: Record<string, string>[];
  notes: PricingCardNote[];
  order: number;
  created_at: string;
  updated_at: string;
};

export type PricingCardTableRow = Record<string, string>;

export type PricingCardNote = {
  icon?: string;
  text: string;
  color?: string;
};

export type GallerySection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: string;
  section_id?: string;
  title: string;
  description?: string;
  image_url: string;
  alt_text?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  title?: string;
  comment: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  is_active: boolean;
  category?: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceArea = {
  id: string;
  area_name: string;
  description?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export type DayOffPeriod = {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_type?: 'weekly' | 'monthly' | 'yearly';
  show_banner: boolean;
  banner_message?: string;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  activity_type: 'booking_created' | 'booking_updated' | 'payment_received' | 'invoice_sent' | 'customer_added';
  entity_type: 'booking' | 'payment' | 'invoice' | 'customer';
  entity_id: string;
  message: string;
  metadata?: any; // JSONB field
  created_at: string;
};