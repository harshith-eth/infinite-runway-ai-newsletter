import { 
  Newsletter,
  SponsorInfo,
  CompanyRaising,
  CompanyHiring,
  NotificationEvent
} from '@/lib/types/newsletter.types';
import { supabase } from '@/lib/services/supabase';
import { stripeService } from '@/lib/services/stripe';
import { slackService } from '@/lib/services/slack';
import { linearService } from '@/lib/services/linear';
import { resendService } from '@/lib/services/resend';

interface SponsorshipSlot {
  id: string;
  type: 'main' | 'companies_raising' | 'companies_hiring';
  position: number;
  date: Date;
  newsletterType: string;
  available: boolean;
  sponsor?: SponsorInfo;
}

interface SponsorReport {
  sponsorId: string;
  sponsorName: string;
  period: string;
  totalNewsletters: number;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalRevenue: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

export class SponsorManager {
  
  // Get available sponsorship slots for a specific period
  async getAvailableSlots(startDate: Date, endDate: Date): Promise<SponsorshipSlot[]> {
    try {
      // Query database for available sponsorship slots
      const slots = await supabase.getAvailableSponsorsForDate(startDate, endDate);
      
      return slots.map(slot => ({
        id: slot.id,
        type: slot.type,
        position: slot.position,
        date: slot.date,
        newsletterType: slot.newsletterType,
        available: slot.available,
        sponsor: slot.sponsor
      }));
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }
  
  // Create new sponsorship package
  async createSponsorshipPackage(
    sponsorData: {
      name: string;
      email: string;
      company: string;
      packageType: 'main' | 'companies_raising' | 'companies_hiring';
      newsletterTypes: string[];
      duration: number; // weeks
      startDate: Date;
      customContent?: any;
    }
  ): Promise<string | null> {
    try {
      // Create Stripe checkout session
      const checkoutSession = await stripeService.createCheckoutSession({
        customerEmail: sponsorData.email,
        packageType: sponsorData.packageType,
        duration: sponsorData.duration,
        metadata: {
          company_name: sponsorData.company,
          newsletter_types: sponsorData.newsletterTypes.join(','),
          start_date: sponsorData.startDate.toISOString(),
          custom_content: JSON.stringify(sponsorData.customContent || {})
        }
      });
      
      // Notify team about new sponsorship inquiry
      await this.notifyNewSponsorshipInquiry(sponsorData);
      
      return checkoutSession.url;
    } catch (error) {
      console.error('Error creating sponsorship package:', error);
      return null;
    }
  }
  
  // Process sponsor content for newsletter insertion
  async insertSponsorContent(newsletter: Newsletter): Promise<Newsletter> {
    try {
      const sponsors = await supabase.getActiveSponsorsForDate(newsletter.publishDate, newsletter.type);
      
      let updatedContent = newsletter.content;
      
      // Insert main sponsor content
      if (sponsors.mainSponsor) {
        updatedContent = this.insertMainSponsorContent(updatedContent, sponsors.mainSponsor);
      }
      
      // Insert companies raising content
      if (sponsors.companiesRaising && sponsors.companiesRaising.length > 0) {
        updatedContent = this.insertCompaniesRaisingContent(updatedContent, sponsors.companiesRaising);
      }
      
      // Insert companies hiring content
      if (sponsors.companiesHiring && sponsors.companiesHiring.length > 0) {
        updatedContent = this.insertCompaniesHiringContent(updatedContent, sponsors.companiesHiring);
      }
      
      return {
        ...newsletter,
        content: updatedContent,
        sponsorInfo: sponsors.mainSponsor,
        companiesRaising: sponsors.companiesRaising,
        companiesHiring: sponsors.companiesHiring
      };
    } catch (error) {
      console.error('Error inserting sponsor content:', error);
      return newsletter;
    }
  }
  
  // Generate sponsor performance report
  async generateSponsorReport(sponsorId: string, period: 'weekly' | 'monthly' | 'quarterly'): Promise<SponsorReport | null> {
    try {
      const sponsor = await supabase.getSponsorById(sponsorId);
      if (!sponsor) return null;
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
      }
      
      const newsletters = await supabase.getNewslettersWithSponsor(sponsorId, startDate, endDate);
      
      let totalSent = 0;
      let totalOpens = 0;
      let totalClicks = 0;
      
      newsletters.forEach(newsletter => {
        if (newsletter.analytics) {
          totalSent += newsletter.analytics.sent;
          totalOpens += newsletter.analytics.opens;
          totalClicks += newsletter.analytics.clicks;
        }
      });
      
      const averageOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
      const averageClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
      
      // Determine performance rating
      let performance: 'excellent' | 'good' | 'average' | 'poor' = 'poor';
      if (averageOpenRate > 30) performance = 'excellent';
      else if (averageOpenRate > 25) performance = 'good';
      else if (averageOpenRate > 20) performance = 'average';
      
      const report: SponsorReport = {
        sponsorId,
        sponsorName: sponsor.name,
        period: `${period} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
        totalNewsletters: newsletters.length,
        totalSent,
        totalOpens,
        totalClicks,
        averageOpenRate: Math.round(averageOpenRate * 100) / 100,
        averageClickRate: Math.round(averageClickRate * 100) / 100,
        totalRevenue: sponsor.amount * newsletters.length,
        performance
      };
      
      return report;
    } catch (error) {
      console.error('Error generating sponsor report:', error);
      return null;
    }
  }
  
  // Send weekly sponsor reports
  async sendWeeklySponsorReports(): Promise<void> {
    try {
      const activeSponsors = await supabase.getActiveSponsors();
      
      for (const sponsor of activeSponsors) {
        const report = await this.generateSponsorReport(sponsor.id, 'weekly');
        if (report) {
          await this.sendSponsorReport(sponsor.email, report);
        }
      }
      
      // Notify team about reports sent
      await this.notifyReportsSent(activeSponsors.length);
    } catch (error) {
      console.error('Error sending weekly sponsor reports:', error);
    }
  }
  
  // Process sponsor payment completion
  async processSponsorPayment(stripeSessionId: string): Promise<void> {
    try {
      // This would be called from the Stripe webhook handler
      const session = await stripeService.getCheckoutSession(stripeSessionId);
      
      if (session.payment_status === 'paid') {
        // Activate sponsorship
        await supabase.activateSponsorship(session.metadata.sponsor_id);
        
        // Create Linear task for sponsor onboarding
        await linearService.createSponsorOnboardingTask({
          sponsorName: session.metadata.company_name,
          packageType: session.metadata.package_type,
          startDate: new Date(session.metadata.start_date)
        });
        
        // Send welcome email to sponsor
        await this.sendSponsorWelcomeEmail(session.customer_details.email, session.metadata);
        
        // Notify team
        await this.notifyNewSponsorActivated(session.metadata);
      }
    } catch (error) {
      console.error('Error processing sponsor payment:', error);
    }
  }
  
  // Private helper methods
  private insertMainSponsorContent(content: string, sponsor: SponsorInfo): string {
    const sponsorHTML = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <img src="${sponsor.logo}" alt="${sponsor.name}" style="width: 60px; height: 60px; margin-right: 15px;">
          <div>
            <h3 style="margin: 0; color: #1a202c;">Sponsored by ${sponsor.name}</h3>
            <p style="margin: 5px 0 0 0; color: #718096; font-size: 14px;">Our partner this week</p>
          </div>
        </div>
        <p style="margin: 0 0 15px 0; line-height: 1.6;">${sponsor.description}</p>
        <a href="${sponsor.ctaLink}" style="display: inline-block; background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          ${sponsor.ctaText || 'Learn More'}
        </a>
      </div>
    `;
    
    // Insert after the first paragraph
    const firstParagraphEnd = content.indexOf('</p>');
    if (firstParagraphEnd !== -1) {
      return content.slice(0, firstParagraphEnd + 4) + sponsorHTML + content.slice(firstParagraphEnd + 4);
    }
    
    return content + sponsorHTML;
  }
  
  private insertCompaniesRaisingContent(content: string, companies: CompanyRaising[]): string {
    const companiesHTML = companies.map(company => `
      <div style="border-bottom: 1px solid #e2e8f0; padding: 15px 0; last-child:border-bottom: none;">
        <h4 style="margin: 0 0 8px 0; color: #2d3748;">${company.name}</h4>
        <p style="margin: 0 0 5px 0; color: #4a5568;"><strong>${company.round}</strong> • ${company.amount}</p>
        <p style="margin: 0 0 5px 0; color: #718096; font-size: 14px;">Investors: ${company.investors.join(', ')}</p>
        <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px;">${company.description}</p>
        <a href="${company.link}" style="color: #3182ce; text-decoration: none; font-size: 14px;">Learn more →</a>
      </div>
    `).join('');
    
    const section = `
      <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="margin: 0 0 20px 0; color: #2d3748; display: flex; align-items: center;">
          💰 Companies Raising
        </h3>
        ${companiesHTML}
      </div>
    `;
    
    return content + section;
  }
  
  private insertCompaniesHiringContent(content: string, companies: CompanyHiring[]): string {
    const companiesHTML = companies.map(company => `
      <div style="border-bottom: 1px solid #e2e8f0; padding: 15px 0; last-child:border-bottom: none;">
        <h4 style="margin: 0 0 8px 0; color: #2d3748;">${company.name}</h4>
        <p style="margin: 0 0 5px 0; color: #4a5568;"><strong>Open Roles:</strong> ${company.roles.join(', ')}</p>
        <p style="margin: 0 0 5px 0; color: #4a5568;"><strong>Location:</strong> ${company.location}</p>
        ${company.stack ? `<p style="margin: 0 0 5px 0; color: #718096; font-size: 14px;"><strong>Stack:</strong> ${company.stack}</p>` : ''}
        <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px;">${company.description}</p>
        <a href="${company.link}" style="color: #3182ce; text-decoration: none; font-size: 14px;">View jobs →</a>
      </div>
    `).join('');
    
    const section = `
      <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h3 style="margin: 0 0 20px 0; color: #2d3748; display: flex; align-items: center;">
          👥 Companies Hiring
        </h3>
        ${companiesHTML}
      </div>
    `;
    
    return content + section;
  }
  
  private async notifyNewSponsorshipInquiry(sponsorData: any): Promise<void> {
    const event: NotificationEvent = {
      type: 'sponsor_inquiry',
      level: 'info',
      title: 'New Sponsorship Inquiry',
      message: `${sponsorData.company} inquired about ${sponsorData.packageType} sponsorship`,
      data: sponsorData,
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  private async notifyNewSponsorActivated(metadata: any): Promise<void> {
    const event: NotificationEvent = {
      type: 'sponsor_activated',
      level: 'success',
      title: 'New Sponsor Activated',
      message: `${metadata.company_name} has been activated as a sponsor`,
      data: metadata,
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  private async notifyReportsSent(count: number): Promise<void> {
    const event: NotificationEvent = {
      type: 'sponsor_reports_sent',
      level: 'info',
      title: 'Weekly Sponsor Reports Sent',
      message: `Sent weekly performance reports to ${count} sponsors`,
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  private async sendSponsorReport(email: string, report: SponsorReport): Promise<void> {
    // This would send an email with the sponsor report
    // Implementation would depend on your email template system
    console.log(`Sending report to ${email}:`, report);
  }
  
  private async sendSponsorWelcomeEmail(email: string, metadata: any): Promise<void> {
    // This would send a welcome email to the new sponsor
    console.log(`Sending welcome email to ${email}:`, metadata);
  }
}

// Export singleton instance
export const sponsorManager = new SponsorManager();

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  const sponsorId = process.argv[3];
  
  switch (command) {
    case 'weekly-reports':
      sponsorManager.sendWeeklySponsorReports()
        .then(() => {
          console.log('✅ Weekly sponsor reports sent');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Failed to send weekly reports:', error);
          process.exit(1);
        });
      break;
      
    case 'report':
      if (!sponsorId) {
        console.error('❌ Sponsor ID required');
        process.exit(1);
      }
      sponsorManager.generateSponsorReport(sponsorId, 'weekly')
        .then(report => {
          if (report) {
            console.log('📊 Sponsor Report:');
            console.log(JSON.stringify(report, null, 2));
          } else {
            console.log('❌ Could not generate report');
          }
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Failed to generate report:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: npx tsx sponsor-manager.ts [weekly-reports|report <sponsor-id>]');
      process.exit(1);
  }
}