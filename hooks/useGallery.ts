import { useState, useEffect } from "react";
import { GalleryItem } from "@/types";

export function useGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gallery");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch gallery items");
      }

      setGalleryItems(data.galleryItems || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addGalleryItem = async (itemData: Omit<GalleryItem, "id" | "admin_id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add gallery item");
      }

      setGalleryItems(prev => [...prev, data.galleryItem]);
      return data.galleryItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const updateGalleryItem = async (id: number, itemData: Partial<GalleryItem>) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update gallery item");
      }

      setGalleryItems(prev =>
        prev.map(item => (item.id === id ? data.galleryItem : item))
      );
      return data.galleryItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deleteGalleryItem = async (id: number) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete gallery item");
      }

      setGalleryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  return {
    galleryItems,
    loading,
    error,
    fetchGalleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  };
} 