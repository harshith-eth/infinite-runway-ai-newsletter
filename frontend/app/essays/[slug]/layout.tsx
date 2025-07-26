import React from 'react';
import type { Metadata } from 'next';
import { getBlogPostBySlug } from '@/lib/blog-data';

// Generate metadata for each blog post based on slug
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Await params first
  const resolvedParams = await params;
  
  // Find post with matching slug
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  // Default metadata if post not found
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
  
  // Return post-specific metadata
  return {
    title: `${post.title} | Infinite Runway`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://infiniterunway.com/essays/${post.slug}`,
      siteName: 'Infinite Runway',
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.imageUrl],
    },
  };
}

export default function EssayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden">
      <div 
        className="h-full overflow-auto hide-scrollbar"
        style={{
          overscrollBehavior: 'none',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
} 