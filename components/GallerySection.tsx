"use client";

import React, { useState } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useGallerySections } from "@/hooks/useGallerySections";

export function GallerySection() {
  const { galleryItems, loading, error } = useGallery();
  const { gallerySections, isLoading: sectionsLoading } = useGallerySections();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Filter items
  const filteredItems = selectedFilter === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.section_id === parseInt(selectedFilter));

  // Get sections that have items
  const sectionsWithItems = gallerySections.filter(section => 
    galleryItems.some(item => item.section_id === section.id)
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  if (loading || sectionsLoading) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-gray-600 dark:text-gray-300">Loading gallery...</div>
        </div>
      </section>
    );
  }

  if (error || filteredItems.length === 0) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Work Gallery
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error ? "Error loading gallery" : "No gallery items available yet."}
          </p>
        </div>
      </section>
    );
  }

  const currentItem = filteredItems[currentIndex];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-500" id="gallery">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full" />
        <div className="absolute top-60 right-32 w-24 h-24 bg-purple-500 rounded-full" />
        <div className="absolute bottom-40 left-1/3 w-16 h-16 bg-yellow-500 rounded-full" />
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-green-500 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Before & After Gallery
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Completed Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See the transformation we bring to homes across South West London. 
            From emergency repairs to complete renovations.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => {
              setSelectedFilter("all");
              setCurrentIndex(0);
            }}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedFilter === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
          >
            All Projects
          </button>
          {sectionsWithItems.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setSelectedFilter(section.id.toString());
                setCurrentIndex(0);
              }}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedFilter === section.id.toString()
                  ? "text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
              }`}
              style={{
                backgroundColor: selectedFilter === section.id.toString() ? section.color : undefined
              }}
            >
              {section.name}
            </button>
          ))}
        </div>

        {/* Main Gallery Carousel */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-96 lg:h-[600px]">
              {/* Before/After Toggle */}
              <div className="absolute top-4 left-4 z-20">
                <div className="flex bg-black/50 rounded-full p-1">
                  <button
                    onClick={() => setShowBefore(true)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      showBefore 
                        ? "bg-white text-gray-900 shadow-lg" 
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    Before
                  </button>
                  <button
                    onClick={() => setShowBefore(false)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      !showBefore 
                        ? "bg-white text-gray-900 shadow-lg" 
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    After
                  </button>
                </div>
              </div>

              {/* Image */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={showBefore ? currentItem.before_image_url : currentItem.after_image_url}
                  alt={showBefore ? "Before" : "After"}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Navigation Arrows */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
                  >
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group"
                  >
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-6">
                {currentItem.is_featured && (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-4">
                    ⭐ Featured Project
                  </span>
                )}
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentItem.title}
                </h3>
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  {currentItem.project_type && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      {currentItem.project_type}
                    </div>
                  )}
                  {currentItem.location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      {currentItem.location}
                    </div>
                  )}
                  {currentItem.completion_date && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      {new Date(currentItem.completion_date).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>
              </div>

              {currentItem.description && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  {currentItem.description}
                </p>
              )}

              {/* Project Counter */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Project {currentIndex + 1} of {filteredItems.length}
                </div>
                
                {/* Dots Indicator */}
                {filteredItems.length > 1 && (
                  <div className="flex space-x-2">
                    {filteredItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? "bg-blue-600 scale-125"
                            : "bg-gray-300 dark:bg-gray-600 hover:bg-blue-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid - Additional Projects */}
        {filteredItems.length > 1 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              More Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.slice(0, 6).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    index === currentIndex ? "ring-4 ring-blue-500" : ""
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.before_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium">{item.project_type}</p>
                      <p className="text-xs opacity-90">{item.location}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 