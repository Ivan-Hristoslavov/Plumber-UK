"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function CookiesPageClient() {
  const adminProfile = useAdminProfile();
  const router = useRouter();
  const [cookiesContent, setCookiesContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        const response = await fetch("/api/cookies");
        if (response.ok) {
          const data = await response.json();
          setCookiesContent(data.content || "");
        }
      } catch (error) {
        console.error("Error fetching cookies policy:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCookies();
  }, []);

  const businessData = {
    businessName: adminProfile?.company_name,
    businessEmail: adminProfile?.business_email,
    businessPhone: adminProfile?.phone,
  };  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cookie Policy
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading cookie policy...</p>
            </div>
          ) : cookiesContent ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <MarkdownRenderer content={cookiesContent} />
            </div>
          ) : (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h1>Cookie Policy</h1>
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <h2>What Are Cookies?</h2>
              <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>
              
              <h2>How We Use Cookies</h2>
              <p>{businessData.businessName} uses cookies to:</p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our website</li>
                <li>Improve your browsing experience</li>
                <li>Provide personalized content</li>
              </ul>
              
              <h2>Types of Cookies We Use</h2>
              <h3>Essential Cookies</h3>
              <p>These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>
              
              <h3>Analytics Cookies</h3>
              <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
              
              <h3>Functional Cookies</h3>
              <p>These cookies allow the website to remember choices you make and provide enhanced, personalized features.</p>
              
              <h2>Managing Cookies</h2>
              <p>You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can impact your user experience and parts of our website may no longer be fully accessible.</p>
              <p>Most browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer.</p>
              
              <h2>Contact Us</h2>
              <p>If you have any questions about our use of cookies, please contact us:</p>
              <ul>
                <li><strong>Email:</strong> {businessData.businessEmail}</li>
                <li><strong>Phone:</strong> {businessData.businessPhone}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
            Questions About Cookies?
          </h3>
          <div className="space-y-2 text-purple-800 dark:text-purple-200">
            <p>
              <strong>Email:</strong> {businessData.businessEmail}
            </p>
            <p>
              <strong>Phone:</strong> {businessData.businessPhone}
            </p>
            <p>
              <strong>Company:</strong> {businessData.businessName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
