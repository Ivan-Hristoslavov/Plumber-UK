import type { Availability } from "@/lib/availability";

/**
 * Answers the one question someone with a burst pipe at 23:00 actually has:
 * will anyone pick up. Server-rendered, so it is in the HTML rather than
 * appearing after hydration.
 */
export function AvailabilityBadge({
  availability,
  className = "",
}: {
  availability: Availability;
  className?: string;
}) {
  if (availability.available) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-green-500/15 border border-green-400/40 px-3.5 py-1.5 backdrop-blur-sm ${className}`}
      >
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
        </span>
        <span className="text-sm font-semibold text-green-300">
          Available now — we answer 24/7
        </span>
      </div>
    );
  }

  // returnsOn is the last day away, so the first day back is the day after.
  const returns = availability.returnsOn
    ? new Date(new Date(`${availability.returnsOn}T12:00:00Z`).getTime() + 86_400_000)
        .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/40 px-3.5 py-1.5 backdrop-blur-sm ${className}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />
      <span className="text-sm font-semibold text-amber-200">
        {availability.reason || "Away"}
        {returns ? ` — back ${returns}` : ""}
      </span>
    </div>
  );
}
