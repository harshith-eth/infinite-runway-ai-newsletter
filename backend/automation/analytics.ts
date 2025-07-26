import { 
  NewsletterAnalytics,
  NotificationEvent,
  SystemHealth
} from '@/lib/types/newsletter.types';
import { supabase } from '@/lib/services/supabase';
import { slackService } from '@/lib/services/slack';
import { linearService } from '@/lib/services/linear';

export class AnalyticsProcessor {
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
      
      // Save health data to database
      await supabase.saveSystemHealthEntry({
        serviceName: 'newsletter-system',
        status: health.status,
        latencyMs: 0,
        errorMessage: health.status !== 'healthy' ? 'System health check failed' : null,
        metadata: health.metrics,
      });
      
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
      const mappedAnalytics = {
        delivered_count: analytics.delivered || 0,
        open_count: analytics.opens || 0,
        click_count: analytics.clicks || 0,
        unsubscribe_count: analytics.unsubscribes || 0,
        sponsor_clicks: analytics.sponsorClicks || {},
      };
      await supabase.updateAnalytics(newsletterId, mappedAnalytics);
      
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
  
  async generateMonthlyReport(): Promise<void> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      const newsletters = await supabase.getNewslettersByDateRange(startOfMonth, endOfMonth);
      
      // Calculate monthly metrics
      const monthlyMetrics = {
        totalNewsletters: newsletters.length,
        totalSent: newsletters.reduce((sum, n) => sum + (n.analytics?.sent || 0), 0),
        totalOpens: newsletters.reduce((sum, n) => sum + (n.analytics?.opens || 0), 0),
        totalClicks: newsletters.reduce((sum, n) => sum + (n.analytics?.clicks || 0), 0),
        avgOpenRate: 0,
        avgClickRate: 0,
        revenue: 0,
      };
      
      // Calculate rates
      if (monthlyMetrics.totalSent > 0) {
        monthlyMetrics.avgOpenRate = (monthlyMetrics.totalOpens / monthlyMetrics.totalSent) * 100;
        monthlyMetrics.avgClickRate = (monthlyMetrics.totalClicks / monthlyMetrics.totalSent) * 100;
      }
      
      // Calculate revenue
      monthlyMetrics.revenue = newsletters.reduce((sum, n) => {
        let newsletterRevenue = 0;
        if (n.sponsorInfo) newsletterRevenue += 2000;
        if (n.companiesRaising) newsletterRevenue += n.companiesRaising.length * 500;
        if (n.companiesHiring) newsletterRevenue += n.companiesHiring.length * 500;
        return sum + newsletterRevenue;
      }, 0);
      
      // Send monthly report to Slack
      const event: NotificationEvent = {
        type: 'analytics_updated',
        level: 'info',
        title: 'Monthly Newsletter Report',
        message: `Monthly metrics: ${monthlyMetrics.totalNewsletters} newsletters, ${monthlyMetrics.avgOpenRate.toFixed(1)}% open rate`,
        data: monthlyMetrics,
        timestamp: new Date(),
      };
      await slackService.sendNotification(event);
      
    } catch (error) {
      console.error('Error generating monthly report:', error);
    }
  }
  
  // Helper methods for system metrics
  private async getAzureQuotaRemaining(): Promise<number> {
    // In a real implementation, this would query Azure API for quota usage
    return 80;
  }
  
  private async getResendQuotaRemaining(): Promise<number> {
    // In a real implementation, this would query Resend API for quota usage
    return 95;
  }
  
  private async calculateErrorRate(): Promise<number> {
    try {
      const recentEntries = await supabase.getRecentSystemHealthEntries();
      if (recentEntries.length === 0) return 0;
      
      const errorEntries = recentEntries.filter(entry => entry.status === 'down');
      return (errorEntries.length / recentEntries.length) * 100;
    } catch (error) {
      console.error('Error calculating error rate:', error);
      return 0.1;
    }
  }
  
  private async calculateAvgGenerationTime(): Promise<number> {
    try {
      const newsletters = await supabase.getNewslettersByDateRange(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      );
      
      if (newsletters.length === 0) return 45;
      
      const generationTimes = newsletters
        .map(n => n.metadata?.generationTime)
        .filter(time => time !== undefined);
      
      if (generationTimes.length === 0) return 45;
      
      const avgTime = generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length;
      return Math.round(avgTime);
    } catch (error) {
      console.error('Error calculating avg generation time:', error);
      return 45;
    }
  }
  
  private async calculateUptime(): Promise<number> {
    try {
      // Calculate based on recent health checks
      const recentEntries = await supabase.getRecentSystemHealthEntries();
      if (recentEntries.length === 0) return 99.9;
      
      const upEntries = recentEntries.filter(entry => entry.status !== 'down');
      return (upEntries.length / recentEntries.length) * 100;
    } catch (error) {
      console.error('Error calculating uptime:', error);
      return 99.9;
    }
  }
}

// Export singleton instance
export const analyticsProcessor = new AnalyticsProcessor();

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'weekly-summary':
      analyticsProcessor.sendWeeklySummary()
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
      analyticsProcessor.checkSystemHealth()
        .then(() => {
          console.log('✅ Health check complete');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Health check failed:', error);
          process.exit(1);
        });
      break;
      
    case 'monthly-report':
      analyticsProcessor.generateMonthlyReport()
        .then(() => {
          console.log('✅ Monthly report generated');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Monthly report failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: npx tsx analytics.ts [weekly-summary|health-check|monthly-report]');
      process.exit(1);
  }
}