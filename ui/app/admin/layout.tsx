'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Calendar', href: '/admin/calendar' },
  { name: 'Bookings', href: '/admin/bookings' },
  { name: 'Customers', href: '/admin/customers' },
  { name: 'Invoices', href: '/admin/invoices' },
  { name: 'Payments', href: '/admin/payments' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    // Check authentication
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [pathname, router]);

  // If we're on the login page, just render the children
  if (pathname === '/admin/login') {
    return children;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render the admin layout
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/calendar" className="text-xl font-bold text-primary">
                  Admin Panel
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem('adminAuth');
                  router.push('/admin/login');
                }}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - full width and horizontal scroll */}
      <main className="w-full px-2 md:px-4 py-6 overflow-x-auto">
        {children}
      </main>
    </div>
  );
} 