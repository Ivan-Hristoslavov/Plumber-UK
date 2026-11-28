/**
 * The FixMyLeak wordmark in the brand colours from the logo
 * (public/fix_my_leak_logo.jpg): "Fix" and "Leak" in black, "My" in orange.
 * Black turns white in dark mode so the name stays readable on a dark bar.
 */
export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`tracking-tight ${className}`}>
      <span className="text-gray-950 dark:text-white">Fix</span>
      <span className="text-[#F59B00]">My</span>
      <span className="text-gray-950 dark:text-white">Leak</span>
    </span>
  );
}
