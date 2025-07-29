"use client";

import { useAdminProfile } from '@/hooks/useAdminProfile';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { AdminProfile } from '@/types';

interface AdminProfileDataProps {
  type: keyof AdminProfile | 'response_time' | 'company_status';
  fallback?: string;
  className?: string;
}

export function AdminProfileData({ type, fallback = '', className }: AdminProfileDataProps) {
  const { profile } = useAdminProfile();
  const { settings: adminSettings } = useAdminSettings();

  if (!profile && !adminSettings) {
    return <span className={className}>{fallback}</span>;
  }

  // Handle special cases that should come from admin settings
  if (type === 'response_time') {
    const value = adminSettings?.responseTime || profile?.response_time || fallback;
    return <span className={className}>{value}</span>;
  }

  // Handle company_status from admin settings
  if (type === 'company_status') {
    const value = adminSettings?.companyStatus || fallback;
    return <span className={className}>{value}</span>;
  }

  // Handle regular profile fields
  const value = (profile as any)?.[type] || fallback;
  return <span className={className}>{value}</span>;
} 