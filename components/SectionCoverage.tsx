import Link from "next/link";

type Area = { name: string; slug: string; postcode: string };
type Service = { name: string; slug: string; price: number | null };

/**
 * Server-rendered, unlike the hero's area chips and the footer's link columns,
 * which are both fetched client-side. Without this the homepage's HTML contained
 * no links at all to the area or service pages, leaving them discoverable only
 * through the sitemap.
 */
export function SectionCoverage({
  areas,
  services,
}: {
  areas: Area[];
  services: Service[];
}) {
  if (areas.length === 0 && services.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-800/50 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {services.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                What we do
              </h2>
              <Link
                href="/services"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                All services
              </Link>
            </div>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex items-baseline justify-between gap-4 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </span>
                    {service.price !== null && (
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        from £{service.price}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {areas.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Where we work
              </h2>
              <Link
                href="/areas"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                All areas
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {areas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/areas/${area.slug}`}
                    className="flex items-baseline justify-between gap-2 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {area.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {area.postcode}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
