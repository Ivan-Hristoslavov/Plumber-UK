"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type LegalPageConfig = {
  slug: "terms" | "privacy" | "cookies" | "gdpr";
  title: string;
  apiEndpoint: string;
  contactTitle: string;
  fallbackContent?: React.ReactNode;
};

export function LegalPageClient({
  slug,
  title,
  apiEndpoint,
  contactTitle,
  fallbackContent,
}: LegalPageConfig) {
  const adminProfile = useAdminProfile();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(apiEndpoint);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || "");
        }
      } catch (error) {
        console.error(`Error fetching ${slug}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [apiEndpoint, slug]);

  const businessData = {
    businessName: adminProfile?.company_name,
    businessEmail: adminProfile?.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    businessPhone: adminProfile?.phone,
  };

  const hasContent = content && content.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            <div className="w-24 sm:w-28" aria-hidden />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 dark:border-gray-600" />
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : hasContent ? (
              <div className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-ul:my-4 prose-li:my-1">
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {fallbackContent}
              </div>
            )}
          </div>
        </article>

        {/* Contact card */}
        <div className="mt-6 sm:mt-8 p-5 sm:p-6 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {contactTitle}
          </h3>
          <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong className="text-gray-700 dark:text-gray-300">Email:</strong>{" "}
              <a href={`mailto:${businessData.businessEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {businessData.businessEmail}
              </a>
            </p>
            <p>
              <strong className="text-gray-700 dark:text-gray-300">Phone:</strong>{" "}
              <a href={`tel:${businessData.businessPhone?.replace(/\s/g, "")}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {businessData.businessPhone}
              </a>
            </p>
            {businessData.businessName && (
              <p>
                <strong className="text-gray-700 dark:text-gray-300">Company:</strong> {businessData.businessName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
