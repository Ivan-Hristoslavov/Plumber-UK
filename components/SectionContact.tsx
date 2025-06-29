"use client";

import { useState, useEffect } from "react";
import { AdminProfileData } from "@/components/AdminProfileData";
import FormBooking from "@/components/FormBooking";
import { useWorkingHours } from "@/hooks/useWorkingHours";

type ServiceArea = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
};

type BusinessSettings = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  emergencyRate: string;
  standardRate: string;
  responseTime: string;
};

export default function SectionContact() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: "Fix My Leak",
    businessEmail: "info@fixmyleak.com", 
    businessPhone: "+44 7541777225",
    businessAddress: "London, UK",
    emergencyRate: "150",
    standardRate: "75",
    responseTime: "45 minutes"
  });
  const [isLoading, setIsLoading] = useState(true);
  const { workingHours } = useWorkingHours();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service areas
        const areasResponse = await fetch('/api/areas');
        if (areasResponse.ok) {
          const areas = await areasResponse.json();
          setServiceAreas(areas.filter((area: ServiceArea) => area.is_active));
        }

        // Fetch business settings from admin_settings
        const settingsResponse = await fetch('/api/admin/settings');
        if (settingsResponse.ok) {
          const data = await settingsResponse.json();
          const settings: { [key: string]: any } = {};
          
          data.settings?.forEach((setting: any) => {
            try {
              settings[setting.key] = typeof setting.value === 'string' 
                ? JSON.parse(setting.value) 
                : setting.value;
            } catch {
              settings[setting.key] = setting.value;
            }
          });

          setBusinessSettings(prev => ({
            businessName: settings.businessName || prev.businessName,
            businessEmail: settings.businessEmail || prev.businessEmail,
            businessPhone: settings.businessPhone || prev.businessPhone,
            businessAddress: settings.businessAddress || prev.businessAddress,
            emergencyRate: settings.emergencyRate || prev.emergencyRate,
            standardRate: settings.standardRate || prev.standardRate,
            responseTime: prev.responseTime // Keep default, will be updated from admin_profile
          }));
        }

        // Fetch admin profile for response_time
        const profileResponse = await fetch('/api/admin/profile');
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setBusinessSettings(prev => ({
            ...prev,
            responseTime: profile.response_time || prev.responseTime
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatWorkingHours = () => {
    const start = workingHours.workingHoursStart;
    const end = workingHours.workingHoursEnd;
    const days = workingHours.workingDays.length;
    
    if (days === 7) return `${start} - ${end} (7 days/week)`;
    if (days === 6) return `${start} - ${end} (Mon-Sat)`;
    if (days === 5) return `${start} - ${end} (Mon-Fri)`;
    return `${start} - ${end} (${days} days/week)`;
  };

  return (
    <section
      className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 shadow-sm">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Get Professional Help
          </div>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Contact & Book Your Service
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300 max-w-4xl mx-auto">
            Get in touch for immediate assistance or book your service online. Professional plumbing solutions available 24/7.
          </p>
        </div>

        {/* Two Row Layout */}
        <div className="space-y-12">
          
          {/* Row 1: Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Emergency Contact */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Emergency 24/7</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Urgent plumbing repairs</p>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <a href={`tel:${businessSettings.businessPhone}`} className="text-red-600 dark:text-red-400 font-bold text-lg hover:text-red-700 dark:hover:text-red-300 transition-colors">
                      {businessSettings.businessPhone}
                    </a>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      From £{businessSettings.emergencyRate}/hour
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Regular Contact */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Regular Service</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{formatWorkingHours()}</p>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <a href={`tel:${businessSettings.businessPhone}`} className="text-green-600 dark:text-green-400 font-bold text-lg hover:text-green-700 dark:hover:text-green-300 transition-colors">
                      {businessSettings.businessPhone}
                    </a>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      From £{businessSettings.standardRate}/hour
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Email Contact */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Quick quotes & inquiries</p>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                  </div>
                ) : (
                  <>
                    <a href={`mailto:${businessSettings.businessEmail}`} className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm break-all">
                      {businessSettings.businessEmail}
                    </a>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Response within {businessSettings.responseTime}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Service Areas */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Coverage Areas</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">South West London</p>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                ) : serviceAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {serviceAreas.slice(0, 4).map((area) => (
                      <span key={area.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {area.name}
                      </span>
                    ))}
                    {serviceAreas.length > 4 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        +{serviceAreas.length - 4} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                    Clapham, Balham, Chelsea
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Booking Form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Book Your Service Online</h3>
                  <p className="text-blue-100">Fast booking • Transparent pricing • Professional service</p>
                </div>
                <div className="hidden lg:flex items-center space-x-6 text-white">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    <span className="text-sm">45min response</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    <span className="text-sm">No hidden fees</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <FormBooking />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}