# Blog Posts

This directory contains individual blog post files for the Infinite Runway website.

## Structure

- Each blog post is a separate TypeScript file with a single export
- All blog posts are combined in `index.ts` 
- The blog-data.ts file in the lib directory imports from this index

## How to Add a New Blog Post

1. Copy `template.ts` to create a new file (e.g., `my-new-post.ts`)
2. Edit the content and metadata fields
3. Make sure the `slug` is unique and URL-friendly
4. Import the new blog post in `index.ts`
5. Add it to the `allBlogPosts` array in `index.ts`
6. Export it individually in `index.ts`

## Example

```typescript
// data/blog-posts/my-new-post.ts
import { BlogPost } from '@/lib/blog-types';

export const myNewPost: BlogPost = {
  title: "My New Blog Post",
  description: "Description of my new blog post",
  imageUrl: "/images/my-image.svg",
  slug: "my-new-post",
  authorName: "Infinite Runway",
  publishDate: "January 15, 2024",
  content: `
    <h2>Main Heading</h2>
    <p>Your content goes here...</p>
  `,
};
```

Then update `index.ts`:

```typescript
// Add import
import { myNewPost } from './my-new-post';

// Add to array
export const allBlogPosts: BlogPost[] = [
  // ...existing posts
  myNewPost,
];

// Add to exports
export {
  // ...existing exports
  myNewPost,
};
```

No changes to app/essays/[slug]/page.tsx are needed - it will automatically pick up the new post! 