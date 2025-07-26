# Development Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Git
- VS Code (recommended)
- Azure account with OpenAI access
- Supabase account
- Stripe account
- Resend account
- Slack workspace
- Linear account

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone [your-repo-url]
cd infinite-runway-main

# Install dependencies
npm install
```

### 2. Environment Variables

Create `.env.local` file in the root directory:

```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://YOUR_RESOURCE.openai.azure.com/
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_DALLE_DEPLOYMENT=dall-e-3

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here

# Resend
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=newsletter@yourdomain.com

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Linear
LINEAR_API_KEY=lin_api_your_key_here
LINEAR_TEAM_ID=your_team_id_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Supabase Database Setup

```sql
-- Run these commands in Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Newsletter content table
CREATE TABLE newsletter_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  theme TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped articles table
CREATE TABLE scraped_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT false,
  relevance_score FLOAT
);

-- Subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Sponsors table
CREATE TABLE sponsors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  package_type TEXT NOT NULL,
  custom_copy TEXT,
  custom_image_url TEXT,
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sponsor_id UUID REFERENCES sponsors(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletter_content(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  open_rate FLOAT,
  click_rate FLOAT,
  subscriber_count INTEGER,
  sponsor_clicks JSONB,
  sponsor_conversions JSONB
);

-- Create indexes for performance
CREATE INDEX idx_scraped_articles_used ON scraped_articles(used);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_sponsors_status ON sponsors(payment_status);
CREATE INDEX idx_newsletter_published ON newsletter_content(published_at);

-- Row Level Security (RLS)
ALTER TABLE newsletter_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
```

### 4. Stripe Setup

1. **Create Products in Stripe Dashboard:**
   ```
   - Monthly Sponsor Package ($500/month)
   - Quarterly Sponsor Package ($1350/quarter) 
   - Annual Sponsor Package ($5000/year)
   ```

2. **Configure Webhook Endpoint:**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **Test Webhook Locally:**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login to Stripe
   stripe login

   # Forward webhooks to localhost
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### 5. Project Structure Setup

```bash
# Create necessary directories
mkdir -p lib/services
mkdir -p lib/utils
mkdir -p components/newsletter
mkdir -p components/sponsor
mkdir -p pages/api/webhooks
mkdir -p automation
mkdir -p .github/workflows
```

### 6. Install Additional Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js
npm install openai
npm install resend
npm install stripe
npm install @slack/webhook
npm install @linear/sdk

# Utility dependencies
npm install axios
npm install cheerio
npm install node-cron
npm install zod
npm install date-fns

# Development dependencies
npm install -D @types/node
npm install -D typescript
npm install -D eslint
npm install -D prettier
```

### 7. GitHub Actions Setup

Create `.github/workflows/newsletter.yml`:

```yaml
name: Automated Newsletter Generation
on:
  schedule:
    - cron: '0 10 * * 1' # Every Monday at 10 AM UTC
  workflow_dispatch: # Allow manual trigger

env:
  AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
  AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}

jobs:
  generate-and-send:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate newsletter
        run: npm run generate-newsletter
      
      - name: Send newsletter
        run: npm run send-newsletter
      
      - name: Commit changes
        run: |
          git config --global user.name 'Newsletter Bot'
          git config --global user.email 'bot@yourdomain.com'
          git add .
          git commit -m "Add newsletter: $(date +'%Y-%m-%d')"
          git push
```

### 8. Local Development Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "generate-newsletter": "node automation/generate-newsletter.js",
    "send-newsletter": "node automation/send-newsletter.js",
    "scrape-content": "node automation/scrape-content.js",
    "test-stripe-webhook": "stripe listen --forward-to localhost:3000/api/webhooks/stripe",
    "db-migrate": "node scripts/migrate.js",
    "db-seed": "node scripts/seed.js"
  }
}
```

### 9. VS Code Extensions

Recommended extensions for development:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.npm-intellisense",
    "mikestead.dotenv",
    "GitHub.copilot"
  ]
}
```

### 10. Testing the Setup

```bash
# 1. Test database connection
npm run db-migrate

# 2. Test Azure OpenAI
node scripts/test-openai.js

# 3. Test Stripe webhook
npm run test-stripe-webhook

# 4. Test email sending
node scripts/test-email.js

# 5. Run development server
npm run dev
```

## Troubleshooting

### Common Issues

1. **Azure OpenAI Connection Failed**
   - Verify API key and endpoint
   - Check deployment names match
   - Ensure region is correct

2. **Supabase Connection Issues**
   - Check service role key permissions
   - Verify database URL
   - Ensure RLS policies are configured

3. **Stripe Webhook Signature Invalid**
   - Update webhook secret in .env
   - Verify endpoint URL
   - Check request body parsing

4. **Email Delivery Failed**
   - Verify domain in Resend
   - Check from email address
   - Review API key permissions

### Debug Mode

Enable debug logging:

```env
# Add to .env.local
DEBUG=true
LOG_LEVEL=verbose
```

## Next Steps

1. Run initial content scraping
2. Test newsletter generation locally
3. Create test sponsor account
4. Verify email template rendering
5. Test full automation workflow

## Support Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/cognitive-services/openai/)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Resend Documentation](https://resend.com/docs)
- [Linear API Docs](https://developers.linear.app)