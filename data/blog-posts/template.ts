import { BlogPost } from '@/lib/blog-types';

// Copy this file as a starting point for new blog posts
export const blogTemplate: BlogPost = {
  title: "Blog Post Title",
  description: "Brief description of the blog post",
  imageUrl: "/images/thumbnail.svg", // Replace with your image path
  slug: "unique-slug-name", // This will be used in the URL
  authorName: "Infinite Runway",
  publishDate: "Month Day, Year",
  authorImageUrl: "/images/authors/infinite-runway.png", // Optional: Author image
  // Optional: Sponsorship information
  sponsorInfo: {
    name: "Sponsor Name",
    logo: "/images/logos/startups/sponsor-logo.svg",
    link: "https://sponsor-website.com",
    description: "A brief description of the sponsor and how they relate to the content of this blog post.",
    ctaText: "Call to Action Text",
    ctaLink: "https://sponsor-landing-page.com"
  },
  content: `
    <h2>Main Heading</h2>
    <p>Your content goes here...</p>
    
    <h3>Subheading</h3>
    <p>More content...</p>
    
    <blockquote>A quote or highlight</blockquote>
    
    <p>Final thoughts and conclusions.</p>
  `,
}; 