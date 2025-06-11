'use client';

import { useState } from 'react';

type PricingTier = {
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  callout?: string;
};

const pricingTiers: PricingTier[] = [
  {
    name: 'Emergency Leak Repair',
    description: '24/7 emergency leak detection and repair',
    price: 85,
    features: [
      'Same day response',
      '24/7 availability',
      'First hour of work included',
      'Leak detection equipment',
      'Basic pipe repair included',
    ],
    callout: 'Most Popular',
  },
  {
    name: 'Standard Pipe Repair',
    description: 'Regular pipe maintenance and repairs',
    price: 65,
    features: [
      'Standard working hours',
      'Next day availability',
      'First hour of work included',
      'Pipe inspection included',
      'Basic repairs included',
    ],
  },
  {
    name: 'Pipe Replacement',
    description: 'Complete pipe replacement service',
    price: 150,
    features: [
      'Full pipe inspection',
      'Supply of new pipes',
      'Professional installation',
      'Quality guarantee',
      'Aftercare support',
    ],
    isPopular: true,
  },
];

const additionalServices = [
  {
    name: 'Leak Detection',
    price: 85,
    description: 'Advanced leak detection using latest technology',
  },
  {
    name: 'Pipe Unblocking',
    price: 120,
    description: 'Professional pipe unblocking service',
  },
  {
    name: 'Pipe Insulation',
    price: 75,
    description: 'Pipe insulation to prevent freezing',
  },
  {
    name: 'Pressure Testing',
    price: 95,
    description: 'Water pressure testing and adjustment',
  },
  {
    name: 'Pipe Relining',
    price: 350,
    description: 'Pipe relining without excavation',
  },
  {
    name: 'Emergency Shut-off',
    price: 45,
    description: 'Emergency water shut-off service',
  },
];

export function SectionPricing() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            All prices include VAT. Additional charges may apply based on location and job complexity.
          </p>
        </div>

        {/* Main Pricing Tiers */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border ${
                tier.isPopular
                  ? 'border-black shadow-xl'
                  : 'border-gray-200 shadow-lg'
              } bg-white p-8 transition-all hover:shadow-2xl`}
            >
              {tier.callout && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-black px-4 py-1 text-sm font-semibold text-white">
                    {tier.callout}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
                <p className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">£{tier.price}</span>
                  {tier.name !== 'Pipe Replacement' && (
                    <span className="text-sm text-gray-600">/hour</span>
                  )}
                </p>
              </div>
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-1"
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
                    <span className="ml-3 text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold ${
                    tier.isPopular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Additional Services
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {additionalServices.map((service) => (
              <div
                key={service.name}
                className={`rounded-lg border ${
                  selectedService === service.name
                    ? 'border-black shadow-lg'
                    : 'border-gray-200'
                } bg-white p-6 transition-all hover:shadow-md`}
                onClick={() => setSelectedService(service.name)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {service.description}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    From £{service.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Note */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            * All prices are subject to change based on job complexity and location.
            <br />
            ** Emergency call-out fee applies outside standard working hours.
            <br />
            *** Free quotes available for all services.
          </p>
        </div>
      </div>
    </section>
  );
} 