# 🚀 Infinite Runway AI Newsletter

A fully autonomous AI-powered newsletter system that automatically generates, publishes, and distributes content without human intervention.

## 📁 Project Structure

```
infinite-runway-ai-newsletter/
├── frontend/              # Next.js Web Application
│   ├── app/              # Next.js App Router
│   ├── components/       # React Components
│   ├── lib/             # Frontend utilities
│   ├── data/            # Static content & blog posts
│   └── public/          # Static assets
│
├── backend/              # Automation & Services
│   ├── automation/      # Newsletter generation scripts
│   ├── services/        # External API integrations
│   ├── scripts/         # Setup & utility scripts
│   ├── docs/           # Technical documentation
│   └── types/          # TypeScript definitions
│
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies for all workspaces (recommended)
npm install

# This will automatically install dependencies for both frontend and backend
# due to the monorepo workspace configuration
```

### Development
```bash
# Start frontend development server
npm run dev

# Setup backend database
npm run backend:setup

# Test newsletter generation
npm run backend:test
```

## 📦 Workspaces

### Frontend (`/frontend`)
- **Technology**: Next.js 15 with App Router
- **Purpose**: Website, blog, and newsletter archive
- **Port**: 3000 (development)

### Backend (`/backend`)
- **Technology**: Node.js with TypeScript
- **Purpose**: Content generation, email automation, analytics
- **Services**: Azure OpenAI, Supabase, Resend, Stripe, Slack, Linear

## 🔧 Available Scripts

### Root Level Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start production frontend server
- `npm run clean` - Clean all node_modules and build artifacts

### Backend Operations
- `npm run backend:setup` - Setup database and validate environment
- `npm run backend:test` - Test newsletter generation
- `npm run backend:generate` - Generate newsletter content
- `npm run backend:send` - Send newsletter emails
- `npm run backend:validate` - Validate environment configuration
- `npm run backend:health` - Run system health check
- `npm run backend:analytics` - Generate weekly analytics report

### Workspace Commands
- `npm run <script> --workspace=frontend` - Run script in frontend workspace
- `npm run <script> --workspace=backend` - Run script in backend workspace

## 📚 Documentation

Detailed documentation is available in `/backend/docs/`:
- [Setup Guide](./backend/SETUP_GUIDE.md) - Complete setup instructions
- [Technical Architecture](./backend/docs/TECHNICAL_ARCHITECTURE.md)
- [Development Guide](./backend/docs/DEVELOPMENT_SETUP.md)

## 🔄 Automation

The system runs as a complete monorepo on Vercel with automated newsletter generation:

### Automated Schedule
- **Monday 10:00 AM UTC**: Weekly AI Digest
- **Wednesday 10:00 AM UTC**: AI Innovation Report  
- **Friday 10:00 AM UTC**: AI Business & Careers
- **Sunday 6:00 PM UTC**: Weekly Analytics Summary
- **Every 6 hours**: System Health Check

### Deployment
- **Frontend**: Deployed as Next.js app on Vercel
- **Backend**: Runs as serverless functions via Vercel cron jobs
- **GitHub Actions**: Handles newsletter generation and email sending
- **API Routes**: `/api/cron/*` endpoints for scheduled tasks

## 🛠️ Services Integration

- **Azure OpenAI**: Content and image generation
- **Supabase**: Database and authentication
- **Resend**: Email delivery
- **Stripe**: Payment processing
- **Slack**: Notifications
- **Linear**: Project management

## 📈 Monitoring

- Real-time Slack notifications
- Linear task automation
- System health checks
- Email analytics

## 📦 Monorepo Structure

This project is structured as a proper monorepo using npm workspaces:

```
infinite-runway-ai-newsletter/
├── package.json              # Root workspace configuration
├── vercel.json               # Vercel deployment config
├── tsconfig.json             # Root TypeScript config
├── .github/workflows/        # GitHub Actions (moved from backend)
├── frontend/                 # Next.js application
│   ├── app/api/cron/        # Serverless cron endpoints
│   └── ...                  # Next.js app structure
└── backend/                  # Automation scripts
    ├── automation/          # Newsletter generation
    ├── services/            # External integrations
    └── ...                  # Backend utilities
```

### Key Benefits
- ✅ **Single Repository**: All code in one place
- ✅ **Unified Dependencies**: Shared packages across workspaces
- ✅ **Vercel Integration**: Deploy entire project as one unit
- ✅ **GitHub Actions**: Automated workflows from root
- ✅ **Type Safety**: Shared TypeScript configuration
- ✅ **Serverless Functions**: Backend runs as Vercel functions

---

**Built with ❤️ using AI automation** 