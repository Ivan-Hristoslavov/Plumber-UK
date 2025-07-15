"use client";
import { useReviews } from "@/hooks/useReviews";
import { useToast, ToastMessages } from "@/components/Toast";

export function AdminReviewsManager() {
  const { reviews, isLoading, error, approveReview, deleteReview, refetch } = useReviews(true);
  const { showSuccess, showError } = useToast();

  if (isLoading) return <div className="py-8 text-center">Loading reviews...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reviews Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length === 0 && (
          <div className="col-span-full text-gray-500 text-center">No reviews yet.</div>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{review.customer_name}</span>
                <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center mb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                ))}
              </div>
              <div className="text-gray-700 dark:text-gray-200 mb-2">{review.comment}</div>
              {review.customer_email && <div className="text-xs text-gray-400">{review.customer_email}</div>}
            </div>
            <div className="flex gap-2 mt-4">
              {!review.is_approved && (
                <button
                  onClick={async () => { await approveReview(Number(review.id), true); }}
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Approve
                </button>
              )}
              {review.is_approved && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">Approved</span>
              )}
              <button
                onClick={async () => { if(confirm('Delete this review?')) await deleteReview(Number(review.id)); }}
                className="px-4 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 