# GitHub Actions Workflow & Deployment Process

## Overview
GitHub Actions serves as your autonomous server that generates content, updates code, publishes to the website, and sends emails - all without any manual intervention.

## How It Works - Step by Step

### 1. The Trigger (Mon/Wed/Fri 10 AM UTC)
```yaml
# .github/workflows/newsletter-automation.yml
on:
  schedule:
    - cron: '0 10 * * 1,3,5'  # Monday, Wednesday, Friday at 10 AM UTC
  workflow_dispatch:          # Also allow manual trigger
```

### 2. Where It Runs
GitHub Actions provides **free cloud servers** (runners) that execute your code:
- No need for your own server
- Runs on GitHub's infrastructure
- 2,000 free minutes/month (more than enough)
- Ubuntu Linux environment

### 3. The Complete Workflow

```yaml
name: Autonomous Newsletter Engine
on:
  schedule:
    - cron: '0 10 * * 1'

jobs:
  generate-newsletter:
    runs-on: ubuntu-latest
    steps:
      # Step 1: Check out your code
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      # Step 2: Set up Node.js
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Step 3: Install dependencies
      - run: npm ci

      # Step 4: Generate newsletter content
      - name: Generate Newsletter Content
        env:
          AZURE_OPENAI_KEY: ${{ secrets.AZURE_OPENAI_KEY }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: |
          node scripts/generate-newsletter.js
          # This creates a new .mdx file in /content/newsletters/

      # Step 5: Commit the new newsletter to your repo
      - name: Commit Newsletter
        run: |
          git config user.name "Newsletter Bot"
          git config user.email "bot@infiniterunway.com"
          git add content/newsletters/
          git commit -m "Add newsletter: $(date +'%Y-%m-%d')"
          git push

      # Step 6: Wait for Vercel to deploy (triggered by commit)
      - name: Wait for Deployment
        run: sleep 60  # Give Vercel time to build

      # Step 7: Send emails to subscribers
      - name: Send Newsletter Emails
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
        run: node scripts/send-emails.js

      # Step 8: Update Linear and send Slack notifications
      - name: Update Status
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: node scripts/update-status.js
```

## The Flow Explained

### 1. Content Generation Phase
```javascript
// scripts/generate-newsletter.js
async function generateNewsletter() {
  // 1. Scrape latest content from sources
  const articles = await scrapeContent();
  
  // 2. Generate newsletter with AI
  const content = await generateWithGPT4(articles);
  
  // 3. Generate thumbnail image
  const imageUrl = await generateImage(content.topic);
  
  // 4. Create MDX file for Next.js
  const mdxContent = formatAsMDX(content, imageUrl);
  
  // 5. Save to filesystem
  fs.writeFileSync(
    `content/newsletters/${date}.mdx`,
    mdxContent
  );
}
```

### 2. Git Commit Phase
When GitHub Actions commits the new file:
```bash
git add content/newsletters/2025-01-27.mdx
git commit -m "Add newsletter: 2025-01-27"
git push
```

This triggers:
- **Vercel** automatically detects the push
- Builds your Next.js site with the new content
- Deploys to production (takes ~45 seconds)
- Your website now shows the new newsletter!

### 3. Email Distribution Phase
After the website is live:
```javascript
// scripts/send-emails.js
async function sendNewsletterEmails() {
  // 1. Get subscriber list from Supabase
  const subscribers = await getActiveSubscribers();
  
  // 2. Get the newsletter content
  const newsletter = await getLatestNewsletter();
  
  // 3. Send via Resend in batches
  await resend.emails.send({
    from: 'Infinite Runway <newsletter@infiniterunway.com>',
    to: subscribers,
    subject: newsletter.title,
    html: newsletter.emailHtml,
    bcc: process.env.ADMIN_EMAIL // You get a copy
  });
  
  // 4. Log delivery stats
  await logEmailStats(subscribers.length);
}
```

## Order of Operations

```
GitHub Actions Workflow Starts (10:00 AM)
    │
    ├─1. Generate Content (10:00-10:05)
    │   ├─ Scrape sources
    │   ├─ AI writes newsletter
    │   └─ AI creates image
    │
    ├─2. Update Repository (10:05-10:06)
    │   ├─ Create MDX file
    │   ├─ Git commit
    │   └─ Git push to main branch
    │
    ├─3. Website Updates (10:06-10:07)
    │   ├─ Vercel detects push
    │   ├─ Builds Next.js site
    │   └─ Deploys to production
    │
    ├─4. Send Emails (10:07-10:10)
    │   ├─ Fetch subscriber list
    │   ├─ Send via Resend API
    │   └─ Track delivery
    │
    └─5. Update Status (10:10-10:11)
        ├─ Update Linear task
        ├─ Send Slack notification
        └─ Log analytics
```

## Why This Order?

1. **Website First, Then Email**
   - Ensures links in emails work immediately
   - Prevents 404 errors for early openers
   - Allows preview on website before mass send

2. **Git as Source of Truth**
   - All content versioned in Git
   - Easy rollback if needed
   - Complete history of all newsletters

## File Structure After Generation

```
your-repo/
├── content/
│   └── newsletters/
│       ├── 2025-01-13.mdx
│       ├── 2025-01-20.mdx
│       └── 2025-01-27.mdx  ← New file added
├── public/
│   └── images/
│       └── newsletters/
│           └── 2025-01-27.png  ← Generated image
└── .github/
    └── workflows/
        └── newsletter-automation.yml
```

## Environment Variables in GitHub

Set these in your repo's Settings → Secrets:
```
AZURE_OPENAI_KEY
AZURE_OPENAI_ENDPOINT
SUPABASE_URL
SUPABASE_SERVICE_KEY
RESEND_API_KEY
STRIPE_SECRET_KEY
SLACK_WEBHOOK_URL
LINEAR_API_KEY
```

## Error Handling

If any step fails:
```yaml
- name: Error Notification
  if: failure()
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    curl -X POST $SLACK_WEBHOOK_URL \
      -H 'Content-Type: application/json' \
      -d '{"text":"🚨 Newsletter generation failed! Check GitHub Actions logs."}'
```

## Manual Intervention

You can manually trigger the workflow:
1. Go to Actions tab in GitHub
2. Select "Autonomous Newsletter Engine"
3. Click "Run workflow"
4. Select branch and run

## Monitoring the Process

### During Execution
- GitHub Actions UI shows real-time logs
- Each step shows success ✓ or failure ✗
- Total runtime ~10-15 minutes

### After Completion
- Check website for new newsletter
- Verify email in your inbox
- See Linear task marked as "Done"
- Check Slack for completion message

## Cost Considerations

### GitHub Actions (Free Tier)
- 2,000 minutes/month free
- Each run ~10 minutes
- 12 runs/month (3x/week) = 120 minutes used
- Still plenty of headroom!

### Vercel (Free Tier)
- Unlimited deployments
- 100GB bandwidth (more than enough)
- Automatic SSL

## Security Best Practices

1. **Never commit secrets**
   - All API keys in GitHub Secrets
   - Never in code or .env files

2. **Limited permissions**
   - Bot account with minimal access
   - Separate API keys for Actions

3. **Audit trail**
   - All commits tracked
   - Actions logs retained 90 days

## Troubleshooting

### Newsletter not appearing on website?
- Check GitHub Actions logs
- Verify Vercel deployment succeeded
- Check for git conflicts

### Emails not sending?
- Verify Resend API key
- Check subscriber list not empty
- Review Resend dashboard for errors

### Process seems stuck?
- GitHub Actions has 6-hour timeout
- Can cancel and re-run manually
- Check for API rate limits