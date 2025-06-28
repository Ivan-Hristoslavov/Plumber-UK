"use client";

import { useAdminProfile } from '@/hooks/useAdminProfile';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AdminProfile } from '@/types';

interface AdminProfileMarkdownProps {
  type: keyof AdminProfile;
  fallback?: string;
  className?: string;
}

export function AdminProfileMarkdown({ type, fallback = '', className }: AdminProfileMarkdownProps) {
  const { profile, loading, error } = useAdminProfile();

  if (loading) {
    return <span className={className}>{fallback}</span>;
  }

  if (error || !profile) {
    return <span className={className}>{fallback}</span>;
  }

  const value = (profile as any)[type] || fallback;
  
  if (type === 'about') {
    return <MarkdownRenderer content={value} className={className} />;
  }
  
  return <span className={className}>{value}</span>;
} 