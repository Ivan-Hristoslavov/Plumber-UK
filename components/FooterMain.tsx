"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { slugify } from "@/lib/slug";

// Main nav links only (legal links are in the bottom bar)
const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Gallery", href: "#gallery" },
  { name: "FAQ", href: "#faq" },
  { name: "Reviews", href: "#reviews" },
  { name: "Contact", href: "#contact" },
  { name: "Service Areas", href: "#service-areas" },
];

type ServiceArea = {
  id: number | string;
  name: string;
  postcode?: string;
  description: string;
  is_active: boolean;
  slug: string;
};

export default function FooterMain() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [services, setServices] = useState<{ name: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const adminProfile = useAdminProfile();

  // Get business data from admin profile
  const businessData = {
    businessName: adminProfile?.company_name || "Fix My Leak",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service areas
        const areasResponse = await fetch('/api/areas');
        if (areasResponse.ok) {
          const areas = await areasResponse.json();
          setServiceAreas(areas.filter((area: ServiceArea) => area.is_active));
        }

        // Fetch services for the footer link column
        const servicesResponse = await fetch('/api/services');
        if (servicesResponse.ok) {
          const data = await servicesResponse.json();
          setServices(
            (Array.isArray(data) ? data : [])
              .filter((s: { is_active: boolean }) => s.is_active)
              .map((s: { name: string }) => ({ name: s.name, slug: slugify(s.name) }))
          );
        }
      } catch {
        // Silently handle fetch errors — footer shows defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // If it's an anchor link (starts with #), prevent default and scroll
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);

      if (element) {
        // Update URL to reflect the section
        if (pathname === "/") {
          router.replace(`/#${targetId}`, { scroll: false });
        } else {
          router.push(`/#${targetId}`);
        }
        
        // Scroll to the element with offset for the navbar
        const yOffset = -80; // Adjust based on your navbar height
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    // If it's a regular link (like /privacy, /terms), let it navigate normally
    // The default behavior will handle the navigation
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10" suppressHydrationWarning>
          {/* Quick Links */}
          <div className="order-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider transition-colors duration-300">
              Quick Links
            </h3>
            <nav className="mt-3 sm:mt-4 flex flex-col gap-2" suppressHydrationWarning>
              {quickLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Service Areas - linked to their landing pages. The footer is on every
              page, so this is the site's main internal-linking surface. */}
          <div className="order-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider transition-colors duration-300">
              Service Areas
            </h3>
            <div className="mt-3 sm:mt-4 flex flex-col gap-2">
              {isLoading ? (
                <span className="block h-4 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" aria-hidden="true" />
              ) : serviceAreas.length > 0 ? (
                serviceAreas.map((area) => (
                  <Link
                    key={area.id}
                    href={`/areas/${area.slug}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    {area.postcode ? `${area.name} (${area.postcode})` : area.name}
                  </Link>
                ))
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
              )}
            </div>
          </div>

          {/* Services - linked to their landing pages */}
          <div className="order-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider transition-colors duration-300">
              Services
            </h3>
            <div className="mt-3 sm:mt-4 flex flex-col gap-2">
              {services.length > 0 ? (
                services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    {service.name}
                  </Link>
                ))
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar: Desktop = Copyright left | Developed by right; Mobile = Terms/Privacy, Developed by, Copyright */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          {/* Mobile: stacked order - Legal links, Developed by, Copyright */}
          <div className="flex flex-col gap-3 md:hidden text-sm text-gray-500 dark:text-gray-400 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Link href="/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Cookies
              </Link>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Link href="/gdpr" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                GDPR
              </Link>
            </div>
            <div>
              Developed by{" "}
              <a
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                href="https://serenity.rapid-frame.co.uk/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Serenity
              </a>
            </div>
            <div suppressHydrationWarning>
              © {new Date().getFullYear()} {businessData.businessName}
            </div>
          </div>
          {/* Desktop: Copyright + legal left | Developed by right */}
          <div className="hidden md:flex items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span suppressHydrationWarning>© {new Date().getFullYear()} {businessData.businessName}</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Link href="/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Cookies
              </Link>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <Link href="/gdpr" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                GDPR
              </Link>
            </div>
            <div>
              Developed by{" "}
              <a
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                href="https://serenity.rapid-frame.co.uk/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Serenity
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
