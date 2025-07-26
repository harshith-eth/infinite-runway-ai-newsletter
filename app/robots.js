import { MetadataRoute } from 'next'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/private/', '/admin/'],
    },
    sitemap: [
      'https://infiniterunway.io/sitemap.xml',
      'https://infiniterunway.io/api/sitemap/json',
    ],
    host: 'https://infiniterunway.io',
  }
} 