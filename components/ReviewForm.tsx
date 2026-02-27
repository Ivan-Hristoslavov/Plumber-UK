"use client";
import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { useToast, ToastMessages } from "@/components/Toast";

export function ReviewForm() {
  const { addReview } = useReviews();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitResult, setSubmitResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setSubmitResult(null);

    try {
      if (!form.name || !form.message) {
        showError(
          ToastMessages.general.validationError.title,
          "Name and message are required."
        );
        setSubmitting(false);
        return;
      }

      await addReview({
        customer_name: form.name,
        customer_email: form.email,
        rating: form.rating,
        title: "",
        comment: form.message,
        message: form.message,
        is_featured: false,
      });
      showSuccess(
        ToastMessages.reviews.submitted.title,
        ToastMessages.reviews.submitted.message
      );

      setSubmitResult({
        success: true,
        message:
          "Thank you for your review! Your feedback has been submitted and is awaiting approval. It will be published on our website once reviewed by our team.",
      });

      setTimeout(() => {
        setSubmitResult(null);
        setForm({ name: "", email: "", message: "", rating: 5 });
        setSuccess("");
        setError("");
      }, 5000);
    } catch (err: any) {
      showError(
        ToastMessages.reviews.error.title,
        err.message || ToastMessages.reviews.error.message
      );
      setSubmitResult({
        success: false,
        message:
          "There was an error submitting your review. Please try again or contact us directly.",
      });

      setTimeout(() => {
        setSubmitResult(null);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitResult) {
    return (
      <section
        className="py-12 sm:py-16 md:py-20 bg-gray-100 dark:bg-gray-900 transition-colors duration-500"
        id="leave-review"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] w-full rounded-2xl sm:rounded-3xl shadow-lg bg-white dark:bg-gray-900 p-5 sm:p-8 transition-colors duration-300 ${submitResult.success ? "border-green-400" : "border-red-400"} border-2`}
          >
            <svg
              className={`w-14 h-14 sm:w-20 sm:h-20 mb-4 sm:mb-8 ${submitResult.success ? "text-green-500" : "text-red-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {submitResult.success ? (
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              ) : (
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              )}
            </svg>
            <h2
              className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-6 text-center ${submitResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
            >
              {submitResult.success ? "Review Submitted!" : "Submission Error"}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 text-center mb-3 sm:mb-4 max-w-2xl leading-relaxed">
              {submitResult.message}
            </p>
            {submitResult.success && (
              <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                This form will reset in 5 seconds
              </div>
            )}
            <div className="w-full max-w-xs sm:max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mb-3 sm:mb-4">
              <div
                className={`h-1.5 sm:h-2 rounded-full ${submitResult.success ? "bg-green-500" : "bg-red-500"} animate-pulse`}
                style={{ width: "100%" }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 text-center">
              {submitResult.success
                ? "Thank you for choosing our services!"
                : "Please try again or contact us for assistance."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-12 sm:py-16 md:py-20 bg-gray-100 dark:bg-gray-900 transition-colors duration-500"
      id="leave-review"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-medium mb-3 sm:mb-6">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Share Your Experience
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors duration-300">
            Leave a Review
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Help others by sharing your experience with our plumbing services
          </p>
        </div>

        {/* Review Form */}
        <div className="relative">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300"
          >
            {success && (
              <div className="mb-5 sm:mb-8 p-3 sm:p-4 bg-green-500/20 dark:bg-green-400/20 border border-green-400/40 dark:border-green-300/40 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 dark:text-green-200 mr-2 sm:mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <p className="text-sm sm:text-base text-green-200 dark:text-green-100 font-medium">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-5 sm:mb-8 p-3 sm:p-4 bg-red-500/20 dark:bg-red-400/20 border border-red-400/30 dark:border-red-300/30 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 dark:text-red-300 mr-2 sm:mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <p className="text-sm sm:text-base text-red-200 dark:text-red-100 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Name Field */}
              <div>
                <label htmlFor="review-name" className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 transition-colors duration-300">
                  Your Name *
                </label>
                <div className="relative">
                  <input
                    id="review-name"
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium"
                    placeholder="Enter your full name"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="review-email" className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 transition-colors duration-300">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <input
                    id="review-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="mt-5 sm:mt-6 md:mt-8">
              <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors duration-300">
                Your Rating
              </label>
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setForm((f) => ({ ...f, rating: i + 1 }))}
                    className="group transition-transform duration-200 hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${i + 1} stars`}
                  >
                    <svg
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 drop-shadow-sm transition-colors duration-200 ${
                        form.rating > i
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600 group-hover:text-yellow-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  </button>
                ))}
                <div className="ml-2 sm:ml-3 text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {form.rating}/5
                  </div>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="mt-5 sm:mt-6 md:mt-8">
              <label htmlFor="review-message" className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 transition-colors duration-300">
                Your Review *
              </label>
              <div className="relative">
                <textarea
                  id="review-message"
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium resize-none sm:rows-6"
                  placeholder="Tell us about your experience with our plumbing services..."
                  required
                />
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 sm:mt-8 md:mt-10 text-center">
              <button
                type="submit"
                disabled={submitting}
                className="group relative inline-flex items-center justify-center px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white font-bold text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2 sm:mr-3" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-transform duration-300 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    Submit Review
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Your review will be published after approval by our team
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
