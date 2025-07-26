# 🚀 Autonomous Newsletter System - Setup Guide

Complete setup guide for the AI-powered newsletter system that automatically generates and sends newsletters 3x per week.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Access to external services (see Service Setup section)

## 🔧 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Environment Template

```bash
npm run generate:env > .env.local
```

### 3. Configure External Services

Fill in the `.env.local` file with your API keys and configuration (see Service Setup section below).

### 4. Validate Environment

```bash
npm run validate:env
```

### 5. Setup Database

```bash
npm run setup:db
```

### 6. Test the System

```bash
npm run generate:test
```

## 🛠️ Service Setup

### Azure OpenAI
1. Create an Azure OpenAI resource
2. Deploy GPT-4 and DALL-E models
3. Get your endpoint and API key

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_IMAGE_DEPLOYMENT_NAME=dall-e-3
```

### Supabase
1. Create a Supabase project
2. Get your project URL and keys
3. Enable RLS (Row Level Security)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Resend
1. Sign up for Resend
2. Verify your domain
3. Create an API key
4. Set up an audience

```env
RESEND_API_KEY=re_your-api-key-here
RESEND_FROM_EMAIL=newsletter@yourdomain.com
RESEND_AUDIENCE_ID=your-audience-id-here
```

### Stripe
1. Create a Stripe account
2. Get your secret key
3. Set up webhook endpoint at `https://yourdomain.com/api/webhooks/stripe`
4. Configure webhook events: `checkout.session.completed`, `payment_intent.succeeded`, etc.

```env
STRIPE_SECRET_KEY=sk_test_your-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

### Slack
1. Create a Slack app
2. Create 4 webhook URLs for different channels
3. Add webhook URLs to environment

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
SLACK_ALERTS_WEBHOOK=https://hooks.slack.com/services/your/alerts/webhook
SLACK_STATUS_WEBHOOK=https://hooks.slack.com/services/your/status/webhook
SLACK_ANALYTICS_WEBHOOK=https://hooks.slack.com/services/your/analytics/webhook
```

### Linear
1. Create a Linear account
2. Generate API key
3. Get your team and project IDs

```env
LINEAR_API_KEY=lin_api_your-api-key-here
LINEAR_TEAM_ID=your-team-id-here
LINEAR_PROJECT_ID=your-project-id-here
```

## 📊 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Setup & Validation
- `npm run setup:db` - Setup database schema
- `npm run setup:db:test` - Test database connection
- `npm run setup:db:cleanup` - Clean up database (destructive)
- `npm run validate:env` - Validate environment configuration
- `npm run validate:env:skip` - Validate without connection tests
- `npm run validate:db` - Check database schema
- `npm run generate:env` - Generate environment template

### Newsletter Operations
- `npm run generate:newsletter` - Generate newsletter (production)
- `npm run generate:test` - Generate test newsletter
- `npm run send:emails` - Send newsletter emails
- `npm run send:test` - Send test email
- `npm run update:status` - Update system status
- `npm run health:check` - Run health check
- `npm run analytics:weekly` - Generate weekly analytics

## 🔄 Automated Workflow

The system runs automatically via GitHub Actions:

- **Monday 10 AM UTC**: Weekly AI Digest
- **Wednesday 10 AM UTC**: AI Innovation Report  
- **Friday 10 AM UTC**: AI Business & Careers
- **Sunday 6 PM UTC**: Weekly analytics summary
- **Every 6 hours**: System health check

## 📁 Project Structure

```
├── automation/           # Automation scripts
│   ├── generate-newsletter.ts
│   ├── send-emails.ts
│   └── update-status.ts
├── scripts/             # Setup and utility scripts
│   ├── setup-database.ts
│   └── validate-environment.ts
├── lib/
│   ├── services/        # External service integrations
│   └── types/          # TypeScript type definitions
├── data/
│   ├── blog-posts/     # Static blog posts
│   └── generated-newsletters/  # AI-generated newsletters
├── app/
│   └── api/
│       └── webhooks/    # Webhook handlers
└── docs/               # Documentation
```

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   ```bash
   npm run validate:env
   ```

2. **Database Connection Issues**
   ```bash
   npm run setup:db:test
   ```

3. **Service Connection Problems**
   ```bash
   npm run validate:env
   ```

4. **Newsletter Generation Fails**
   ```bash
   npm run generate:test
   ```

### Debug Mode

Add `DEBUG=true` to your environment variables for detailed logging.

## 📈 Monitoring

The system includes comprehensive monitoring:

- **Slack Notifications**: Real-time alerts and status updates
- **Linear Integration**: Automated task creation and tracking
- **Health Checks**: Automated system health monitoring
- **Analytics**: Email performance and engagement metrics

## 🔐 Security

- All API keys are stored as environment variables
- Database uses Row Level Security (RLS)
- Webhook endpoints are secured with signature verification
- Service-to-service communication uses encrypted channels

## 🚀 Deployment

### GitHub Actions Setup

1. Add all environment variables as GitHub secrets
2. Configure Vercel deployment (or your preferred hosting)
3. Set up webhook endpoints in external services
4. Test with manual workflow trigger

### Production Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Webhook endpoints configured
- [ ] DNS and domain setup complete
- [ ] SSL certificates installed
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the error logs in Slack
3. Check Linear for automated issue tracking
4. Review the health check dashboard

## 🎯 Success Metrics

- **Newsletter Generation**: >95% success rate
- **Email Delivery**: >98% delivery rate
- **Open Rate**: >25% target
- **System Uptime**: >99.5% availability
- **Generation Time**: <2 minutes per newsletter

---

*Last updated: January 2025*
*System Version: 1.0*