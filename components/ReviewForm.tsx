"use client";
import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';

export function ReviewForm() {
  const { addReview } = useReviews();
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (!form.name || !form.message) {
        setError('Name and message are required.');
        setSubmitting(false);
        return;
      }
      await addReview(form);
      setSuccess('Thank you for your review! It will appear after approval.');
      setForm({ name: '', email: '', message: '', rating: 0 });
    } catch (err: any) {
      setError(err.message || 'Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 relative overflow-hidden" id="leave-review">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, #06b6d4 0%, transparent 50%)`
        }}></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Glassmorphism */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-white/10 rounded-full text-white dark:text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Share Your Experience
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 transition-colors duration-300">
            Leave a Review
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto transition-colors duration-300">
            Help others by sharing your experience with our plumbing services
          </p>
        </div>

        {/* Review Form with Enhanced Glassmorphism */}
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl transform rotate-1"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl transform -rotate-1"></div>
          
          <form onSubmit={handleSubmit} className="relative bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 dark:border-white/10 transition-colors duration-300">
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-8 p-4 bg-green-500/20 dark:bg-green-400/20 border border-green-400/40 dark:border-green-300/40 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-300 dark:text-green-200 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  <p className="text-green-200 dark:text-green-100 font-medium">{success}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-8 p-4 bg-red-500/20 dark:bg-red-400/20 border border-red-400/30 dark:border-red-300/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 dark:text-red-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  <p className="text-red-200 dark:text-red-100 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-white dark:text-white mb-3 transition-colors duration-300">
                  Your Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-4 bg-white/10 dark:bg-white/5 border border-white/30 dark:border-white/20 rounded-2xl text-white dark:text-white placeholder-white/60 dark:placeholder-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium backdrop-blur-sm"
                    placeholder="Enter your full name"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-white/60 dark:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-white dark:text-white mb-3 transition-colors duration-300">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-4 bg-white/10 dark:bg-white/5 border border-white/30 dark:border-white/20 rounded-2xl text-white dark:text-white placeholder-white/60 dark:placeholder-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium backdrop-blur-sm"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-white/60 dark:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="mt-8">
              <label className="block text-sm font-semibold text-white dark:text-white mb-4 transition-colors duration-300">
                Rate Your Experience
              </label>
              <div className="flex items-center justify-center gap-2 p-6 bg-white/5 dark:bg-white/5 rounded-2xl border border-white/20 dark:border-white/10 backdrop-blur-sm">
                {Array.from({ length: 6 }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setForm(f => ({ ...f, rating: i + 1 }))}
                    className={`group relative w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm ${
                      form.rating > i 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30' 
                        : 'bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/30 dark:border-white/20'
                    }`}
                    aria-label={`Rate ${i + 1} stars`}
                  >
                    <svg className={`w-6 h-6 mx-auto transition-colors duration-300 ${
                      form.rating > i ? 'text-white' : 'text-white/60 dark:text-white/50'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                    {form.rating > i && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                ))}
                <div className="ml-4 text-center">
                  <div className="text-2xl font-bold text-white dark:text-white">{form.rating}</div>
                  <div className="text-sm text-white/60 dark:text-white/50">/ 6</div>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="mt-8">
              <label className="block text-sm font-semibold text-white dark:text-white mb-3 transition-colors duration-300">
                Your Review *
              </label>
              <div className="relative">
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-4 bg-white/10 dark:bg-white/5 border border-white/30 dark:border-white/20 rounded-2xl text-white dark:text-white placeholder-white/60 dark:placeholder-white/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium resize-none backdrop-blur-sm"
                  placeholder="Tell us about your experience with our plumbing services. What did you like? How was our response time and service quality?"
                  required
                />
                <div className="absolute bottom-4 right-4">
                  <svg className="w-5 h-5 text-white/60 dark:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 text-center">
              <button
                type="submit"
                disabled={submitting}
                className="group relative inline-flex items-center px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    Submit Review
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <p className="mt-4 text-sm text-white/60 dark:text-white/50">
                Your review will be published after approval by our team
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 