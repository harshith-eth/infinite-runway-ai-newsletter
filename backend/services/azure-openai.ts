import { ContentGenerationRequest, Newsletter, NewsletterType } from '@/lib/types/newsletter.types';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

interface AzureOpenAIConfig {
  endpoint: string;
  deploymentName: string;
  imageDeploymentName: string;
}

interface ContentPrompts {
  'weekly-digest': string;
  'innovation-report': string;
  'business-careers': string;
}

export class AzureOpenAIService {
  private config: AzureOpenAIConfig;
  
  constructor() {
    this.config = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
      imageDeploymentName: process.env.AZURE_IMAGE_DEPLOYMENT_NAME!,
    };
    
    this.validateConfig();
  }
  
  private validateConfig() {
    const required = ['endpoint', 'deploymentName', 'imageDeploymentName'];
    for (const key of required) {
      if (!this.config[key as keyof AzureOpenAIConfig]) {
        throw new Error(`Missing required Azure OpenAI config: ${key}`);
      }
    }
    
    // Check if API keys are present in environment variables
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error('Missing AZURE_OPENAI_API_KEY environment variable');
    }
    if (!process.env.AZURE_IMAGE_API_KEY) {
      throw new Error('Missing AZURE_IMAGE_API_KEY environment variable');
    }
  }
  
  async generateNewsletterContent(request: ContentGenerationRequest): Promise<string> {
    const prompt = this.buildContentPrompt(request);
    
    try {
      const response = await fetch(
        `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2025-01-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: this.getSystemPrompt(request.type),
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 4000,
            top_p: 0.95,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating newsletter content:', error);
      throw error;
    }
  }
  
  async generateContentAnalysis(requestPrompt: string): Promise<string> {
    try {
      console.log('Sending content analysis request to Azure OpenAI...');
      
      const response = await fetch(
        `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2025-01-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are an expert data analyst specializing in content analysis. You extract detailed insights from newsletter content and provide structured JSON responses that can be used for image generation.'
              },
              {
                role: 'user',
                content: requestPrompt,
              },
            ],
            temperature: 0.3, // Lower temperature for more structured/predictable output
            max_tokens: 2000,
            top_p: 0.95,
            response_format: { "type": "json_object" } // Ensure proper JSON formatting
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content analysis:', error);
      throw error;
    }
  }

  async generateAdvancedImagePrompt(requestPrompt: string): Promise<string> {
    try {
      console.log('Sending advanced image prompt request to Azure OpenAI...');
      
      const response = await fetch(
        `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2025-01-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are a master prompt engineer specializing in creating extremely detailed, cinematic image prompts for DALL-E. 
                You excel at creating elaborate scenes that combine retro technology with natural/cosmic elements.
                Your prompts include rich detail about composition, lighting, mood, color palette, textures, and atmosphere.
                You return ONLY the prompt itself with no explanations, commentary, or additional text.`
              },
              {
                role: 'user',
                content: requestPrompt,
              },
            ],
            temperature: 0.8, // Higher temperature for more creative output
            max_tokens: 3000, // Allow for very detailed prompts
            top_p: 0.95,
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating advanced image prompt:', error);
      throw error;
    }
  }

  async generateCustomPrompt(requestPrompt: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2025-01-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are an expert at analyzing newsletter content and creating high-quality image prompts for DALL-E. Return only the image prompt with no explanations or additional text.'
              },
              {
                role: 'user',
                content: requestPrompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.95,
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating custom prompt:', error);
      throw error;
    }
  }
  
  async generateNewsletterImageWithPrompt(prompt: string): Promise<string> {
    try {
      // Use the image-specific Azure OpenAI endpoint and API key from environment
      const imageEndpoint = process.env.AZURE_IMAGE_ENDPOINT || this.config.endpoint;
      
      // Log only the first part of the prompt to avoid console clutter
      const truncatedPrompt = prompt.length > 200 ? 
        `${prompt.substring(0, 200)}... [${prompt.length - 200} more chars]` : 
        prompt;
      console.log(`Generating image with custom prompt: "${truncatedPrompt}"`);
      
      // Ensure prompt isn't too long for the API
      const maxPromptLength = 4000; // DALL-E has a prompt length limit
      const finalPrompt = prompt.length > maxPromptLength ? 
        prompt.substring(0, maxPromptLength) : 
        prompt;
        
      const response = await fetch(
        `${imageEndpoint}/openai/deployments/${this.config.imageDeploymentName}/images/generations?api-version=2025-04-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_IMAGE_API_KEY,
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            n: 1,
            size: '1536x1024', // Larger rectangular size for newsletter thumbnails
            quality: 'high',   // Standard quality (Azure doesn't support 'hd')
            output_format: 'png',
            output_compression: 100
            // Azure OpenAI doesn't support 'style' parameter
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI Image API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // For b64_json format, we need to handle the base64 response
      if (data.data[0].b64_json) {
        return `data:image/png;base64,${data.data[0].b64_json}`;
      }
      return data.data[0].url;
    } catch (error) {
      console.error('Error generating image with custom prompt:', error);
      throw error;
    }
  }

  async generateNewsletterImage(
    topic: string,
    type: NewsletterType
  ): Promise<string> {
    const prompt = this.buildImagePrompt(topic, type);
    
    try {
      // Use the image-specific Azure OpenAI endpoint and API key from environment
      const imageEndpoint = process.env.AZURE_IMAGE_ENDPOINT || this.config.endpoint;
      
      const response = await fetch(
        `${imageEndpoint}/openai/deployments/${this.config.imageDeploymentName}/images/generations?api-version=2025-04-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_IMAGE_API_KEY,
          },
          body: JSON.stringify({
            prompt,
            n: 1,
            size: '1536x1024', // Larger rectangular size for newsletter thumbnails
            quality: 'high',   // Standard quality (Azure doesn't support 'hd')
            output_format: 'png',
            output_compression: 100
            // Azure OpenAI doesn't support 'style' parameter
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI Image API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      // For b64_json format, we need to handle the base64 response
      if (data.data[0].b64_json) {
        return `data:image/png;base64,${data.data[0].b64_json}`;
      }
      return data.data[0].url;
    } catch (error) {
      console.error('Error generating newsletter image:', error);
      throw error;
    }
  }
  
  private getSystemPrompt(type: NewsletterType): string {
    const prompts = {
      'weekly-digest': `You are an expert AI newsletter writer creating a comprehensive weekly digest for executives, investors, and tech leaders. 
      Your writing style is professional, insightful, and data-driven. You focus on strategic implications and business value.
      Format the content in CLEAN MARKDOWN with proper headings (##, ###) and paragraphs. NO HTML tags allowed.`,
      
      'innovation-report': `You are a technical AI newsletter writer creating content for developers, engineers, and technical professionals.
      Your writing style is technically accurate yet accessible, with practical examples and code snippets where relevant.
      Focus on new tools, frameworks, and technical breakthroughs. Format in CLEAN MARKDOWN with code blocks using backticks.`,
      
      'business-careers': `You are a business-focused AI newsletter writer creating content for professionals, job seekers, and entrepreneurs.
      Your writing style is practical, inspiring, and action-oriented. Focus on real-world applications and career opportunities.
      Include actionable advice and success stories. Format in CLEAN MARKDOWN with clear sections.`,
    };
    
    return prompts[type];
  }
  
  private buildContentPrompt(request: ContentGenerationRequest): string {
    const { type, scrapedContent, sponsorInfo, companiesRaising, companiesHiring } = request;
    
    // Sort content by relevance
    const topArticles = scrapedContent
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);
    
    const articlesContext = topArticles
      .map(article => `- ${article.title} (${article.source}): ${article.content.slice(0, 200)}...`)
      .join('\n');
    
    let prompt = `Create a compelling newsletter based on these recent AI developments:\n\n${articlesContext}\n\n`;
    
    prompt += `Requirements:
    - Length: 2,500 words
    - Include an engaging introduction
    - Cover 5-7 main topics with analysis
    - Add a "Key Takeaways" section
    - Include relevant statistics and data points
    - Maintain consistent tone for ${type} audience
    - Format in clean HTML
    `;
    
    if (sponsorInfo) {
      prompt += `\n- Naturally mention our sponsor ${sponsorInfo.name} where relevant`;
    }
    
    if (type === 'weekly-digest' && companiesRaising?.length) {
      prompt += `\n- Reference some of these funding rounds: ${companiesRaising.map(c => c.name).join(', ')}`;
    }
    
    if (type === 'business-careers' && companiesHiring?.length) {
      prompt += `\n- Mention hiring trends from companies like: ${companiesHiring.map(c => c.name).join(', ')}`;
    }
    
    return prompt;
  }
  
  private buildImagePrompt(topic: string, type: NewsletterType): string {
    const basePrompt = `Create a single, clean pixelated icon related to ${topic} with a completely TRANSPARENT BACKGROUND. 
    
    Style: Simple 8-bit/16-bit pixel art style. JUST THE ICON - NO BORDERS, NO WINDOW FRAMES, NO UI ELEMENTS.
    
    Background: 100% TRANSPARENT - absolutely no background elements or colors of any kind.
    
    Elements: ONLY ONE simple pixelated icon that directly relates to "${topic}". No additional decorative elements.
    
    Centering: The icon must be PERFECTLY CENTERED in the composition.
    
    Size: The icon should be VERY LARGE, taking up 85-90% of the available canvas space.
    
    Colors: Use vibrant, high-contrast colors appropriate to the subject. Yellow for lightbulbs, blue for technology, green for finance, etc.
    
    Execution: Create JUST THE ICON ITSELF with transparent background. Do not include any window borders, frames, controls, or UI elements.
    `;
    
    // Generate dynamic icon suggestions based on the topic content
    const iconSuggestions = this.generateTopicIcon(topic);
    
    return `${basePrompt} ${iconSuggestions} 
    
    IMPORTANT: 
    - ABSOLUTELY NO TEXT in the image
    - 100% TRANSPARENT BACKGROUND - no white backgrounds, frames, or windows
    - ONLY THE ICON ITSELF should be visible
    - The icon must be PERFECTLY CENTERED
    - Icon should take up 85-90% of the canvas`;
  }
  
  private generateTopicIcon(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    // Dynamic icon generation based on actual topic content
    if (topicLower.includes('funding') || topicLower.includes('investment') || topicLower.includes('raise')) {
      return 'Single large central element: a pixelated money bag, dollar sign, or investment chart icon.';
    }
    if (topicLower.includes('openai') || topicLower.includes('gpt') || topicLower.includes('chatgpt')) {
      return 'Single large central element: a pixelated chat bubble, robot head, or AI brain icon.';
    }
    if (topicLower.includes('google') || topicLower.includes('search') || topicLower.includes('gemini')) {
      return 'Single large central element: a pixelated search magnifying glass, colorful squares, or gem icon.';
    }
    if (topicLower.includes('microsoft') || topicLower.includes('azure') || topicLower.includes('copilot')) {
      return 'Single large central element: a pixelated window panes, cloud, or office building icon.';
    }
    if (topicLower.includes('tesla') || topicLower.includes('autonomous') || topicLower.includes('self-driving')) {
      return 'Single large central element: a pixelated car, lightning bolt, or steering wheel icon.';
    }
    if (topicLower.includes('chip') || topicLower.includes('processor') || topicLower.includes('nvidia')) {
      return 'Single large central element: a pixelated microchip, circuit board, or processor icon.';
    }
    if (topicLower.includes('healthcare') || topicLower.includes('medical') || topicLower.includes('drug')) {
      return 'Single large central element: a pixelated medical cross, pill, or stethoscope icon.';
    }
    if (topicLower.includes('robotics') || topicLower.includes('robot') || topicLower.includes('automation')) {
      return 'Single large central element: a pixelated robot, mechanical arm, or gear icon.';
    }
    if (topicLower.includes('quantum') || topicLower.includes('computing') || topicLower.includes('research')) {
      return 'Single large central element: a pixelated atom, quantum particles, or laboratory flask icon.';
    }
    if (topicLower.includes('startup') || topicLower.includes('entrepreneur') || topicLower.includes('business')) {
      return 'Single large central element: a pixelated rocket ship, light bulb, or startup building icon.';
    }
    if (topicLower.includes('github') || topicLower.includes('code') || topicLower.includes('programming')) {
      return 'Single large central element: a pixelated code brackets, terminal window, or git branch icon.';
    }
    if (topicLower.includes('security') || topicLower.includes('cyber') || topicLower.includes('privacy')) {
      return 'Single large central element: a pixelated shield, lock, or security badge icon.';
    }
    if (topicLower.includes('data') || topicLower.includes('analytics') || topicLower.includes('science')) {
      return 'Single large central element: a pixelated database, chart, or graph icon.';
    }
    if (topicLower.includes('blockchain') || topicLower.includes('crypto') || topicLower.includes('bitcoin')) {
      return 'Single large central element: a pixelated chain link, coin, or blockchain cube icon.';
    }
    if (topicLower.includes('climate') || topicLower.includes('energy') || topicLower.includes('green')) {
      return 'Single large central element: a pixelated leaf, solar panel, or wind turbine icon.';
    }
    
    // Default fallback for any other topics
    return 'Single large central element: a pixelated technology icon, digital symbol, or innovation-related graphic that relates to the topic.';
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2025-01-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 5,
          }),
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Azure OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const azureOpenAI = new AzureOpenAIService();