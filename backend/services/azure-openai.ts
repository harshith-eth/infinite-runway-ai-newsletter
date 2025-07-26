import { ContentGenerationRequest, Newsletter, NewsletterType } from '@/lib/types/newsletter.types';

interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
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
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
      imageDeploymentName: process.env.AZURE_IMAGE_DEPLOYMENT_NAME!,
    };
    
    this.validateConfig();
  }
  
  private validateConfig() {
    const required = ['endpoint', 'apiKey', 'deploymentName', 'imageDeploymentName'];
    for (const key of required) {
      if (!this.config[key as keyof AzureOpenAIConfig]) {
        throw new Error(`Missing required Azure OpenAI config: ${key}`);
      }
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
            'api-key': this.config.apiKey,
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
  
  async generateNewsletterImage(
    topic: string,
    type: NewsletterType
  ): Promise<string> {
    const prompt = this.buildImagePrompt(topic, type);
    
    try {
      const response = await fetch(
        `${process.env.AZURE_IMAGE_ENDPOINT}/openai/deployments/${process.env.AZURE_IMAGE_DEPLOYMENT_NAME}/images/generations?api-version=${process.env.AZURE_IMAGE_API_VERSION}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.AZURE_IMAGE_API_KEY!,
          },
          body: JSON.stringify({
            prompt,
            n: 1,
            size: '1024x1024',
            quality: 'medium',
            output_format: 'png',
            output_compression: 100,
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
      Format the content in clean HTML with proper headings and paragraphs.`,
      
      'innovation-report': `You are a technical AI newsletter writer creating content for developers, engineers, and technical professionals.
      Your writing style is technically accurate yet accessible, with practical examples and code snippets where relevant.
      Focus on new tools, frameworks, and technical breakthroughs. Format in HTML with code blocks using <pre> tags.`,
      
      'business-careers': `You are a business-focused AI newsletter writer creating content for professionals, job seekers, and entrepreneurs.
      Your writing style is practical, inspiring, and action-oriented. Focus on real-world applications and career opportunities.
      Include actionable advice and success stories. Format in HTML with clear sections.`,
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
    const basePrompt = `Create a retro-futuristic illustration for an AI newsletter about ${topic}.
    Style: 1980s aesthetic with modern twist, neon gradients (purple, blue, pink), geometric patterns.
    Elements: Abstract neural networks, data flows, digital grid patterns.
    Mood: Optimistic, innovative, cutting-edge technology.
    Composition: Clean, professional, suitable for newsletter header.
    `;
    
    const typeSpecific = {
      'weekly-digest': 'Add subtle business/finance elements like graphs or charts in the background.',
      'innovation-report': 'Include code-like elements, circuit patterns, or technical diagrams.',
      'business-careers': 'Incorporate growth symbols, upward arrows, or career progression elements.',
    };
    
    return `${basePrompt} ${typeSpecific[type]} No text or words in the image.`;
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=2025-01-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.config.apiKey,
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