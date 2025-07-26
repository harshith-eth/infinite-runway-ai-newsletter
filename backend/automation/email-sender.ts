import { 
  Newsletter,
  EmailSendRequest,
  NotificationEvent
} from '@/lib/types/newsletter.types';
import { supabase } from '@/lib/services/supabase';
import { resendService } from '@/lib/services/resend';
import { slackService } from '@/lib/services/slack';
import { linearService } from '@/lib/services/linear';

interface SendOptions {
  newsletterId?: string;
  testMode?: boolean;
  testEmail?: string;
}

export class EmailSender {
  async sendNewsletter(options: SendOptions): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 1. Get the newsletter
      const newsletter = await this.getNewsletter(options.newsletterId);
      if (!newsletter) {
        throw new Error('Newsletter not found');
      }
      
      console.log(`Preparing to send newsletter: ${newsletter.title}`);
      
      // 2. Check if already sent
      if (newsletter.status === 'sent' && !options.testMode) {
        console.log('Newsletter already sent, skipping...');
        return;
      }
      
      // 3. Notify start
      await this.notifyStart(newsletter, options.testMode || false);
      
      // 4. Get subscribers
      const subscribers = options.testMode 
        ? [{ 
            id: 'test', 
            email: options.testEmail || process.env.ADMIN_EMAIL || 'test@example.com',
            subscribedAt: new Date(),
            status: 'active' as const
          }]
        : await supabase.getActiveSubscribers();
      
      console.log(`Sending to ${subscribers.length} subscribers${options.testMode ? ' (test mode)' : ''}`);
      
      // 5. Create email send request
      const emailRequest: EmailSendRequest = {
        newsletter,
        recipients: subscribers,
        testMode: options.testMode,
      };
      
      // 6. Send emails
      const result = await resendService.sendNewsletter(emailRequest);
      
      console.log(`Email send complete: ${result.sent} sent, ${result.failed} failed`);
      
      // 7. Update newsletter status
      if (!options.testMode) {
        await supabase.updateNewsletterStatus(newsletter.id, 'sent');
        
        // 8. Create analytics entry
        await supabase.createAnalyticsEntry(newsletter.id, result.sent);
      }
      
      // 9. Update Linear task
      await this.updateLinearTask(newsletter, result.sent, result.failed);
      
      // 10. Notify completion
      await this.notifyCompletion(newsletter, result, Date.now() - startTime);
      
      // 11. Log any errors
      if (result.errors.length > 0) {
        console.error('Email send errors:', result.errors);
      }
      
    } catch (error) {
      console.error('Email send failed:', error);
      await this.notifyFailure(error);
      throw error;
    }
  }
  
  private async getNewsletter(newsletterId?: string): Promise<Newsletter | null> {
    if (newsletterId) {
      // Get specific newsletter by ID
      return await supabase.getNewsletterBySlug(newsletterId);
    }
    
    // Get the latest unsent newsletter
    const latestNewsletter = await this.getLatestUnsentNewsletter();
    return latestNewsletter;
  }
  
  private async getLatestUnsentNewsletter(): Promise<Newsletter | null> {
    // Query for newsletters with status 'published' but not 'sent'
    const today = new Date();
    const type = this.getNewsletterTypeForDay(today);
    const slug = `${type}-${today.toISOString().split('T')[0]}`;
    
    return await supabase.getNewsletterBySlug(slug);
  }
  
  private getNewsletterTypeForDay(date: Date): string {
    const day = date.getDay();
    
    switch (day) {
      case 1: // Monday
        return 'weekly-digest';
      case 3: // Wednesday
        return 'innovation-report';
      case 5: // Friday
        return 'business-careers';
      default:
        return 'weekly-digest'; // Default fallback
    }
  }
  
  private async updateLinearTask(newsletter: Newsletter, sent: number, failed: number): Promise<void> {
    try {
      // Find the Linear task for this newsletter
      const tasks = await linearService.searchTasks(newsletter.id);
      if (tasks.length > 0) {
        const task = tasks[0];
        await linearService.updateTaskStatus({
          taskId: task.id,
          comment: `Email distribution complete: ${sent} sent, ${failed} failed`,
        });
      }
    } catch (error) {
      console.error('Error updating Linear task:', error);
    }
  }
  
  private async notifyStart(newsletter: Newsletter, testMode: boolean): Promise<void> {
    const event: NotificationEvent = {
      type: 'email_send_started',
      level: 'info',
      title: 'Email Distribution Started',
      message: `Starting email distribution for ${newsletter.title}${testMode ? ' (test mode)' : ''}`,
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  private async notifyCompletion(
    newsletter: Newsletter, 
    result: any, 
    duration: number
  ): Promise<void> {
    const event: NotificationEvent = {
      type: 'email_send_completed',
      level: 'success',
      title: 'Email Distribution Complete',
      message: `Successfully sent ${newsletter.title}`,
      data: {
        sent: result.sent,
        failed: result.failed,
        duration: duration / 1000,
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  private async notifyFailure(error: any): Promise<void> {
    const event: NotificationEvent = {
      type: 'email_send_failed',
      level: 'critical',
      title: 'Email Distribution Failed',
      message: 'Failed to send newsletter emails',
      data: {
        error: error.message || error,
        stack: error.stack,
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(event);
  }
  
  // Utility method to send test email
  async sendTestEmail(newsletterId: string, email: string): Promise<boolean> {
    try {
      const newsletter = await supabase.getNewsletterBySlug(newsletterId);
      if (!newsletter) {
        throw new Error('Newsletter not found');
      }
      
      return await resendService.sendTestEmail(newsletter, email);
    } catch (error) {
      console.error('Test email failed:', error);
      return false;
    }
  }
  
  // Method to retry failed emails
  async retryFailedEmails(newsletterId: string, failedEmails: string[]): Promise<void> {
    try {
      const newsletter = await supabase.getNewsletterBySlug(newsletterId);
      if (!newsletter) {
        throw new Error('Newsletter not found');
      }
      
      // Get subscriber objects for failed emails
      const subscribers = await supabase.getActiveSubscribers();
      const failedSubscribers = subscribers.filter(s => failedEmails.includes(s.email));
      
      if (failedSubscribers.length === 0) {
        console.log('No matching subscribers found for retry');
        return;
      }
      
      const emailRequest: EmailSendRequest = {
        newsletter,
        recipients: failedSubscribers,
        testMode: false,
      };
      
      const result = await resendService.sendNewsletter(emailRequest);
      console.log(`Retry complete: ${result.sent} sent, ${result.failed} failed`);
      
    } catch (error) {
      console.error('Retry failed:', error);
      throw error;
    }
  }
  
  // Method to get email statistics
  async getEmailStats(newsletterId: string): Promise<any> {
    try {
      // Query analytics data from database
      const analytics = await supabase.getAnalyticsByNewsletterSlug(newsletterId);
      
      if (!analytics) {
        return {
          sent: 0,
          delivered: 0,
          opens: 0,
          clicks: 0,
          unsubscribes: 0,
          bounces: 0,
        };
      }
      
      return {
        sent: analytics.sent || 0,
        delivered: analytics.delivered || 0,
        opens: analytics.opens || 0,
        clicks: analytics.clicks || 0,
        unsubscribes: analytics.unsubscribes || 0,
        bounces: analytics.bounces || 0,
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      return null;
    }
  }
  
  // Batch send functionality for large subscriber lists
  async sendNewsletterBatch(newsletter: Newsletter, subscribers: any[], batchSize: number = 1000): Promise<void> {
    const totalSubscribers = subscribers.length;
    let processed = 0;
    
    for (let i = 0; i < totalSubscribers; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalSubscribers / batchSize)}`);
      
      const emailRequest: EmailSendRequest = {
        newsletter,
        recipients: batch,
        testMode: false,
      };
      
      const result = await resendService.sendNewsletter(emailRequest);
      processed += result.sent;
      
      console.log(`Batch complete: ${result.sent} sent, ${result.failed} failed`);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < totalSubscribers) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Total batch processing complete: ${processed} emails sent`);
  }
}

// Export singleton instance
export const emailSender = new EmailSender();

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const newsletterId = args[0];
  const testMode = args.includes('--test');
  const testEmail = args.find(arg => arg.startsWith('--email='))?.split('=')[1];
  
  const options: SendOptions = {
    newsletterId,
    testMode,
    testEmail,
  };
  
  emailSender.sendNewsletter(options)
    .then(() => {
      console.log('✅ Email send complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Email send failed:', error);
      process.exit(1);
    });
}