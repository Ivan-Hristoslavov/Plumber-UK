import { useState, useEffect, useRef } from "react";
import { PricingCard } from "@/types";

// Global cache to prevent multiple API calls
let pricingCardsCache: PricingCard[] | null = null;
let cachePromise: Promise<PricingCard[]> | null = null;

export function usePricingCards() {
  const [pricingCards, setPricingCards] = useState<PricingCard[]>(pricingCardsCache || []);
  const [loading, setLoading] = useState(!pricingCardsCache);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchPricingCards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pricing-cards");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch pricing cards");
      }

      const cards = data.pricingCards || [];
      pricingCardsCache = cards; // Update cache
      setPricingCards(cards);
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
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (pricingCardsCache) {
      setPricingCards(pricingCardsCache);
      setLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise.then(data => {
        setPricingCards(data);
        setLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
      return;
    }

    // Make the API call
    cachePromise = fetch("/api/pricing-cards")
      .then(response => response.json())
      .then(data => {
        if (!data.pricingCards) {
          throw new Error("Failed to fetch pricing cards");
        }
        const cards = data.pricingCards || [];
        pricingCardsCache = cards;
        setPricingCards(cards);
        setLoading(false);
        return cards;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        cachePromise = null; // Reset promise on error
        throw err;
      });
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