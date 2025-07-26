// Re-export the BlogPost interface from blog-types
export type { BlogPost } from '@/lib/blog-types';

// Import all blog posts from the blog-posts directory
import { allBlogPosts } from '@/data/blog-posts';
import type { BlogPost } from '@/lib/blog-types';

// Export the blog posts array 
export const blogPosts = allBlogPosts;

// Helper function to get a blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return blogPosts.find((post) => post.slug === slug);
}

// Helper function to get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return blogPosts;
}

// Helper function to get paginated blog posts
export async function getPaginatedBlogPosts(page: number = 1, postsPerPage: number = 9): Promise<{
  posts: BlogPost[];
  totalPages: number;
}> {
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = blogPosts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    totalPages: Math.ceil(blogPosts.length / postsPerPage),
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
  
  const lowercaseQuery = query.toLowerCase().trim();
  
  return blogPosts.filter(post => {
    return (
      post.title.toLowerCase().includes(lowercaseQuery) || 
      post.description.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery)
    );
  });
} 