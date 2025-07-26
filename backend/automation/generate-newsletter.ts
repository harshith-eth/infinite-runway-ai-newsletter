import { 
  Newsletter, 
  NewsletterType, 
  NewsletterStatus,
  ContentGenerationRequest,
  NotificationEvent
} from '@/lib/types/newsletter.types';
import { azureOpenAI } from '@/lib/services/azure-openai';
import { supabase } from '@/lib/services/supabase';
import { scraperService } from '@/lib/services/scraper';
import { slackService } from '@/lib/services/slack';
import { linearService } from '@/lib/services/linear';
import { BlogPost } from '@/lib/types/blog.types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

interface GenerationOptions {
  type: NewsletterType;
  date?: Date;
  testMode?: boolean;
}

export class NewsletterGenerator {
  private readonly OUTPUT_DIR = path.join(process.cwd(), '..', 'frontend', 'app', 'essays');
  
  async generate(options: GenerationOptions): Promise<Newsletter> {
    const startTime = Date.now();
    const date = options.date || new Date();
    
    try {
      // 1. Notify start (skip for demo)
      console.log('Starting newsletter generation...');
      
      // 2. Create Linear task (skip for demo)
      console.log('Linear task creation skipped for demo');
      const linearTaskId = null;
      
      // 3. Scrape content
      console.log('Scraping content...');
      const scrapedContent = await scraperService.scrapeForNewsletter(options.type);
      console.log(`Scraped ${scrapedContent.length} articles`);
      
      // 4. Generate dynamic slug based on content
      const slug = this.generateSlug(options.type, date, scrapedContent);
      console.log(`Generated slug: ${slug}`);
      
      // 4. Get sponsor information (use mock data for demo)
      console.log('Using mock sponsor information for demo...');
      const sponsors = {
        mainSponsor: {
          id: "demo-sponsor-1",
          name: "OpenAI",
          logo: "/images/logos/startups/OpenAI.svg",
          link: "https://openai.com",
          description: "OpenAI is building safe AGI that benefits all of humanity. Join us in pushing the boundaries of what's possible with AI.",
          ctaText: "Explore OpenAI",
          ctaLink: "https://openai.com",
          startDate: date,
          endDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days later
        },
        companiesRaising: [],
        companiesHiring: []
      };
      
      // 5. Generate newsletter content with Azure OpenAI
      console.log('Generating newsletter content with Azure OpenAI...');
      const contentRequest: ContentGenerationRequest = {
        type: options.type,
        date: date,
        scrapedContent: scrapedContent.slice(0, 20), // Top 20 articles
        sponsorInfo: sponsors.mainSponsor,
        companiesRaising: sponsors.companiesRaising,
        companiesHiring: sponsors.companiesHiring,
      };
      
      const content = await azureOpenAI.generateNewsletterContent(contentRequest);
      
      // 6. Generate image with correct slug
      console.log('Generating newsletter image...');
      const imageUrl = await this.generateAndSaveImage(options.type, slug);
      
      // 7. Create newsletter object
      const newsletter: Newsletter = {
        id: slug,
        title: this.getNewsletterTitle(options.type, date, scrapedContent),
        slug: slug,
        description: this.getNewsletterDescription(options.type),
        content: content,
        imageUrl: imageUrl,
        publishDate: date,
        type: options.type,
        authorName: 'Infinite Runway',
        authorImageUrl: '/images/authors/infinite-runway.png',
        sponsorInfo: sponsors.mainSponsor,
        companiesRaising: sponsors.companiesRaising,
        companiesHiring: sponsors.companiesHiring,
        status: 'draft' as NewsletterStatus,
        metadata: {
          scrapedArticles: scrapedContent.length,
          aiTokensUsed: 0, // TODO: Track actual token usage
          generationTime: (Date.now() - startTime) / 1000,
          imageGenerationTime: 0, // Set separately
          sources: [...new Set(scrapedContent.map(a => a.source))],
        },
      };
      
      // 8. Save to database (skip for demo)
      console.log('Database save skipped for demo');
      
      // 9. Generate files for essays system
      console.log('Creating newsletter files in essays structure...');
      await this.createBlogPostFile(newsletter);
      
      // 10. Mark articles as used (skip for demo)
      console.log('Article marking skipped for demo');
      
      // 11. Update Linear task (skip for demo)
      console.log('Linear task update skipped for demo');
      
      // 12. Notify completion (skip for demo)
      console.log('Slack notification skipped for demo');
      
      return newsletter;
    } catch (error) {
      console.error('Newsletter generation failed:', error);
      
      // Notify failure (skip for demo)
      console.log('Failure notification skipped for demo');
      
      throw error;
    }
  }
  
  private generateSlug(type: NewsletterType, date: Date, scrapedContent?: any[]): string {
    if (scrapedContent && scrapedContent.length > 0) {
      // Extract key topics from top articles to create dynamic slug
      const topArticles = scrapedContent.slice(0, 5);
      const keywords = this.extractKeywords(topArticles);
      const dynamicSlug = keywords.slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
      return dynamicSlug || `ai-news-${date.toISOString().split('T')[0]}`;
    }
    const dateStr = date.toISOString().split('T')[0];
    return `${type}-${dateStr}`;
  }

  private extractKeywords(articles: any[]): string[] {
    // AI and tech-specific topic categorization (code-based, not prompt-based)
    const topicCategories = {
      'openai-gpt': ['openai', 'gpt', 'chatgpt', 'dall-e', 'sora', 'sam-altman'],
      'google-ai': ['google', 'gemini', 'deepmind', 'bard', 'tensorflow'],
      'meta-ai': ['meta', 'facebook', 'llama', 'pytorch', 'zuckerberg'],
      'microsoft-ai': ['microsoft', 'copilot', 'azure', 'bing'],
      'anthropic': ['anthropic', 'claude'],
      'ai-funding': ['funding', 'investment', 'raised', 'valuation', 'series', 'billion'],
      'ai-models': ['model', 'llm', 'transformer', 'neural', 'training'],
      'computer-vision': ['vision', 'image', 'visual', 'cv', 'detection'],
      'ai-tools': ['tool', 'platform', 'framework', 'api', 'sdk'],
      'autonomous-ai': ['autonomous', 'self-driving', 'robotics', 'drone'],
      'ai-healthcare': ['healthcare', 'medical', 'diagnosis', 'drug', 'pharma'],
      'enterprise-ai': ['enterprise', 'business', 'corporate', 'saas'],
      'ai-safety': ['safety', 'alignment', 'ethics', 'responsible'],
      'quantum-ai': ['quantum', 'computing', 'qubits']
    };

    const topicScores: { [key: string]: number } = {};
    
    // Score articles based on topic relevance
    articles.forEach((article: any) => {
      const text = (article.title + ' ' + (article.content || '')).toLowerCase();
      
      Object.entries(topicCategories).forEach(([topic, keywords]) => {
        const matches = keywords.filter(keyword => text.includes(keyword)).length;
        if (matches > 0) {
          topicScores[topic] = (topicScores[topic] || 0) + matches;
        }
      });
    });

    // Return top 2-3 topics, clean up names
    const topTopics = Object.entries(topicScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([topic]) => topic.replace(/-ai$/, '').replace(/-/g, '-'));
    
    return topTopics.length > 0 ? topTopics : ['ai-weekly'];
  }
  
  private getNewsletterTitle(type: NewsletterType, date: Date, scrapedContent?: any[]): string {
    if (scrapedContent && scrapedContent.length > 0) {
      // Generate dynamic title based on top articles
      const topArticles = scrapedContent.slice(0, 3);
      const keywords = this.extractKeywords(topArticles);
      
      if (keywords.length > 0) {
        const dynamicTitle = keywords.slice(0, 2).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' & ');
        
        const dateStr = date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric' 
        });
        
        return `${dynamicTitle} Weekly - ${dateStr}`;
      }
    }
    
    const titles = {
      'weekly-digest': 'Weekly AI Digest',
      'innovation-report': 'AI Innovation Report',
      'business-careers': 'AI Business & Careers',
    };
    
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${titles[type]} - ${dateStr}`;
  }
  
  private getNewsletterDescription(type: NewsletterType): string {
    const descriptions = {
      'weekly-digest': 'Your weekly roundup of AI news, funding, and industry insights',
      'innovation-report': 'The latest AI tools, research, and technical breakthroughs',
      'business-careers': 'AI job opportunities, business applications, and career insights',
    };
    
    return descriptions[type];
  }
  
  private async generateAndSaveImage(type: NewsletterType, slug: string): Promise<string> {
    const imageStartTime = Date.now();
    
    try {
      // Get a topic from the newsletter title
      const topic = this.getImageTopic(type);
      
      // Generate image with Azure OpenAI
      const imageData = await azureOpenAI.generateNewsletterImage(topic, type);
      
      // Save the image (either base64 or URL)
      const imagePath = await this.downloadAndSaveImage(imageData, slug);
      
      console.log(`Image generated in ${(Date.now() - imageStartTime) / 1000} seconds`);
      
      // Return the public path
      return `/images/newsletters/${slug}.png`;
    } catch (error) {
      console.error('Image generation failed:', error);
      // Return a default image on failure
      return '/images/thumbnail.svg';
    }
  }
  
  private getImageTopic(type: NewsletterType): string {
    const topics = {
      'weekly-digest': 'AI industry landscape and business growth',
      'innovation-report': 'cutting-edge AI technology and innovation',
      'business-careers': 'AI careers and professional development',
    };
    
    return topics[type];
  }
  
  private async downloadAndSaveImage(imageData: string, filename: string): Promise<string> {
    try {
      const imagePath = path.join(process.cwd(), '..', 'frontend', 'public', 'images', 'newsletters', `${filename}.png`);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(imagePath), { recursive: true });
      
      if (imageData.startsWith('data:image/png;base64,')) {
        // Handle base64 data
        const base64Data = imageData.replace('data:image/png;base64,', '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(imagePath, buffer);
        console.log(`✅ Saved base64 image: ${filename}.png`);
      } else {
        // Handle URL data
        const axios = (await import('axios')).default;
        const response = await axios.get(imageData, { responseType: 'arraybuffer' });
        await fs.writeFile(imagePath, response.data);
        console.log(`✅ Downloaded image from URL: ${filename}.png`);
      }
      
      return imagePath;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }
  
  private async createBlogPostFile(newsletter: Newsletter): Promise<void> {
    // Get current date for folder structure
    const date = newsletter.publishDate;
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const weekNumber = this.getWeekNumber(date);
    
    // Create newsletter directory structure: /essays/2025/august/week-1/newsletter-title/
    const newsletterDir = path.join(
      this.OUTPUT_DIR, 
      year.toString(), 
      month, 
      `week-${weekNumber}`, 
      newsletter.slug
    );
    
    // Ensure directory exists
    await fs.mkdir(newsletterDir, { recursive: true });
    
    // Create metadata.json
    const metadata = {
      title: newsletter.title,
      description: newsletter.description,
      slug: newsletter.slug,
      author: {
        name: "Savannah Pierce",
        imageUrl: "/images/authors/savannah-pierce.png"
      },
      publishDate: newsletter.publishDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      imageUrl: `/images/newsletters/${newsletter.slug}.png`,
      sponsor: newsletter.sponsorInfo ? {
        name: newsletter.sponsorInfo.name,
        logo: newsletter.sponsorInfo.logo,
        link: newsletter.sponsorInfo.link,
        description: newsletter.sponsorInfo.description,
        ctaText: newsletter.sponsorInfo.ctaText,
        ctaLink: newsletter.sponsorInfo.ctaLink,
      } : undefined,
      type: "newsletter",
      week: weekNumber,
      month: month,
      year: year
    };
    
    const metadataPath = path.join(newsletterDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Create page.mdx with content
    const mdxContent = newsletter.content;
    const mdxPath = path.join(newsletterDir, 'page.mdx');
    await fs.writeFile(mdxPath, mdxContent);
    
    // Copy the Azure OpenAI generated image (PNG format)
    const generatedImageSource = path.join(process.cwd(), '..', 'frontend', 'public', 'images', 'newsletters', `${newsletter.slug}.png`);
    const imageDest = path.join(newsletterDir, `${newsletter.slug}.png`);
    
    try {
      await fs.copyFile(generatedImageSource, imageDest);
      console.log(`✅ Copied generated image: ${newsletter.slug}.png`);
    } catch (error) {
      console.warn('Could not copy generated image, creating placeholder');
      // Create a simple SVG placeholder if the Azure image doesn't exist
      const placeholderSvg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#1a1a2e"/>
        <text x="300" y="200" text-anchor="middle" font-family="Arial" font-size="24" fill="white">${newsletter.title}</text>
      </svg>`;
      await fs.writeFile(path.join(newsletterDir, 'thumbnail.svg'), placeholderSvg);
    }
    
    console.log(`✅ Newsletter files created in: ${newsletterDir}`);
  }
  
  private getWeekNumber(date: Date): number {
    // Get the week number of the month (1-5)
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const dayOfWeek = firstDay.getDay();
    
    return Math.ceil((dayOfMonth + dayOfWeek) / 7);
  }

  private generateMockContent(type: NewsletterType, date: Date): string {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return `# Welcome to ${this.getNewsletterTitle(type, date)}

**Happy ${date.toLocaleDateString('en-US', { weekday: 'long' })}!**

This week in AI has been absolutely incredible. Here's what caught our attention.

## 🚀 This Week's Highlights

### Major AI Breakthrough
A new foundation model has been released that promises to revolutionize how we think about artificial intelligence capabilities.

### Industry Movement  
Several major tech companies announced significant AI investments, totaling over $2B in funding rounds.

### Research Development
Breakthrough research in multimodal AI systems shows promising results for real-world applications.

## 💡 Key Insights

The AI landscape continues to evolve rapidly, with new developments emerging daily. Here are the most important trends to watch:

- **Enterprise Adoption**: Companies are increasingly integrating AI into core business processes
- **Regulatory Framework**: New AI governance policies are being developed globally  
- **Technical Innovation**: Advances in model efficiency and capabilities

## 📈 What This Means

For businesses and developers, these developments signal exciting opportunities ahead. The convergence of multiple AI technologies is creating unprecedented possibilities.

---

*Generated on ${dateStr}*`;
  }
  
  private generateCompaniesRaisingHTML(companies: any[]): string {
    const items = companies.map(company => `
    <div style="border-bottom: 1px solid #e5e7eb; padding: 1rem 0;">
      <h3 style="margin: 0 0 0.5rem 0;">${company.name}</h3>
      <p style="margin: 0.5rem 0;"><strong>${company.round}</strong> - ${company.amount}</p>
      <p style="margin: 0.5rem 0; color: #6b7280;">Investors: ${company.investors.join(', ')}</p>
      <p style="margin: 0.5rem 0;">${company.description}</p>
      <a href="${company.link}" style="color: #2563eb;">Learn more →</a>
    </div>
    `).join('');
    
    return `
    <h2 style="margin-top: 3rem;">💰 Companies Raising</h2>
    <div style="background-color: #f9fafb; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      ${items}
    </div>`;
  }
  
  private generateCompaniesHiringHTML(companies: any[]): string {
    const items = companies.map(company => `
    <div style="border-bottom: 1px solid #e5e7eb; padding: 1rem 0;">
      <h3 style="margin: 0 0 0.5rem 0;">${company.name}</h3>
      <p style="margin: 0.5rem 0;"><strong>Open Roles:</strong> ${company.roles.join(', ')}</p>
      <p style="margin: 0.5rem 0;"><strong>Location:</strong> ${company.location}</p>
      ${company.stack ? `<p style="margin: 0.5rem 0;"><strong>Tech Stack:</strong> ${company.stack}</p>` : ''}
      <p style="margin: 0.5rem 0;">${company.description}</p>
      <a href="${company.link}" style="color: #2563eb;">View jobs →</a>
    </div>
    `).join('');
    
    return `
    <h2 style="margin-top: 3rem;">👥 Companies Hiring</h2>
    <div style="background-color: #f9fafb; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      ${items}
    </div>`;
  }
  
  private async updateIndexFile(newSlug: string): Promise<void> {
    const indexPath = path.join(this.OUTPUT_DIR, 'index.ts');
    
    try {
      // Read existing index or create new
      let content = '';
      try {
        content = await fs.readFile(indexPath, 'utf-8');
      } catch {
        content = "import { BlogPost } from '@/lib/blog-types';\n\n";
      }
      
      // Add import for new newsletter
      const importStatement = `import { ${this.toCamelCase(newSlug)} } from './${newSlug}';\n`;
      
      if (!content.includes(importStatement)) {
        // Find the last import statement
        const lastImportIndex = content.lastIndexOf('import');
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        
        if (lastImportIndex >= 0) {
          content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
        } else {
          content = importStatement + content;
        }
      }
      
      // Update exports array
      const exportName = this.toCamelCase(newSlug);
      if (!content.includes(`export const generatedNewsletters`)) {
        content += `\nexport const generatedNewsletters: BlogPost[] = [${exportName}];\n`;
      } else {
        // Add to existing array
        content = content.replace(
          /export const generatedNewsletters: BlogPost\[\] = \[(.*?)\];/s,
          (match, existing) => {
            const items = existing.trim().split(',').map((s: string) => s.trim()).filter(Boolean);
            if (!items.includes(exportName)) {
              items.unshift(exportName); // Add new newsletter at beginning
            }
            return `export const generatedNewsletters: BlogPost[] = [${items.join(', ')}];`;
          }
        );
      }
      
      await fs.writeFile(indexPath, content);
    } catch (error) {
      console.error('Error updating index file:', error);
    }
  }
  
  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
  
  private async notifyStart(type: NewsletterType, date: Date): Promise<void> {
    const event: NotificationEvent = {
      type: 'newsletter_generation_started',
      level: 'info',
      title: 'Newsletter Generation Started',
      message: `Starting generation of ${type} newsletter for ${date.toLocaleDateString()}`,
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  private async notifyCompletion(newsletter: Newsletter, duration: number): Promise<void> {
    const event: NotificationEvent = {
      type: 'newsletter_generation_completed',
      level: 'success',
      title: 'Newsletter Generated Successfully',
      message: `${newsletter.title} has been generated`,
      data: {
        newsletter: newsletter,
        duration: duration / 1000,
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  private async notifyFailure(type: NewsletterType, error: any): Promise<void> {
    const event: NotificationEvent = {
      type: 'newsletter_generation_failed',
      level: 'critical',
      title: 'Newsletter Generation Failed',
      message: `Failed to generate ${type} newsletter`,
      data: {
        error: error.message || error,
        stack: error.stack,
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
}

// Export singleton instance
export const newsletterGenerator = new NewsletterGenerator();

// CLI execution
if (require.main === module) {
  const type = process.argv[2] as NewsletterType || 'weekly-digest';
  const testMode = process.argv.includes('--test');
  
  newsletterGenerator.generate({ type, testMode })
    .then(newsletter => {
      console.log(`✅ Newsletter generated successfully: ${newsletter.title}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Newsletter generation failed:', error);
      process.exit(1);
    });
}