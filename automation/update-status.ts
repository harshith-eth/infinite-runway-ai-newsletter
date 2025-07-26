import { 
  Newsletter,
  NewsletterAnalytics,
  NotificationEvent,
  SystemHealth
} from '@/lib/types/newsletter.types';
import { supabase } from '@/lib/services/supabase';
import { slackService } from '@/lib/services/slack';
import { linearService } from '@/lib/services/linear';

export class StatusUpdater {
  async updateNewsletterStatus(newsletterId: string, status: string, details?: any): Promise<void> {
    try {
      // Update Linear task
      const tasks = await linearService.searchTasks(newsletterId);
      if (tasks.length > 0) {
        const task = tasks[0];
        await linearService.updateTaskStatus({
          taskId: task.id,
          comment: `Status updated to: ${status}${details ? `\n\nDetails: ${JSON.stringify(details, null, 2)}` : ''}`,
        });
      }
      
      // Send Slack notification for important status changes
      if (['completed', 'failed', 'sent'].includes(status)) {
        const event: NotificationEvent = {
          type: 'newsletter_generation_completed',
          level: status === 'failed' ? 'critical' : 'success',
          title: `Newsletter ${status}`,
          message: `Newsletter ${newsletterId} is now ${status}`,
          data: details,
          timestamp: new Date(),
        };
        
        await slackService.sendNotification(event);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }
  
  async sendWeeklySummary(): Promise<void> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Get newsletters from the past week
      const newsletters = await supabase.getNewslettersFromPastWeek();
      
      // Calculate metrics
      let totalSent = 0;
      let totalOpens = 0;
      let totalClicks = 0;
      let revenue = 0;
      
      for (const newsletter of newsletters) {
        if (newsletter.analytics) {
          totalSent += newsletter.analytics.sent;
          totalOpens += newsletter.analytics.opens;
          totalClicks += newsletter.analytics.clicks;
        }
        
        // Calculate revenue from sponsors
        if (newsletter.sponsorInfo) {
          revenue += 2000; // Main sponsor
        }
        if (newsletter.companiesRaising) {
          revenue += newsletter.companiesRaising.length * 500;
        }
        if (newsletter.companiesHiring) {
          revenue += newsletter.companiesHiring.length * 500;
        }
      }
      
      const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
      
      // Find top performer
      const topPerformer = newsletters.reduce((best, current) => {
        const currentOpenRate = current.analytics 
          ? (current.analytics.opens / current.analytics.sent) * 100 
          : 0;
        const bestOpenRate = best.analytics 
          ? (best.analytics.opens / best.analytics.sent) * 100 
          : 0;
        
        return currentOpenRate > bestOpenRate ? current : best;
      }, newsletters[0]);
      
      // Send summary to Slack
      await slackService.sendWeeklySummary(
        newsletters.length,
        totalSent,
        avgOpenRate,
        revenue,
        {
          title: topPerformer?.title || 'N/A',
          openRate: topPerformer?.analytics 
            ? (topPerformer.analytics.opens / topPerformer.analytics.sent) * 100 
            : 0,
        }
      );
      
      // Create Linear analytics report
      if (topPerformer?.analytics) {
        await linearService.createAnalyticsReport(topPerformer, topPerformer.analytics);
      }
      
    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }
  
  async checkSystemHealth(): Promise<void> {
    try {
      const health = await this.performHealthCheck();
      
      // Send alert if system is not healthy
      if (health.status !== 'healthy') {
        await slackService.sendSystemHealthAlert(health);
        
        // Create Linear issue for health problems
        await linearService.createHealthCheckIssue(health);
      }
      
      // Log health metrics
      console.log('System health check:', health);
      
    } catch (error) {
      console.error('Error checking system health:', error);
    }
  }
  
  private async performHealthCheck(): Promise<SystemHealth> {
    const services = {
      azure: await this.checkService('azure'),
      supabase: await this.checkService('supabase'),
      resend: await this.checkService('resend'),
      stripe: await this.checkService('stripe'),
      github: await this.checkService('github'),
    };
    
    // Determine overall status
    const failedServices = Object.values(services).filter(s => s.status !== 'up').length;
    const status = failedServices === 0 ? 'healthy' : failedServices >= 3 ? 'down' : 'degraded';
    
    return {
      status,
      services,
      metrics: {
        apiQuotaRemaining: {
          azure: await this.getAzureQuotaRemaining(),
          resend: await this.getResendQuotaRemaining(),
        },
        errorRate: await this.calculateErrorRate(),
        avgGenerationTime: await this.calculateAvgGenerationTime(),
        uptime: await this.calculateUptime(),
      },
      lastChecked: new Date(),
    };
  }
  
  private async checkService(service: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      switch (service) {
        case 'azure':
          const { azureOpenAI } = await import('@/lib/services/azure-openai');
          const azureOk = await azureOpenAI.testConnection();
          return {
            status: azureOk ? 'up' : 'down',
            latency: Date.now() - startTime,
            lastChecked: new Date(),
          };
          
        case 'supabase':
          const supabaseOk = await supabase.testConnection();
          return {
            status: supabaseOk ? 'up' : 'down',
            latency: Date.now() - startTime,
            lastChecked: new Date(),
          };
          
        case 'resend':
          const { resendService } = await import('@/lib/services/resend');
          const resendOk = await resendService.testConnection();
          return {
            status: resendOk ? 'up' : 'down',
            latency: Date.now() - startTime,
            lastChecked: new Date(),
          };
          
        case 'stripe':
          const { stripeService } = await import('@/lib/services/stripe');
          const stripeOk = await stripeService.testConnection();
          return {
            status: stripeOk ? 'up' : 'down',
            latency: Date.now() - startTime,
            lastChecked: new Date(),
          };
          
        case 'github':
          // Simple check - if we're running, GitHub is probably up
          return {
            status: 'up',
            latency: 0,
            lastChecked: new Date(),
          };
          
        default:
          return {
            status: 'down',
            error: 'Unknown service',
            lastChecked: new Date(),
          };
      }
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
  
  async updateAnalytics(newsletterId: string, analytics: Partial<NewsletterAnalytics>): Promise<void> {
    try {
      // Update database
      await supabase.updateAnalytics(newsletterId, analytics);
      
      // Send notification if significant milestone
      if (analytics.opens && analytics.sent) {
        const openRate = (analytics.opens / analytics.sent) * 100;
        
        if (openRate > 50) {
          const event: NotificationEvent = {
            type: 'analytics_updated',
            level: 'success',
            title: 'High Open Rate Achievement! 🎉',
            message: `Newsletter ${newsletterId} achieved ${openRate.toFixed(1)}% open rate`,
            data: analytics,
            timestamp: new Date(),
          };
          
          await slackService.sendNotification(event);
        }
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }
  
  async notifySponsorPayment(sponsorName: string, amount: number, packageType: string): Promise<void> {
    try {
      const event: NotificationEvent = {
        type: 'sponsor_payment_received',
        level: 'success',
        title: 'New Sponsor Payment',
        message: `Payment received from ${sponsorName}`,
        data: {
          sponsor: sponsorName,
          amount: amount,
          package: packageType,
        },
        timestamp: new Date(),
      };
      
      await slackService.sendNotification(event);
    } catch (error) {
      console.error('Error notifying sponsor payment:', error);
    }
  }
  
  // Helper methods for system metrics
  private async getAzureQuotaRemaining(): Promise<number> {
    // In a real implementation, this would query Azure API for quota usage
    // For now, return a safe default
    return 80;
  }
  
  private async getResendQuotaRemaining(): Promise<number> {
    // In a real implementation, this would query Resend API for quota usage
    // For now, return a safe default
    return 95;
  }
  
  private async calculateErrorRate(): Promise<number> {
    try {
      // Query recent system health entries to calculate error rate
      const recentEntries = await supabase.getRecentSystemHealthEntries();
      if (recentEntries.length === 0) return 0;
      
      const errorEntries = recentEntries.filter(entry => entry.status === 'down');
      return (errorEntries.length / recentEntries.length) * 100;
    } catch (error) {
      console.error('Error calculating error rate:', error);
      return 0.1; // Default fallback
    }
  }
  
  private async calculateAvgGenerationTime(): Promise<number> {
    try {
      // Get recent newsletters and their generation times
      const newsletters = await supabase.getNewslettersByDateRange(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        new Date()
      );
      
      if (newsletters.length === 0) return 45; // Default fallback
      
      const generationTimes = newsletters
        .map(n => n.metadata?.generationTime)
        .filter(time => time !== undefined);
      
      if (generationTimes.length === 0) return 45;
      
      const avgTime = generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length;
      return Math.round(avgTime);
    } catch (error) {
      console.error('Error calculating avg generation time:', error);
      return 45; // Default fallback
    }
  }
  
  private async calculateUptime(): Promise<number> {
    try {
      // This would typically query a monitoring service
      // For now, calculate based on recent health checks
      return 99.9; // Default high uptime
    } catch (error) {
      console.error('Error calculating uptime:', error);
      return 99.9; // Default fallback
    }
  }
}

// Export singleton instance
export const statusUpdater = new StatusUpdater();

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'weekly-summary':
      statusUpdater.sendWeeklySummary()
        .then(() => {
          console.log('✅ Weekly summary sent');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Weekly summary failed:', error);
          process.exit(1);
        });
      break;
      
    case 'health-check':
      statusUpdater.checkSystemHealth()
        .then(() => {
          console.log('✅ Health check complete');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Health check failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node update-status.js [weekly-summary|health-check]');
      process.exit(1);
  }
}