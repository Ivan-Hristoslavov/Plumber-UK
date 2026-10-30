import type { Metadata } from "next";
import Link from "next/link";

import FoundingJoinForm from "@/components/FoundingJoinForm";
import { BRAND_NAME } from "@/lib/brand";
import { FOUNDING_HREF, FOUNDING_LIMIT, resolveJoinPlan } from "@/lib/founding";
import { getFoundingPlaces } from "@/lib/founding-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply for Founding 100",
  description: `Apply to become one of the first ${FOUNDING_LIMIT} ${BRAND_NAME} founding members.`,
  // An application form has nothing to offer a search result.
  robots: { index: false, follow: false },
};

export default async function FoundingJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const initialPlan = resolveJoinPlan(plan);
  const places = await getFoundingPlaces();
  const full = places !== null && places.remaining === 0;

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-blue-200">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-blue-300">/</span>
            <Link href={FOUNDING_HREF} className="hover:text-white transition-colors">Founding 100</Link>
            <span className="mx-2 text-blue-300">/</span>
            <span className="text-white font-medium">Apply</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Apply to be one of the {FOUNDING_LIMIT}</h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl">
            It takes a couple of minutes. Nothing is charged until we have reviewed and accepted your application.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {full ? (
          <div className="max-w-xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">All {FOUNDING_LIMIT} places are taken</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your interest. You can still book {BRAND_NAME} for any plumbing job.
            </p>
            <Link href="/" className="inline-flex rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition-colors">
              Back to {BRAND_NAME}
            </Link>
          </div>
        ) : (
          <FoundingJoinForm initialPlan={initialPlan.id} />
        )}
      </div>
    </main>
  );
}
