/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcryptjs'],
  compiler: {
    // Production code carried ~134 console.log/warn calls outside the admin
    // area, the Stripe webhook alone accounting for 44. Stripping them at build
    // time keeps the debugging statements in development without filling the
    // production logs; console.error is kept so real failures still surface.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  images: {
    // Gallery before/after photos are uploaded to Supabase storage and were
    // previously rendered with a bare <img>, so full-size originals (up to
    // ~3MB) went straight to the browser.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp'],
  },
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Never cache API responses
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        // Never cache HTML/documents (prevents users seeing stale pages)
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        // Files under /public are not content-hashed, so the catch-all above
        // marked them no-store and they were re-downloaded on every page view —
        // video.mp4 alone is 6.8MB. This rule comes after it deliberately: Next
        // applies each matching rule in turn and the last wins. A short max-age
        // with revalidation keeps them correct when replaced in place while
        // stopping the repeat downloads; once stale the browser asks and
        // normally gets a 304 with no body.
        source: '/(.*)\\.(mp4|webm|jpg|jpeg|png|webp|avif|gif|svg|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        // Cache Next.js static assets aggressively (they are content-hashed)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache optimized images (safe to cache)
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
