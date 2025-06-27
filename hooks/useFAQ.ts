'use client';
import { useState, useEffect } from 'react';
import { FAQItem } from '@/types';

export function useFAQ(adminMode = false) {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQItems = async () => {
    try {
      setIsLoading(true);
      const url = adminMode ? '/api/faq?all=1' : '/api/faq';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch FAQ items');
      setFaqItems(data.faqItems || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addFAQItem = async (faqItem: Omit<FAQItem, 'id' | 'admin_id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faqItem),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add FAQ item');
    await fetchFAQItems();
    return data.faqItem;
  };

  const updateFAQItem = async (id: number, faqItem: Partial<FAQItem>) => {
    const res = await fetch(`/api/faq/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faqItem),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update FAQ item');
    await fetchFAQItems();
    return data.faqItem;
  };

  const deleteFAQItem = async (id: number) => {
    const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete FAQ item');
    await fetchFAQItems();
  };

  useEffect(() => { fetchFAQItems(); }, []);

  return { faqItems, isLoading, error, addFAQItem, updateFAQItem, deleteFAQItem, refetch: fetchFAQItems };
} 