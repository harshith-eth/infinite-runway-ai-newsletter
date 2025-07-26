# Technical Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CONTENT SOURCES                             │
├─────────────┬──────────────┬────────────────┬──────────────────────┤
│ Hacker News │ Tech Blogs   │ AI Newsletters │ RSS Feeds            │
└──────┬──────┴──────┬───────┴────────┬───────┴──────────────────────┘
       │             │                 │
       └─────────────┼─────────────────┘
                     ▼
            ┌────────────────┐
            │ Web Scraper    │
            │ (Node.js)      │
            └────────┬───────┘
                     ▼
         ┌───────────────────────┐
         │   Supabase Database   │
         │  ┌─────────────────┐  │
         │  │ scraped_articles│  │
         │  │ newsletter_data │  │
         │  │ sponsors        │  │
         │  │ payments        │  │
         │  │ analytics       │  │
         │  └─────────────────┘  │
         └───────────┬───────────┘
                     ▼
    ┌────────────────────────────────┐
    │      Content Generation        │
    │  ┌──────────────────────────┐  │
    │  │ Azure OpenAI GPT-4       │  │
    │  │ - Newsletter writing     │  │
    │  │ - Content curation       │  │
    │  └──────────────────────────┘  │
    │  ┌──────────────────────────┐  │
    │  │ Azure OpenAI DALL-E      │  │
    │  │ - Retro-futuristic imgs │  │
    │  └──────────────────────────┘  │
    └────────────────┬───────────────┘
                     ▼
         ┌───────────────────────┐
         │   Content Processor   │
         │ - Format for web/email│
         │ - Insert sponsor ads  │
         │ - Generate metadata   │
         └──────────┬────────────┘
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
┌───────────────┐       ┌─────────────────┐
│ GitHub Actions│       │  Resend Email   │
│ - Auto commit │       │ - Send to list  │
│ - Deploy site │       │ - Track opens   │
└───────┬───────┘       └────────┬────────┘
        │                        │
        ▼                        ▼
┌───────────────┐       ┌─────────────────┐
│  Next.js Site │       │  Subscribers    │
│ (Production)  │       │  Email Inboxes  │
└───────────────┘       └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    TRANSPARENCY & MONITORING LAYER                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐        ┌────────────────────────────┐ │
│  │        Linear            │        │         Slack              │ │
│  │  ┌─────────────────┐     │        │  ┌───────────────────┐     │ │
│  │  │ Pipeline Board  │     │        │  │ #engine-alerts    │     │ │
│  │  │ • Backlog       │     │        │  │ • Critical errors │     │ │
│  │  │ • To Do         │     │        │  │ • Failures        │     │ │
│  │  │ • In Progress   │     │        │  └───────────────────┘     │ │
│  │  │ • Done          │     │        │  ┌───────────────────┐     │ │
│  │  └─────────────────┘     │        │  │ #engine-status    │     │ │
│  │  ┌─────────────────┐     │        │  │ • Milestones      │     │ │
│  │  │ Analytics Tasks │     │        │  │ • Completions     │     │ │
│  │  │ • Weekly reports│     │        │  └───────────────────┘     │ │
│  │  │ • Monthly health│     │        │  ┌───────────────────┐     │ │
│  │  │ • Metrics       │     │        │  │ #engine-analytics │     │ │
│  │  └─────────────────┘     │        │  │ • Weekly summary  │     │ │
│  └──────────────────────────┘        │  │ • Monthly trends  │     │ │
│         ▲                             │  └───────────────────┘     │ │
│         │                             └────────────────────────────┘ │
│         └────────────────────────────────────┐                      │
│                All stages update Linear tasks │                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Layer
```
Next.js Application
├── /pages
│   ├── /newsletters      # Dynamic newsletter pages
│   ├── /sponsors         # Sponsor portal
│   └── /subscribe        # Subscription management
├── /components
│   ├── NewsletterCard
│   ├── SponsorCheckout   # Stripe integration
│   └── AnalyticsDashboard
└── /api
    ├── /webhooks
    │   ├── stripe        # Payment webhooks
    │   └── github        # Deploy webhooks
    ├── /newsletter       # Newsletter CRUD
    └── /sponsors         # Sponsor management
```

### 2. Backend Services
```
/lib/services/
├── azure-openai.ts       # AI content generation
├── supabase.ts          # Database operations
├── resend.ts            # Email delivery
├── stripe.ts            # Payment processing
├── slack.ts             # Notifications
├── linear.ts            # Task management
└── scraper.ts           # Content aggregation
```

### 3. Automation Layer
```
/automation/
├── content-generator.ts  # Weekly newsletter creation
├── email-sender.ts      # Distribution logic
├── analytics.ts         # Performance tracking
└── sponsor-manager.ts   # Ad insertion & reports
```

### 4. Database Schema
```
Supabase PostgreSQL
├── Public Tables
│   ├── newsletters
│   ├── subscribers
│   ├── sponsors
│   └── analytics
├── Realtime
│   └── sponsor_payments  # Live payment updates
└── Storage
    ├── images           # Generated thumbnails
    └── sponsor_assets   # Uploaded ad content
```

## API Integration Points

### 1. Azure OpenAI
- **Endpoint**: `https://YOUR_RESOURCE.openai.azure.com/`
- **Models**: GPT-4, DALL-E 3
- **Rate Limits**: 60 requests/min
- **Retry Strategy**: Exponential backoff

### 2. Stripe
- **Webhooks**: `/api/webhooks/stripe`
- **Events**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.deleted`
- **Security**: Webhook signature verification

### 3. Resend
- **API**: REST API v1
- **Templates**: Stored in Resend dashboard
- **Lists**: Managed via API
- **Batching**: 1000 emails per request

### 4. GitHub Actions
```yaml
Workflows:
├── newsletter-generation.yml  # Weekly trigger
├── deploy-production.yml     # Auto-deploy
└── backup-database.yml       # Daily backups
```

## Security Architecture

### Authentication Flow
```
┌─────────┐      ┌──────────┐      ┌───────────┐
│ User    │─────▶│ Next.js  │─────▶│ Supabase  │
│         │◀─────│ Auth     │◀─────│ Auth      │
└─────────┘      └──────────┘      └───────────┘
                       │
                       ▼
                ┌──────────────┐
                │ JWT Token    │
                │ (HttpOnly)   │
                └──────────────┘
```

### API Key Management
```
Environment Variables (.env.local)
├── AZURE_OPENAI_KEY        # Encrypted
├── SUPABASE_SERVICE_KEY    # Encrypted
├── RESEND_API_KEY          # Encrypted
├── STRIPE_SECRET_KEY       # Encrypted
├── STRIPE_WEBHOOK_SECRET   # Encrypted
├── SLACK_WEBHOOK_URL       # Encrypted
└── LINEAR_API_KEY          # Encrypted
```

## Deployment Architecture

### Infrastructure
```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Vercel     │────▶│  Supabase   │────▶│ Azure OpenAI │
│  (Frontend)  │     │ (Database)  │     │    (AI)      │
└──────────────┘     └─────────────┘     └──────────────┘
       │                    │                     │
       └────────────────────┴─────────────────────┘
                            │
                     ┌──────────────┐
                     │ GitHub Repo  │
                     │ + Actions    │
                     └──────────────┘
```

### Scaling Considerations

1. **Content Generation**
   - Queue system for large batches
   - Parallel processing for images
   - Caching for repeated content

2. **Email Delivery**
   - Batch processing (1000/request)
   - Rate limiting compliance
   - Retry queue for failures

3. **Database**
   - Connection pooling
   - Read replicas for analytics
   - Automated backups

4. **Payment Processing**
   - Idempotent webhook handlers
   - Failed payment recovery
   - Subscription lifecycle management

## Monitoring & Observability

### Metrics to Track
```
Performance Metrics:
├── Newsletter generation time
├── Email delivery rate
├── API response times
├── Database query performance
└── Payment success rate

Business Metrics:
├── Subscriber growth
├── Open/click rates
├── Sponsor conversion
├── Revenue tracking
└── Content engagement
```

### Alert Conditions
- Content generation failure
- Email delivery < 95%
- Payment webhook failures
- API rate limit warnings
- Database connection errors

## Disaster Recovery

### Backup Strategy
1. **Database**: Daily automated backups
2. **Content**: Version control in Git
3. **Images**: Supabase storage replication
4. **Configs**: Encrypted env backup

### Failover Plan
1. **Primary failure**: Switch to backup Azure region
2. **Database failure**: Restore from latest backup
3. **Email failure**: Queue and retry
4. **Payment failure**: Manual reconciliation