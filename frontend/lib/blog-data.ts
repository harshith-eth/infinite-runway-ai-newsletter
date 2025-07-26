// Re-export the BlogPost interface from blog-types
export type { BlogPost } from '@/lib/blog-types';

// Import types and newsletter loader
import type { BlogPost } from '@/lib/blog-types';
import { getAllNewsletters, newsletterToBlogPost } from '@/lib/newsletter-loader';

// Get all newsletters (no more static blog posts)
async function getCombinedBlogPosts(): Promise<BlogPost[]> {
  try {
    const newsletters = await getAllNewsletters();
    const newsletterBlogPosts = newsletters.map(newsletterToBlogPost);
    
    // Sort by publish date (newest first)
    return newsletterBlogPosts.sort((a, b) => {
      const dateA = new Date(a.publishDate);
      const dateB = new Date(b.publishDate);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error loading newsletters:', error);
    return [];
  }
}

// Helper function to get a blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const combinedPosts = await getCombinedBlogPosts();
  return combinedPosts.find((post) => post.slug === slug);
}

// Helper function to get all blog posts (including newsletters)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return await getCombinedBlogPosts();
}

// Helper function to get paginated blog posts
export async function getPaginatedBlogPosts(page: number = 1, postsPerPage: number = 9): Promise<{
  posts: BlogPost[];
  totalPages: number;
}> {
  const combinedPosts = await getCombinedBlogPosts();
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = combinedPosts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    totalPages: Math.ceil(combinedPosts.length / postsPerPage),
  };
}

/**
 * Searches blog posts by title or description
 * @param query The search query
 * @returns Array of matching blog posts
 */
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const combinedPosts = await getCombinedBlogPosts();
  const lowercaseQuery = query.toLowerCase().trim();
  
  return combinedPosts.filter(post => {
    return (
      post.title.toLowerCase().includes(lowercaseQuery) || 
      post.description.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery)
    );
  });
} 