"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminProfile, AdminProfile } from "@/lib/admin-profile";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function TermsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getAdminProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 transition-colors duration-300" />
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 transition-colors duration-300">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors duration-300" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors duration-300" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
            </p>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="text-gray-600 dark:text-gray-400">
              <p>Terms of service content will be displayed here once configured in the admin panel.</p>
              <p>For now, please contact us for our current terms and conditions.</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {profile?.company_name || "Fix My Leak"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                For questions about these terms, please contact us at{" "}
                <a
                  href={`mailto:${profile?.email || "info@fixmyleak.com"}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {profile?.email || "info@fixmyleak.com"}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 