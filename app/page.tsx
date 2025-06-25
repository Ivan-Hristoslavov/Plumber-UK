'use client';

import Link from 'next/link';
import { SectionHero } from '@/components/SectionHero';
import { SectionPricing } from '@/components/SectionPricing';
import { FormBooking } from '@/components/FormBooking';
import { FAQSection } from '../components/FAQSection';
import Image from 'next/image';

const faqItems = [
  {
    question: 'What areas do you cover?',
    answer: 'We provide plumbing services across the entire United Kingdom, with 24/7 emergency coverage in major cities.',
  },
  {
    question: 'Are your plumbers qualified?',
    answer: 'Yes, all our plumbers are fully qualified, Gas Safe registered, and undergo regular training to maintain the highest standards.',
  },
  {
    question: 'Do you offer emergency services?',
    answer: 'Yes, we provide 24/7 emergency plumbing services. Our emergency team is always on call to handle urgent situations.',
  },
  {
    question: 'What are your payment terms?',
    answer: 'We accept all major credit cards, bank transfers, and cash payments. Payment is due upon completion of work.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Home Section */}
      <SectionHero />

      {/* Pricing Section */}
      <SectionPricing />

      {/* About Section */}
      <section id="about" className="relative py-24 overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500 rounded-full"></div>
          <div className="absolute top-60 right-20 w-32 h-32 bg-purple-500 rounded-full"></div>
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-yellow-500 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-36 h-36 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Our Expert Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the professionals who bring years of experience and dedication to every plumbing job
            </p>
          </div>
          
          {/* Main Content Grid - Symmetric Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Image */}
            <div className="flex justify-center">
              <div className="relative group max-w-md">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-4 group-hover:shadow-3xl transition-all duration-500 transform group-hover:-translate-y-2">
                  <div className="relative rounded-2xl overflow-hidden">
                    <Image
                      src="/plamen.jpeg"
                      alt="Plamen Zhelev"
                      width={400}
                      height={500}
                      className="object-cover w-full h-[500px] transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* Professional Name Card */}
                <div className="mt-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 px-6 py-4 transform group-hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <h3 className="font-bold text-2xl text-gray-900 mb-1">Plamen Zhelev</h3>
                    <p className="text-gray-600 mb-3">Professional Plumber</p>
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">Fully Qualified • 10+ Years</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Available Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Content */}
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Your Trusted Plumbing Partner</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    My name is Plamen Zhelev, and I'm a fully qualified plumbing and heating engineer based in London. 
                    With over 10 years of hands-on experience and professional qualifications, I run my own company – PZ Plumbing Ltd.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed">
                    I cover areas including Clapham, Balham, Chelsea, Wandsworth, Battersea, and the surrounding parts of London.
                    I offer emergency callouts with response times of up to 45 minutes and same-day service guaranteed.
                  </p>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p className="text-sm text-blue-800 font-medium">
                        <strong>Notable Project:</strong> Worked at Claridge's Hotel in Mayfair for three years, installing and maintaining high-end plumbing systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Services List */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-6">Our Services</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-medium">Leak detection and repair</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-medium">Emergency callouts - 45 min response</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-medium">Installation of sanitary appliances</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-medium">Quooker boiling water taps fitting</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1V4z" />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-medium">Tap, sink, waste & valve repairs</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="mt-6 text-center">
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Get In Touch
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
              <p className="text-gray-600">Numbers that speak for our quality and reliability</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="group bg-blue-600 p-8 rounded-3xl shadow-lg text-center text-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-4xl font-bold mb-2">10+</h4>
                <p className="text-blue-100 font-medium">Years Experience</p>
              </div>
              
              <div className="group bg-green-600 p-8 rounded-3xl shadow-lg text-center text-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-4xl font-bold mb-2">10k+</h4>
                <p className="text-green-100 font-medium">Happy Customers</p>
              </div>
              
              <div className="group bg-purple-600 p-8 rounded-3xl shadow-lg text-center text-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-4xl font-bold mb-2">45min</h4>
                <p className="text-purple-100 font-medium">Response Time</p>
              </div>
              
              <div className="group bg-orange-600 p-8 rounded-3xl shadow-lg text-center text-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-4xl font-bold mb-2">100%</h4>
                <p className="text-orange-100 font-medium">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <section id="contact" className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 py-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Get In Touch</h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Ready to fix your plumbing issues? Contact us today for fast, reliable service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
              
              {/* Contact Cards */}
              <div className="space-y-4">
                <div className="group bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Emergency Hotline</p>
                      <p className="text-white/80 text-lg font-bold">07541777225</p>
                      <p className="text-white/60 text-xs">45 min response time guaranteed</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <p className="text-white/80 text-lg font-bold">yo_plam@yahoo.com</p>
                      <p className="text-white/60 text-xs">Free consultation available</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Service Areas</p>
                      <div className="text-white/80">
                        <p className="font-bold text-sm">London Coverage</p>
                        <p className="text-sm">Clapham • Balham • Chelsea • Wandsworth • Battersea</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2 pt-4">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white/90 text-xs font-medium">Fully Qualified</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <svg className="w-4 h-4 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-xs font-medium">Public Liability</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-xs font-medium">PZ Plumbing Ltd</span>
                </div>
              </div>
            </div>
            
            {/* Booking Form */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Book a Service</h3>
              <FormBooking />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
