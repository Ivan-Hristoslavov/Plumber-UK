"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useAdminProfile } from "@/components/AdminProfileContext";
import { trackPhoneCall } from "@/components/GoogleAnalytics";
import { ToastMessages, useToast } from "@/components/Toast";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { type BookingService, usePricingCardsForBooking } from "@/hooks/usePricingCardsForBooking";
import { useWorkingHours } from "@/hooks/useWorkingHours";

import BookingCalendar from "./BookingCalendar";
import {
  type DayOffPeriod,
  type LondonNow,
  type Slot,
  type SlotStatus,
  type TimeOfDay,
  addDays,
  addMonths,
  findNextAvailableDate,
  formatLongDate,
  formatShortDate,
  getLondonNow,
  parseSlot,
  slotStatus,
  timeToMinutes,
} from "./booking-utils";

const STEPS = ["Job", "Date & time", "Your details", "Review"] as const;

const FIELD =
  "w-full rounded-xl border bg-white dark:bg-gray-700/50 px-3.5 py-3 text-base text-gray-900 dark:text-white placeholder-gray-400 outline-none transition focus:ring-2";
const FIELD_OK = "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20";
const FIELD_BAD = "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20";
const LABEL = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Details = { name: string; email: string; phone: string; address: string };
type DetailErrors = Partial<Record<keyof Details, string>>;

type Availability = {
  date: string;
  bookedStarts: number[];
  dayOff: { title?: string; description?: string; banner?: string } | null;
};

type Confirmation = {
  service: string;
  when: string;
  address: string;
  email: string;
  phone: string;
  emergency: boolean;
};

function validateDetails(details: Details): DetailErrors {
  const errors: DetailErrors = {};
  if (details.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!EMAIL_PATTERN.test(details.email.trim())) errors.email = "Please enter a valid email address.";
  if (details.phone.replace(/\D/g, "").length < 10) errors.phone = "Please enter a phone number we can reach you on.";
  if (details.address.trim().length < 5) errors.address = "Please enter the full address of the job.";
  return errors;
}

const withFrom = (price: string) => (price.startsWith("£") ? `From ${price}` : price);

function Icon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
}

const ICON = {
  check: "M5 13l4 4L19 7",
  phone:
    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  alert:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  pin: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  wrench:
    "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
};

function StepIndicator({ current, onJump }: { current: number; onJump: (step: number) => void }) {
  return (
    <div className="mb-6 sm:mb-8">
      <ol className="flex items-center" aria-label="Booking progress">
        {STEPS.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={label} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
              <button
                type="button"
                disabled={!done}
                onClick={() => onJump(index)}
                aria-current={active ? "step" : undefined}
                className="group flex items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    done
                      ? "bg-green-500 text-white group-hover:bg-green-600"
                      : active
                        ? "bg-blue-600 text-white ring-4 ring-blue-600/20"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {done ? <Icon path={ICON.check} className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={`hidden sm:block text-sm font-semibold ${
                    active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <span
                  className={`mx-2 sm:mx-3 h-0.5 flex-1 rounded ${done ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:hidden">
        Step {current + 1} of {STEPS.length} · <span className="text-gray-900 dark:text-white">{STEPS[current]}</span>
      </p>
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`} aria-hidden="true" />;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

function SummaryRow({
  icon,
  label,
  onChange,
  children,
}: {
  icon: string;
  label: string;
  onChange?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        <Icon path={icon} className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <div className="mt-0.5 text-[15px] text-gray-900 dark:text-white break-words">{children}</div>
      </div>
      {onChange && (
        <button
          type="button"
          onClick={onChange}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
        >
          Change
        </button>
      )}
    </div>
  );
}

export default function BookingWizard() {
  const { showSuccess, showError } = useToast();
  const profile = useAdminProfile();
  const { settings } = useAdminSettings();
  const { services, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = usePricingCardsForBooking();
  const { workingHours, timeSlots, isLoading: hoursLoading } = useWorkingHours();

  const phone = profile?.phone || "+44 7541777225";
  const displayPhone = phone.replace(/^\+44\s?/, "0");
  const workingDays = Array.isArray(workingHours.workingDays) ? workingHours.workingDays : [];

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState<Details>({ name: "", email: "", phone: "", address: "" });
  const [touched, setTouched] = useState<Partial<Record<keyof Details, boolean>>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const [now, setNow] = useState<LondonNow | null>(null);
  const [periods, setPeriods] = useState<DayOffPeriod[]>([]);
  const [periodsLoaded, setPeriodsLoaded] = useState(false);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [availabilityTick, setAvailabilityTick] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const dateInitialised = useRef(false);
  const stepMounted = useRef(false);

  // London's today is only known in the browser, so it is set after mount to
  // keep the server and first client render identical.
  useEffect(() => {
    setNow(getLondonNow());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/day-off", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setPeriods(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPeriodsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // With a single service there is nothing to choose.
  useEffect(() => {
    if (!serviceId && services.length === 1) setServiceId(services[0].id);
  }, [services, serviceId]);

  const today = now?.date ?? "";
  const maxDate = today ? addMonths(today, 3) : "";
  const calendarRules = { today, maxDate, periods, workingDays };

  // Start on the first day that can actually be booked.
  useEffect(() => {
    if (dateInitialised.current || !today || !periodsLoaded || hoursLoading) return;
    dateInitialised.current = true;
    const next = findNextAvailableDate(today, { today, maxDate, periods, workingDays });
    if (next) setDate(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, periodsLoaded, hoursLoading]);

  // Which times are taken on the chosen date. The abort guard stops a slow
  // answer for an earlier date overwriting the one on screen.
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    setAvailabilityStatus("loading");

    fetch(`/api/bookings/availability?date=${date}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("availability");
        return response.json();
      })
      .then((data) => {
        setAvailability({
          date,
          bookedStarts: (data.bookedTimes || []).map((slot: { time: string }) => timeToMinutes(slot.time)),
          dayOff: data.isDayOff
            ? { title: data.dayOffTitle, description: data.dayOffDescription, banner: data.bannerMessage }
            : null,
        });
        setAvailabilityStatus("ready");
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setAvailabilityStatus("error");
      });

    return () => controller.abort();
  }, [date, availabilityTick]);

  const slots = useMemo(
    () => timeSlots.map(parseSlot).filter((slot): slot is Slot => slot !== null),
    [timeSlots],
  );

  const currentAvailability = availability && availability.date === date ? availability : null;
  const dayOff = currentAvailability?.dayOff ?? null;
  const isToday = !!date && date === today;

  const slotInfo = slots.map((slot) => ({
    slot,
    status: (dayOff
      ? "booked"
      : slotStatus(slot, currentAvailability?.bookedStarts ?? [], {
          isToday,
          nowMinutes: now?.minutes ?? 0,
        })) as SlotStatus,
  }));
  const availableCount = slotInfo.filter((item) => item.status === "available").length;
  const selectedSlot = slotInfo.find((item) => item.slot.value === time);
  const ready = availabilityStatus === "ready" && !!currentAvailability;

  // A chosen time that is no longer free (date changed, or someone just took it).
  useEffect(() => {
    if (time && ready && selectedSlot?.status !== "available") setTime("");
  }, [time, ready, selectedSlot?.status]);

  const service = services.find((item) => item.id === serviceId);
  const errors = validateDetails(details);
  const showError_ = (field: keyof Details) => (touched[field] || showAllErrors ? errors[field] : undefined);

  const jobValid = !!service;
  const whenValid = ready && !dayOff && selectedSlot?.status === "available";

  // Move to the top of the form when the step changes, if the visitor has
  // scrolled past it, and put keyboard focus on the new heading.
  useEffect(() => {
    if (!stepMounted.current) {
      stepMounted.current = true;
      return;
    }
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, confirmation]);

  const goTo = (target: number) => {
    setFormError(null);
    if (target === 1) setNow(getLondonNow());
    setStep(target);
  };

  const next = () => {
    if (step === 0 && !jobValid) return;
    if (step === 1 && !whenValid) return;
    if (step === 2) {
      setShowAllErrors(true);
      if (Object.keys(errors).length > 0) return;
    }
    goTo(step + 1);
  };

  const onPickDate = (picked: string) => {
    setDate(picked);
    setTime("");
    // On a phone the times sit below the calendar; bring them into view.
    requestAnimationFrame(() => {
      const el = slotsRef.current;
      if (el && el.getBoundingClientRect().top > window.innerHeight * 0.7) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  const checkTomorrow = () => {
    const nextDate = findNextAvailableDate(addDays(today, 1), calendarRules);
    if (nextDate) onPickDate(nextDate);
  };

  const submit = async () => {
    if (submitting || !service || !selectedSlot) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const email = details.email.trim();

      // Reuse the customer record if this email has booked before.
      let customerId: string | null = null;
      try {
        const lookup = await fetch(`/api/customers?email=${encodeURIComponent(email)}`);
        const lookupData = await lookup.json();
        const list = Array.isArray(lookupData.customers) ? lookupData.customers : [];
        customerId = list.find((c: { email: string }) => c.email === email)?.id ?? null;
      } catch {
        customerId = null;
      }

      if (!customerId) {
        const created = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: details.name.trim(),
            email,
            phone: details.phone.trim(),
            address: details.address.trim(),
            customer_type: "individual",
          }),
        });
        if (!created.ok) {
          const body = await created.json().catch(() => ({}));
          throw new Error(body.error || "Failed to create customer");
        }
        customerId = (await created.json()).id;
      }

      // The quoted amount follows the rates shown on the site (admin settings).
      const rate = Number(isEmergency ? settings.emergencyRate : settings.standardRate);
      const amount = Number.isFinite(rate) && rate > 0 ? rate : isEmergency ? 120 : 80;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          customer_name: details.name.trim(),
          customer_email: email,
          customer_phone: details.phone.trim(),
          service: service.name,
          date,
          time: selectedSlot.slot.value.split(" - ")[0],
          status: isEmergency ? "pending" : "scheduled",
          payment_status: "pending",
          amount,
          address: details.address.trim(),
          notes: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (body.conflict) {
          // Someone took the slot while this form was open: back to the times.
          setTime("");
          setAvailabilityTick((tick) => tick + 1);
          setStep(1);
          setFormError(body.message || "That time has just been taken. Please choose another.");
          showError("Time Slot Conflict", body.message || "That time has just been taken.");
          return;
        }
        throw new Error(body.error || "Failed to create booking");
      }

      setConfirmation({
        service: service.name,
        when: `${formatLongDate(date)}, ${selectedSlot.slot.label}`,
        address: details.address.trim(),
        email,
        phone: details.phone.trim(),
        emergency: isEmergency,
      });
      showSuccess(ToastMessages.bookings.submitted.title, ToastMessages.bookings.submitted.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : ToastMessages.bookings.error.message;
      setFormError(`${message}. Your details are still here, so you can try again, or call us on ${displayPhone}.`);
      showError(ToastMessages.bookings.error.title, message);
    } finally {
      setSubmitting(false);
    }
  };

  const startAgain = () => {
    setConfirmation(null);
    setStep(0);
    setIsEmergency(false);
    setDescription("");
    setTime("");
    setShowAllErrors(false);
    setTouched({});
    setAvailabilityTick((tick) => tick + 1);
    const nextDate = findNextAvailableDate(today, calendarRules);
    setDate(nextDate ?? "");
  };

  // ---------------------------------------------------------------- success

  if (confirmation) {
    return (
      <div ref={topRef} className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
          <Icon path={ICON.check} className="h-8 w-8" />
        </div>
        <h3 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 outline-none">
          Request sent
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Thank you. We will call or email you to confirm your slot.
        </p>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 text-left divide-y divide-gray-100 dark:divide-gray-700">
          <SummaryRow icon={ICON.wrench} label="Job">
            {confirmation.service}
            {confirmation.emergency && (
              <span className="ml-2 rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">
                Emergency
              </span>
            )}
          </SummaryRow>
          <SummaryRow icon={ICON.calendar} label="Requested time">{confirmation.when}</SummaryRow>
          <SummaryRow icon={ICON.pin} label="Address">{confirmation.address}</SummaryRow>
        </div>

        <div className="mt-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 p-5 text-left text-sm text-gray-700 dark:text-gray-200">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">What happens next</p>
          <ul className="space-y-2">
            <li className="flex gap-2.5"><Icon path={ICON.check} className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />We will contact you on {confirmation.phone} or {confirmation.email} to confirm.</li>
            <li className="flex gap-2.5"><Icon path={ICON.check} className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />Nothing to pay now.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`tel:${phone}`}
            onClick={() => trackPhoneCall("booking_confirmation")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 font-semibold transition-colors"
          >
            <Icon path={ICON.phone} className="h-4 w-4" />
            Call {displayPhone}
          </a>
          <button
            type="button"
            onClick={startAgain}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-6 py-3 font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Make another booking
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ steps

  const groups: TimeOfDay[] = ["Morning", "Afternoon", "Evening"];

  return (
    <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24">
      <StepIndicator current={step} onJump={goTo} />

      {/* Step 1: the job */}
      {step === 0 && (
        <section aria-labelledby="step-title">
          <h3 id="step-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white outline-none">
            What do you need?
          </h3>
          <p className="mt-1 mb-5 text-sm text-gray-600 dark:text-gray-400">Choose the service and tell us what is happening.</p>

          {servicesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
            </div>
          ) : servicesError || services.length === 0 ? (
            <div role="alert" className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold mb-1">We could not load our services.</p>
              <p className="mb-3">Please try again, or call us and we will book you in.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={refetchServices} className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 font-semibold">
                  Try again
                </button>
                <a href={`tel:${phone}`} className="rounded-lg border border-amber-300 dark:border-amber-700 px-4 py-2 font-semibold">
                  Call {displayPhone}
                </a>
              </div>
            </div>
          ) : (
            <fieldset>
              <legend className="sr-only">Service</legend>
              <div className={`grid gap-3 ${services.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {services.map((item: BookingService) => {
                  const selected = serviceId === item.id;
                  return (
                    <label
                      key={item.id}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <input type="radio" name="service" value={item.id} checked={selected} onChange={() => setServiceId(item.id)} className="sr-only" />
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                        <Icon path={ICON.wrench} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-gray-900 dark:text-white">{item.name}</span>
                        <span className="block text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</span>
                      </span>
                      <span className="shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">
                        {withFrom(item.price)}
                      </span>
                      {selected && (
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                          <Icon path={ICON.check} className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* Emergency */}
          <label
            className={`mt-4 flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900 ${
              isEmergency
                ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} className="peer sr-only" />
            <span className="mt-1 flex h-6 w-11 shrink-0 items-center rounded-full bg-gray-300 dark:bg-gray-600 p-0.5 transition-colors peer-checked:bg-red-600 peer-checked:[&>span]:translate-x-5" aria-hidden="true">
              <span className="h-5 w-5 rounded-full bg-white shadow transition-transform" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Icon path={ICON.alert} className="h-4 w-4 text-red-500" />
                This is an emergency
              </span>
              <span className="mt-0.5 block text-sm text-gray-600 dark:text-gray-300">
                Burst pipe, flooding or no water? Tick this and we will prioritise your request.
              </span>
            </span>
          </label>

          {isEmergency && (
            <a
              href={`tel:${phone}`}
              onClick={() => trackPhoneCall("booking_form_emergency")}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white px-4 py-3 font-semibold transition-colors"
            >
              <Icon path={ICON.phone} className="h-4 w-4" />
              For the fastest help, call {displayPhone}
            </a>
          )}

          <div className="mt-5">
            <label className={LABEL} htmlFor="booking-description">
              What is the problem? <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <textarea
              id="booking-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="e.g. Water leaking under the kitchen sink since this morning"
              className={`${FIELD} ${FIELD_OK} resize-none`}
            />
          </div>
        </section>
      )}

      {/* Step 2: date and time */}
      {step === 1 && (
        <section aria-labelledby="step-title">
          <h3 id="step-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white outline-none">
            Pick a date and time
          </h3>
          <p className="mt-1 mb-5 text-sm text-gray-600 dark:text-gray-400">Choose a day, then a time window that suits you.</p>

          {formError && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {formError}
            </p>
          )}

          {!today || !periodsLoaded || hoursLoading ? (
            <div className="grid gap-5 md:grid-cols-2">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 md:items-start">
              <BookingCalendar value={date} onChange={onPickDate} today={today} maxDate={maxDate} periods={periods} workingDays={workingDays} />

              <div ref={slotsRef} className="scroll-mt-24">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Icon path={ICON.calendar} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  {date ? formatLongDate(date) : "Choose a day"}
                </p>

                {!date ? (
                  <p className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300">
                    There are no bookable days in the next three months. Please call us on {displayPhone}.
                  </p>
                ) : availabilityStatus === "loading" || (availabilityStatus === "idle") || !currentAvailability ? (
                  availabilityStatus === "error" ? (
                    <div role="alert" className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-100">
                      We could not check availability.{" "}
                      <button type="button" onClick={() => setAvailabilityTick((t) => t + 1)} className="font-semibold underline">
                        Try again
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2" aria-busy="true">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  )
                ) : dayOff ? (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-semibold">{dayOff.title || "We are closed on this day"}</p>
                    {dayOff.description && <p className="mt-1">{dayOff.description}</p>}
                    {isEmergency && (
                      <a href={`tel:${phone}`} className="mt-3 inline-flex items-center gap-2 font-semibold underline">
                        <Icon path={ICON.phone} className="h-4 w-4" /> Emergency? Call {displayPhone}
                      </a>
                    )}
                  </div>
                ) : availableCount === 0 ? (
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-200">
                    <p className="flex items-center gap-2 font-semibold">
                      <Icon path={ICON.clock} className="h-4 w-4" />
                      {isToday ? "No more times today" : "This day is fully booked"}
                    </p>
                    <button type="button" onClick={checkTomorrow} className="mt-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 font-semibold">
                      Show the next available day
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4" role="group" aria-label="Available times">
                    {groups.map((part) => {
                      const items = slotInfo.filter((item) => item.slot.part === part);
                      if (items.length === 0) return null;
                      return (
                        <div key={part}>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{part}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {items.map(({ slot, status }) => {
                              const selected = time === slot.value;
                              const free = status === "available";
                              return (
                                <button
                                  key={slot.value}
                                  type="button"
                                  disabled={!free}
                                  aria-pressed={selected}
                                  onClick={() => setTime(slot.value)}
                                  className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900 ${
                                    selected
                                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25"
                                      : free
                                        ? "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-400"
                                        : "cursor-not-allowed border-transparent bg-gray-100 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500"
                                  }`}
                                >
                                  <span className={free ? "" : "line-through"}>{slot.label}</span>
                                  {!free && <span className="block text-[11px] font-medium no-underline">{status === "past" ? "Passed" : "Booked"}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {periods.some((p) => p.end_date >= today) && today && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 px-3 py-2.5 text-xs text-blue-900 dark:text-blue-100">
              <Icon path={ICON.calendar} className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                We are closed:{" "}
                {periods
                  .filter((p) => p.end_date >= today)
                  .map((p) => `${formatShortDate(p.start_date)} – ${formatShortDate(p.end_date)} (${p.title})`)
                  .join(", ")}
              </span>
            </p>
          )}
        </section>
      )}

      {/* Step 3: details */}
      {step === 2 && (
        <section aria-labelledby="step-title">
          <h3 id="step-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white outline-none">
            Your details
          </h3>
          <p className="mt-1 mb-5 text-sm text-gray-600 dark:text-gray-400">So we know who to call and where to go.</p>

          <div className="space-y-4">
            <div>
              <label className={LABEL} htmlFor="booking-name">Full name</label>
              <input
                id="booking-name"
                type="text"
                autoComplete="name"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                onBlur={() => setTouched({ ...touched, name: true })}
                aria-invalid={!!showError_("name")}
                aria-describedby="booking-name-error"
                placeholder="Your full name"
                className={`${FIELD} ${showError_("name") ? FIELD_BAD : FIELD_OK}`}
              />
              <FieldError id="booking-name-error" message={showError_("name")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="booking-phone">Phone</label>
                <input
                  id="booking-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  aria-invalid={!!showError_("phone")}
                  aria-describedby="booking-phone-error"
                  placeholder="07xxx xxxxxx"
                  className={`${FIELD} ${showError_("phone") ? FIELD_BAD : FIELD_OK}`}
                />
                <FieldError id="booking-phone-error" message={showError_("phone")} />
              </div>
              <div>
                <label className={LABEL} htmlFor="booking-email">Email</label>
                <input
                  id="booking-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  aria-invalid={!!showError_("email")}
                  aria-describedby="booking-email-error"
                  placeholder="you@example.com"
                  className={`${FIELD} ${showError_("email") ? FIELD_BAD : FIELD_OK}`}
                />
                <FieldError id="booking-email-error" message={showError_("email")} />
              </div>
            </div>

            <div>
              <label className={LABEL} htmlFor="booking-address">Address of the job</label>
              <textarea
                id="booking-address"
                rows={2}
                autoComplete="street-address"
                value={details.address}
                onChange={(e) => setDetails({ ...details, address: e.target.value })}
                onBlur={() => setTouched({ ...touched, address: true })}
                aria-invalid={!!showError_("address")}
                aria-describedby="booking-address-error"
                placeholder="House number, street and postcode"
                className={`${FIELD} ${showError_("address") ? FIELD_BAD : FIELD_OK} resize-none`}
              />
              <FieldError id="booking-address-error" message={showError_("address")} />
            </div>
          </div>
        </section>
      )}

      {/* Step 4: review */}
      {step === 3 && service && selectedSlot && (
        <section aria-labelledby="step-title">
          <h3 id="step-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white outline-none">
            Check and send
          </h3>
          <p className="mt-1 mb-5 text-sm text-gray-600 dark:text-gray-400">Make sure everything is right, then send your request.</p>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 divide-y divide-gray-100 dark:divide-gray-700">
            <SummaryRow icon={ICON.wrench} label="Job" onChange={() => goTo(0)}>
              <span className="font-semibold">{service.name}</span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{withFrom(service.price)}</span>
              {isEmergency && (
                <span className="ml-2 rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">Emergency</span>
              )}
              {description.trim() && <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">{description.trim()}</span>}
            </SummaryRow>
            <SummaryRow icon={ICON.calendar} label="When" onChange={() => goTo(1)}>
              <span className="font-semibold">{formatLongDate(date)}</span>
              <span className="block text-sm text-gray-600 dark:text-gray-300">{selectedSlot.slot.label}</span>
            </SummaryRow>
            <SummaryRow icon={ICON.user} label="Contact" onChange={() => goTo(2)}>
              <span className="font-semibold">{details.name.trim()}</span>
              <span className="block text-sm text-gray-600 dark:text-gray-300">{details.phone.trim()}</span>
              <span className="block text-sm text-gray-600 dark:text-gray-300">{details.email.trim()}</span>
            </SummaryRow>
            <SummaryRow icon={ICON.pin} label="Address" onChange={() => goTo(2)}>
              {details.address.trim()}
            </SummaryRow>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2"><Icon path={ICON.check} className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />No payment now.</li>
            <li className="flex gap-2"><Icon path={ICON.check} className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />We will call or email to confirm your slot.</li>
          </ul>

          {formError && (
            <p role="alert" className="mt-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {formError}
            </p>
          )}
        </section>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={submitting}
            className="rounded-xl border border-gray-300 dark:border-gray-600 px-5 py-3.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            disabled={(step === 0 && !jobValid) || (step === 1 && !whenValid)}
            className="flex-1 sm:flex-none sm:ml-auto sm:min-w-[12rem] rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed text-white px-6 py-3.5 text-base font-bold shadow-lg shadow-blue-600/20 disabled:shadow-none transition-all"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex-1 sm:flex-none sm:ml-auto sm:min-w-[12rem] rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3.5 text-base font-bold shadow-lg shadow-green-600/25 transition-all"
          >
            {submitting ? "Sending…" : "Send booking request"}
          </button>
        )}
      </div>

      {step === 1 && !whenValid && (
        <p className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">Choose a date and a time to continue.</p>
      )}

      {step === 3 && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          We use your details only to arrange this visit. See our{" "}
          <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
        </p>
      )}
    </div>
  );
}
