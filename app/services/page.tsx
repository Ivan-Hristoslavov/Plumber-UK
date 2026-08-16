import type { Metadata } from "next";
import Link from "next/link";

import { getActiveServices } from "@/lib/services";
import { getAdminProfile } from "@/lib/admin-profile";
import { responseTimeMinutes } from "@/lib/response-time";
import { BRAND_NAME } from "@/lib/brand";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const services = await getActiveServices();
  const names = services.map((s) => s.name).join(", ");

  const title = "Plumbing Services & Prices";
  const description = `${names} across South West London. Transparent pricing, same-day emergency callouts, fully insured.`;

  return {
    title,
    description,
    alternates: { canonical: `${base}/services` },
    openGraph: {
      title,
      description,
      url: `${base}/services`,
      type: "website",
      locale: "en_GB",
      siteName: BRAND_NAME,
      images: [{ url: "/fix_my_leak_logo.jpg", width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function ServicesIndexPage() {
  const [services, profile] = await Promise.all([getActiveServices(), getAdminProfile()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://fixmyleak.co.uk";
  const responseTime = responseTimeMinutes(profile?.response_time);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Services", item: `${base}/services` },
    ],
  };

  // An ItemList of the services makes the relationship between this hub and its
  // children explicit rather than leaving it to be inferred from links alone.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.name,
      url: `${base}/services/${service.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-blue-100">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-blue-300">/</span>
            <span className="text-white font-medium">Services</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Plumbing Services &amp; Prices
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Every job quoted before work starts. Emergency callouts answered within
            {" "}{responseTime} minutes across South West London.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all flex flex-col"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {service.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-1">
                {service.description}
              </p>
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {service.price !== null && (
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    from £{service.price}
                  </span>
                )}
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
