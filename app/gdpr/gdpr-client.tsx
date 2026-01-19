"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function GDPRPageClient() {
  const adminProfile = useAdminProfile();
  const router = useRouter();
  const [gdprContent, setGdprContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGDPR = async () => {
      try {
        const response = await fetch("/api/gdpr");
        if (response.ok) {
          const data = await response.json();
          setGdprContent(data.content || "");
        }
      } catch (error) {
        console.error("Error fetching GDPR policy:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGDPR();
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
              GDPR Compliance
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
              <p className="text-gray-600 dark:text-gray-400">Loading GDPR information...</p>
            </div>
          ) : gdprContent ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <MarkdownRenderer content={gdprContent} />
            </div>
          ) : (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h1>GDPR Compliance</h1>
              <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <h2>Your Rights Under GDPR</h2>
              <p>Under the General Data Protection Regulation (GDPR), you have the following rights regarding your personal data:</p>
              
              <h3>1. Right to Access</h3>
              <p>You have the right to request copies of your personal data that we hold.</p>
              
              <h3>2. Right to Rectification</h3>
              <p>You have the right to request that we correct any inaccurate or incomplete personal data.</p>
              
              <h3>3. Right to Erasure</h3>
              <p>You have the right to request that we delete your personal data in certain circumstances.</p>
              
              <h3>4. Right to Restrict Processing</h3>
              <p>You have the right to request that we restrict the processing of your personal data in certain circumstances.</p>
              
              <h3>5. Right to Data Portability</h3>
              <p>You have the right to request that we transfer your personal data to another service provider.</p>
              
              <h3>6. Right to Object</h3>
              <p>You have the right to object to our processing of your personal data in certain circumstances.</p>
              
              <h3>7. Rights Related to Automated Decision Making</h3>
              <p>You have the right not to be subject to decisions based solely on automated processing.</p>
              
              <h2>How to Exercise Your Rights</h2>
              <p>To exercise any of these rights, please contact us using the information below. We will respond to your request within one month.</p>
              
              <h2>Data Controller</h2>
              <p><strong>{businessData.businessName}</strong> is the data controller for your personal data.</p>
              
              <h2>Contact Information</h2>
              <p>If you have any questions or wish to exercise your rights under GDPR, please contact us:</p>
              <ul>
                <li><strong>Email:</strong> {businessData.businessEmail}</li>
                <li><strong>Phone:</strong> {businessData.businessPhone}</li>
              </ul>
              
              <h2>Complaints</h2>
              <p>If you are not satisfied with how we handle your personal data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) in the UK.</p>
              <p>ICO Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">https://ico.org.uk</a></p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
            GDPR Questions?
          </h3>
          <div className="space-y-2 text-indigo-800 dark:text-indigo-200">
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
