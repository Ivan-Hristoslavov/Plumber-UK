'use client';

import { useState } from 'react';

type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
};

const services: Service[] = [
  {
    id: 'emergency-leak',
    name: 'Emergency Leak Repair',
    description: '24/7 emergency leak detection and repair',
    price: '£85/hour',
  },
  {
    id: 'standard-pipe',
    name: 'Standard Pipe Repair',
    description: 'Regular pipe maintenance and repairs',
    price: '£65/hour',
  },
  {
    id: 'pipe-replacement',
    name: 'Pipe Replacement',
    description: 'Complete pipe replacement service',
    price: 'From £150',
  },
  {
    id: 'leak-detection',
    name: 'Leak Detection',
    description: 'Advanced leak detection service',
    price: '£85',
  },
  {
    id: 'pipe-unblocking',
    name: 'Pipe Unblocking',
    description: 'Professional pipe unblocking service',
    price: '£120',
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    service: '',
    date: '',
    timeSlot: '',
    description: '',
    isEmergency: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        service: '',
        date: '',
        timeSlot: '',
        description: '',
        isEmergency: false,
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Get tomorrow's date for the minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>
        </div>

        {/* Service Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700">
              Select Service *
            </label>
            <select
              id="service"
              name="service"
              required
              value={formData.service}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            >
              <option value="">Choose a service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Preferred Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              min={minDate}
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">
              Preferred Time Slot *
            </label>
            <select
              id="timeSlot"
              name="timeSlot"
              required
              value={formData.timeSlot}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            >
              <option value="">Select a time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Problem Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Please describe your plumbing issue..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isEmergency"
              name="isEmergency"
              checked={formData.isEmergency}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="isEmergency" className="ml-2 block text-sm text-gray-700">
              This is an emergency (24/7 service available)
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-lg text-white font-medium ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          } transition-colors`}
        >
          {isSubmitting ? 'Submitting...' : 'Book Now'}
        </button>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
          Thank you for your booking! We will contact you shortly to confirm your appointment.
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          There was an error submitting your booking. Please try again or call us directly.
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        * Required fields. For emergencies, please call us directly at 0800 123 4567.
      </p>
    </form>
  );
} 