// Supabase Database Types

export interface Database {
  public: {
    Tables: {
      newsletter_content: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          content: string;
          image_url: string;
          type: 'weekly-digest' | 'innovation-report' | 'business-careers';
          status: 'draft' | 'scheduled' | 'published' | 'sent';
          published_at: string | null;
          created_at: string;
          updated_at: string;
          metadata: Record<string, any> | null;
        };
        Insert: Omit<Database['public']['Tables']['newsletter_content']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['newsletter_content']['Insert']>;
      };
      
      scraped_articles: {
        Row: {
          id: string;
          source: string;
          title: string;
          content: string | null;
          url: string;
          published_at: string;
          scraped_at: string;
          used: boolean;
          relevance_score: number | null;
          tags: string[];
        };
        Insert: Omit<Database['public']['Tables']['scraped_articles']['Row'], 'id' | 'scraped_at'>;
        Update: Partial<Database['public']['Tables']['scraped_articles']['Insert']>;
      };
      
      subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          status: 'active' | 'unsubscribed' | 'bounced';
          subscribed_at: string;
          unsubscribed_at: string | null;
          preferences: {
            frequency: 'all' | 'weekly-only';
            topics: string[];
          } | null;
        };
        Insert: Omit<Database['public']['Tables']['subscribers']['Row'], 'id' | 'subscribed_at'>;
        Update: Partial<Database['public']['Tables']['subscribers']['Insert']>;
      };
      
      sponsors: {
        Row: {
          id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          payment_status: 'pending' | 'active' | 'canceled' | 'past_due';
          name: string;
          email: string;
          company_name: string | null;
          package_type: 'main' | 'company-raising' | 'company-hiring';
          custom_copy: string | null;
          custom_image_url: string | null;
          start_date: string;
          end_date: string;
          auto_renew: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sponsors']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sponsors']['Insert']>;
      };
      
      payments: {
        Row: {
          id: string;
          sponsor_id: string;
          stripe_payment_intent_id: string | null;
          amount: number;
          currency: string;
          status: 'succeeded' | 'processing' | 'failed';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      
      analytics: {
        Row: {
          id: string;
          newsletter_id: string;
          sent_at: string;
          sent_count: number;
          delivered_count: number | null;
          open_count: number | null;
          click_count: number | null;
          unsubscribe_count: number | null;
          sponsor_clicks: Record<string, number> | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analytics']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['analytics']['Insert']>;
      };
      
      sponsor_slots: {
        Row: {
          id: string;
          date: string;
          newsletter_type: 'weekly-digest' | 'innovation-report' | 'business-careers';
          slot_type: 'main' | 'company-raising' | 'company-hiring';
          slot_position: number;
          sponsor_id: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sponsor_slots']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sponsor_slots']['Insert']>;
      };
      
      system_health: {
        Row: {
          id: string;
          service_name: string;
          status: 'healthy' | 'degraded' | 'down';
          latency_ms: number | null;
          error_message: string | null;
          metadata: Record<string, any> | null;
          checked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['system_health']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['system_health']['Insert']>;
      };
    };
    
    Views: {
      newsletter_performance: {
        Row: {
          newsletter_id: string;
          title: string;
          type: string;
          published_at: string;
          open_rate: number;
          click_rate: number;
          revenue_generated: number;
        };
      };
      
      sponsor_revenue: {
        Row: {
          month: string;
          total_revenue: number;
          active_sponsors: number;
          package_breakdown: Record<string, number>;
        };
      };
    };
    
    Functions: {
      get_available_sponsor_slots: {
        Args: {
          start_date: string;
          end_date: string;
          slot_type?: string;
        };
        Returns: Database['public']['Tables']['sponsor_slots']['Row'][];
      };
      
      calculate_newsletter_score: {
        Args: {
          newsletter_id: string;
        };
        Returns: number;
      };
    };
  };
}