import { readFileSync, writeFileSync } from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

// Load environment variables manually
const envFile = readFileSync('.env.local', 'utf8');
const envVars = envFile.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
envVars.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  relevanceScore: number;
  tags: string[];
  used: boolean;
}

async function scrapeContentStandalone(): Promise<ScrapedArticle[]> {
  const rssParser = new Parser();
  const allArticles: ScrapedArticle[] = [];
  
  try {
    // 1. Hacker News
    console.log('   📡 Scraping Hacker News...');
    const hnResponse = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = hnResponse.data.slice(0, 5);
    
    for (const id of storyIds) {
      try {
        const storyResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const story = storyResponse.data;
        
        if (story && story.title) {
          allArticles.push({
            id: `hn-${id}`,
            title: story.title,
            content: story.text || `Posted by ${story.by} with ${story.score} points`,
            url: story.url || `https://news.ycombinator.com/item?id=${id}`,
            source: 'Hacker News',
            publishedAt: new Date(story.time * 1000),
            relevanceScore: story.score || 0,
            tags: ['tech', 'news'],
            used: false,
          });
        }
      } catch (error) {
        console.log(`     ⚠️ Failed to fetch story ${id}`);
      }
    }
    
    // 2. TechCrunch AI
    console.log('   📡 Scraping TechCrunch AI...');
    const tcFeed = await rssParser.parseURL('https://techcrunch.com/category/artificial-intelligence/feed/');
    
    tcFeed.items.slice(0, 5).forEach((item, index) => {
      if (item.title && item.link) {
        allArticles.push({
          id: `tc-${index}`,
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || '',
          url: item.link,
          source: 'TechCrunch',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          relevanceScore: 80,
          tags: ['ai', 'tech'],
          used: false,
        });
      }
    });
    
    // 3. VentureBeat AI
    console.log('   📡 Scraping VentureBeat AI...');
    const vbFeed = await rssParser.parseURL('https://venturebeat.com/category/ai/feed/');
    
    vbFeed.items.slice(0, 5).forEach((item, index) => {
      if (item.title && item.link) {
        allArticles.push({
          id: `vb-${index}`,
          title: item.title,
          content: item.contentSnippet || item.content || item.summary || '',
          url: item.link,
          source: 'VentureBeat',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          relevanceScore: 75,
          tags: ['ai', 'business'],
          used: false,
        });
      }
    });
    
    // 4. GitHub Trending
    console.log('   📡 Scraping GitHub Trending...');
    const ghResponse = await axios.get('https://github.com/trending', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)' }
    });
    
    const $ = cheerio.load(ghResponse.data);
    $('.Box-row').each((i, elem) => {
      if (i >= 3) return;
      
      const titleElem = $(elem).find('h2 a');
      const title = titleElem.text().trim();
      const url = 'https://github.com' + titleElem.attr('href');
      const description = $(elem).find('p').text().trim();
      
      if (title) {
        allArticles.push({
          id: `gh-${i}`,
          title: title,
          content: description || 'Trending repository on GitHub',
          url: url,
          source: 'GitHub',
          publishedAt: new Date(),
          relevanceScore: 70,
          tags: ['github', 'code'],
          used: false,
        });
      }
    });
    
  } catch (error) {
    console.error('   ❌ Scraping error:', error);
  }
  
  return allArticles;
}

async function generateCompleteNewsletter() {
  console.log('🚀 Starting complete newsletter generation...\n');
  
  try {
    // Step 1: Scrape content from real sources
    console.log('📡 Step 1: Scraping content from real sources...');
    const scrapedContent = await scrapeContentStandalone();
    console.log(`✅ Scraped ${scrapedContent.length} articles from various sources`);
    
    // Step 2: Generate newsletter content with Azure OpenAI
    console.log('\\n📝 Step 2: Generating newsletter content with Azure OpenAI...');
    const contentResponse = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2025-01-01-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_API_KEY!,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert AI newsletter writer creating a comprehensive weekly digest for executives, investors, and tech leaders. 
              Your writing style is professional, insightful, and data-driven. You focus on strategic implications and business value.
              Format the content in clean HTML with proper headings and paragraphs.`,
            },
            {
              role: 'user',
              content: `Create a compelling newsletter based on these recent AI developments:

${scrapedContent.map(article => `- ${article.title} (${article.source}): ${article.content.slice(0, 200)}...`).join('\\n')}

Requirements:
- Length: 2,500 words
- Include an engaging introduction
- Cover 5-7 main topics with analysis
- Add a "Key Takeaways" section
- Include relevant statistics and data points
- Maintain professional tone for executives
- Format in clean HTML with proper structure
- Include <h2> headings for major sections
- Use <p> tags for paragraphs
- Include <ul> and <li> for key takeaways`,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      }
    );
    
    if (!contentResponse.ok) {
      throw new Error(`Content generation failed: ${contentResponse.statusText}`);
    }
    
    const contentData = await contentResponse.json();
    const newsletterContent = contentData.choices[0].message.content;
    console.log('✅ Newsletter content generated successfully!');
    console.log(`📄 Content length: ${newsletterContent.length} characters`);
    
    // Step 3: Generate newsletter thumbnail with Azure Image API
    console.log('\\n🖼️ Step 3: Generating newsletter thumbnail...');
    const imageResponse = await fetch(
      `${process.env.AZURE_IMAGE_ENDPOINT}/openai/deployments/${process.env.AZURE_IMAGE_DEPLOYMENT_NAME}/images/generations?api-version=${process.env.AZURE_IMAGE_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_IMAGE_API_KEY!,
        },
        body: JSON.stringify({
          prompt: `Create a retro-futuristic illustration for an AI newsletter weekly digest. 
          Style: 1980s aesthetic with modern twist, neon gradients (purple, blue, pink), geometric patterns.
          Elements: Abstract neural networks, data flows, digital grid patterns, subtle business charts.
          Mood: Optimistic, innovative, cutting-edge technology.
          Composition: Clean, professional, suitable for newsletter header.
          No text or words in the image.`,
          n: 1,
          size: '1024x1024',
          quality: 'medium',
          output_format: 'png',
          output_compression: 100,
        }),
      }
    );
    
    if (!imageResponse.ok) {
      throw new Error(`Image generation failed: ${imageResponse.statusText}`);
    }
    
    const imageData = await imageResponse.json();
    const imageBase64 = imageData.data[0].b64_json;
    console.log('✅ Newsletter thumbnail generated successfully!');
    console.log(`🖼️ Image size: ${imageBase64.length} characters (base64)`);
    
    // Step 4: Create complete newsletter object
    console.log('\\n📰 Step 4: Creating complete newsletter...');
    const newsletter = {
      id: `newsletter-${Date.now()}`,
      title: 'AI Weekly Digest - ' + new Date().toLocaleDateString(),
      slug: `ai-weekly-digest-${new Date().toISOString().slice(0, 10)}`,
      description: 'Your weekly roundup of the most important AI developments, breakthroughs, and business implications.',
      content: newsletterContent,
      imageUrl: `data:image/png;base64,${imageBase64}`,
      publishDate: new Date(),
      type: 'weekly-digest' as const,
      authorName: 'AI Weekly Team',
      authorImageUrl: '/images/team/harshith.png',
      status: 'published' as const,
      metadata: {
        scrapedArticles: scrapedContent.length,
        aiTokensUsed: 4000,
        generationTime: Date.now(),
        imageGenerationTime: Date.now(),
        sources: [...new Set(scrapedContent.map(a => a.source))],
      },
    };
    
    console.log('✅ Complete newsletter created!');
    console.log(`📊 Newsletter stats:`);
    console.log(`   - Title: ${newsletter.title}`);
    console.log(`   - Content length: ${newsletter.content.length} characters`);
    console.log(`   - Sources used: ${newsletter.metadata.sources.join(', ')}`);
    console.log(`   - Articles scraped: ${newsletter.metadata.scrapedArticles}`);
    
    // Step 5: Save newsletter to file for website display
    console.log('\\n💾 Step 5: Saving newsletter for website display...');
    const newsletterForWebsite = {
      ...newsletter,
      // Generate a clean excerpt for the website
      excerpt: newsletterContent.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
    };
    
    // Save to generated newsletters directory
    const newsletterPath = `./data/generated-newsletters/${newsletter.slug}.json`;
    writeFileSync(newsletterPath, JSON.stringify(newsletterForWebsite, null, 2));
    console.log(`✅ Newsletter saved to: ${newsletterPath}`);
    
    // Step 6: Create HTML preview
    console.log('\\n🌐 Step 6: Creating HTML preview...');
    const htmlPreview = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.title}</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            color: white;
        }
        .thumbnail { 
            width: 100%; 
            max-width: 600px; 
            height: auto; 
            border-radius: 8px; 
            margin: 20px 0;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .content { 
            line-height: 1.8; 
            margin: 30px 0;
        }
        .content h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        .content p {
            margin: 15px 0;
            text-align: justify;
        }
        .content ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        .content li {
            margin: 8px 0;
        }
        .meta { 
            color: #666; 
            font-size: 14px; 
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f1f2f6;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${newsletter.title}</h1>
        <p>Published: ${newsletter.publishDate.toLocaleDateString()}</p>
        <p>${newsletter.description}</p>
        <img src="${newsletter.imageUrl}" alt="Newsletter thumbnail" class="thumbnail">
    </div>
    
    <div class="content">
        ${newsletter.content}
    </div>
    
    <div class="meta">
        <p><strong>📊 Newsletter Analytics:</strong></p>
        <p><strong>Sources:</strong> ${newsletter.metadata.sources.join(', ')}</p>
        <p><strong>Articles analyzed:</strong> ${newsletter.metadata.scrapedArticles}</p>
        <p><strong>AI tokens used:</strong> ${newsletter.metadata.aiTokensUsed}</p>
        <p><strong>Generated at:</strong> ${new Date(newsletter.metadata.generationTime).toLocaleString()}</p>
    </div>
    
    <div class="footer">
        <p><strong>🤖 Generated with Azure OpenAI</strong></p>
        <p>This newsletter was automatically generated using real-time content scraping and AI content generation.</p>
    </div>
</body>
</html>`;
    
    writeFileSync('./generated-newsletter-preview.html', htmlPreview);
    console.log('✅ HTML preview saved to: ./generated-newsletter-preview.html');
    
    console.log('\\n🎉 COMPLETE NEWSLETTER GENERATION SUCCESSFUL!');
    console.log('\\n📋 Summary:');
    console.log(`   ✅ Scraped ${scrapedContent.length} articles from real sources`);
    console.log(`   ✅ Generated ${newsletterContent.length} characters of AI content`);
    console.log(`   ✅ Created retro-futuristic newsletter thumbnail`);
    console.log(`   ✅ Saved newsletter data for website integration`);
    console.log(`   ✅ Created styled HTML preview`);
    console.log('\\n🌐 Open generated-newsletter-preview.html in your browser to see the result!');
    
  } catch (error) {
    console.error('❌ Newsletter generation failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

generateCompleteNewsletter().catch(console.error);