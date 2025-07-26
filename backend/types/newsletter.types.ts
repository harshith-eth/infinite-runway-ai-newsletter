// Core Newsletter Types

export interface Newsletter {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl: string;
  publishDate: Date;
  type: NewsletterType;
  authorName: string;
  authorImageUrl: string;
  sponsorInfo?: SponsorInfo;
  companiesRaising?: CompanyRaising[];
  companiesHiring?: CompanyHiring[];
  analytics?: NewsletterAnalytics;
  status: NewsletterStatus;
  metadata?: NewsletterMetadata;
}

export type NewsletterType = 'weekly-digest' | 'innovation-report' | 'business-careers';

export type NewsletterStatus = 'draft' | 'scheduled' | 'published' | 'sent';

export interface SponsorInfo {
  id: string;
  name: string;
  logo: string;
  link: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  paymentId?: string;
  startDate: Date;
  endDate: Date;
}

export interface CompanyRaising {
  id: string;
  name: string;
  round: string;
  amount: string;
  investors: string[];
  description: string;
  link: string;
  logo?: string;
}

export interface CompanyHiring {
  id: string;
  name: string;
  roles: string[];
  location: string;
  stack?: string;
  description: string;
  link: string;
  logo?: string;
}

export interface NewsletterAnalytics {
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  sponsorClicks: Record<string, number>;
  updatedAt: Date;
}

export interface NewsletterMetadata {
  scrapedArticles: number;
  aiTokensUsed: number;
  generationTime: number;
  imageGenerationTime: number;
  sources: string[];
}

// Content Generation Types

export interface ContentGenerationRequest {
  type: NewsletterType;
  date: Date;
  scrapedContent: ScrapedArticle[];
  previousNewsletters?: string[]; // To avoid repetition
  sponsorInfo?: SponsorInfo;
  companiesRaising?: CompanyRaising[];
  companiesHiring?: CompanyHiring[];
}

export interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  relevanceScore: number;
  tags: string[];
  used: boolean;
}

// Email Types

export interface EmailRecipient {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed' | 'bounced';
  preferences?: {
    frequency: 'all' | 'weekly-only';
    topics: string[];
  };
}

export interface EmailSendRequest {
  newsletter: Newsletter;
  recipients: EmailRecipient[];
  scheduledFor?: Date;
  testMode?: boolean;
}

// Notification Types

export interface NotificationEvent {
  type: NotificationType;
  level: 'critical' | 'success' | 'info' | 'debug';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export type NotificationType = 
  | 'newsletter_generation_started'
  | 'newsletter_generation_completed'
  | 'newsletter_generation_failed'
  | 'email_send_started'
  | 'email_send_completed'
  | 'email_send_failed'
  | 'sponsor_payment_received'
  | 'system_error'
  | 'analytics_updated';

// Linear Integration Types

export interface LinearTask {
  id?: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';
  priority: 0 | 1 | 2 | 3 | 4;
  labels: string[];
  assigneeId?: string;
  projectId: string;
  dueDate?: Date;
  metadata?: Record<string, any>;
}

// System Health Types

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    azure: ServiceStatus;
    supabase: ServiceStatus;
    resend: ServiceStatus;
    stripe: ServiceStatus;
    github: ServiceStatus;
  };
  metrics: {
    apiQuotaRemaining: Record<string, number>;
    errorRate: number;
    avgGenerationTime: number;
    uptime: number;
  };
  lastChecked: Date;
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
  lastChecked: Date;
}