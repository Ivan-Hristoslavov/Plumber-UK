'use client';

import { useState, useEffect } from 'react';
import { GallerySection } from '@/types';

export function useGallerySections() {
  const [gallerySections, setGallerySections] = useState<GallerySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGallerySections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gallery-sections');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch gallery sections');
      }

      setGallerySections(data.gallerySections || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching gallery sections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addGallerySection = async (sectionData: Partial<GallerySection>) => {
    try {
      const response = await fetch('/api/gallery-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add gallery section');
      }

      await fetchGallerySections();
      return data.gallerySection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateGallerySection = async (id: number, sectionData: Partial<GallerySection>) => {
    try {
      const response = await fetch(`/api/gallery-sections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update gallery section');
      }

      await fetchGallerySections();
      return data.gallerySection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteGallerySection = async (id: number) => {
    try {
      const response = await fetch(`/api/gallery-sections/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete gallery section');
      }

      await fetchGallerySections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchGallerySections();
  }, []);

  return {
    gallerySections,
    isLoading,
    error,
    addGallerySection,
    updateGallerySection,
    deleteGallerySection,
    refetch: fetchGallerySections,
  };
} 