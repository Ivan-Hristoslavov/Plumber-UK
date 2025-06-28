import { title } from "@/components/primitives";
import { AdminProfileMarkdown } from "@/components/AdminProfileMarkdown";
import { AdminProfileData } from "@/components/AdminProfileData";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
          <h1 className={`${title()} text-gray-900 dark:text-white mb-8 text-center`}>
            About <AdminProfileData type="name" fallback="FixMyLeak" />
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            {/* Dynamic About Me Content */}
            <div className="mb-8">
              <AdminProfileMarkdown 
                type="about" 
                fallback=""
                className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
              />
            </div>

            {/* Static Content */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              FixMyLeak is London's premier emergency plumbing service, specializing in rapid leak detection 
              and comprehensive plumbing solutions across South West and Central London areas.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're committed to providing fast, reliable, and professional plumbing services when you need them most. 
              With our <AdminProfileData type="response_time" fallback="45-minute" /> response guarantee and 24/7 availability, we ensure your plumbing emergencies 
              are resolved quickly and efficiently.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Us</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
              <li className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 w-2 h-2 rounded-full mt-3 mr-3"></span>
                Emergency response within <AdminProfileData type="response_time" fallback="45 minutes" />
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 w-2 h-2 rounded-full mt-3 mr-3"></span>
                Fully licensed and insured professionals
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 w-2 h-2 rounded-full mt-3 mr-3"></span>
                Transparent pricing with no hidden fees
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 w-2 h-2 rounded-full mt-3 mr-3"></span>
                Comprehensive guarantee on all work
              </li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Contact Us Today
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Don't let plumbing problems disrupt your day. Call our emergency hotline for immediate assistance.
              </p>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  <AdminProfileData type="phone" fallback="07541777225" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
