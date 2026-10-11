"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../../../components/ThemeToggle";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Send credentials to API for authentication
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Redirect to dashboard on successful login
        router.push("/admin/dashboard");
      } else {
        const data = await response.json();

        setError(data.error || "Invalid credentials");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    }
  };

  const inputClass =
    "block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-colors duration-200";

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10"
      />

      {/* Theme Toggle */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle size="md" />
      </div>

      {/* Back to Home Button */}
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <button
          className="flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all duration-200 hover:text-blue-600 hover:shadow dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-blue-400"
          onClick={() => (window.location.href = "/")}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          Back to Home
        </button>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/30">
          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 3.5c-3.2 4-5.5 6.9-5.5 9.8a5.5 5.5 0 0011 0c0-2.9-2.3-5.8-5.5-9.8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Admin Panel Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Access the admin dashboard
        </p>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-gray-200/80 bg-white px-5 py-8 shadow-xl shadow-gray-900/5 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                Email address
              </label>
              <input
                required
                autoComplete="email"
                className={inputClass}
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                Password
              </label>
              <input
                required
                autoComplete="current-password"
                className={inputClass}
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <button
              className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Contact support if you&apos;ve forgotten your credentials
          </p>
        </div>
      </div>
    </div>
  );
}
