import { useState, useEffect } from "react";
import { PricingCard } from "@/types";

export function usePricingCards() {
  const [pricingCards, setPricingCards] = useState<PricingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricingCards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pricing-cards");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch pricing cards");
      }

      setPricingCards(data.pricingCards || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPricingCards([]);
    } finally {
      setLoading(false);
    }
  };

  const addPricingCard = async (cardData: Omit<PricingCard, "id" | "admin_id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/pricing-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add pricing card");
      }

      setPricingCards(prev => [...prev, data.pricingCard]);
      return data.pricingCard;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const updatePricingCard = async (id: number, cardData: Partial<PricingCard>) => {
    try {
      const response = await fetch(`/api/pricing-cards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update pricing card");
      }

      setPricingCards(prev =>
        prev.map(card => (card.id === id ? data.pricingCard : card))
      );
      return data.pricingCard;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deletePricingCard = async (id: number) => {
    try {
      const response = await fetch(`/api/pricing-cards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete pricing card");
      }

      setPricingCards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    fetchPricingCards();
  }, []);

  return {
    pricingCards,
    loading,
    error,
    fetchPricingCards,
    addPricingCard,
    updatePricingCard,
    deletePricingCard,
  };
} 