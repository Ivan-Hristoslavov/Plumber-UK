"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useToast, ToastMessages } from "@/components/Toast";

type LegalContent = {
  terms: string;
  privacy_policy: string;
  cookies_policy: string;
  gdpr_policy: string;
};

export function AdminLegalManager() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "cookies" | "gdpr">("terms");
  const [content, setContent] = useState<LegalContent>({
    terms: "",
    privacy_policy: "",
    cookies_policy: "",
    gdpr_policy: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadLegalContent();
  }, []);

  const loadLegalContent = async () => {
    try {
      setLoading(true);
      
      // Load from separate tables (use allSettled so missing tables don't block others)
      const [termsResult, privacyResult, cookiesResult, gdprResult] = await Promise.allSettled([
        supabase.from("terms").select("content").single(),
        supabase.from("privacy_policy").select("content").single(),
        supabase.from("cookies_policy").select("content").single(),
        supabase.from("gdpr_policy").select("content").single()
      ]);

      const getContent = (result: PromiseSettledResult<{ data: { content: string } | null; error: unknown }>) =>
        result.status === "fulfilled" && !result.value.error && result.value.data?.content != null
          ? result.value.data.content
          : "";

      setContent({
        terms: getContent(termsResult),
        privacy_policy: getContent(privacyResult),
        cookies_policy: getContent(cookiesResult),
        gdpr_policy: getContent(gdprResult),
      });
    } catch (error) {
      console.error("Error loading legal content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update all tables
      const promises = [];
      
      const upsertOpts = { onConflict: "id" };
      
      // Update terms
      promises.push(
        supabase.from("terms").upsert({ 
          id: 1, 
          content: content.terms 
        }, upsertOpts)
      );
      
      // Update privacy policy
      promises.push(
        supabase.from("privacy_policy").upsert({ 
          id: 1, 
          content: content.privacy_policy 
        }, upsertOpts)
      );

      // Update cookies policy
      promises.push(
        supabase.from("cookies_policy").upsert({ 
          id: 1, 
          content: content.cookies_policy 
        }, upsertOpts)
      );

      // Update GDPR policy
      promises.push(
        supabase.from("gdpr_policy").upsert({ 
          id: 1, 
          content: content.gdpr_policy 
        }, upsertOpts)
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }

      showSuccess("Legal Content Updated", "All legal pages have been saved successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 
        (error && typeof error === 'object' && 'message' in error) ? String((error as { message: unknown }).message) : 
        "Unknown error";
      console.error("Error saving legal content:", message, error);
      showError("Save Error", `Failed to save legal content: ${message}. Ensure cookies_policy and gdpr_policy tables exist (run migrations).`);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { 
      id: "terms", 
      name: "Terms & Conditions", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: "privacy", 
      name: "Privacy Policy", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    { 
      id: "cookies", 
      name: "Cookie Policy", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    { 
      id: "gdpr", 
      name: "GDPR Compliance", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Manage your Terms & Conditions, Privacy Policy, Cookie Policy, and GDPR Compliance content.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 text-sm"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Tips - compact */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>💡 Use clear language</span>
        <span>·</span>
        <span>Include contact info</span>
        <span>·</span>
        <span>Specify terms & cancellation</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "terms" | "privacy" | "cookies" | "gdpr")}
              className={`py-3 px-4 rounded-t-lg font-medium text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-b-0 border-gray-200 dark:border-gray-600 shadow-sm -mb-px"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50"
              }`}
            >
              <span className={activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : ""}>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Editor + Preview side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6 min-h-[480px]">
        {/* Editor panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Edit · {tabs.find((t) => t.id === activeTab)?.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Markdown supported</p>
          </div>
          <div className="p-4 flex-1 flex flex-col min-h-0">
            <MarkdownEditor
              value={activeTab === "terms" ? content.terms : activeTab === "privacy" ? content.privacy_policy : activeTab === "cookies" ? content.cookies_policy : content.gdpr_policy}
              onChange={(value) => setContent({ ...content, [activeTab === "terms" ? "terms" : activeTab === "privacy" ? "privacy_policy" : activeTab === "cookies" ? "cookies_policy" : "gdpr_policy"]: value })}
              placeholder={`Write your ${tabs.find((t) => t.id === activeTab)?.name} here. Use # for headings, **bold**, - for lists...`}
              rows={16}
              className="flex-1 min-h-0"
            />
          </div>
        </div>

        {/* Preview panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Preview
            </h3>
            <a
              href={`/${activeTab}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View live →
            </a>
          </div>
          <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-[320px] bg-gray-50/30 dark:bg-gray-900/30">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
              {(activeTab === "terms" && content.terms) || (activeTab === "privacy" && content.privacy_policy) || (activeTab === "cookies" && content.cookies_policy) || (activeTab === "gdpr" && content.gdpr_policy) ? (
                <MarkdownRenderer content={activeTab === "terms" ? content.terms : activeTab === "privacy" ? content.privacy_policy : activeTab === "cookies" ? content.cookies_policy : content.gdpr_policy} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 dark:text-gray-500 italic text-sm">No content yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start typing in the editor to see a preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 