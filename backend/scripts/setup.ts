#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs/promises';
import { statusUpdater } from '../automation/update-status';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

interface SetupStep {
  name: string;
  check: () => Promise<boolean>;
  action?: () => Promise<void>;
  required: boolean;
}

class SetupScript {
  private steps: SetupStep[] = [
    {
      name: 'Check Node.js version',
      check: async () => {
        const version = process.version;
        const major = parseInt(version.split('.')[0].substring(1));
        if (major < 18) {
          console.error(`❌ Node.js version ${version} is too old. Please use Node.js 18 or higher.`);
          return false;
        }
        console.log(`✅ Node.js version ${version}`);
        return true;
      },
      required: true,
    },
    {
      name: 'Check environment file',
      check: async () => {
        try {
          await fs.access('.env.local');
          console.log('✅ .env.local file exists');
          return true;
        } catch {
          console.error('❌ .env.local file not found');
          console.log('📋 Copy .env.local.example to .env.local and fill in your values');
          return false;
        }
      },
      required: true,
    },
    {
      name: 'Validate environment variables',
      check: async () => {
        const { valid, missing } = await statusUpdater.validateEnvironment();
        
        if (!valid) {
          console.error('❌ Missing required environment variables:');
          missing.forEach(key => console.error(`   - ${key}`));
          return false;
        }
        
        console.log('✅ All required environment variables are set');
        return true;
      },
      required: true,
    },
    {
      name: 'Test Azure OpenAI connection',
      check: async () => {
        try {
          const { azureOpenAI } = await import('../lib/services/azure-openai');
          const connected = await azureOpenAI.testConnection();
          if (connected) {
            console.log('✅ Azure OpenAI connection successful');
            return true;
          }
          console.error('❌ Azure OpenAI connection failed');
          return false;
        } catch (error) {
          console.error('❌ Azure OpenAI error:', error);
          return false;
        }
      },
      required: true,
    },
    {
      name: 'Test Supabase connection',
      check: async () => {
        try {
          const { supabase } = await import('../lib/services/supabase');
          const connected = await supabase.testConnection();
          if (connected) {
            console.log('✅ Supabase connection successful');
            return true;
          }
          console.error('❌ Supabase connection failed');
          return false;
        } catch (error) {
          console.error('❌ Supabase error:', error);
          return false;
        }
      },
      required: true,
    },
    {
      name: 'Test Resend connection',
      check: async () => {
        try {
          const { resendService } = await import('../lib/services/resend');
          const connected = await resendService.testConnection();
          if (connected) {
            console.log('✅ Resend connection successful');
            return true;
          }
          console.error('❌ Resend connection failed');
          return false;
        } catch (error) {
          console.error('❌ Resend error:', error);
          return false;
        }
      },
      required: true,
    },
    {
      name: 'Test Stripe connection',
      check: async () => {
        try {
          const { stripeService } = await import('../lib/services/stripe');
          const connected = await stripeService.testConnection();
          if (connected) {
            console.log('✅ Stripe connection successful');
            return true;
          }
          console.error('❌ Stripe connection failed');
          return false;
        } catch (error) {
          console.error('❌ Stripe error:', error);
          return false;
        }
      },
      required: true,
    },
    {
      name: 'Test Slack webhook',
      check: async () => {
        try {
          const { slackService } = await import('../lib/services/slack');
          const connected = await slackService.testConnection();
          if (connected) {
            console.log('✅ Slack webhook connection successful');
            return true;
          }
          console.warn('⚠️  Slack webhook connection failed (optional)');
          return false;
        } catch (error) {
          console.warn('⚠️  Slack error (optional):', error);
          return false;
        }
      },
      required: false,
    },
    {
      name: 'Test Linear API',
      check: async () => {
        try {
          const { linearService } = await import('../lib/services/linear');
          const connected = await linearService.testConnection();
          if (connected) {
            console.log('✅ Linear API connection successful');
            return true;
          }
          console.warn('⚠️  Linear API connection failed (optional)');
          return false;
        } catch (error) {
          console.warn('⚠️  Linear error (optional):', error);
          return false;
        }
      },
      required: false,
    },
    {
      name: 'Check database schema',
      check: async () => {
        // In a real setup, you would check if all required tables exist
        console.log('⚠️  Database schema check not implemented');
        console.log('📋 Please run the Supabase migrations manually');
        return true;
      },
      required: false,
    },
    {
      name: 'Create required directories',
      check: async () => {
        const dirs = [
          'data/generated-newsletters',
          'public/images/newsletters',
        ];
        
        for (const dir of dirs) {
          try {
            await fs.mkdir(dir, { recursive: true });
          } catch (error) {
            console.error(`❌ Failed to create directory: ${dir}`);
            return false;
          }
        }
        
        console.log('✅ Required directories created');
        return true;
      },
      required: true,
    },
    {
      name: 'Test content scraping',
      check: async () => {
        try {
          const { scraperService } = await import('../lib/services/scraper');
          console.log('🔍 Testing content scraping...');
          const results = await scraperService.testScraping();
          
          console.log('Scraping test results:');
          results.forEach(result => {
            console.log(`   ${result.source}: ${result.count} articles`);
          });
          
          return results.some(r => r.count > 0);
        } catch (error) {
          console.error('❌ Scraping test failed:', error);
          return false;
        }
      },
      required: false,
    },
  ];
  
  async run(): Promise<void> {
    console.log('🚀 Infinite Runway Newsletter System Setup\n');
    
    let allRequiredPassed = true;
    let optionalFailed = 0;
    
    for (const step of this.steps) {
      console.log(`\n📌 ${step.name}...`);
      
      try {
        const success = await step.check();
        
        if (!success && step.required) {
          allRequiredPassed = false;
        } else if (!success && !step.required) {
          optionalFailed++;
        }
        
        if (success && step.action) {
          await step.action();
        }
      } catch (error) {
        console.error(`❌ Error in step "${step.name}":`, error);
        if (step.required) {
          allRequiredPassed = false;
        }
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    if (allRequiredPassed) {
      console.log('✅ All required setup steps completed successfully!');
      
      if (optionalFailed > 0) {
        console.log(`⚠️  ${optionalFailed} optional steps failed or were skipped`);
      }
      
      console.log('\n📋 Next steps:');
      console.log('1. Run the database migrations in Supabase');
      console.log('2. Configure GitHub secrets for Actions');
      console.log('3. Test newsletter generation: npm run generate:test');
      console.log('4. Test email sending: npm run send:test');
      console.log('5. Deploy to production when ready');
    } else {
      console.error('❌ Setup failed! Please fix the errors above and run again.');
      process.exit(1);
    }
  }
}

// Run the setup
const setup = new SetupScript();
setup.run().catch(error => {
  console.error('Setup script error:', error);
  process.exit(1);
});