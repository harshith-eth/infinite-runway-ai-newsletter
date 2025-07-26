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

async function testAzureDirectly() {
  console.log('🔍 Testing Azure OpenAI APIs directly...\n');
  
  console.log('🔧 Environment variables:');
  console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT);
  console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? 'SET' : 'NOT SET');
  console.log('AZURE_OPENAI_DEPLOYMENT_NAME:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
  console.log('AZURE_IMAGE_DEPLOYMENT_NAME:', process.env.AZURE_IMAGE_DEPLOYMENT_NAME);
  console.log('');
  
  try {
    // Test 1: Content Generation
    console.log('📝 Testing content generation...');
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
              content: 'You are an expert AI newsletter writer.',
            },
            {
              role: 'user',
              content: 'Write a short newsletter introduction about Meta\'s new AI superintelligence lab.',
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );
    
    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      console.error('❌ Content generation failed:', errorText);
      return;
    }
    
    const contentData = await contentResponse.json();
    const generatedContent = contentData.choices[0].message.content;
    console.log('✅ Content generation successful!');
    console.log(`📄 Generated content: ${generatedContent.substring(0, 200)}...`);
    
    // Test 2: Image Generation
    console.log('\\n🖼️ Testing image generation...');
    const imageResponse = await fetch(
      `${process.env.AZURE_IMAGE_ENDPOINT}/openai/deployments/${process.env.AZURE_IMAGE_DEPLOYMENT_NAME}/images/generations?api-version=${process.env.AZURE_IMAGE_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_IMAGE_API_KEY!,
        },
        body: JSON.stringify({
          prompt: 'A retro-futuristic illustration for an AI newsletter about Meta\'s superintelligence lab. Style: 1980s aesthetic with neon gradients (purple, blue, pink), abstract neural networks, digital grid patterns. Professional, clean composition.',
          n: 1,
          size: '1024x1024',
          quality: 'medium',
          output_format: 'png',
          output_compression: 100,
        }),
      }
    );
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('❌ Image generation failed:', errorText);
      return;
    }
    
    const imageData = await imageResponse.json();
    console.log('✅ Image generation successful!');
    
    if (imageData.data[0].b64_json) {
      console.log('🖼️ Generated image as base64 data (length:', imageData.data[0].b64_json.length, 'characters)');
      console.log('🖼️ Base64 preview:', imageData.data[0].b64_json.substring(0, 50) + '...');
    } else if (imageData.data[0].url) {
      console.log('🖼️ Generated image URL:', imageData.data[0].url);
    }
    
    console.log('\\n🎉 All Azure API tests passed!');
    
  } catch (error) {
    console.error('❌ Azure API test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

testAzureDirectly().catch(console.error);