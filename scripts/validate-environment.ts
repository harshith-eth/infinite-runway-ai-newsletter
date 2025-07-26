import { azureOpenAI } from '@/lib/services/azure-openai';
import { supabase } from '@/lib/services/supabase';
import { resendService } from '@/lib/services/resend';
import { stripeService } from '@/lib/services/stripe';
import { slackService } from '@/lib/services/slack';
import { linearService } from '@/lib/services/linear';
import { scraperService } from '@/lib/services/scraper';

interface ValidationResult {
  service: string;
  required: boolean;
  configured: boolean;
  connected: boolean;
  error?: string;
}

interface ServiceTest {
  name: string;
  required: boolean;
  envVars: string[];
  testConnection: () => Promise<boolean>;
}

export class EnvironmentValidator {
  private services: ServiceTest[] = [
    {
      name: 'Azure OpenAI',
      required: true,
      envVars: [
        'AZURE_OPENAI_ENDPOINT',
        'AZURE_OPENAI_API_KEY',
        'AZURE_OPENAI_DEPLOYMENT_NAME',
        'AZURE_OPENAI_IMAGE_DEPLOYMENT_NAME'
      ],
      testConnection: () => azureOpenAI.testConnection()
    },
    {
      name: 'Supabase',
      required: true,
      envVars: [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ],
      testConnection: () => supabase.testConnection()
    },
    {
      name: 'Resend',
      required: true,
      envVars: [
        'RESEND_API_KEY',
        'RESEND_FROM_EMAIL',
        'RESEND_AUDIENCE_ID'
      ],
      testConnection: () => resendService.testConnection()
    },
    {
      name: 'Stripe',
      required: true,
      envVars: [
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET'
      ],
      testConnection: () => stripeService.testConnection()
    },
    {
      name: 'Slack',
      required: true,
      envVars: [
        'SLACK_WEBHOOK_URL',
        'SLACK_ALERTS_WEBHOOK',
        'SLACK_STATUS_WEBHOOK',
        'SLACK_ANALYTICS_WEBHOOK'
      ],
      testConnection: () => slackService.testConnection()
    },
    {
      name: 'Linear',
      required: true,
      envVars: [
        'LINEAR_API_KEY',
        'LINEAR_TEAM_ID',
        'LINEAR_PROJECT_ID'
      ],
      testConnection: () => linearService.testConnection()
    }
  ];

  private appEnvVars = [
    'NEXT_PUBLIC_APP_URL',
    'ADMIN_EMAIL',
    'NODE_ENV'
  ];

  async validate(skipConnections = false): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    console.log('🔍 Validating environment configuration...\n');
    
    // Check app environment variables
    const appConfigured = this.validateAppConfig();
    results.push({
      service: 'App Configuration',
      required: true,
      configured: appConfigured,
      connected: appConfigured, // For app config, configured = connected
    });
    
    // Check each service
    for (const service of this.services) {
      const result = await this.validateService(service, skipConnections);
      results.push(result);
    }
    
    return results;
  }
  
  private validateAppConfig(): boolean {
    const missing = this.appEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.log(`❌ App Configuration - Missing variables: ${missing.join(', ')}`);
      return false;
    }
    
    console.log('✅ App Configuration - All variables present');
    return true;
  }
  
  private async validateService(service: ServiceTest, skipConnections: boolean): Promise<ValidationResult> {
    const result: ValidationResult = {
      service: service.name,
      required: service.required,
      configured: false,
      connected: false,
    };
    
    // Check environment variables
    const missing = service.envVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      result.error = `Missing environment variables: ${missing.join(', ')}`;
      console.log(`❌ ${service.name} - ${result.error}`);
      return result;
    }
    
    result.configured = true;
    
    if (skipConnections) {
      console.log(`⚠️  ${service.name} - Configured (connection test skipped)`);
      return result;
    }
    
    // Test connection
    try {
      console.log(`🔄 Testing ${service.name} connection...`);
      result.connected = await service.testConnection();
      
      if (result.connected) {
        console.log(`✅ ${service.name} - Connected successfully`);
      } else {
        console.log(`❌ ${service.name} - Connection failed`);
        result.error = 'Connection test failed';
      }
    } catch (error) {
      console.log(`❌ ${service.name} - Connection error: ${error instanceof Error ? error.message : error}`);
      result.error = error instanceof Error ? error.message : 'Unknown connection error';
    }
    
    return result;
  }
  
  generateReport(results: ValidationResult[]): string {
    const totalServices = results.length;
    const configuredServices = results.filter(r => r.configured).length;
    const connectedServices = results.filter(r => r.connected).length;
    const requiredServices = results.filter(r => r.required).length;
    const requiredConfigured = results.filter(r => r.required && r.configured).length;
    const requiredConnected = results.filter(r => r.required && r.connected).length;
    
    let report = '\n📊 Environment Validation Report\n';
    report += '='.repeat(50) + '\n\n';
    
    // Overall Status
    const allRequiredConfigured = requiredConfigured === requiredServices;
    const allRequiredConnected = requiredConnected === requiredServices;
    
    if (allRequiredConfigured && allRequiredConnected) {
      report += '🎉 Status: READY FOR PRODUCTION\n';
    } else if (allRequiredConfigured) {
      report += '⚠️  Status: CONFIGURED BUT CONNECTION ISSUES\n';
    } else {
      report += '❌ Status: MISSING CONFIGURATION\n';
    }
    
    report += `\n📈 Summary:\n`;
    report += `- Total Services: ${totalServices}\n`;
    report += `- Required Services: ${requiredServices}\n`;
    report += `- Configured: ${configuredServices}/${totalServices}\n`;
    report += `- Connected: ${connectedServices}/${totalServices}\n`;
    report += `- Required Configured: ${requiredConfigured}/${requiredServices}\n`;
    report += `- Required Connected: ${requiredConnected}/${requiredServices}\n`;
    
    // Detailed Results
    report += `\n📋 Detailed Results:\n`;
    
    for (const result of results) {
      const status = result.connected ? '✅' : result.configured ? '⚠️' : '❌';
      const required = result.required ? '(Required)' : '(Optional)';
      
      report += `${status} ${result.service} ${required}\n`;
      
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
    }
    
    // Next Steps
    report += `\n🚀 Next Steps:\n`;
    
    const failedRequired = results.filter(r => r.required && !r.configured);
    if (failedRequired.length > 0) {
      report += `1. Configure missing required services:\n`;
      failedRequired.forEach(r => {
        report += `   - ${r.service}: ${r.error}\n`;
      });
    }
    
    const connectedIssues = results.filter(r => r.configured && !r.connected);
    if (connectedIssues.length > 0) {
      report += `2. Fix connection issues:\n`;
      connectedIssues.forEach(r => {
        report += `   - ${r.service}: ${r.error}\n`;
      });
    }
    
    if (allRequiredConfigured && allRequiredConnected) {
      report += `1. Run database setup: npm run setup:db\n`;
      report += `2. Test newsletter generation: npm run generate:test\n`;
      report += `3. Configure GitHub Actions secrets\n`;
      report += `4. Deploy to production\n`;
    }
    
    return report;
  }
  
  async checkDatabaseSchema(): Promise<boolean> {
    try {
      console.log('🔍 Checking database schema...');
      
      // Check if main tables exist
      const tables = [
        'newsletter_content',
        'scraped_articles',
        'subscribers',
        'sponsors',
        'analytics',
        'email_tracking'
      ];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table} not found or not accessible`);
          return false;
        }
      }
      
      console.log('✅ Database schema validation passed');
      return true;
      
    } catch (error) {
      console.log(`❌ Database schema validation failed: ${error}`);
      return false;
    }
  }
  
  async generateEnvExample(): Promise<string> {
    const envExample = `# =============================================================================
# AUTONOMOUS NEWSLETTER SYSTEM - ENVIRONMENT CONFIGURATION
# =============================================================================

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_IMAGE_DEPLOYMENT_NAME=dall-e-3

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Resend Email Configuration
RESEND_API_KEY=re_your-api-key-here
RESEND_FROM_EMAIL=newsletter@yourdomain.com
RESEND_AUDIENCE_ID=your-audience-id-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
SLACK_ALERTS_WEBHOOK=https://hooks.slack.com/services/your/alerts/webhook
SLACK_STATUS_WEBHOOK=https://hooks.slack.com/services/your/status/webhook
SLACK_ANALYTICS_WEBHOOK=https://hooks.slack.com/services/your/analytics/webhook

# Linear Configuration
LINEAR_API_KEY=lin_api_your-api-key-here
LINEAR_TEAM_ID=your-team-id-here
LINEAR_PROJECT_ID=your-project-id-here

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
NODE_ENV=production

# =============================================================================
# SETUP INSTRUCTIONS:
# 1. Copy this file to .env.local
# 2. Replace all placeholder values with your actual credentials
# 3. Run: npm run validate:env
# 4. Run: npm run setup:db
# 5. Test: npm run generate:test
# =============================================================================
`;
    
    return envExample;
  }
}

// Export singleton instance
export const environmentValidator = new EnvironmentValidator();

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  const skipConnections = process.argv.includes('--skip-connections');
  
  switch (command) {
    case 'validate':
      environmentValidator.validate(skipConnections)
        .then(results => {
          const report = environmentValidator.generateReport(results);
          console.log(report);
          
          const allRequiredValid = results
            .filter(r => r.required)
            .every(r => r.configured && r.connected);
          
          process.exit(allRequiredValid ? 0 : 1);
        })
        .catch(error => {
          console.error('❌ Environment validation failed:', error);
          process.exit(1);
        });
      break;
      
    case 'check-db':
      environmentValidator.checkDatabaseSchema()
        .then(valid => {
          if (valid) {
            console.log('✅ Database schema is valid');
            process.exit(0);
          } else {
            console.log('❌ Database schema validation failed');
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('❌ Database schema check failed:', error);
          process.exit(1);
        });
      break;
      
    case 'generate-env':
      environmentValidator.generateEnvExample()
        .then(content => {
          console.log(content);
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Failed to generate env example:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node validate-environment.js [validate|check-db|generate-env] [--skip-connections]');
      process.exit(1);
  }
}