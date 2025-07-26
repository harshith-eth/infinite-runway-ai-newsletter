import { readFileSync } from 'fs';

// Load environment variables manually
const envFile = readFileSync('.env.local', 'utf8');
const envVars = envFile.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
envVars.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

import { azureOpenAI } from './lib/services/azure-openai';

async function testAzureOpenAI() {
  console.log('🔍 Testing Azure OpenAI connection...\n');
  
  // Debug: Print environment variables
  console.log('🔧 Environment variables:');
  console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT);
  console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'SET' : 'NOT SET');
  console.log('AZURE_OPENAI_DEPLOYMENT_NAME:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
  console.log('AZURE_IMAGE_DEPLOYMENT_NAME:', process.env.AZURE_IMAGE_DEPLOYMENT_NAME);
  console.log('');
  
  try {
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const connectionTest = await azureOpenAI.testConnection();
    console.log(`${connectionTest ? '✅' : '❌'} Connection test: ${connectionTest ? 'SUCCESS' : 'FAILED'}`);
    
    if (!connectionTest) {
      console.log('❌ Cannot proceed with content generation - connection failed');
      return;
    }
    
    // Test content generation
    console.log('\n📝 Testing content generation...');
    const mockRequest = {
      type: 'weekly-digest' as const,
      date: new Date(),
      scrapedContent: [
        {
          id: 'test-1',
          title: 'Meta announces new AI superintelligence lab',
          content: 'Meta has announced its new AI superintelligence laboratory with former OpenAI researcher Shengjia Zhao leading the team.',
          url: 'https://example.com/meta-ai',
          source: 'TechCrunch',
          publishedAt: new Date(),
          relevanceScore: 95,
          tags: ['ai', 'meta', 'superintelligence'],
          used: false,
        },
        {
          id: 'test-2',
          title: 'OpenAI releases new GPT-5 preview',
          content: 'OpenAI has released an early preview of GPT-5 with significant improvements in reasoning and code generation capabilities.',
          url: 'https://example.com/gpt5',
          source: 'Hacker News',
          publishedAt: new Date(),
          relevanceScore: 90,
          tags: ['openai', 'gpt', 'ai'],
          used: false,
        }
      ],
    };
    
    const content = await azureOpenAI.generateNewsletterContent(mockRequest);
    console.log('✅ Content generation successful!');
    console.log(`📄 Generated content length: ${content.length} characters`);
    console.log(`📄 Content preview: ${content.substring(0, 200)}...`);
    
    // Test image generation
    console.log('\n🖼️ Testing image generation...');
    const imageUrl = await azureOpenAI.generateNewsletterImage(
      'AI Superintelligence and GPT-5 Preview',
      'weekly-digest'
    );
    console.log('✅ Image generation successful!');
    console.log(`🖼️ Generated image: ${imageUrl.substring(0, 100)}...`);
    
    console.log('\n🎉 All Azure OpenAI tests passed!');
    
  } catch (error) {
    console.error('❌ Azure OpenAI test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

testAzureOpenAI().catch(console.error);