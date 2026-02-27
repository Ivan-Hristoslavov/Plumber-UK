"use client";

import { useAdminProfile } from '@/hooks/useAdminProfile';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { AdminProfile } from '@/types';
import { useState, useEffect } from 'react';

interface ListManagerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  description?: string;
}

function ListManager({ value, onChange, placeholder, label, description }: ListManagerProps) {
  const [newItem, setNewItem] = useState('');

  // Parse the current value into items
  const items = value
    .split(/[.,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...items, newItem.trim()];
      onChange(updatedItems.join('. '));
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems.join('. '));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {/* Badge-style items */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-start gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-medium border border-blue-200 dark:border-blue-800 max-w-full"
            >
              <span className="max-w-[240px] sm:max-w-[320px] break-words text-left leading-snug">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400 transition-colors touch-manipulation"
                aria-label={`Remove ${item}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 min-w-0 px-4 py-3 min-h-[44px] text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
          type="text"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          type="button"
          onClick={handleAddItem}
          disabled={!newItem.trim()}
          className="min-h-[44px] px-4 py-3 sm:px-5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2 touch-manipulation font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add</span>
        </button>
      </div>

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

interface AdminProfileDataProps {
  type: keyof AdminProfile | 'response_time' | 'company_status' | 'years_of_experience';
  fallback?: string;
  className?: string;
  asList?: boolean;
}

export function AdminProfileData({ type, fallback = '', className, asList = false }: AdminProfileDataProps) {
  const { profile } = useAdminProfile();
  const { settings: adminSettings } = useAdminSettings();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle special cases that should come from admin settings
  if (type === 'response_time') {
    // Always use fallback during SSR to prevent hydration mismatch
    const rawValue = fallback || '45-minute';
    
    // Normalize the value - remove any existing "minutes" or "minute" text
    const normalizedValue = String(rawValue).replace(/\s*(minutes?|mins?)\s*/gi, '').trim() || '45';
    // Format with capitalized "Minutes Response Time"
    const formattedValue = `${normalizedValue} Minutes Response Time`;
    return <span className={className}>{formattedValue}</span>;
  }

  if (!profile && !adminSettings) {
    return <span className={className}>{fallback}</span>;
  }

  // Handle company_status from admin settings
  if (type === 'company_status') {
    const value = adminSettings?.companyStatus || fallback;
    return <span className={className}>{value}</span>;
  }

  // Handle years_of_experience to ensure it includes "Years"
  if (type === 'years_of_experience') {
    const value = profile?.years_of_experience || fallback;
    // If the value doesn't already include "Years", add it
    const displayValue = value && !value.toLowerCase().includes('years') 
      ? `${value} Years` 
      : value;
    // During SSR/initial render, always use fallback to prevent hydration mismatch
    // After mount, use actual data
    const finalDisplayValue = isMounted ? displayValue : (fallback || '10+ Years');
    return <span className={className}>{finalDisplayValue}</span>;
  }

  // Handle list-based fields (certifications and specializations) with "Show more" when > 4
  if (asList && (type === 'certifications' || type === 'specializations')) {
    const value = (profile as any)?.[type] || fallback;

    if (!value) {
      return <span className={className}>{fallback}</span>;
    }

    // Split by common delimiters and clean up
    const items = value
      .split(/[.,;]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    if (items.length === 0) {
      return <span className={className}>{fallback}</span>;
    }

    const maxVisible = 4;
    const visibleItems = items.slice(0, maxVisible);
    const extraItems = items.slice(maxVisible);
    const hasMore = extraItems.length > 0;

    const listItem = (item: string, index: number) => (
      <span
        key={index}
        className="inline-block max-w-[280px] sm:max-w-[360px] px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-medium border border-blue-200 dark:border-blue-800 break-words"
      >
        {item}
      </span>
    );

    if (!hasMore) {
      return (
        <div className={`${className} flex flex-wrap gap-2`}>
          {items.map((item: string, index: number) => listItem(item, index))}
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="flex flex-wrap gap-2">
          {visibleItems.map((item: string, index: number) => listItem(item, index))}
        </div>
        <details className="group/details mt-2">
          <summary className="list-expand-summary flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:underline text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded px-1 py-0.5 touch-manipulation">
            <span>Show {extraItems.length} more</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-open/details:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="flex flex-wrap gap-2 mt-2">
            {extraItems.map((item: string, index: number) => listItem(item, maxVisible + index))}
          </div>
        </details>
      </div>
    );
  }

  // Handle regular profile fields
  const value = (profile as any)?.[type] || fallback;
  return <span className={className}>{value}</span>;
}

export { ListManager }; 