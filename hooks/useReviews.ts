'use client';
import { useState, useEffect } from 'react';
import { Review } from '@/types';

export function useReviews(adminMode = false) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const url = adminMode ? '/api/reviews?all=1' : '/api/reviews';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews');
      setReviews(data.reviews || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (review: Omit<Review, 'id' | 'is_approved' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add review');
    await fetchReviews();
    return data.review;
  };

  const approveReview = async (id: number, is_approved: boolean) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update review');
    await fetchReviews();
    return data.review;
  };

  const deleteReview = async (id: number) => {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete review');
    await fetchReviews();
  };

  useEffect(() => { fetchReviews(); }, []);

  return { reviews, isLoading, error, addReview, approveReview, deleteReview, refetch: fetchReviews };
} 