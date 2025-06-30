"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function TermsPage() {
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Terms of Service
              </h1>
              <p className="text-blue-100">
                Last updated: {adminProfile?.updated_at ? new Date(adminProfile.updated_at).toLocaleDateString() : "January 2025"}
              </p>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {adminProfile?.terms_and_conditions ? (
                  <MarkdownRenderer content={adminProfile.terms_and_conditions} />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Terms of Service</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Terms of service content will be displayed here once configured in the admin panel.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      For now, please contact us for our current terms and conditions.
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
                  For questions about these terms, please contact us at{" "}
                  <a
                    href={`mailto:${adminProfile?.email || "info@fixmyleak.com"}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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