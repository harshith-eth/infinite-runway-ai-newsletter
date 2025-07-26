import fs from 'fs';
import path from 'path';
import { BlogPost } from './blog-types';

export interface NewsletterMetadata {
  title: string;
  description: string;
  slug: string;
  author: {
    name: string;
    imageUrl?: string;
  };
  publishDate: string;
  imageUrl: string;
  sponsor?: {
    name: string;
    logo: string;
    link: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  type: 'newsletter';
  week: number;
  month: string;
  year: number;
}

export interface NewsletterContent {
  metadata: NewsletterMetadata;
  content: string;
  mdxPath: string;
}

// Base path for newsletters
const NEWSLETTERS_BASE_PATH = path.join(process.cwd(), 'frontend/app/essays');

// Get all newsletter folders recursively
function getAllNewsletterPaths(): string[] {
  const newsletterPaths: string[] = [];
  
  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Check if this directory contains newsletter files
        const metadataPath = path.join(itemPath, 'metadata.json');
        const mdxPath = path.join(itemPath, 'page.mdx');
        
        if (fs.existsSync(metadataPath) && fs.existsSync(mdxPath)) {
          newsletterPaths.push(itemPath);
        } else {
          // Continue scanning subdirectories
          scanDirectory(itemPath);
        }
      }
    }
  }
  
  scanDirectory(NEWSLETTERS_BASE_PATH);
  return newsletterPaths;
}

// Load newsletter by slug
export async function getNewsletterBySlug(slug: string): Promise<NewsletterContent | null> {
  const newsletterPaths = getAllNewsletterPaths();
  
  for (const newsletterPath of newsletterPaths) {
    try {
      const metadataPath = path.join(newsletterPath, 'metadata.json');
      const metadata: NewsletterMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      
      if (metadata.slug === slug) {
        const mdxPath = path.join(newsletterPath, 'page.mdx');
        const content = fs.readFileSync(mdxPath, 'utf8');
        
        return {
          metadata,
          content,
          mdxPath
        };
      }
    } catch (error) {
      console.error(`Error loading newsletter from ${newsletterPath}:`, error);
      continue;
    }
  }
  
  return null;
}

// Get all newsletters
export async function getAllNewsletters(): Promise<NewsletterContent[]> {
  const newsletterPaths = getAllNewsletterPaths();
  const newsletters: NewsletterContent[] = [];
  
  for (const newsletterPath of newsletterPaths) {
    try {
      const metadataPath = path.join(newsletterPath, 'metadata.json');
      const mdxPath = path.join(newsletterPath, 'page.mdx');
      
      const metadata: NewsletterMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const content = fs.readFileSync(mdxPath, 'utf8');
      
      newsletters.push({
        metadata,
        content,
        mdxPath
      });
    } catch (error) {
      console.error(`Error loading newsletter from ${newsletterPath}:`, error);
      continue;
    }
  }
  
  // Sort by publish date, newest first
  return newsletters.sort((a, b) => {
    const dateA = new Date(a.metadata.publishDate);
    const dateB = new Date(b.metadata.publishDate);
    return dateB.getTime() - dateA.getTime();
  });
}

// Convert newsletter to BlogPost format for compatibility
export function newsletterToBlogPost(newsletter: NewsletterContent): BlogPost {
  return {
    title: newsletter.metadata.title,
    description: newsletter.metadata.description,
    imageUrl: newsletter.metadata.imageUrl,
    slug: newsletter.metadata.slug,
    authorName: newsletter.metadata.author.name,
    publishDate: newsletter.metadata.publishDate,
    authorImageUrl: newsletter.metadata.author.imageUrl,
    sponsorInfo: newsletter.metadata.sponsor,
    content: newsletter.content
  };
}

// Search newsletters
export async function searchNewsletters(query: string): Promise<NewsletterContent[]> {
  const allNewsletters = await getAllNewsletters();
  
  if (!query.trim()) {
    return allNewsletters;
  }
  
  const searchTerm = query.toLowerCase();
  
  return allNewsletters.filter(newsletter => {
    const title = newsletter.metadata.title.toLowerCase();
    const description = newsletter.metadata.description.toLowerCase();
    const content = newsletter.content.toLowerCase();
    
    return title.includes(searchTerm) || 
           description.includes(searchTerm) || 
           content.includes(searchTerm);
  });
} 