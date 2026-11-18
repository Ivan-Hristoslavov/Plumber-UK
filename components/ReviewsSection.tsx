"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

import { useReviews } from '@/hooks/useReviews';
import { ReviewForm } from '@/components/ReviewForm';

/** Text longer than this is cut on the card, with "Read more" for the rest. */
const TEXT_CLAMP_LENGTH = 180;

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

function Stars({ rating, className = 'w-4 h-4' }: { rating: number; className?: string }) {
  return (
    <span className="flex items-center" aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`${className} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/** Locks page scroll and closes on Escape while a dialog is open. */
function useDialog(onClose: () => void) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
}

/**
 * The review form as a sheet: it slides up from the bottom on a phone, where
 * the thumb is, and sits centred on larger screens.
 */
function WriteReviewDialog({ onClose }: { onClose: () => void }) {
  useDialog(onClose);
  const focusOnMount = useCallback((node: HTMLDivElement | null) => node?.focus(), []);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" role="presentation" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        ref={focusOnMount}
        tabIndex={-1}
        className="relative flex max-h-[92vh] outline-none w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-scale-in dark:bg-gray-800 sm:max-w-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600 sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 sm:px-6 sm:pt-6">
          <div>
            <h2 id="write-review-title" className="text-xl font-bold text-gray-900 dark:text-white">Write a review</h2>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">How did we do? It takes a minute.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto">
          <ReviewForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const modalRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose} role="presentation">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" aria-hidden="true" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Review by ${review.customer_name}`}
        tabIndex={-1}
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-scale-in overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close review"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
        <div className="px-8 pt-8 pb-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-xl">{review.customer_name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 dark:text-white text-lg truncate">{review.customer_name}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed whitespace-pre-line">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}

export function ReviewsSection({ initialReviews = [] }: { initialReviews?: Review[] }) {
  const { reviews: fetchedReviews, isLoading, error } = useReviews();

  // Seeded from the server for the same reason as the FAQ: the review text is
  // page content, and it was reaching crawlers only after JavaScript ran.
  // Every review stays in the HTML (the carousel only scrolls them), where the
  // old pagination hid all but a handful.
  const reviews = fetchedReviews.length > 0 ? fetchedReviews : initialReviews;
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [writing, setWriting] = useState(false);
  const closeReview = useCallback(() => setSelectedReview(null), []);
  const closeWriting = useCallback(() => setWriting(false), []);

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  // Carousel position, for the arrow buttons' disabled state.
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setEdges({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
  }, []);
  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges, reviews.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  };

  if (isLoading && reviews.length === 0) return <div className="py-8 text-center">Loading reviews...</div>;
  if (error && reviews.length === 0) return null;

  const writeButton = (
    <button
      type="button"
      onClick={() => setWriting(true)}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </svg>
      Write a review
    </button>
  );

  return (
    <section className="py-10 sm:py-14 bg-gray-100 dark:bg-gray-900 transition-colors duration-500" id="reviews">
      {/* Old links to the separate form section still land here. */}
      <span id="leave-review" className="sr-only" />
      <div className="max-w-6xl mx-auto px-4">
        {/* Header: title and the overall score on the left, the two actions on the right. */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">What our customers say</h2>
            {reviews.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Stars rating={average} />
                <span className="font-bold text-gray-900 dark:text-white">{average.toFixed(1)}</span>
                <span>· {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {reviews.length > 1 && (
              <div className="hidden gap-2 sm:flex">
                {([-1, 1] as const).map((direction) => (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => scrollByPage(direction)}
                    disabled={direction === -1 ? edges.start : edges.end}
                    aria-label={direction === -1 ? 'Previous reviews' : 'More reviews'}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={direction === -1 ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </button>
                ))}
              </div>
            )}
            {writeButton}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="font-semibold text-gray-900 dark:text-white">No reviews yet</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Had a job done by us? Be the first to say how it went.</p>
          </div>
        ) : (
          // Swipe on a phone (the next card peeks in to show there is more),
          // arrows on larger screens. One row, whatever the number of reviews.
          <div className="-mx-4 sm:mx-0">
            <div
              ref={trackRef}
              onScroll={updateEdges}
              role="region"
              aria-roledescription="carousel"
              aria-label="Customer reviews"
              tabIndex={0}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
            >
              {reviews.map((review) => {
                const isLong = review.comment.length > TEXT_CLAMP_LENGTH;
                const displayText = isLong ? review.comment.slice(0, TEXT_CLAMP_LENGTH).trimEnd() + '…' : review.comment;

                return (
                  <article
                    key={review.id}
                    className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
                  >
                    <Stars rating={review.rating} />
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">&ldquo;{displayText}&rdquo;</p>
                    {isLong && (
                      <button
                        type="button"
                        onClick={() => setSelectedReview(review)}
                        className="mt-1 self-start text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Read more
                      </button>
                    )}
                    <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white" aria-hidden="true">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{review.customer_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedReview && <ReviewModal review={selectedReview} onClose={closeReview} />}
      {writing && <WriteReviewDialog onClose={closeWriting} />}
    </section>
  );
}
