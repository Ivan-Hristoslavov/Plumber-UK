"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type SiteGuidanceItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function AdminSiteGuidance() {
  const [guidanceItems, setGuidanceItems] = useState<SiteGuidanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  useEffect(() => {
    loadGuidanceItems();
  }, []);

  const loadGuidanceItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("site_guidance")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error loading site guidance:", error);
        return;
      }

      setGuidanceItems(data || []);
      
      // Set the first item as active by default
      if (data && data.length > 0) {
        setActiveItem(data[0].id);
      }
    } catch (error) {
      console.error("Error loading site guidance:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeItemData = guidanceItems.find(item => item.id === activeItem);

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Site Guidance
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
          Learn how to use your admin panel effectively with these helpful guides.
        </p>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          🚀 Quick Tips
        </h4>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• This admin panel is designed to be mobile-friendly</li>
          <li>• Use the sidebar navigation to access different sections</li>
          <li>• Check the dashboard daily for business overview</li>
          <li>• Keep your profile and settings up to date</li>
        </ul>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Guide Topics
            </h3>
            <nav className="space-y-2">
              {guidanceItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeItem === item.id
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    {item.category}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 mt-6 lg:mt-0">
          {activeItemData ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  {activeItemData.title}
                </h3>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {activeItemData.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <MarkdownRenderer content={activeItemData.content} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select a guide topic from the sidebar to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Help Section */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
          📞 Need More Help?
        </h4>
        <p className="text-sm text-green-800 dark:text-green-200 mb-4">
          If you can't find what you're looking for in these guides, don't hesitate to reach out:
        </p>
        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
          <li>• Check the FAQ section for common questions</li>
          <li>• Review your business settings for configuration issues</li>
          <li>• Test features in a safe environment first</li>
          <li>• Keep your admin credentials secure</li>
        </ul>
      </div>
    </div>
  );
} 