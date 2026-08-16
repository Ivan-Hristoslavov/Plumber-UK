import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAdminProfile } from "@/lib/admin-profile";
import { responseTimeMinutes } from "@/lib/response-time";
import { BRAND_NAME } from "@/lib/brand";

export const revalidate = 3600;

type Area = {
  name: string;
  slug: string;
  postcode: string;
  description: string;
};

async function getAreas(): Promise<Area[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("admin_areas_cover")
      .select("name, slug, postcode, description")
      .eq("is_active", true)
      .order("order", { ascending: true });

    return data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const areas = await getAreas();
  const names = areas.map((a) => a.name).join(", ");

  const title = "Areas We Cover";
  const description = `Emergency plumbing across South West London — ${names}. Same-day callouts, fully insured, transparent pricing.`;

  return {
    title,
    description,
    alternates: { canonical: `${base}/areas` },
    openGraph: {
      title,
      description,
      url: `${base}/areas`,
      type: "website",
      locale: "en_GB",
      siteName: BRAND_NAME,
      images: [{ url: "/fix_my_leak_logo.jpg", width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function AreasIndexPage() {
  const [areas, profile] = await Promise.all([getAreas(), getAdminProfile()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const responseTime = responseTimeMinutes(profile?.response_time);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Areas We Cover", item: `${base}/areas` },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-blue-100">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-blue-300">/</span>
            <span className="text-white font-medium">Areas We Cover</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Areas We Cover
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Emergency plumbing across South West London, with a {responseTime}-minute
            response target in every area below.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/areas/${area.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all"
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {area.name}
                </h2>
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  {area.postcode}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                {area.description}
              </p>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1">
                Emergency plumber in {area.name}
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <p className="text-center text-gray-600 dark:text-gray-300 mt-10">
          Not listed?{" "}
          <Link href="/#contact" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Get in touch
          </Link>{" "}
          — we often cover neighbouring postcodes.
        </p>
      </section>
    </main>
  );
}
