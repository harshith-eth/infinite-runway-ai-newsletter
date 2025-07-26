import { NextResponse } from 'next/server'

// Define the base URL for the sitemap
const baseUrl = 'https://infiniterunway.io'

export async function GET() {
  // Define all the pages for the sitemap
  const pages = [
    { url: '/', lastModified: new Date(), title: 'Home' },
    { url: '/essays', lastModified: new Date(), title: 'Essays' },
    { url: '/advertise', lastModified: new Date(), title: 'Advertise' },
    { url: '/about', lastModified: new Date(), title: 'About' },
    { url: '/contact', lastModified: new Date(), title: 'Contact' },
    { url: '/careers', lastModified: new Date(), title: 'Careers' },
    { url: '/partners', lastModified: new Date(), title: 'Partners' },
    { url: '/privacy', lastModified: new Date(), title: 'Privacy Policy' },
    { url: '/terms', lastModified: new Date(), title: 'Terms of Use' },
    { url: '/cookies', lastModified: new Date(), title: 'Cookie Policy' },
    { url: '/sitemap', lastModified: new Date(), title: 'Sitemap' },
  ]

  // Create the sitemap data structure
  const sitemap = {
    version: '1.0',
    generated: new Date().toISOString(),
    baseUrl,
    pages: pages.map(page => ({
      url: `${baseUrl}${page.url}`,
      lastModified: page.lastModified.toISOString(),
      title: page.title,
      changeFrequency: 'weekly',
      priority: 0.8
    }))
  }

  // Return the JSON with the correct content type
  return NextResponse.json(sitemap)
} 