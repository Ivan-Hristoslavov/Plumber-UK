import Link from 'next/link';
import { SectionHero } from '@/components/SectionHero';
import { SectionPricing } from '@/components/SectionPricing';
import { FormBooking } from '@/components/FormBooking';

const services = [
  {
    title: 'Emergency Leak Repair',
    description: '24/7 emergency leak detection and repair services for urgent situations.',
  },
  {
    title: 'Pipe Maintenance',
    description: 'Professional pipe inspection, repair, and maintenance services.',
  },
  {
    title: 'Leak Detection',
    description: 'Advanced leak detection using the latest technology and equipment.',
  },
];

const additionalServices = [
  {
    title: 'Boiler Services',
    description: 'Annual boiler service and maintenance to ensure your heating system runs efficiently and safely.',
    price: 'From £85',
  },
  {
    title: 'Drainage Services',
    description: 'Professional drain unblocking, CCTV surveys, and drain repairs.',
    price: 'From £120',
  },
  {
    title: 'Gas Safety Certificates',
    description: 'Gas safety inspections and certification for landlords and homeowners.',
    price: 'From £75',
  },
  {
    title: 'Leak Detection',
    description: 'Advanced leak detection services using the latest technology.',
    price: 'From £150',
  },
  {
    title: 'Power Flushing',
    description: 'Professional power flushing of central heating systems.',
    price: 'From £350',
  },
  {
    title: 'Radiator Installation',
    description: 'Supply and installation of new radiators.',
    price: 'From £180',
  },
];

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

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <SectionPricing />

      {/* About Section */}
      <section id="about" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">About Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Your Trusted Plumbing Partner</h3>
              <p className="text-gray-600 mb-6">
                With over 15 years of experience, we've been providing professional plumbing services across the UK. 
                Our team of qualified plumbers is committed to delivering the highest quality service to every customer.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-black mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gas Safe registered engineers</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-black mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 emergency services</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-black mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Fully insured and guaranteed work</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-4xl font-bold text-black mb-2">15+</h4>
                <p className="text-gray-600">Years Experience</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-4xl font-bold text-black mb-2">10k+</h4>
                <p className="text-gray-600">Happy Customers</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-4xl font-bold text-black mb-2">24/7</h4>
                <p className="text-gray-600">Emergency Service</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-4xl font-bold text-black mb-2">100%</h4>
                <p className="text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqItems.map((item, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Book a Service</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-black mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Emergency Hotline</p>
                    <p className="text-gray-600">0800 123 4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-black mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">info@fixmyleak.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-black mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Working Hours</p>
                    <p className="text-gray-600">24/7 Emergency Service</p>
                    <p className="text-gray-600">Mon-Fri: 8am-6pm</p>
                    <p className="text-gray-600">Sat: 9am-4pm</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <FormBooking />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
