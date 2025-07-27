# Newsletter Generation Workflow

This document outlines the end-to-end process for generating AI newsletters in the Infinite Runway system, with specific focus on the enhanced workflows and timeout handling for image generation.

## Overview

The newsletter generation system creates content-rich, visually appealing newsletters through a multi-stage process:

1. **Content Scraping**: Gathering relevant AI news and articles
2. **Content Generation**: Creating structured newsletter content with AI
3. **Image Creation**: Generating custom header images based on the content
4. **File Generation**: Producing the necessary files for web display

## Workflow Steps in Detail

### 1. Initialization

The process begins by initializing necessary parameters and setting up the environment:

```typescript
async generate(options: GenerationOptions): Promise<Newsletter> {
  const startTime = Date.now();
  const date = options.date || new Date();
  
  // Setup and notifications...
}
```

### 2. Content Scraping

The system scrapes relevant content from configured sources:

```typescript
const scrapedContent = await scraperService.scrapeForNewsletter(options.type);
console.log(`Scraped ${scrapedContent.length} unique, highly relevant articles`);
```

This content provides the foundation for both the newsletter text and image.

### 3. Dynamic Slug Generation

A unique slug is created based on the content themes:

```typescript
const slug = this.generateSlug(options.type, date, scrapedContent);
```

The slug combines dynamic keywords extracted from the content with date information to ensure uniqueness.

### 4. Newsletter Content Generation

The system leverages Azure OpenAI to create the newsletter content:

```typescript
const contentRequest: ContentGenerationRequest = {
  type: options.type,
  date: date,
  scrapedContent: scrapedContent.slice(0, 15), // Top 15 articles
  sponsorInfo: sponsors.mainSponsor,
  // Additional parameters...
};

const content = await azureOpenAI.generateNewsletterContent(contentRequest);
```

### 5. Enhanced Image Generation

The image generation workflow has been significantly improved:

```typescript
// First analyze the content to create a better image prompt
const imagePrompt = await this.generateImagePromptFromContent(content, options.type, slug);

// Try to generate the image with up to 3 attempts
let attempt = 1;
while (attempt <= 3 && !success) {
  try {
    imageUrl = await this.generateAndSaveImageWithPrompt(imagePrompt, slug);
    success = true;
  } catch (error) {
    // Retry logic...
    attempt++;
  }
}

// Fallback mechanism if all attempts fail
if (!success) {
  // Use fallback approach...
}
```

#### Key Improvements:

- **Content-First Approach**: Images are derived from the actual newsletter content
- **Multi-Stage Processing**: Deep content analysis followed by detailed prompt creation
- **Retry Mechanism**: Up to 3 attempts with 2-second delays between tries
- **Robust Fallback**: Secondary approach if primary method fails
- **Timeout Management**: Support for extended timeouts for image generation

### 6. Newsletter Object Creation

The system assembles a complete newsletter object:

```typescript
const newsletter: Newsletter = {
  id: slug,
  title: this.getNewsletterTitle(options.type, date, scrapedContent),
  slug: slug,
  content: content,
  imageUrl: imageUrl,
  // Additional properties...
};
```

### 7. File Generation

The newsletter is saved to the file system in the appropriate structure:

```typescript
await this.createBlogPostFile(newsletter);
```

This creates:
- A metadata.json file with newsletter information
- A page.mdx file containing the content
- Image files in the correct directories

## Timeout Handling

The enhanced system includes proper handling for long-running image generation:

### Problem:

Image generation through Azure OpenAI can take 60-120 seconds, which may exceed default command timeouts.

### Solution:

1. **Extended Timeouts**: Use longer timeouts when running the generation command:
   ```bash
   npm run generate:newsletter -- weekly-digest --timeout=600000
   ```

2. **Progress Logging**: Clear console output of each step in the process

3. **Saved Prompts**: Even if image generation times out, the generated prompts are saved for review

## Command-Line Usage

### Basic Usage

```bash
npm run generate:newsletter -- <newsletter-type>
```

Where `<newsletter-type>` is one of:
- `weekly-digest` (general AI news)
- `innovation-report` (technical focus)
- `business-careers` (industry/career focus)

### Options

```bash
# Generate with test mode (mock data)
npm run generate:newsletter -- weekly-digest --test

# Generate with specific date
npm run generate:newsletter -- weekly-digest --date=2025-07-30

# Generate with extended timeout (10 minutes)
npm run generate:newsletter -- weekly-digest --timeout=600000
```

## Directory Structure

Newsletters are saved to:
```
/frontend/app/essays/<year>/<month>/week-<num>/<slug>/
```

With files:
- `metadata.json` - Newsletter metadata
- `page.mdx` - Newsletter content
- `<slug>.png` - Newsletter header image

## Monitoring and Debugging

### Logs

Image prompts are now saved to:
```
/backend/logs/prompts/<slug>-<timestamp>.txt
```

This allows for review and refinement of prompt strategies even if image generation fails.

### Console Output

The process provides detailed console output at each step:

```
Scraping content...
📊 Filtered to 207 highly relevant articles (score > 15)
Scraped 207 unique, highly relevant articles
Generated slug: climate-safety-20250726-5061
Beginning advanced image prompt generation process...
Requesting content analysis...
Content analysis completed successfully
Requesting advanced image prompt generation...
Image generation attempt 1/3...
✅ Image generated successfully in 50.742 seconds
```

## Best Practices

1. **Always use extended timeouts** for newsletter generation (at least 5-10 minutes)
2. **Review generated prompts** in the logs directory to understand image generation
3. **Test with different newsletter types** to see variations in image style
4. **Check image quality** after generation to ensure proper sizing and transparency

## Troubleshooting

### Common Issues:

1. **Timeout Errors**: Use `--timeout=600000` parameter for longer runs
2. **API Parameter Errors**: Check Azure OpenAI documentation for supported parameters
3. **Image Size Issues**: Verify the size parameter (currently 1536x1024) is supported
4. **Prompt Quality**: Review saved prompts to ensure they match desired aesthetic

## Future Workflow Improvements

Planned enhancements:

1. **Asynchronous Processing**: Move image generation to a background task
2. **Scheduled Generation**: Pre-generate newsletters during off-peak hours
3. **Quality Control**: Add human review step before final publication
4. **Performance Optimization**: Cache content analysis to speed up generation

## References

- Azure OpenAI Service: https://learn.microsoft.com/en-us/azure/ai-services/openai/
- Next.js App Router: https://nextjs.org/docs/app
- MDX Documentation: https://mdxjs.com/