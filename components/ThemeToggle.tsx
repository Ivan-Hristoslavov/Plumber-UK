"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Размери за различните размери
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${sizes[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`} />
    );
  }

  const toggleTheme = () => {
    // If current theme is system, switch to the opposite of resolved theme
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  // Use resolvedTheme to determine the actual theme being displayed
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`${sizes[size]} relative overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 bg-sky-100 dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow duration-300 group ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sky wash. Both states are always mounted and cross-fade, so the button
          never flashes an empty frame mid-swap. */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-br from-amber-200 via-sky-200 to-sky-300 transition-opacity duration-500 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 transition-opacity duration-500 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* The sun rises and sets rather than swapping instantly: it slides down
          out of frame as the moon slides in from the top. */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${
          isDark ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <svg className={`${iconSizes[size]} text-amber-500 drop-shadow-sm`} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4.2" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="origin-center transition-transform duration-700 group-hover:rotate-45">
            <line x1="12" y1="2.2" x2="12" y2="4.4" />
            <line x1="12" y1="19.6" x2="12" y2="21.8" />
            <line x1="2.2" y1="12" x2="4.4" y2="12" />
            <line x1="19.6" y1="12" x2="21.8" y2="12" />
            <line x1="5.1" y1="5.1" x2="6.7" y2="6.7" />
            <line x1="17.3" y1="17.3" x2="18.9" y2="18.9" />
            <line x1="5.1" y1="18.9" x2="6.7" y2="17.3" />
            <line x1="17.3" y1="6.7" x2="18.9" y2="5.1" />
          </g>
        </svg>
      </span>

      <span
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${
          isDark ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <svg className={`${iconSizes[size]} text-slate-100 drop-shadow`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        </svg>
      </span>

      {/* Stars fade in behind the moon. */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-700 delay-100 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="absolute left-[22%] top-[26%] h-0.5 w-0.5 rounded-full bg-white/90" />
        <span className="absolute left-[72%] top-[34%] h-[3px] w-[3px] rounded-full bg-white/70" />
        <span className="absolute left-[34%] top-[70%] h-0.5 w-0.5 rounded-full bg-white/60" />
      </span>
    </button>
  );
}
