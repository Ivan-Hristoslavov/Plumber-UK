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
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black sm:text-4xl mb-2">
            FixMyLeak - Rates Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-40 justify-center">
          {/* Card 1: Call-out & Hourly Labour Rates */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 min-w-[380px] md:min-w-[480px] flex flex-col">
            <h3 className="text-2xl font-semibold text-black mb-6 text-center">Call-out & Hourly Labour Rates</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-bold">Day & Time</th>
                    <th className="py-2 pr-4 font-bold">Call-out Fee</th>
                    <th className="py-2 font-bold">Labour Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="py-2 pr-4">Mon-Fri 08:00-18:00</td><td className="py-2 pr-4">£80</td><td className="py-2">£60-£80</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">Mon-Fri 18:00-08:00</td><td className="py-2 pr-4">£110</td><td className="py-2">£100-£120</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">Saturday 08:00-18:00</td><td className="py-2 pr-4">£110</td><td className="py-2">£80-£100</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">Saturday 18:00-08:00</td><td className="py-2 pr-4">£130</td><td className="py-2">£100-£120</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">Sunday (All day)</td><td className="py-2 pr-4">£140</td><td className="py-2">£100-£130</td></tr>
                  <tr><td className="py-2 pr-4">Bank Holidays (All day)</td><td className="py-2 pr-4">£150</td><td className="py-2">£120-£140</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Card 2: Full-Day Booking Rates */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 min-w-[380px] md:min-w-[480px] flex flex-col">
            <h3 className="text-2xl font-semibold text-black mb-6 text-center">Full-Day Booking Rates</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-bold">Day</th>
                    <th className="py-2 font-bold">Full-Day Rate (Approx. 8h)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="py-2 pr-4">Mon-Fri</td><td className="py-2">£480 - £520</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">Saturday</td><td className="py-2">£600 - £750</td></tr>
                  <tr><td className="py-2 pr-4">Sunday / Bank Holiday</td><td className="py-2">£750 - £950</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Explanatory Text */}
        <div className="mt-12 text-center text-base text-black max-w-3xl mx-auto space-y-4">
          <p>All rates above are labour only. Materials are not included and can be supplied by the customer, or provided by me at cost + 20%. Call-out fee includes travel and initial assessment.</p>
          <p>Full-day bookings offer reduced hourly rates and are subject to availability.</p>
          <p>All prices are set based on average rates in South West London and remain competitive and fair.</p>
        </div>
      </div>
    </section>
  );
} 