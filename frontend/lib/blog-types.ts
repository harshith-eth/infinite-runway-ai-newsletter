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
  sponsorInfo?: {
    name: string;
    logo: string;
    link: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
  };
} 