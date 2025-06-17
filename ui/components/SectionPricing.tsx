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
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-yellow-500 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-green-500 rounded-full"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Transparent Pricing
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            FixMyLeak - Professional Rates
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Clear, competitive pricing with no hidden fees. Choose the service that best fits your needs.
          </p>
        </div>
        
        {/* Enhanced Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 justify-center max-w-6xl mx-auto mb-16">
          {/* Card 1: Call-out & Hourly Labour Rates */}
          <div className="group relative bg-white rounded-3xl shadow-xl border border-gray-200 p-10 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-500" />
            
            <div className="relative z-10">
              {/* Header with Icon */}
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Call-out & Hourly Labour Rates</h3>
                  <p className="text-blue-600 font-medium">Flexible hourly bookings</p>
                </div>
              </div>
              
              {/* Enhanced Table */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 pr-4 font-bold text-gray-900 text-left">Day & Time</th>
                        <th className="py-3 pr-4 font-bold text-gray-900 text-left">Call-out Fee</th>
                        <th className="py-3 font-bold text-gray-900 text-left">Labour Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">Mon-Fri 08:00-18:00</td>
                        <td className="py-3 pr-4 text-green-600 font-bold">£80</td>
                        <td className="py-3 text-blue-600 font-bold">£60-£80</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">Mon-Fri 18:00-08:00</td>
                        <td className="py-3 pr-4 text-orange-600 font-bold">£110</td>
                        <td className="py-3 text-purple-600 font-bold">£100-£120</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">Saturday 08:00-18:00</td>
                        <td className="py-3 pr-4 text-orange-600 font-bold">£110</td>
                        <td className="py-3 text-blue-600 font-bold">£80-£100</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">Saturday 18:00-08:00</td>
                        <td className="py-3 pr-4 text-red-600 font-bold">£130</td>
                        <td className="py-3 text-purple-600 font-bold">£100-£120</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">Sunday (All day)</td>
                        <td className="py-3 pr-4 text-red-600 font-bold">£140</td>
                        <td className="py-3 text-purple-600 font-bold">£100-£130</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-gray-800">Bank Holidays (All day)</td>
                        <td className="py-3 pr-4 text-red-700 font-bold">£150</td>
                        <td className="py-3 text-red-600 font-bold">£120-£140</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Perfect for urgent repairs and smaller jobs</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">24/7 emergency availability</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Transparent pricing with no hidden fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Full-Day Booking Rates */}
          <div className="group relative bg-white rounded-3xl shadow-xl border border-gray-200 p-10 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-500" />
            
            <div className="relative z-10">
              {/* Header with Icon */}
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Full-Day Booking Rates</h3>
                  <p className="text-orange-600 font-medium">Better value for larger projects</p>
                </div>
              </div>
              
              {/* Enhanced Table */}
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-6 mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 pr-4 font-bold text-gray-900 text-left">Day</th>
                        <th className="py-3 font-bold text-gray-900 text-left">Full-Day Rate (Approx. 8h)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-4 pr-4 font-medium text-gray-800">Mon-Fri</td>
                        <td className="py-4 text-green-600 font-bold text-lg">£480 - £520</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-4 pr-4 font-medium text-gray-800">Saturday</td>
                        <td className="py-4 text-orange-600 font-bold text-lg">£600 - £750</td>
                      </tr>
                      <tr className="hover:bg-white/50 transition-colors">
                        <td className="py-4 pr-4 font-medium text-gray-800">Sunday / Bank Holiday</td>
                        <td className="py-4 text-red-600 font-bold text-lg">£750 - £950</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Ideal for larger projects and planned maintenance</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Up to 30% savings compared to hourly rates</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Dedicated full day service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Explanatory Text */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100 max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Important Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-relaxed">All rates above are <strong>labour only</strong>. Materials are not included and can be supplied by the customer.</p>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-relaxed">Materials can be provided by us at <strong>cost + 20%</strong> for your convenience.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-relaxed">Call-out fee includes <strong>travel and initial assessment</strong> of the problem.</p>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-relaxed">Full-day bookings offer <strong>reduced hourly rates</strong> and are subject to availability.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-center text-gray-700 font-medium">
              All prices are set based on average rates in <strong>South West London</strong> and remain competitive and fair.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 