import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { ScrapedArticle, NewsletterType } from '@/lib/types/newsletter.types';
import { supabase } from './supabase';

interface ScraperSource {
  name: string;
  url: string;
  type: 'api' | 'rss' | 'html';
  selector?: string; // For HTML scraping
  relevanceKeywords?: string[];
  newsletterTypes?: NewsletterType[];
}

interface HackerNewsItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  time: number;
  by: string;
  score: number;
  descendants?: number;
}

export class ScraperService {
  private rssParser: Parser;
  private sources: ScraperSource[];
  
  constructor() {
    this.rssParser = new Parser({
      customFields: {
        item: ['pubDate', 'creator', 'content:encoded', 'category'],
      },
    });
    
    this.sources = [
      // Monday - Weekly Digest sources
      {
        name: 'Hacker News',
        url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
        type: 'api',
        relevanceKeywords: ['AI', 'artificial intelligence', 'machine learning', 'GPT', 'neural', 'startup', 'funding'],
        newsletterTypes: ['weekly-digest'],
      },
      {
        name: 'TechCrunch AI',
        url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        type: 'rss',
        newsletterTypes: ['weekly-digest', 'business-careers'],
      },
      {
        name: 'VentureBeat AI',
        url: 'https://venturebeat.com/category/ai/feed/',
        type: 'rss',
        newsletterTypes: ['weekly-digest', 'innovation-report'],
      },
      
      // Wednesday - Innovation Report sources
      {
        name: 'GitHub Trending',
        url: 'https://github.com/trending',
        type: 'html',
        selector: '.Box-row',
        relevanceKeywords: ['AI', 'ML', 'neural', 'transformer', 'diffusion', 'LLM'],
        newsletterTypes: ['innovation-report'],
      },
      {
        name: 'Product Hunt AI',
        url: 'https://www.producthunt.com/topics/artificial-intelligence/feed',
        type: 'rss',
        newsletterTypes: ['innovation-report'],
      },
      {
        name: 'Papers With Code',
        url: 'https://paperswithcode.com/feed',
        type: 'rss',
        newsletterTypes: ['innovation-report'],
      },
      
      // Friday - Business & Careers sources
      {
        name: 'AI Jobs',
        url: 'https://ai-jobs.net/feed/',
        type: 'rss',
        newsletterTypes: ['business-careers'],
      },
      {
        name: 'The Information',
        url: 'https://www.theinformation.com/feed',
        type: 'rss',
        newsletterTypes: ['business-careers', 'weekly-digest'],
      },
    ];
  }
  
  async scrapeForNewsletter(type: NewsletterType): Promise<ScrapedArticle[]> {
    const relevantSources = this.sources.filter(
      source => !source.newsletterTypes || source.newsletterTypes.includes(type)
    );
    
    const allArticles: ScrapedArticle[] = [];
    
    for (const source of relevantSources) {
      try {
        const articles = await this.scrapeSource(source);
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }
    
    // Score and sort articles by relevance
    const scoredArticles = this.scoreArticles(allArticles, type);
    
    // Save to database
    await this.saveArticles(scoredArticles);
    
    return scoredArticles;
  }
  
  private async scrapeSource(source: ScraperSource): Promise<ScrapedArticle[]> {
    switch (source.type) {
      case 'api':
        return this.scrapeAPI(source);
      case 'rss':
        return this.scrapeRSS(source);
      case 'html':
        return this.scrapeHTML(source);
      default:
        throw new Error(`Unknown source type: ${source.type}`);
    }
  }
  
  private async scrapeAPI(source: ScraperSource): Promise<ScrapedArticle[]> {
    if (source.name === 'Hacker News') {
      return this.scrapeHackerNews();
    }
    
    throw new Error(`API scraper not implemented for: ${source.name}`);
  }
  
  private async scrapeHackerNews(): Promise<ScrapedArticle[]> {
    try {
      // Get top story IDs
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = response.data.slice(0, 30); // Top 30 stories
      
      // Fetch story details in parallel
      const storyPromises = storyIds.map((id: number) =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      );
      
      const stories = await Promise.all(storyPromises);
      
      return stories
        .map(story => story.data)
        .filter(item => item && item.title && (item.url || item.text))
        .map(item => this.hackerNewsToArticle(item));
    } catch (error) {
      console.error('Error scraping Hacker News:', error);
      return [];
    }
  }
  
  private hackerNewsToArticle(item: HackerNewsItem): ScrapedArticle {
    const content = item.text || `${item.title}. Posted by ${item.by} with ${item.score} points and ${item.descendants || 0} comments.`;
    
    return {
      id: `hn-${item.id}`,
      title: item.title,
      content: content,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      source: 'Hacker News',
      publishedAt: new Date(item.time * 1000),
      relevanceScore: 0, // Will be calculated later
      tags: this.extractTags(item.title + ' ' + content),
      used: false,
    };
  }
  
  private async scrapeRSS(source: ScraperSource): Promise<ScrapedArticle[]> {
    try {
      const feed = await this.rssParser.parseURL(source.url);
      
      return feed.items
        .filter(item => item.title && item.link)
        .slice(0, 20) // Limit to 20 items per feed
        .map(item => ({
          id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${item.guid || item.link}`,
          title: item.title!,
          content: this.cleanContent(item.contentSnippet || item.content || item.summary || ''),
          url: item.link!,
          source: source.name,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          relevanceScore: 0,
          tags: this.extractTags(item.title + ' ' + (item.categories?.join(' ') || '')),
          used: false,
        }));
    } catch (error) {
      console.error(`Error scraping RSS feed ${source.url}:`, error);
      return [];
    }
  }
  
  private async scrapeHTML(source: ScraperSource): Promise<ScrapedArticle[]> {
    try {
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)',
        },
      });
      
      const $ = cheerio.load(response.data);
      const articles: ScrapedArticle[] = [];
      
      if (source.name === 'GitHub Trending') {
        $('.Box-row').each((i, elem) => {
          if (i >= 10) return; // Limit to top 10
          
          const titleElem = $(elem).find('h2 a');
          const title = titleElem.text().trim();
          const url = 'https://github.com' + titleElem.attr('href');
          const description = $(elem).find('p').text().trim();
          const stars = $(elem).find('.octicon-star').parent().text().trim();
          
          if (title) {
            articles.push({
              id: `github-${title.replace(/[^\w-]/g, '-')}`,
              title: title,
              content: `${description}. Stars: ${stars}`,
              url: url,
              source: 'GitHub Trending',
              publishedAt: new Date(),
              relevanceScore: 0,
              tags: this.extractTags(title + ' ' + description),
              used: false,
            });
          }
        });
      }
      
      return articles;
    } catch (error) {
      console.error(`Error scraping HTML ${source.url}:`, error);
      return [];
    }
  }
  
  private cleanContent(content: string): string {
    // Remove HTML tags
    const text = content.replace(/<[^>]+>/g, '');
    // Decode HTML entities
    const decoded = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    // Trim and limit length
    return decoded.trim().slice(0, 1000);
  }
  
  private extractTags(text: string): string[] {
    const commonTags = [
      'ai', 'ml', 'machine-learning', 'deep-learning', 'neural-network',
      'gpt', 'llm', 'transformer', 'diffusion', 'computer-vision',
      'nlp', 'robotics', 'automation', 'data-science', 'startup',
      'funding', 'investment', 'tech', 'innovation', 'research',
    ];
    
    const lowerText = text.toLowerCase();
    const foundTags = commonTags.filter(tag => 
      lowerText.includes(tag) || lowerText.includes(tag.replace('-', ' '))
    );
    
    return [...new Set(foundTags)];
  }
  
  private scoreArticles(articles: ScrapedArticle[], type: NewsletterType): ScrapedArticle[] {
    const typeWeights = {
      'weekly-digest': {
        keywords: ['funding', 'investment', 'startup', 'acquisition', 'ipo', 'revenue', 'valuation'],
        multiplier: 1.5,
      },
      'innovation-report': {
        keywords: ['open-source', 'github', 'api', 'sdk', 'framework', 'library', 'tool', 'release'],
        multiplier: 1.5,
      },
      'business-careers': {
        keywords: ['hiring', 'job', 'career', 'salary', 'remote', 'team', 'culture', 'growth'],
        multiplier: 1.5,
      },
    };
    
    const weights = typeWeights[type];
    
    return articles.map(article => {
      let score = 0;
      
      // Base score from source reliability
      const sourceScores: Record<string, number> = {
        'Hacker News': 8,
        'TechCrunch AI': 9,
        'VentureBeat AI': 8,
        'GitHub Trending': 7,
        'Product Hunt AI': 7,
        'Papers With Code': 9,
        'The Information': 9,
        'AI Jobs': 6,
      };
      
      score += sourceScores[article.source] || 5;
      
      // Recency score (newer is better)
      const ageInHours = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60);
      if (ageInHours < 24) score += 5;
      else if (ageInHours < 48) score += 3;
      else if (ageInHours < 168) score += 1; // Less than a week
      
      // Keyword relevance
      const text = (article.title + ' ' + article.content).toLowerCase();
      const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'llm', 'neural'];
      const keywordMatches = aiKeywords.filter(kw => text.includes(kw)).length;
      score += keywordMatches * 2;
      
      // Type-specific keywords
      const typeKeywordMatches = weights.keywords.filter(kw => text.includes(kw)).length;
      score += typeKeywordMatches * weights.multiplier;
      
      // Tag score
      score += article.tags.length;
      
      return {
        ...article,
        relevanceScore: Math.min(score, 100), // Cap at 100
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  private async saveArticles(articles: ScrapedArticle[]): Promise<void> {
    try {
      // Check for duplicates
      const uniqueArticles = [];
      for (const article of articles) {
        const exists = await supabase.getNewsletterBySlug(article.url);
        if (!exists) {
          uniqueArticles.push(article);
        }
      }
      
      if (uniqueArticles.length > 0) {
        await supabase.saveScrapedArticles(uniqueArticles);
      }
    } catch (error) {
      console.error('Error saving scraped articles:', error);
    }
  }
  
  async getUnusedArticles(type: NewsletterType, limit: number = 50): Promise<ScrapedArticle[]> {
    try {
      const articles = await supabase.getUnusedArticles(limit * 2); // Get more to filter
      
      // Re-score for the specific newsletter type
      const scored = this.scoreArticles(articles, type);
      
      return scored.slice(0, limit);
    } catch (error) {
      console.error('Error getting unused articles:', error);
      return [];
    }
  }
  
  async markArticlesAsUsed(articleIds: string[]): Promise<void> {
    try {
      await supabase.markArticlesAsUsed(articleIds);
    } catch (error) {
      console.error('Error marking articles as used:', error);
    }
  }
  
  async testScraping(): Promise<{ source: string; count: number; sample?: ScrapedArticle }[]> {
    const results = [];
    
    for (const source of this.sources.slice(0, 3)) { // Test first 3 sources
      try {
        const articles = await this.scrapeSource(source);
        results.push({
          source: source.name,
          count: articles.length,
          sample: articles[0],
        });
      } catch (error) {
        results.push({
          source: source.name,
          count: 0,
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const scraperService = new ScraperService();