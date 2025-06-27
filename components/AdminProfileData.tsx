"use client";

import { useAdminProfile } from '@/hooks/useAdminProfile';
import { AdminProfile } from '@/types';

interface AdminProfileDataProps {
  type: keyof AdminProfile;
  fallback?: string;
  className?: string;
}

export function AdminProfileData({ type, fallback = '', className }: AdminProfileDataProps) {
  const { profile, loading, error } = useAdminProfile();

  if (loading) {
    return <span className={className}>{fallback}</span>;
  }

  if (error || !profile) {
    return <span className={className}>{fallback}</span>;
  }

  const value = (profile as any)[type] || fallback;
  return <span className={className}>{value}</span>;
} 