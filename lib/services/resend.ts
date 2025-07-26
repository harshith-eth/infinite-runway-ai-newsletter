import { Resend } from 'resend';
import { 
  Newsletter, 
  EmailRecipient, 
  EmailSendRequest,
  NewsletterAnalytics,
  CompanyRaising,
  CompanyHiring
} from '@/lib/types/newsletter.types';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface BatchEmailResult {
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

export class ResendService {
  private resend: Resend;
  private fromEmail: string;
  private audienceId?: string;
  
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'newsletter@infiniterunway.com';
    this.audienceId = process.env.RESEND_AUDIENCE_ID;
    
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    
    this.resend = new Resend(apiKey);
  }
  
  async sendNewsletter(request: EmailSendRequest): Promise<BatchEmailResult> {
    const { newsletter, recipients, testMode = false } = request;
    
    // Generate email template
    const template = this.generateEmailTemplate(newsletter);
    
    // Filter active recipients only
    const activeRecipients = recipients.filter(r => r.status === 'active');
    
    if (testMode) {
      // In test mode, only send to admin email
      return this.sendSingleEmail({
        to: process.env.ADMIN_EMAIL || this.fromEmail,
        ...template,
        subject: `[TEST] ${template.subject}`,
      });
    }
    
    // Send in batches of 100 to avoid rate limits
    const batchSize = 100;
    const results: BatchEmailResult = {
      sent: 0,
      failed: 0,
      errors: [],
    };
    
    for (let i = 0; i < activeRecipients.length; i += batchSize) {
      const batch = activeRecipients.slice(i, i + batchSize);
      const batchResult = await this.sendBatch(batch, template, newsletter.id);
      
      results.sent += batchResult.sent;
      results.failed += batchResult.failed;
      results.errors.push(...batchResult.errors);
      
      // Wait 1 second between batches to avoid rate limits
      if (i + batchSize < activeRecipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
  
  private async sendBatch(
    recipients: EmailRecipient[], 
    template: EmailTemplate,
    newsletterId: string
  ): Promise<BatchEmailResult> {
    const results: BatchEmailResult = {
      sent: 0,
      failed: 0,
      errors: [],
    };
    
    try {
      // Create batch with personalized unsubscribe links
      const batch = recipients.map(recipient => ({
        from: `Infinite Runway <${this.fromEmail}>`,
        to: recipient.email,
        subject: template.subject,
        html: this.personalizeEmail(template.html, recipient, newsletterId),
        text: template.text,
        headers: {
          'X-Newsletter-ID': newsletterId,
          'X-Subscriber-ID': recipient.id,
        },
        tags: [
          {
            name: 'newsletter_id',
            value: newsletterId,
          },
          {
            name: 'newsletter_type',
            value: 'automated',
          },
        ],
      }));
      
      const response = await this.resend.batch.send(batch);
      
      if (response.data) {
        results.sent = response.data.filter(r => r.id).length;
        results.failed = batch.length - results.sent;
      }
    } catch (error) {
      console.error('Batch send error:', error);
      results.failed = recipients.length;
      results.errors = recipients.map(r => ({
        email: r.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
    
    return results;
  }
  
  private async sendSingleEmail(params: any): Promise<BatchEmailResult> {
    try {
      await this.resend.emails.send(params);
      return { sent: 1, failed: 0, errors: [] };
    } catch (error) {
      return {
        sent: 0,
        failed: 1,
        errors: [{
          email: params.to,
          error: error instanceof Error ? error.message : 'Unknown error',
        }],
      };
    }
  }
  
  private generateEmailTemplate(newsletter: Newsletter): EmailTemplate {
    const subject = this.getSubjectLine(newsletter);
    const html = this.generateHtmlEmail(newsletter);
    const text = this.generateTextEmail(newsletter);
    
    return { subject, html, text };
  }
  
  private getSubjectLine(newsletter: Newsletter): string {
    const typeEmojis = {
      'weekly-digest': '📊',
      'innovation-report': '🛠️',
      'business-careers': '💼',
    };
    
    const emoji = typeEmojis[newsletter.type] || '🚀';
    return `${emoji} ${newsletter.title} - Infinite Runway`;
  }
  
  private generateHtmlEmail(newsletter: Newsletter): string {
    const { sponsorInfo, companiesRaising, companiesHiring } = newsletter;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.title}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header img {
      width: 200px;
      height: auto;
    }
    .hero-image {
      width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 28px;
      margin-bottom: 10px;
    }
    h2 {
      color: #2563eb;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .sponsor-section {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .sponsor-logo {
      width: 150px;
      height: auto;
      margin-bottom: 15px;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 15px;
    }
    .company-list {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .company-item {
      border-bottom: 1px solid #e2e8f0;
      padding: 15px 0;
    }
    .company-item:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #666;
      font-size: 14px;
    }
    .unsubscribe {
      color: #666;
      text-decoration: underline;
    }
    .tracking-pixel {
      width: 1px;
      height: 1px;
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="Infinite Runway">
    </div>
    
    <img src="${newsletter.imageUrl}" alt="${newsletter.title}" class="hero-image">
    
    <h1>${newsletter.title}</h1>
    <p style="color: #666; font-size: 16px;">${newsletter.description}</p>
    
    ${sponsorInfo ? this.generateSponsorSection(sponsorInfo) : ''}
    
    <div class="content">
      ${newsletter.content}
    </div>
    
    ${companiesRaising && companiesRaising.length > 0 ? this.generateCompaniesRaisingSection(companiesRaising) : ''}
    
    ${companiesHiring && companiesHiring.length > 0 ? this.generateCompaniesHiringSection(companiesHiring) : ''}
    
    <div class="footer">
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/essays/${newsletter.slug}" style="color: #2563eb;">Read on website</a>
        · 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe" style="color: #2563eb;">Forward to a friend</a>
      </p>
      <p>
        You're receiving this because you subscribed to Infinite Runway.<br>
        <a href="{{unsubscribe_link}}" class="unsubscribe">Unsubscribe</a>
      </p>
      <p style="font-size: 12px; color: #999;">
        Infinite Runway · San Francisco, CA
      </p>
    </div>
  </div>
  <img src="{{tracking_pixel}}" alt="" class="tracking-pixel">
</body>
</html>`;
  }
  
  private generateSponsorSection(sponsor: any): string {
    return `
    <div class="sponsor-section">
      <p style="font-size: 12px; color: #666; margin-bottom: 10px;">TODAY'S SPONSOR</p>
      ${sponsor.logo ? `<img src="${sponsor.logo}" alt="${sponsor.name}" class="sponsor-logo">` : ''}
      <h3 style="margin-bottom: 10px;">${sponsor.name}</h3>
      <p>${sponsor.description}</p>
      ${sponsor.ctaLink ? `<a href="${sponsor.ctaLink}" class="cta-button">${sponsor.ctaText || 'Learn More'}</a>` : ''}
    </div>`;
  }
  
  private generateCompaniesRaisingSection(companies: CompanyRaising[]): string {
    const items = companies.map(company => `
      <div class="company-item">
        <h3 style="margin: 0 0 5px 0;">${company.name}</h3>
        <p style="margin: 5px 0;"><strong>${company.round}</strong> - ${company.amount}</p>
        <p style="margin: 5px 0; color: #666;">Investors: ${company.investors.join(', ')}</p>
        <p style="margin: 5px 0;">${company.description}</p>
        <a href="${company.link}" style="color: #2563eb;">Learn more →</a>
      </div>
    `).join('');
    
    return `
    <div class="company-list">
      <h2>💰 Companies Raising</h2>
      ${items}
    </div>`;
  }
  
  private generateCompaniesHiringSection(companies: CompanyHiring[]): string {
    const items = companies.map(company => `
      <div class="company-item">
        <h3 style="margin: 0 0 5px 0;">${company.name}</h3>
        <p style="margin: 5px 0;"><strong>Open Roles:</strong> ${company.roles.join(', ')}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${company.location}</p>
        ${company.stack ? `<p style="margin: 5px 0;"><strong>Stack:</strong> ${company.stack}</p>` : ''}
        <p style="margin: 5px 0;">${company.description}</p>
        <a href="${company.link}" style="color: #2563eb;">View jobs →</a>
      </div>
    `).join('');
    
    return `
    <div class="company-list">
      <h2>👥 Companies Hiring</h2>
      ${items}
    </div>`;
  }
  
  private generateTextEmail(newsletter: Newsletter): string {
    // Simple text version for email clients that don't support HTML
    return `${newsletter.title}

${newsletter.description}

Read the full newsletter: ${process.env.NEXT_PUBLIC_APP_URL}/essays/${newsletter.slug}

--
Infinite Runway
Unsubscribe: {{unsubscribe_link}}`;
  }
  
  private personalizeEmail(html: string, recipient: EmailRecipient, newsletterId: string): string {
    const unsubscribeLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?email=${encodeURIComponent(recipient.email)}&id=${recipient.id}`;
    const trackingPixel = `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open?newsletter=${newsletterId}&subscriber=${recipient.id}`;
    
    return html
      .replace(/{{subscriber_name}}/g, recipient.name || 'there')
      .replace(/{{unsubscribe_link}}/g, unsubscribeLink)
      .replace(/{{tracking_pixel}}/g, trackingPixel);
  }
  
  async sendTestEmail(newsletter: Newsletter, toEmail: string): Promise<boolean> {
    try {
      const template = this.generateEmailTemplate(newsletter);
      await this.resend.emails.send({
        from: `Infinite Runway <${this.fromEmail}>`,
        to: toEmail,
        subject: `[TEST] ${template.subject}`,
        html: template.html,
        text: template.text,
      });
      return true;
    } catch (error) {
      console.error('Test email error:', error);
      return false;
    }
  }
  
  async addToAudience(email: string, name?: string): Promise<boolean> {
    if (!this.audienceId) {
      console.warn('No RESEND_AUDIENCE_ID configured');
      return false;
    }
    
    try {
      await this.resend.contacts.create({
        email,
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
        audienceId: this.audienceId,
      });
      return true;
    } catch (error) {
      console.error('Add to audience error:', error);
      return false;
    }
  }
  
  async removeFromAudience(email: string): Promise<boolean> {
    if (!this.audienceId) {
      console.warn('No RESEND_AUDIENCE_ID configured');
      return false;
    }
    
    try {
      // Resend doesn't have a direct remove API, so we'll update the contact as unsubscribed
      await this.resend.contacts.update({
        email,
        audienceId: this.audienceId,
        unsubscribed: true,
      });
      return true;
    } catch (error) {
      console.error('Remove from audience error:', error);
      return false;
    }
  }
  
  async testConnection(): Promise<boolean> {
    try {
      // Try to get domains to test API connection
      await this.resend.domains.list();
      return true;
    } catch (error) {
      console.error('Resend connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const resendService = new ResendService();