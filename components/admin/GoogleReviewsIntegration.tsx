"use client";

import { useCallback, useEffect, useState } from "react";

import { GoogleG } from "@/components/GoogleG";

type Status = {
  tableReady: boolean;
  hasKey: boolean;
  keySource: "admin" | "env" | null;
  keyHint: string | null;
  placeId: string | null;
  placeName: string | null;
  enabled: boolean;
};

type Candidate = { placeId: string; name: string; address: string; rating: number | null; count: number };

const ENDPOINT = "/api/admin/integrations/google-reviews";
const FIELD =
  "w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const BUTTON =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

async function call(method: string, body?: unknown) {
  const response = await fetch(ENDPOINT, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

/**
 * Admin -> Settings -> Integrations: the Google API key and which Google
 * business to read the rating and reviews from. The key is saved on the server
 * only and never sent back (just its last four characters).
 */
export function GoogleReviewsIntegration() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setStatus(await call("GET"));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    setMessage(null);
    try {
      await action();
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  const saveKey = () =>
    run("key", async () => {
      setStatus(await call("PUT", { apiKey: keyInput.trim() }));
      setKeyInput("");
      setMessage({ ok: true, text: "API key saved." });
    });

  const removeKey = () =>
    run("remove", async () => {
      setStatus(await call("PUT", { apiKey: "" }));
      setMessage({ ok: true, text: "API key removed." });
    });

  const search = () =>
    run("search", async () => {
      const data = await call("POST", { action: "search", query, apiKey: keyInput.trim() || undefined });
      setCandidates(data.candidates);
      if (data.candidates.length === 0) setMessage({ ok: false, text: "No business found. Try the name and the area, e.g. \"FixMyLeak Clapham\"." });
    });

  const choose = (candidate: Candidate) =>
    run("choose", async () => {
      const body: Record<string, unknown> = { placeId: candidate.placeId, placeName: candidate.name };
      if (keyInput.trim()) body.apiKey = keyInput.trim();
      setStatus(await call("PUT", body));
      setKeyInput("");
      setCandidates(null);
      setQuery("");
      setMessage({ ok: true, text: `Connected to ${candidate.name}. Google reviews will show on the website.` });
    });

  const test = () =>
    run("test", async () => {
      const data = await call("POST", { action: "test" });
      setMessage({
        ok: true,
        text: `Working: ${data.name} has ${data.rating ?? "no"} stars from ${data.count} Google reviews (${data.reviews} shown on the site).`,
      });
    });

  const toggle = (enabled: boolean) =>
    run("toggle", async () => {
      setStatus(await call("PUT", { enabled }));
    });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-center flex-shrink-0">
          <GoogleG className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Google Reviews</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Shows your Google rating and newest Google reviews next to the website&apos;s own reviews.
          </p>
        </div>
      </div>

      {loadError && <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>}

      {status && !status.tableReady && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
          One database step is still needed before this can be saved (the integration settings table). Ask your developer
          to run it.
        </p>
      )}

      {status && status.tableReady && (
        <div className="space-y-6">
          {/* Step 1: key */}
          <section>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">1. Google API key</h4>
            {status.hasKey ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Saved <span className="font-mono">{status.keyHint}</span>
                {status.keySource === "env" && " (from the server settings)"}. Paste a new one below to replace it.
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Create it in Google Cloud Console → APIs &amp; Services → Credentials, with <b>Places API (New)</b> enabled.
                Restrict the key to that API.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                autoComplete="off"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIza…"
                className={FIELD}
                aria-label="Google API key"
              />
              <button type="button" onClick={saveKey} disabled={!keyInput.trim() || busy !== null} className={`${BUTTON} bg-blue-600 text-white hover:bg-blue-500 shrink-0`}>
                {busy === "key" ? "Saving…" : "Save key"}
              </button>
              {status.keySource === "admin" && (
                <button type="button" onClick={removeKey} disabled={busy !== null} className={`${BUTTON} border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 shrink-0`}>
                  Remove
                </button>
              )}
            </div>
          </section>

          {/* Step 2: business */}
          <section>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">2. Your business on Google</h4>
            {status.placeId && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Connected to <b>{status.placeName || status.placeId}</b>. Search again to change it.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    e.preventDefault();
                    search();
                  }
                }}
                placeholder="Business name and area, or a Google Maps link"
                className={FIELD}
                aria-label="Business name or Google Maps link"
              />
              <button
                type="button"
                onClick={search}
                disabled={!query.trim() || (!status.hasKey && !keyInput.trim()) || busy !== null}
                className={`${BUTTON} bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shrink-0`}
              >
                {busy === "search" ? "Searching…" : "Find"}
              </button>
            </div>

            {candidates && candidates.length > 0 && (
              <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                {candidates.map((candidate) => (
                  <li key={candidate.placeId} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{candidate.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {candidate.address}
                        {candidate.rating !== null && ` · ★ ${candidate.rating} (${candidate.count})`}
                      </p>
                    </div>
                    <button type="button" onClick={() => choose(candidate)} disabled={busy !== null} className={`${BUTTON} bg-blue-600 text-white hover:bg-blue-500 shrink-0 py-2`}>
                      This one
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Step 3: on/off + test */}
          {status.placeId && status.hasKey && (
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={status.enabled}
                  onChange={(e) => toggle(e.target.checked)}
                  disabled={busy !== null}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Show Google reviews on the website</span>
              </label>
              <button type="button" onClick={test} disabled={busy !== null} className={`${BUTTON} border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800`}>
                {busy === "test" ? "Checking…" : "Test connection"}
              </button>
            </section>
          )}

          {message && (
            <p
              role={message.ok ? "status" : "alert"}
              className={`rounded-xl px-4 py-3 text-sm ${
                message.ok
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
