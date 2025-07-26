import { BlogPost } from '@/lib/blog-types';
import { aiMirror } from './ai-mirror';
import { convergence } from './convergence';
import { digitalConsciousness } from './digital-consciousness';

// Import generated newsletters if they exist
let generatedNewsletters: BlogPost[] = [];
try {
  const generated = require('../generated-newsletters/index');
  generatedNewsletters = generated.generatedNewsletters || [];
} catch (error) {
  // No generated newsletters yet, that's okay
  console.log('No generated newsletters found, using static blog posts only');
}

// Static blog posts
export const staticBlogPosts: BlogPost[] = [
  aiMirror,
  convergence,
  digitalConsciousness,
  // Add new static blog posts to this array
];

// Combined blog posts (static + generated newsletters)
export const allBlogPosts: BlogPost[] = [
  ...generatedNewsletters, // Generated newsletters first (most recent)
  ...staticBlogPosts,      // Static blog posts second
].sort((a, b) => {
  // Sort by publication date, newest first
  const dateA = new Date(a.publishDate);
  const dateB = new Date(b.publishDate);
  return dateB.getTime() - dateA.getTime();
});

// Export individual blog posts for direct access
export {
  aiMirror,
  convergence,
  digitalConsciousness,
  generatedNewsletters,
  // Export new blog posts here as well
};

// Helper function to get newsletters only
export const getNewsletters = (): BlogPost[] => {
  return generatedNewsletters;
};

// Helper function to get static posts only
export const getStaticPosts = (): BlogPost[] => {
  return staticBlogPosts;
};

// Helper function to get posts by type
export const getPostsByType = (type: string): BlogPost[] => {
  return allBlogPosts.filter(post => {
    // Check if post has newsletter type metadata
    if (post.slug.includes(type)) {
      return true;
    }
    // For static posts, they don't have newsletter types
    return false;
  });
}; 