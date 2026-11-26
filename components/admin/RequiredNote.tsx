/** One line at the top of a form explaining the red star. */
export function RequiredNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      Fields marked <span className="font-semibold text-red-600 dark:text-red-400">*</span> are required. The rest are optional.
    </p>
  );
}
