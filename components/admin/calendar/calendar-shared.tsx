import type { ReactNode } from "react";

export type CalendarBooking = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  payment_status: "pending" | "paid" | "refunded";
  amount: number;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingStatus = CalendarBooking["status"];

export const STATUS_ORDER: BookingStatus[] = [
  "pending",
  "scheduled",
  "completed",
  "cancelled",
];

type StatusMeta = {
  label: string;
  /** Pill on a calendar cell: tinted surface + readable text. */
  pill: string;
  /** Solid stripe / dot colour. */
  dot: string;
  /** Badge used in lists and modals. */
  badge: string;
};

export const STATUS_META: Record<BookingStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20",
    dot: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  },
  scheduled: {
    label: "Scheduled",
    pill: "bg-blue-50 text-blue-900 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-100 dark:hover:bg-blue-500/20",
    dot: "bg-blue-500",
    badge:
      "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/30",
  },
  completed: {
    label: "Completed",
    pill: "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-gray-100 text-gray-500 line-through hover:bg-gray-200 dark:bg-gray-700/40 dark:text-gray-400 dark:hover:bg-gray-700/70",
    dot: "bg-gray-400",
    badge:
      "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:ring-gray-600",
  },
};

export const PAYMENT_BADGE: Record<CalendarBooking["payment_status"], string> = {
  paid: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
  pending:
    "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  refunded:
    "bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-500/30",
};

export const BADGE_BASE =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset";

export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  const [h = "", m = ""] = time.split(":");
  return `${h.padStart(2, "0")}:${m.slice(0, 2).padStart(2, "0")}`;
}

export function hourOf(time: string | null | undefined): number {
  const h = parseInt(time?.split(":")[0] || "", 10);
  return Number.isNaN(h) ? -1 : h;
}

/** A booking that still counts towards workload and value. */
export const isActive = (b: CalendarBooking) => b.status !== "cancelled";

export function Icon({
  path,
  className = "w-5 h-5",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
}

export const ICONS = {
  prev: "M15 19l-7-7 7-7",
  next: "M9 5l7 7-7 7",
  close: "M6 18L18 6M6 6l12 12",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  phone:
    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  pin: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  alert: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function ModalShell({
  children,
  onClose,
  maxWidth = "max-w-md",
  zIndex = "z-50",
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
  zIndex?: string;
}) {
  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-end sm:items-center justify-center overflow-y-auto bg-gray-900/60 p-0 sm:p-4 backdrop-blur-sm animate-fade-in`}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidth} sm:my-8 overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-scale-in`}
      >
        {children}
      </div>
    </div>
  );
}
