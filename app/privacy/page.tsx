"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function PrivacyPage() {
  const adminProfile = useAdminProfile();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Fixed Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 shadow-sm hover:shadow-md"
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
      </div>

      {/* Content with top padding for fixed header */}
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Privacy Policy
              </h1>
              <p className="text-green-100">
                Last updated: {adminProfile?.updated_at ? new Date(adminProfile.updated_at).toLocaleDateString() : "January 2025"}
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {adminProfile?.privacy_policy ? (
                  <MarkdownRenderer content={adminProfile.privacy_policy} />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Privacy Policy</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Privacy policy content will be displayed here once configured in the admin panel.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      For now, please contact us for our current privacy policy.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div className="bg-gray-50 dark:bg-gray-900 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {adminProfile?.company_name || "Fix My Leak"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  For questions about this privacy policy, please contact us at{" "}
                  <a
                    href={`mailto:${adminProfile?.email || "info@fixmyleak.com"}`}
                    className="text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    {adminProfile?.email || "info@fixmyleak.com"}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 