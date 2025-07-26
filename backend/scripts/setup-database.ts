import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class DatabaseSetup {
  async setup(): Promise<void> {
    try {
      console.log('🗄️ Setting up database schema...');
      
      // Create tables
      await this.createTables();
      
      // Set up RLS policies
      await this.setupRLSPolicies();
      
      // Create indexes
      await this.createIndexes();
      
      // Insert initial data
      await this.insertInitialData();
      
      console.log('✅ Database setup completed successfully!');
      
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
  }
  
  private async createTables(): Promise<void> {
    console.log('Creating tables...');
    
    // Newsletter content table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS newsletter_content (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          content TEXT NOT NULL,
          image_url TEXT,
          publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          type TEXT NOT NULL CHECK (type IN ('weekly-digest', 'innovation-report', 'business-careers')),
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sent')),
          author_name TEXT DEFAULT 'Infinite Runway',
          author_image_url TEXT DEFAULT '/images/authors/infinite-runway.png',
          metadata JSONB DEFAULT '{}',
          analytics JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Scraped articles table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS scraped_articles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          source TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          url TEXT UNIQUE NOT NULL,
          author TEXT,
          published_at TIMESTAMP WITH TIME ZONE,
          scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          score INTEGER DEFAULT 0,
          used BOOLEAN DEFAULT false,
          newsletter_id UUID REFERENCES newsletter_content(id),
          metadata JSONB DEFAULT '{}'
        );
      `
    });
    
    // Subscribers table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS subscribers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unsubscribed')),
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          unsubscribed_at TIMESTAMP WITH TIME ZONE,
          preferences JSONB DEFAULT '{"newsletter_types": ["all"]}',
          metadata JSONB DEFAULT '{}'
        );
      `
    });
    
    // Sponsors table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sponsors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          logo TEXT,
          website TEXT,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'payment_failed')),
          package_type TEXT NOT NULL CHECK (package_type IN ('main', 'companies_raising', 'companies_hiring')),
          newsletter_types TEXT[] DEFAULT ARRAY['all'],
          slots_per_newsletter INTEGER DEFAULT 1,
          amount INTEGER NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          end_date TIMESTAMP WITH TIME ZONE,
          stripe_customer_id TEXT UNIQUE,
          stripe_subscription_id TEXT UNIQUE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Analytics table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          newsletter_id UUID REFERENCES newsletter_content(id),
          sent INTEGER DEFAULT 0,
          delivered INTEGER DEFAULT 0,
          opens INTEGER DEFAULT 0,
          clicks INTEGER DEFAULT 0,
          unsubscribes INTEGER DEFAULT 0,
          bounces INTEGER DEFAULT 0,
          revenue INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Email tracking table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS email_tracking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          newsletter_id UUID REFERENCES newsletter_content(id),
          subscriber_id UUID REFERENCES subscribers(id),
          email TEXT NOT NULL,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          delivered_at TIMESTAMP WITH TIME ZONE,
          opened_at TIMESTAMP WITH TIME ZONE,
          clicked_at TIMESTAMP WITH TIME ZONE,
          unsubscribed_at TIMESTAMP WITH TIME ZONE,
          bounced_at TIMESTAMP WITH TIME ZONE,
          metadata JSONB DEFAULT '{}'
        );
      `
    });
    
    console.log('✅ Tables created successfully');
  }
  
  private async setupRLSPolicies(): Promise<void> {
    console.log('Setting up RLS policies...');
    
    // Enable RLS on all tables
    const tables = [
      'newsletter_content',
      'scraped_articles', 
      'subscribers',
      'sponsors',
      'analytics',
      'email_tracking'
    ];
    
    for (const table of tables) {
      await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });
    }
    
    // Create policies for public read access to newsletters
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Enable read access for published newsletters" ON newsletter_content
        FOR SELECT USING (status = 'published' OR status = 'sent');
      `
    });
    
    // Create policies for service role (full access)
    for (const table of tables) {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Enable all access for service role" ON ${table}
          FOR ALL USING (true);
        `
      });
    }
    
    console.log('✅ RLS policies configured');
  }
  
  private async createIndexes(): Promise<void> {
    console.log('Creating indexes...');
    
    // Newsletter indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_newsletter_slug ON newsletter_content(slug);
        CREATE INDEX IF NOT EXISTS idx_newsletter_type ON newsletter_content(type);
        CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_content(status);
        CREATE INDEX IF NOT EXISTS idx_newsletter_publish_date ON newsletter_content(publish_date);
      `
    });
    
    // Scraped articles indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_scraped_articles_source ON scraped_articles(source);
        CREATE INDEX IF NOT EXISTS idx_scraped_articles_used ON scraped_articles(used);
        CREATE INDEX IF NOT EXISTS idx_scraped_articles_score ON scraped_articles(score);
        CREATE INDEX IF NOT EXISTS idx_scraped_articles_scraped_at ON scraped_articles(scraped_at);
      `
    });
    
    // Subscribers indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
        CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
      `
    });
    
    // Sponsors indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
        CREATE INDEX IF NOT EXISTS idx_sponsors_package_type ON sponsors(package_type);
        CREATE INDEX IF NOT EXISTS idx_sponsors_dates ON sponsors(start_date, end_date);
        CREATE INDEX IF NOT EXISTS idx_sponsors_stripe_customer ON sponsors(stripe_customer_id);
      `
    });
    
    // Analytics indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_analytics_newsletter_id ON analytics(newsletter_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
      `
    });
    
    // Email tracking indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_email_tracking_newsletter_id ON email_tracking(newsletter_id);
        CREATE INDEX IF NOT EXISTS idx_email_tracking_subscriber_id ON email_tracking(subscriber_id);
        CREATE INDEX IF NOT EXISTS idx_email_tracking_email ON email_tracking(email);
      `
    });
    
    console.log('✅ Indexes created successfully');
  }
  
  private async insertInitialData(): Promise<void> {
    console.log('Inserting initial data...');
    
    // Insert admin subscriber
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@infiniterunway.com';
    
    await supabase.from('subscribers').upsert([
      {
        email: adminEmail,
        name: 'Admin',
        status: 'active',
        preferences: {
          newsletter_types: ['all'],
          admin: true
        }
      }
    ], { onConflict: 'email' });
    
    // Insert sample newsletter types data
    const sampleNewsletter = {
      title: 'Welcome to Infinite Runway Newsletter',
      slug: 'welcome-newsletter',
      description: 'Your AI-powered newsletter for the latest in artificial intelligence',
      content: '<h1>Welcome to Infinite Runway!</h1><p>This is your first AI-generated newsletter. The system is now set up and ready to automatically generate content 3 times per week.</p>',
      type: 'weekly-digest',
      status: 'published',
      publish_date: new Date().toISOString(),
      metadata: {
        isWelcome: true,
        setupComplete: true
      }
    };
    
    await supabase.from('newsletter_content').upsert([sampleNewsletter], { onConflict: 'slug' });
    
    console.log('✅ Initial data inserted successfully');
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('newsletter_content').select('count').limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection test passed');
      return true;
      
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
  
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up database...');
    
    const tables = [
      'email_tracking',
      'analytics', 
      'sponsors',
      'subscribers',
      'scraped_articles',
      'newsletter_content'
    ];
    
    for (const table of tables) {
      await supabase.rpc('exec_sql', {
        sql: `DROP TABLE IF EXISTS ${table} CASCADE;`
      });
    }
    
    console.log('✅ Database cleanup completed');
  }
}

// Export singleton instance
export const databaseSetup = new DatabaseSetup();

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      databaseSetup.setup()
        .then(() => {
          console.log('✅ Database setup completed successfully!');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Database setup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'test':
      databaseSetup.testConnection()
        .then(success => {
          if (success) {
            console.log('✅ Database connection test passed');
            process.exit(0);
          } else {
            console.log('❌ Database connection test failed');
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('❌ Database connection test failed:', error);
          process.exit(1);
        });
      break;
      
    case 'cleanup':
      databaseSetup.cleanup()
        .then(() => {
          console.log('✅ Database cleanup completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Database cleanup failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node setup-database.js [setup|test|cleanup]');
      process.exit(1);
  }
}