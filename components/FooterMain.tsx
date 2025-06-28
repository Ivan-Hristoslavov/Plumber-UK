"use client";

import Link from "next/link";

// Import navigation structure from NavigationNavbar
const navigation = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#pricing" },
  { 
    name: "About", 
    href: "#about",
    dropdown: [
      { name: "Our Story", href: "#about" },
      { name: "Service Areas", href: "#areas" },
      { name: "Gallery", href: "#gallery" }
    ]
  },
  { 
    name: "Support", 
    href: "#faq",
    dropdown: [
      { name: "FAQ", href: "#faq" },
      { name: "Reviews", href: "#reviews" }
    ]
  },
  { name: "Contact", href: "#contact" },
];

export default function FooterMain() {
  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);

    if (element) {
      // Scroll to the element with offset for the navbar
      const yOffset = -80; // Adjust based on your navbar height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link
              className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
              href="/"
            >
              FIX MY LEAK
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 max-w-md">
              Professional plumbing services across South West London. Emergency repairs, 
              installations, and maintenance with Gas Safe certified engineers.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                📞 Emergency 24/7: <span className="font-semibold text-blue-600 dark:text-blue-400">+44 7700 123456</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                📧 Email: <span className="font-semibold">admin@fixmyleak.com</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider transition-colors duration-300">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleClick(e, item.href)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <ul className="mt-2 ml-4 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            onClick={(e) => handleClick(e, subItem.href)}
                            className="text-xs text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider transition-colors duration-300">
              Service Areas
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/areas/clapham"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Clapham
                </Link>
              </li>
              <li>
                <Link
                  href="/areas/battersea"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Battersea
                </Link>
              </li>
              <li>
                <Link
                  href="/areas/chelsea"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Chelsea
                </Link>
              </li>
              <li>
                <Link
                  href="/areas/wandsworth"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Wandsworth
                </Link>
              </li>
              <li>
                <Link
                  href="/areas/balham"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Balham
                </Link>
              </li>
              <li>
                <Link
                  href="/areas/streatham"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Streatham
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              © {new Date().getFullYear()} Fix my leak. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Gas Safe Registered
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Fully Insured
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Developed by{" "}
                <a
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  href="https://serenity.rapid-frame.co.uk/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Serenity Web Studio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
