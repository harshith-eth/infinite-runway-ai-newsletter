import { getAllBlogPosts } from '@/lib/blog-data';

export async function GET() {
  const posts = await getAllBlogPosts();
  const site_url = 'https://infiniterunway.com';
  
  // Define main pages
  const mainPages = [
    { url: '/', lastModified: new Date().toISOString() },
    { url: '/posts', lastModified: new Date().toISOString() },
    { url: '/essays', lastModified: new Date().toISOString() },
    { url: '/about', lastModified: new Date().toISOString() },
    { url: '/advertise', lastModified: new Date().toISOString() },
    { url: '/contact', lastModified: new Date().toISOString() },
  ];
  
  // Convert blog posts to sitemap entries
  const blogPages = posts.map((post) => {
    // Try to parse the date, fallback to current date if cannot parse
    let lastModified;
    try {
      lastModified = new Date(post.publishDate).toISOString();
    } catch (e) {
      lastModified = new Date().toISOString();
    }
    
    return {
      url: `/posts/${post.slug}`,
      lastModified,
    };
  });
  
  // Combine all pages
  const allPages = [...mainPages, ...blogPages];
  
  // Create XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map((page) => `
  <url>
    <loc>${site_url}${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 