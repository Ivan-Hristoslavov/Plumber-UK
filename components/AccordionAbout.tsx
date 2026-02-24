"use client";

import { useAdminProfileContext } from "@/components/AdminProfileContext";

export function AccordionAbout() {
  const { adminProfile: profile, loading } = useAdminProfileContext();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
      </div>
    );
  }

  const aboutText = profile?.about || "";
  if (!aboutText) return null;

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const processedLines = lines.map((line) => {
      if (line.startsWith("# "))
        return `<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">${line.substring(2)}</h1>`;
      if (line.startsWith("## "))
        return `<h2 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">${line.substring(3)}</h2>`;
      if (line.startsWith("### "))
        return `<h3 class="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">${line.substring(4)}</h3>`;
      if (line.trim() === "---")
        return '<hr class="my-4 border-gray-300 dark:border-gray-600">';
      if (line.startsWith("- "))
        return `<li class="ml-4 mb-1">${line.substring(2)}</li>`;
      if (line.match(/^\d+\.\s/))
        return `<li class="ml-4 mb-1">${line.replace(/^\d+\.\s/, "")}</li>`;
      if (line.trim()) {
        let p = line;
        p = p.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        p = p.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        p = p.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        return `<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">${p}</p>`;
      }
      return "";
    });

    const result: string[] = [];
    let listItems: string[] = [];
    for (const line of processedLines) {
      if (line.includes("<li")) {
        listItems.push(line);
      } else {
        if (listItems.length > 0) {
          result.push(`<ul class="list-disc list-inside mb-4 space-y-1">${listItems.join("")}</ul>`);
          listItems = [];
        }
        if (line) result.push(line);
      }
    }
    if (listItems.length > 0)
      result.push(`<ul class="list-disc list-inside mb-4 space-y-1">${listItems.join("")}</ul>`);
    return result.join("");
  };

  const fullHtml = renderMarkdown(aboutText);

  return (
    <div
      className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed text-[14px] sm:text-[15px]"
      dangerouslySetInnerHTML={{ __html: fullHtml }}
    />
  );
}
