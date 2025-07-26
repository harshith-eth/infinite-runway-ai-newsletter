import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';
import { 
  Newsletter, 
  ScrapedArticle, 
  EmailRecipient,
  CompanyRaising,
  CompanyHiring,
  SponsorInfo,
  NewsletterType
} from '@/lib/types/newsletter.types';

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

class SupabaseService {
  private client: SupabaseClient;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    this.client = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  // Newsletter Content Methods
  
  async createNewsletter(newsletter: Omit<Newsletter, 'id' | 'analytics'>): Promise<Newsletter> {
    const { data, error } = await this.client
      .from('newsletter_content')
      .insert({
        title: newsletter.title,
        slug: newsletter.slug,
        description: newsletter.description,
        content: newsletter.content,
        image_url: newsletter.imageUrl,
        type: newsletter.type,
        status: newsletter.status,
        published_at: newsletter.publishDate.toISOString(),
        metadata: newsletter.metadata || {},
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return this.mapToNewsletter(data);
  }
  
  async getNewsletterBySlug(slug: string): Promise<Newsletter | null> {
    const { data, error } = await this.client
      .from('newsletter_content')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return this.mapToNewsletter(data);
  }
  
  async updateNewsletterStatus(id: string, status: Newsletter['status']): Promise<void> {
    const { error } = await this.client
      .from('newsletter_content')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // Scraped Articles Methods
  
  async saveScrapedArticles(articles: Omit<ScrapedArticle, 'id'>[]): Promise<void> {
    const { error } = await this.client
      .from('scraped_articles')
      .insert(
        articles.map(article => ({
          source: article.source,
          title: article.title,
          content: article.content,
          url: article.url,
          published_at: article.publishedAt.toISOString(),
          relevance_score: article.relevanceScore,
          tags: article.tags,
          used: false,
        }))
      );
    
    if (error) throw error;
  }
  
  async getUnusedArticles(limit: number = 50): Promise<ScrapedArticle[]> {
    const { data, error } = await this.client
      .from('scraped_articles')
      .select('*')
      .eq('used', false)
      .order('relevance_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(this.mapToScrapedArticle);
  }
  
  async markArticlesAsUsed(articleIds: string[]): Promise<void> {
    const { error } = await this.client
      .from('scraped_articles')
      .update({ used: true })
      .in('id', articleIds);
    
    if (error) throw error;
  }
  
  // Subscriber Methods
  
  async getActiveSubscribers(): Promise<EmailRecipient[]> {
    const { data, error } = await this.client
      .from('subscribers')
      .select('*')
      .eq('status', 'active');
    
    if (error) throw error;
    
    return data.map(this.mapToEmailRecipient);
  }
  
  async addSubscriber(email: string, name?: string): Promise<void> {
    const { error } = await this.client
      .from('subscribers')
      .insert({
        email,
        name,
        status: 'active',
      });
    
    if (error) throw error;
  }
  
  async unsubscribe(email: string): Promise<void> {
    const { error } = await this.client
      .from('subscribers')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email);
    
    if (error) throw error;
  }
  
  // Sponsor Methods
  
  async getActiveSponsorsForDate(date: Date, type: NewsletterType): Promise<{
    mainSponsor?: SponsorInfo;
    companiesRaising: CompanyRaising[];
    companiesHiring: CompanyHiring[];
  }> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get all sponsor slots for this date and newsletter type
    const { data: slots, error: slotsError } = await this.client
      .from('sponsor_slots')
      .select(`
        *,
        sponsors (*)
      `)
      .eq('date', dateStr)
      .eq('newsletter_type', type)
      .eq('is_available', false);
    
    if (slotsError) throw slotsError;
    
    const result = {
      mainSponsor: undefined as SponsorInfo | undefined,
      companiesRaising: [] as CompanyRaising[],
      companiesHiring: [] as CompanyHiring[],
    };
    
    // Process slots and organize by type
    slots.forEach(slot => {
      if (!slot.sponsors) return;
      
      const sponsor = slot.sponsors as any;
      
      if (slot.slot_type === 'main' && sponsor.package_type === 'main') {
        result.mainSponsor = this.mapToSponsorInfo(sponsor);
      } else if (slot.slot_type === 'company-raising') {
        result.companiesRaising.push(this.mapToCompanyRaising(sponsor));
      } else if (slot.slot_type === 'company-hiring') {
        result.companiesHiring.push(this.mapToCompanyHiring(sponsor));
      }
    });
    
    return result;
  }
  
  async createSponsorSlots(date: Date, type: NewsletterType): Promise<void> {
    const slots = [
      { slot_type: 'main', slot_position: 1 },
      { slot_type: 'company-raising', slot_position: 1 },
      { slot_type: 'company-raising', slot_position: 2 },
      { slot_type: 'company-raising', slot_position: 3 },
      { slot_type: 'company-hiring', slot_position: 1 },
      { slot_type: 'company-hiring', slot_position: 2 },
      { slot_type: 'company-hiring', slot_position: 3 },
    ];
    
    const { error } = await this.client
      .from('sponsor_slots')
      .insert(
        slots.map(slot => ({
          date: date.toISOString().split('T')[0],
          newsletter_type: type,
          slot_type: slot.slot_type as any,
          slot_position: slot.slot_position,
          is_available: true,
        }))
      );
    
    if (error) throw error;
  }
  
  // Analytics Methods
  
  async createAnalyticsEntry(newsletterId: string, sentCount: number): Promise<void> {
    const { error } = await this.client
      .from('analytics')
      .insert({
        newsletter_id: newsletterId,
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
      });
    
    if (error) throw error;
  }
  
  async updateAnalytics(
    newsletterId: string, 
    analytics: Partial<{
      delivered_count: number;
      open_count: number;
      click_count: number;
      unsubscribe_count: number;
      sponsor_clicks: Record<string, number>;
    }>
  ): Promise<void> {
    const { error } = await this.client
      .from('analytics')
      .update(analytics)
      .eq('newsletter_id', newsletterId);
    
    if (error) throw error;
  }
  
  // Helper Methods
  
  private mapToNewsletter(data: any): Newsletter {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      imageUrl: data.image_url,
      publishDate: new Date(data.published_at),
      type: data.type,
      authorName: 'Infinite Runway',
      authorImageUrl: '/images/authors/infinite-runway.png',
      status: data.status,
      metadata: data.metadata,
    };
  }
  
  private mapToScrapedArticle(data: any): ScrapedArticle {
    return {
      id: data.id,
      title: data.title,
      content: data.content || '',
      url: data.url,
      source: data.source,
      publishedAt: new Date(data.published_at),
      relevanceScore: data.relevance_score || 0,
      tags: data.tags || [],
      used: data.used,
    };
  }
  
  private mapToEmailRecipient(data: any): EmailRecipient {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      subscribedAt: new Date(data.subscribed_at),
      status: data.status,
      preferences: data.preferences,
    };
  }
  
  private mapToSponsorInfo(data: any): SponsorInfo {
    return {
      id: data.id,
      name: data.name,
      logo: data.custom_image_url || '/images/sponsors/default.png',
      link: `https://${data.company_name?.toLowerCase().replace(/\s+/g, '')}.com`,
      description: data.custom_copy || '',
      ctaText: 'Learn More',
      ctaLink: `https://${data.company_name?.toLowerCase().replace(/\s+/g, '')}.com`,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
    };
  }
  
  private mapToCompanyRaising(data: any): CompanyRaising {
    // Parse funding info from custom_copy
    const fundingInfo = this.parseFundingInfo(data.custom_copy);
    
    return {
      id: data.id,
      name: data.company_name || data.name,
      round: fundingInfo.round,
      amount: fundingInfo.amount,
      investors: fundingInfo.investors,
      description: fundingInfo.description,
      link: `https://${data.company_name?.toLowerCase().replace(/\s+/g, '')}.com`,
    };
  }
  
  private mapToCompanyHiring(data: any): CompanyHiring {
    // Parse hiring info from custom_copy
    const hiringInfo = this.parseHiringInfo(data.custom_copy);
    
    return {
      id: data.id,
      name: data.company_name || data.name,
      roles: hiringInfo.roles,
      location: hiringInfo.location,
      stack: hiringInfo.stack,
      description: hiringInfo.description,
      link: `https://${data.company_name?.toLowerCase().replace(/\s+/g, '')}.com/careers`,
    };
  }
  
  private parseFundingInfo(customCopy: string): any {
    // Simple parsing logic - in production, this would be more sophisticated
    return {
      round: 'Series A',
      amount: '$10M',
      investors: ['Sequoia Capital', 'a16z'],
      description: customCopy || 'Building the future of AI',
    };
  }
  
  private parseHiringInfo(customCopy: string): any {
    // Simple parsing logic - in production, this would be more sophisticated
    return {
      roles: ['ML Engineer', 'Product Manager'],
      location: 'Remote',
      stack: 'Python, TensorFlow, React',
      description: customCopy || 'Join our growing team',
    };
  }
  
  // Sponsor management methods
  async createSponsor(sponsorData: any): Promise<void> {
    const { error } = await this.client.from('sponsors').insert([{
      name: sponsorData.name,
      email: sponsorData.email,
      status: sponsorData.status || 'active',
      package_type: sponsorData.packageType,
      newsletter_types: sponsorData.newsletterTypes || ['all'],
      slots_per_newsletter: sponsorData.slotsPerNewsletter || 1,
      amount: sponsorData.amount,
      start_date: sponsorData.startDate?.toISOString() || new Date().toISOString(),
      end_date: sponsorData.endDate?.toISOString(),
      stripe_customer_id: sponsorData.stripeCustomerId,
      stripe_subscription_id: sponsorData.stripeSubscriptionId,
      metadata: sponsorData.metadata || {}
    }]);
    
    if (error) {
      console.error('Error creating sponsor:', error);
      throw error;
    }
  }
  
  async updateSponsorByStripeId(stripeId: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('sponsors')
      .update({
        status: updates.status,
        end_date: updates.endDate?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', stripeId);
    
    if (error) {
      console.error('Error updating sponsor:', error);
      throw error;
    }
  }
  
  async getSponsorByStripeId(stripeId: string): Promise<any> {
    const { data, error } = await this.client
      .from('sponsors')
      .select('*')
      .eq('stripe_subscription_id', stripeId)
      .single();
    
    if (error) {
      console.error('Error getting sponsor:', error);
      return null;
    }
    
    return data;
  }
  
  // Newsletter analytics methods
  async getNewslettersFromPastWeek(): Promise<Newsletter[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data, error } = await this.client
      .from('newsletter_content')
      .select('*')
      .gte('publish_date', oneWeekAgo.toISOString())
      .order('publish_date', { ascending: false });
    
    if (error) {
      console.error('Error getting newsletters:', error);
      return [];
    }
    
    return data?.map(this.mapDatabaseToNewsletter) || [];
  }
  
  async getNewslettersByDateRange(startDate: Date, endDate: Date): Promise<Newsletter[]> {
    const { data, error } = await this.client
      .from('newsletter_content')
      .select('*')
      .gte('publish_date', startDate.toISOString())
      .lte('publish_date', endDate.toISOString())
      .order('publish_date', { ascending: false });
    
    if (error) {
      console.error('Error getting newsletters:', error);
      return [];
    }
    
    return data?.map(this.mapDatabaseToNewsletter) || [];
  }
  
  // System health methods
  async getRecentSystemHealthEntries(): Promise<any[]> {
    const { data, error } = await this.client
      .from('system_health')
      .select('*')
      .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('checked_at', { ascending: false });
    
    if (error) {
      console.error('Error getting system health entries:', error);
      return [];
    }
    
    return data || [];
  }
  
  async saveSystemHealthEntry(entry: any): Promise<void> {
    const { error } = await this.client.from('system_health').insert([{
      service_name: entry.serviceName,
      status: entry.status,
      latency_ms: entry.latencyMs,
      error_message: entry.errorMessage,
      metadata: entry.metadata,
      checked_at: new Date().toISOString()
    }]);
    
    if (error) {
      console.error('Error saving system health entry:', error);
      throw error;
    }
  }
  
  // Get analytics by newsletter slug
  async getAnalyticsByNewsletterSlug(slug: string): Promise<any> {
    const { data, error } = await this.client
      .from('analytics')
      .select('*')
      .eq('newsletter_id', slug)
      .single();
    
    if (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
    
    return data;
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client.from('subscribers').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const supabase = new SupabaseService();