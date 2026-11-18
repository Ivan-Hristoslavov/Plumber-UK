"use client";

import { useEffect, useRef, useState } from "react";

import { useReviews } from "@/hooks/useReviews";
import { ToastMessages, useToast } from "@/components/Toast";

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z";

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const FIELD =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white";
const LABEL = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

/**
 * The "leave a review" form. It lives in a dialog opened from the reviews
 * section rather than as its own section, so the page carries one button
 * instead of a full-height form most visitors never use.
 */
export function ReviewForm({ onClose }: { onClose: () => void }) {
  const { addReview } = useReviews();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  // Start typing straight away on a computer. On a phone this would pop the
  // keyboard over the rating before the visitor has seen the form.
  useEffect(() => {
    if (window.matchMedia("(min-width: 640px)").matches) nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.message.trim()) {
      setError("Please add your name and a few words about the job.");
      return;
    }

    setSubmitting(true);
    try {
      await addReview({
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        rating: form.rating,
        title: "",
        comment: form.message.trim(),
        message: form.message.trim(),
        is_featured: false,
      });
      showSuccess(ToastMessages.reviews.submitted.title, ToastMessages.reviews.submitted.message);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ToastMessages.reviews.error.message;
      showError(ToastMessages.reviews.error.title, message);
      setError("We could not send your review. Please try again, or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="px-6 py-10 text-center" role="status">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thank you!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600 dark:text-gray-300">
          Your review has been sent. It will appear on the site once our team has checked it.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
      {/* Rating first: it is the one-tap part, and it sets the tone for the rest. */}
      <fieldset>
        <legend className={LABEL}>Your rating</legend>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setForm((f) => ({ ...f, rating: i + 1 }))}
              aria-label={`${i + 1} star${i ? "s" : ""}`}
              aria-pressed={form.rating === i + 1}
              className="rounded-lg p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg
                className={`h-9 w-9 ${form.rating > i ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d={STAR_PATH} />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{RATING_WORDS[form.rating]}</span>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className={LABEL}>
            Your name
          </label>
          <input
            ref={nameRef}
            id="review-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={FIELD}
            placeholder="e.g. Sarah from Clapham"
            required
          />
        </div>
        <div>
          <label htmlFor="review-email" className={LABEL}>
            Email <span className="font-normal text-gray-500 dark:text-gray-400">(optional, not shown)</span>
          </label>
          <input
            id="review-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={FIELD}
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="review-message" className={LABEL}>
          Your review
        </label>
        <textarea
          id="review-message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          rows={4}
          maxLength={2000}
          className={`${FIELD} resize-none`}
          placeholder="What did we fix, and how did it go?"
          required
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">Published after a quick check by our team.</p>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send review"}
        </button>
      </div>
    </form>
  );
}
