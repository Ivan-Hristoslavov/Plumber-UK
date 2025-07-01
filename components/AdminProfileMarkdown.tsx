"use client";

import { useAdminProfile } from '@/components/AdminProfileContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AdminProfile } from '@/types';

interface AdminProfileMarkdownProps {
  type: keyof AdminProfile;
  fallback?: string;
  className?: string;
}

export function AdminProfileMarkdown({ type, fallback = '', className }: AdminProfileMarkdownProps) {
  const profile = useAdminProfile();

  if (!profile) {
    return <span className={className}>{fallback}</span>;
  }

  const value = (profile as any)[type] || fallback;
  
  if (type === 'about') {
    return <MarkdownRenderer content={value} className={className} />;
  }
  
  return <span className={className}>{value}</span>;
} 