import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'
  
  return {
    rules: [
      // 🎯 GOOGLE ADS & SEO OPTIMIZED CONFIGURATION
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin*',
          '/api*',
          '/private*',
          '/temp*',
          '/uploads/temp*',
          '/search?*',
          '/filter?*',
          '/*?utm_*',
          '/*?fbclid=*',
          '/*?gclid=*',
          '/404',
          '/500',
        ],
      },
      // 🤖 GOOGLEBOT - Maximum SEO Performance
      {
        userAgent: 'Googlebot',
        allow: ['/', '/uploads/', '/images/', '/*.css', '/*.js'],
        disallow: [
          '/admin*',
          '/api/auth*',
          '/api/admin*',
          '/search?*',
          '/*?utm_*',
          '/*?fbclid=*',
          '/*?gclid=*',
        ],
        crawlDelay: 1,
      },
      // 🔍 GOOGLEBOT-IMAGE - Enhanced Image SEO
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/uploads/', '/images/', '/*.jpg', '/*.jpeg', '/*.png', '/*.webp', '/*.svg'],
        disallow: [
          '/admin*',
          '/uploads/temp*',
          '/uploads/private*',
        ],
      },
      // 🎥 GOOGLEBOT-VIDEO - Video Content Optimization
      {
        userAgent: 'Googlebot-Video',
        allow: ['/', '/*.mp4', '/*.webm', '/*.mov'],
        disallow: [
          '/admin*',
          '/private*',
        ],
      },
      // 🅱️ BINGBOT - Microsoft Search Optimization
      {
        userAgent: 'Bingbot',
        allow: ['/', '/uploads/'],
        disallow: [
          '/admin*',
          '/api/auth*',
          '/api/admin*',
          '/*?utm_*',
          '/*?fbclid=*',
        ],
        crawlDelay: 2,
      },
      // 🦆 DUCKDUCKBOT - Privacy-Focused Search
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: [
          '/admin*',
          '/api*',
          '/private*',
        ],
      },
      // 🐦 TWITTERBOT - Social Media Optimization
      {
        userAgent: 'Twitterbot',
        allow: ['/', '/uploads/'],
        disallow: [
          '/admin*',
          '/api*',
          '/private*',
        ],
      },
      // 📘 FACEBOOKEXTERNALHIT - Facebook Sharing
      {
        userAgent: 'facebookexternalhit',
        allow: ['/', '/uploads/'],
        disallow: [
          '/admin*',
          '/api*',
          '/private*',
        ],
      },
      // 🔗 LINKEDINBOT - LinkedIn Optimization
      {
        userAgent: 'LinkedInBot',
        allow: ['/', '/uploads/'],
        disallow: [
          '/admin*',
          '/api*',
          '/private*',
        ],
      },
      // 📱 WHATSAPP - WhatsApp Link Previews
      {
        userAgent: 'WhatsApp',
        allow: ['/', '/uploads/'],
        disallow: [
          '/admin*',
          '/api*',
          '/private*',
        ],
      },
      // 🚫 BAD BOTS - Block Malicious Crawlers
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
          'YandexBot',
          'PetalBot',
          'MegaIndex',
          'SeznamBot',
          'BingPreview',
          'CCBot',
          'ChatGPT-User',
          'GPTBot',
          'Google-Extended',
          'anthropic-ai',
          'Claude-Web',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
