import { getAllBlogPosts } from '@/lib/blog-data';

export async function GET() {
  const posts = await getAllBlogPosts();
  const site_url = 'https://infiniterunway.com';

  // Create RSS XML with enhanced SEO and geo elements
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Infinite Runway</title>
    <link>${site_url}</link>
    <description>Thoughts on AI, technology, and more - The latest updates and insights from Infinite Runway</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Infinite Runway RSS Generator</generator>
    <managingEditor>contact@infiniterunway.com</managingEditor>
    <webMaster>webmaster@infiniterunway.com</webMaster>
    <category>Technology</category>
    <category>AI</category>
    <category>Business</category>
    <category>Startup</category>
    <image>
      <url>${site_url}/images/logo.svg</url>
      <title>Infinite Runway</title>
      <link>${site_url}</link>
    </image>
    <atom:link href="${site_url}/rss.xml" rel="self" type="application/rss+xml"/>
    
    ${posts.map((post) => {
      return `
    <item>
      <title>${post.title}</title>
      <link>${site_url}/posts/${post.slug}</link>
      <guid isPermaLink="true">${site_url}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.authorName}]]></dc:creator>
      <category><![CDATA[Technology]]></category>
      <category><![CDATA[AI]]></category>
      <description><![CDATA[${post.description}]]></description>
      <content:encoded><![CDATA[${post.description}]]></content:encoded>
      <media:content url="${post.imageUrl}" medium="image" />
      <media:thumbnail url="${post.imageUrl}" />
    </item>`;
    }).join('')}
  </channel>
</rss>`;

  // Return the XML with proper content type and cache headers for better SEO
  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600',
    },
  });
} 