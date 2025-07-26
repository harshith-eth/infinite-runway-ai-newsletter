import { readFileSync, writeFileSync } from 'fs';
import { scraperService } from './lib/services/scraper';

// Load environment variables manually
const envFile = readFileSync('.env.local', 'utf8');
const envVars = envFile.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
envVars.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function generateCompleteNewsletter() {
  console.log('🚀 Starting complete newsletter generation...\n');
  
  try {
    // Step 1: Scrape content from real sources
    console.log('📡 Step 1: Scraping content from real sources...');
    const scrapedContent = await scraperService.scrapeForNewsletter('weekly-digest');
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

${scrapedContent.slice(0, 10).map(article => `- ${article.title} (${article.source}): ${article.content.slice(0, 200)}...`).join('\\n')}

Requirements:
- Length: 2,500 words
- Include an engaging introduction
- Cover 5-7 main topics with analysis
- Add a "Key Takeaways" section
- Include relevant statistics and data points
- Maintain professional tone for executives
- Format in clean HTML with proper structure`,
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
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .thumbnail { width: 100%; max-width: 600px; height: auto; border-radius: 8px; }
        .content { line-height: 1.6; }
        .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${newsletter.title}</h1>
        <p class="meta">Published: ${newsletter.publishDate.toLocaleDateString()}</p>
        <img src="${newsletter.imageUrl}" alt="Newsletter thumbnail" class="thumbnail">
    </div>
    <div class="content">
        ${newsletter.content}
    </div>
    <div class="meta">
        <p><strong>Sources:</strong> ${newsletter.metadata.sources.join(', ')}</p>
        <p><strong>Articles analyzed:</strong> ${newsletter.metadata.scrapedArticles}</p>
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
    console.log(`   ✅ Created HTML preview for immediate viewing`);
    console.log('\\n🌐 Open generated-newsletter-preview.html in your browser to see the result!');
    
  } catch (error) {
    console.error('❌ Newsletter generation failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

generateCompleteNewsletter().catch(console.error);