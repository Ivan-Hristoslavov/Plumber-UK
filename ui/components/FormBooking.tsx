'use client';

import { useState } from 'react';

type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: string;
};

const services: Service[] = [
  {
    id: 'callout-hourly',
    name: 'Call-out & Hourly Labour Rates',
    description: 'Flexible hourly bookings for urgent or short jobs. See pricing section for full details.',
    price: 'See table',
    icon: '🔧',
  },
  {
    id: 'full-day',
    name: 'Full-Day Booking Rates',
    description: 'Book a full day for larger or planned works. See pricing section for full details.',
    price: 'See table',
    icon: '📅',
  },
];

const timeSlots = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
];

export function FormBooking() {
  const [selectedService, setSelectedService] = useState('');
  const [formKey] = useState(() => Math.random().toString(36));
  
  console.log('FormBooking rendered with key:', formKey);

  // Get today's date for the minimum date and default value
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const defaultDate = minDate;

  return (
    <form key={formKey} action="#" method="POST" className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30"
              placeholder="Enter your full name"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group">
          <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30"
              placeholder="your.email@example.com"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group">
          <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30"
              placeholder="+44 7XXX XXXXXX"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group">
          <label htmlFor="address" className="block text-sm font-semibold text-white mb-2">
            Service Address *
          </label>
          <div className="relative">
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30 resize-none"
              placeholder="Enter the full address where service is needed"
            />
            <div className="absolute top-3 right-3">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-white mb-3">
          Select Service Type *
        </label>
        <div className="grid grid-cols-1 gap-4">
          {services.map(service => (
            <div
              key={service.id}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedService === service.id
                  ? 'border-blue-400 bg-blue-500/20 shadow-lg'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <input
                type="radio"
                name="service"
                value={service.id}
                checked={selectedService === service.id}
                onChange={(e) => setSelectedService(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{service.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{service.name}</h4>
                  <p className="text-sm text-white/70 mb-2">{service.description}</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    {service.price}
                  </span>
                </div>
              </div>
              <div className={`absolute top-4 right-4 transition-opacity ${
                selectedService === service.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label htmlFor="preferred-date" className="block text-sm font-semibold text-white mb-2">
            Preferred Date *
          </label>
          <div className="relative">
            <input
              type="date"
              id="preferred-date"
              name="preferred-date"
              required
              min={minDate}
              defaultValue={defaultDate}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white group-hover:border-white/30 [color-scheme:dark]"
              style={{
                colorScheme: 'dark'
              }}
            />
          </div>
        </div>

        <div className="group">
          <label htmlFor="timeSlot" className="block text-sm font-semibold text-white mb-2">
            Preferred Time *
          </label>
          <div className="relative">
            <select
              id="timeSlot"
              name="timeSlot"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white group-hover:border-white/30 appearance-none"
            >
              <option value="" className="bg-gray-800 text-white">Select a time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot} className="bg-gray-800 text-white">
                  {slot}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="group">
        <label htmlFor="description" className="block text-sm font-semibold text-white mb-2">
          Problem Description
        </label>
        <div className="relative">
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Please describe your plumbing issue in detail..."
            className="w-full px-4 py-3 rounded-xl border-2 border-white/20 focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 group-hover:border-white/30 resize-none"
          />
          <div className="absolute top-3 right-3">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Emergency Option */}
      <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isEmergency"
            name="isEmergency"
            className="h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500 bg-white/10"
          />
          <label htmlFor="isEmergency" className="ml-3 flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-white">
              This is an emergency (45min response time)
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 bg-blue-600 text-white shadow-lg hover:shadow-xl hover:bg-blue-700"
      >
        Send Booking Request
        <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>

      <p className="text-sm text-white/60 text-center">
        * Required fields. For emergencies, call us directly at <strong className="text-white">07541777225</strong>
      </p>
    </form>
  );
} 