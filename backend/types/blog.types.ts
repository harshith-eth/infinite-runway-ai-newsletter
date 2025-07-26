// Blog post interface - to be used by all blog post files
export interface BlogPost {
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  authorName: string;
  authorImageUrl?: string;
  publishDate: string;
  content: string;
  tags?: string[];
  readingTime?: string;
  featured?: boolean;
  sponsorInfo?: any; // Add this property that's being used in the automation files
} 