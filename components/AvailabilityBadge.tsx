import type { Availability } from "@/lib/availability";

/**
 * Tells visitors when the business is away (holiday, day off) and when it is
 * back. Server-rendered, so it is in the HTML rather than appearing after
 * hydration.
 */
export function AvailabilityBadge({
  availability,
  className = "",
}: {
  availability: Availability;
  className?: string;
}) {
  // While available, nothing is shown: the client asked for the green
  // "Available now — we answer 24/7" line to go. The away notice stays, so
  // nobody expects an answer while the business is closed.
  if (availability.available) return null;

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
