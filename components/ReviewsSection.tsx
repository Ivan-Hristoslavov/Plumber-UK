import { useReviews } from '@/hooks/useReviews';

export function ReviewsSection() {
  const { reviews, isLoading, error } = useReviews();

  if (isLoading) return <div className="py-8 text-center">Loading reviews...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;

  return (
    <section className="py-20 bg-white dark:bg-gray-900" id="reviews">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Customer Reviews
          </div>
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">What Our Clients Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real feedback from real customers about our plumbing services
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Reviews Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Be the first to share your experience with our plumbing services! Your feedback helps us improve and helps other customers make informed decisions.
              </p>
              <a
                href="#leave-review"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("leave-review")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                Write the First Review
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0 flex flex-col items-center md:items-start w-32">
                  <div className="flex items-center mb-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">{review.customer_name}</div>
                  <div className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex-1 text-gray-700 dark:text-gray-200 text-lg">{review.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
} 