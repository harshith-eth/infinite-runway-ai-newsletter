import { readFileSync, writeFileSync } from 'fs';
import { BlogPost } from '@/lib/blog-types';

// Load environment variables
const envFile = readFileSync('.env.local', 'utf8');
const envVars = envFile.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
envVars.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function convertNewsletterToBlogPost() {
  console.log('🔄 Converting generated newsletter to BlogPost format...\n');
  
  try {
    // Read the generated newsletter JSON
    const newsletterData = JSON.parse(readFileSync('./data/generated-newsletters/ai-weekly-digest-2025-07-26.json', 'utf8'));
    
    // Extract clean content (remove HTML wrapper if present)
    let cleanContent = newsletterData.content;
    if (cleanContent.includes('```html')) {
      // Extract HTML content from code block
      const htmlMatch = cleanContent.match(/```html\n([\s\S]*?)\n```/);
      if (htmlMatch) {
        cleanContent = htmlMatch[1];
        // Remove the HTML document wrapper, keep only body content
        const bodyMatch = cleanContent.match(/<body>([\s\S]*?)<\/body>/);
        if (bodyMatch) {
          cleanContent = bodyMatch[1].trim();
          // Remove the title h1 since it will be shown in the BlogCard
          cleanContent = cleanContent.replace(/<h1[^>]*>.*?<\/h1>/, '').trim();
        }
      }
    }
    
    // Convert to BlogPost format
    const blogPost: BlogPost = {
      title: newsletterData.title,
      description: newsletterData.description,
      imageUrl: newsletterData.imageUrl, // This contains the base64 image
      slug: newsletterData.slug,
      authorName: newsletterData.authorName,
      authorImageUrl: newsletterData.authorImageUrl,
      publishDate: new Date(newsletterData.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      content: cleanContent,
      // Add sponsor info if available
      sponsorInfo: newsletterData.sponsorInfo ? {
        name: newsletterData.sponsorInfo.name,
        logo: newsletterData.sponsorInfo.logo,
        link: newsletterData.sponsorInfo.ctaLink,
        description: newsletterData.sponsorInfo.description,
        ctaText: newsletterData.sponsorInfo.ctaText,
        ctaLink: newsletterData.sponsorInfo.ctaLink,
      } : undefined,
    };
    
    console.log('✅ Converted newsletter to BlogPost format');
    console.log(`   📄 Title: ${blogPost.title}`);
    console.log(`   📅 Publish Date: ${blogPost.publishDate}`);
    console.log(`   📝 Content Length: ${blogPost.content.length} characters`);
    console.log(`   🖼️ Image: ${blogPost.imageUrl ? 'Generated AI image (base64)' : 'None'}`);
    
    // Create the TypeScript file for the blog post
    const blogPostTS = `import { BlogPost } from '@/lib/blog-types';

export const aiWeeklyDigest20250726: BlogPost = ${JSON.stringify(blogPost, null, 2)};
`;
    
    // Save the TypeScript file
    writeFileSync('./data/generated-newsletters/ai-weekly-digest-2025-07-26.ts', blogPostTS);
    console.log('✅ Created TypeScript blog post file: ./data/generated-newsletters/ai-weekly-digest-2025-07-26.ts');
    
    // Create or update the index file for generated newsletters
    const indexFileContent = `import { BlogPost } from '@/lib/blog-types';
import { aiWeeklyDigest20250726 } from './ai-weekly-digest-2025-07-26';

// Array of all generated newsletters
export const generatedNewsletters: BlogPost[] = [
  aiWeeklyDigest20250726,
  // Add future generated newsletters here
];

// Export individual newsletters
export {
  aiWeeklyDigest20250726,
};
`;
    
    writeFileSync('./data/generated-newsletters/index.ts', indexFileContent);
    console.log('✅ Created/updated generated newsletters index: ./data/generated-newsletters/index.ts');
    
    console.log('\n🎉 Newsletter integration complete!');
    console.log('\n📋 What was created:');
    console.log('   ✅ TypeScript blog post with proper BlogPost interface');
    console.log('   ✅ Generated newsletters index file');
    console.log('   ✅ Integrated with existing blog system');
    console.log('\n🌐 The newsletter will now appear in your /essays page alongside AI Mirror, Convergence, and Digital Consciousness!');
    
    return blogPost;
    
  } catch (error) {
    console.error('❌ Failed to convert newsletter:', error);
    throw error;
  }
}

convertNewsletterToBlogPost().catch(console.error);