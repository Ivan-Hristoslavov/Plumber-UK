'use client';

export function SectionHero() {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center bg-black text-white">
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Professional Plumbing Services
        </h1>
        <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
          Available 24/7 across the United Kingdom for all your plumbing needs
        </p>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors inline-block"
        >
          Book Now
        </a>
      </div>
    </section>
  );
} 