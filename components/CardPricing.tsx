'use client';

import { useState } from 'react';
import Link from 'next/link';

type PricingTier = {
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
};

const pricingTiers: PricingTier[] = [
  {
    name: 'Emergency Call Out',
    description: '24/7 emergency plumbing services',
    price: 85,
    features: [
      'Same day response',
      'Available 24/7',
      'First hour of work included',
      'Parts not included',
      'Free quote for additional work',
    ],
    isPopular: true,
  },
  {
    name: 'Standard Service',
    description: 'Regular plumbing maintenance and repairs',
    price: 65,
    features: [
      'Next day appointment',
      'Standard working hours',
      'First hour of work included',
      'Parts not included',
      'Written quote provided',
    ],
  },
  {
    name: 'Bathroom Installation',
    description: 'Complete bathroom design and installation',
    price: 2500,
    features: [
      'Full bathroom design',
      'Supply and installation',
      'All fixtures included',
      '5-year workmanship guarantee',
      'Free initial consultation',
    ],
  },
];

export function CardPricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  // Calculate annual prices (only for subscription-like services)
  const getPrice = (price: number, isSubscription: boolean = false) => {
    if (isSubscription && isAnnual) {
      return (price * 10).toFixed(2); // 2 months free for annual
    }
    return price.toFixed(2);
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Clear, upfront pricing with no hidden costs
          </p>
        </div>

        <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${
                tier.isPopular ? 'border-black ring-2 ring-black' : 'border-gray-200'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-black px-3 py-1 text-center text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-bold text-gray-900">£{getPrice(tier.price)}</span>
                  {tier.name === 'Bathroom Installation' ? (
                    <span className="text-base font-medium text-gray-500"> starting from</span>
                  ) : (
                    <span className="text-base font-medium text-gray-500"> /hour</span>
                  )}
                </p>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/book-now"
                  className={`block w-full rounded-full px-6 py-3 text-center text-sm font-semibold ${
                    tier.isPopular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-white text-black border border-black hover:bg-gray-50'
                  } transition-colors`}
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            * All prices are in GBP and include VAT. Parts and materials are charged separately.
            <br />
            * Emergency call-out fee applies outside of standard working hours.
            <br />
            * Prices may vary based on location and job complexity.
          </p>
        </div>
      </div>
    </div>
  );
} 