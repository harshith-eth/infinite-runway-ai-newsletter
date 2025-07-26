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

interface GenerationOptions {
  type: NewsletterType;
  date?: Date;
  testMode?: boolean;
}

export class ContentGenerator {
  private readonly OUTPUT_DIR = path.join(process.cwd(), 'data', 'generated-newsletters');
  
  async generate(options: GenerationOptions): Promise<Newsletter> {
    const startTime = Date.now();
    const date = options.date || new Date();
    
    try {
      console.log(`🚀 Starting newsletter generation...`);
      
      // 1. Scrape content
      console.log('📰 Scraping content...');
      const scrapedContent = await scraperService.scrapeForNewsletter(options.type);
      console.log(`✅ Scraped ${scrapedContent.length} articles`);
      
      // 2. Generate content with AI - AI will give us the title!
      console.log('📝 Generating newsletter content with AI...');
      const contentRequest: ContentGenerationRequest = {
        type: options.type,
        date: date,
        scrapedContent: scrapedContent.slice(0, 20), // Top 20 articles
        sponsorInfo: undefined,
        companiesRaising: [],
        companiesHiring: [],
      };
      
      const result = await azureOpenAI.generateNewsletterContent(contentRequest);
      console.log('✅ AI content generated successfully');
      
      // 3. Extract title from AI result and create slug
      const title = this.extractTitleFromContent(result);
      const slug = this.generateSlugFromTitle(title);
      console.log(`📝 Generated title: "${title}"`);
      console.log(`🔗 Generated slug: "${slug}"`);
      
             // 4. Generate image based on title + content
       console.log('🎨 Generating newsletter image...');
       const imageUrl = await this.generateAndSaveImage(options.type, slug);
      console.log('✅ Image generated successfully');
      
      // 5. Create newsletter object
      const newsletter: Newsletter = {
        id: slug,
        title: title,
        slug: slug,
        description: this.generateDescriptionFromTitle(title),
        content: result,
        imageUrl: imageUrl,
        publishDate: date,
        type: options.type,
        authorName: 'Infinite Runway',
        authorImageUrl: '/images/authors/infinite-runway.png',
        sponsorInfo: undefined,
        companiesRaising: [],
        companiesHiring: [],
        status: 'draft' as NewsletterStatus,
        metadata: {
          scrapedArticles: scrapedContent.length,
          aiTokensUsed: this.calculateTokenUsage(result),
          generationTime: (Date.now() - startTime) / 1000,
          imageGenerationTime: 0,
          sources: [...new Set(scrapedContent.map(a => a.source))],
        },
      };
      
      // 6. Create blog post file
      console.log('📄 Creating blog post file...');
      await this.createBlogPostFile(newsletter);
      console.log('✅ Blog post file created successfully');
      
      console.log(`🎉 Newsletter generated successfully in ${(Date.now() - startTime) / 1000} seconds`);
      console.log(`📍 Check your Essays section at /essays to see: "${title}"`);
      
      return newsletter;
    } catch (error) {
      console.error('❌ Newsletter generation failed:', error);
      throw error;
    }
  }
  
  private generateSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  
  private extractTitleFromContent(content: string): string {
    // Try to extract title from HTML h1 tag
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].replace(/<[^>]*>/g, '').trim();
    }
    
    // Try to extract title from first line if it looks like a title
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/<[^>]*>/g, '').trim();
      if (firstLine.length > 10 && firstLine.length < 100) {
        return firstLine;
      }
    }
    
    // Fallback to generating based on date
    const today = new Date();
    return `AI Weekly Digest - ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }
  
  private generateDescriptionFromTitle(title: string): string {
    if (title.toLowerCase().includes('weekly')) {
      return 'Your weekly roundup of AI news, funding, and industry insights';
    }
    if (title.toLowerCase().includes('innovation')) {
      return 'The latest AI tools, research, and technical breakthroughs';
    }
    if (title.toLowerCase().includes('business') || title.toLowerCase().includes('career')) {
      return 'AI job opportunities, business applications, and career insights';
    }
    return 'Latest insights and updates from the AI industry';
  }
  
  // These methods are no longer used since we extract title from AI content
  // Keeping them for backward compatibility
  private getNewsletterTitle(type: NewsletterType, date: Date): string {
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
      const imageUrl = await azureOpenAI.generateNewsletterImage(topic, type);
      
      // Download and save the image
      const imagePath = await this.downloadAndSaveImage(imageUrl, slug);
      
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
  
  private async downloadAndSaveImage(url: string, filename: string): Promise<string> {
    try {
      const axios = (await import('axios')).default;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      
      const imagePath = path.join(process.cwd(), 'public', 'images', 'newsletters', `${filename}.png`);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(imagePath), { recursive: true });
      
      // Save image
      await fs.writeFile(imagePath, response.data);
      
      return imagePath;
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }
  
  private async createBlogPostFile(newsletter: Newsletter): Promise<void> {
    const blogPost: BlogPost = {
      title: newsletter.title,
      description: newsletter.description,
      imageUrl: newsletter.imageUrl,
      slug: newsletter.slug,
      authorName: newsletter.authorName,
      authorImageUrl: newsletter.authorImageUrl,
      publishDate: newsletter.publishDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      content: newsletter.content,
      sponsorInfo: newsletter.sponsorInfo ? {
        name: newsletter.sponsorInfo.name,
        logo: newsletter.sponsorInfo.logo,
        link: newsletter.sponsorInfo.link,
        description: newsletter.sponsorInfo.description,
        ctaText: newsletter.sponsorInfo.ctaText,
        ctaLink: newsletter.sponsorInfo.ctaLink,
      } : undefined,
    };
    
    // Add companies raising and hiring sections to content
    if (newsletter.companiesRaising && newsletter.companiesRaising.length > 0) {
      blogPost.content += this.generateCompaniesRaisingHTML(newsletter.companiesRaising);
    }
    
    if (newsletter.companiesHiring && newsletter.companiesHiring.length > 0) {
      blogPost.content += this.generateCompaniesHiringHTML(newsletter.companiesHiring);
    }
    
    // Create TypeScript file content
    const fileContent = `import { BlogPost } from '@/lib/blog-types';

export const ${this.toCamelCase(newsletter.slug)}: BlogPost = ${JSON.stringify(blogPost, null, 2)};
`;
    
    // Ensure directory exists
    await fs.mkdir(this.OUTPUT_DIR, { recursive: true });
    
    // Write file
    const filePath = path.join(this.OUTPUT_DIR, `${newsletter.slug}.ts`);
    await fs.writeFile(filePath, fileContent);
    
    // Update index file
    await this.updateIndexFile(newsletter.slug);
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
        const regex = /export const generatedNewsletters: BlogPost\[\] = \[([\s\S]*?)\];/;
        content = content.replace(regex, (match, existing) => {
          const items = existing.trim().split(',').map((s: string) => s.trim()).filter(Boolean);
          if (!items.includes(exportName)) {
            items.unshift(exportName); // Add new newsletter at beginning
          }
          return `export const generatedNewsletters: BlogPost[] = [${items.join(', ')}];`;
        });
      }
      
      await fs.writeFile(indexPath, content);
    } catch (error) {
      console.error('Error updating index file:', error);
    }
  }
  
  private toCamelCase(str: string): string {
    return str
      .split('-')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }
  
  private calculateTokenUsage(content: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(content.length / 4);
  }
  
  private async notifyStart(type: NewsletterType, date: Date): Promise<void> {
    // Temporarily disabled - external service not configured
    console.log(`📢 Starting generation of ${type} newsletter for ${date.toLocaleDateString()}`);
  }
  
  private async notifyCompletion(newsletter: Newsletter, duration: number): Promise<void> {
    // Temporarily disabled - external service not configured
    console.log(`🎉 Newsletter completed: ${newsletter.title} (${duration / 1000}s)`);
  }
  
  private async notifyFailure(type: NewsletterType, error: any): Promise<void> {
    // Temporarily disabled - external service not configured
    console.log(`❌ Newsletter generation failed: ${type} - ${error.message || error}`);
  }
}

// Export singleton instance
export const contentGenerator = new ContentGenerator();

// CLI execution
if (require.main === module) {
  const type = process.argv[2] as NewsletterType || 'weekly-digest';
  const testMode = process.argv.includes('--test');
  
  contentGenerator.generate({ type, testMode })
    .then(newsletter => {
      console.log(`✅ Newsletter generated successfully: ${newsletter.title}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Newsletter generation failed:', error);
      process.exit(1);
    });
}