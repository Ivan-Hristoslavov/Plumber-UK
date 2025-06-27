import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  company_address: string;
  gas_safe_number: string;
  bank_name: string;
  account_number: string;
  sort_code: string;
  insurance_provider: string;
  about?: string;
  years_of_experience?: string;
  specializations?: string;
  certifications?: string;
  service_areas?: string;
  response_time?: string;
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
  id: number;
  admin_id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: number;
  admin_id: string;
  title: string;
  description?: string;
  before_image_url: string;
  after_image_url: string;
  project_type?: string;
  location?: string;
  completion_date?: string;
  section_id?: number;
  order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: number;
  name: string;
  email?: string;
  message: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
};

export type FAQItem = {
  id: number;
  admin_id: string;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
