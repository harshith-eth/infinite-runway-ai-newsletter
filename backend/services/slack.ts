import { IncomingWebhook } from '@slack/webhook';
import { 
  NotificationEvent, 
  NotificationType,
  Newsletter,
  NewsletterAnalytics,
  SystemHealth
} from '@/lib/types/newsletter.types';

export interface SlackChannel {
  webhook: string;
  name: string;
  types: NotificationType[];
}

export interface SlackMessage {
  text: string;
  blocks?: any[];
  attachments?: any[];
  channel?: string;
  username?: string;
  icon_emoji?: string;
}

export class SlackService {
  private webhooks: Map<string, IncomingWebhook>;
  private channels: Map<string, SlackChannel>;
  
  constructor() {
    this.webhooks = new Map();
    this.channels = new Map();
    
    this.initializeChannels();
  }
  
  private initializeChannels() {
    const mainWebhook = process.env.SLACK_WEBHOOK_URL;
    
    if (!mainWebhook) {
      console.warn('No SLACK_WEBHOOK_URL configured');
      return;
    }
    
    // Initialize webhooks for different channels
    // In production, you might have different webhooks for different channels
    this.channels.set('alerts', {
      webhook: process.env.SLACK_ALERTS_WEBHOOK || mainWebhook,
      name: '#engine-alerts',
      types: [
        'newsletter_generation_failed',
        'email_send_failed',
        'system_error',
      ],
    });
    
    this.channels.set('status', {
      webhook: process.env.SLACK_STATUS_WEBHOOK || mainWebhook,
      name: '#engine-status',
      types: [
        'newsletter_generation_completed',
        'email_send_completed',
        'sponsor_payment_received',
      ],
    });
    
    this.channels.set('analytics', {
      webhook: process.env.SLACK_ANALYTICS_WEBHOOK || mainWebhook,
      name: '#engine-analytics',
      types: ['analytics_updated'],
    });
    
    // Initialize webhook instances
    this.channels.forEach((channel, key) => {
      this.webhooks.set(key, new IncomingWebhook(channel.webhook));
    });
  }
  
  async sendNotification(event: NotificationEvent): Promise<void> {
    try {
      const channel = this.getChannelForEvent(event.type);
      if (!channel) {
        console.warn(`No channel configured for event type: ${event.type}`);
        return;
      }
      
      const message = this.formatMessage(event);
      await this.send(channel, message);
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      // Don't throw - we don't want Slack failures to break the system
    }
  }
  
  private getChannelForEvent(type: NotificationType): string | null {
    for (const [key, channel] of this.channels) {
      if (channel.types.includes(type)) {
        return key;
      }
    }
    return null;
  }
  
  private async send(channelKey: string, message: SlackMessage): Promise<void> {
    const webhook = this.webhooks.get(channelKey);
    if (!webhook) {
      throw new Error(`No webhook configured for channel: ${channelKey}`);
    }
    
    await webhook.send(message);
  }
  
  private formatMessage(event: NotificationEvent): SlackMessage {
    const formatters: Record<NotificationType, () => SlackMessage> = {
      newsletter_generation_started: () => ({
        text: '🚀 Newsletter generation started',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Newsletter Generation Started*\n${event.message}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Started at: ${event.timestamp.toLocaleString()}`,
              },
            ],
          },
        ],
      }),
      
      newsletter_generation_completed: () => {
        const data = event.data as { newsletter: Newsletter; duration: number };
        return {
          text: '✅ Newsletter generation completed!',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '✅ Newsletter Generated Successfully',
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Title:*\n${data.newsletter.title}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Type:*\n${data.newsletter.type}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Generation Time:*\n${data.duration} seconds`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Status:*\n${data.newsletter.status}`,
                },
              ],
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'View Newsletter',
                  },
                  url: `${process.env.NEXT_PUBLIC_APP_URL}/essays/${data.newsletter.slug}`,
                },
              ],
            },
          ],
        };
      },
      
      newsletter_generation_failed: () => ({
        text: '🚨 Newsletter generation failed!',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 Newsletter Generation Failed',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error:* ${event.message}\n\n*Details:*\n\`\`\`${JSON.stringify(event.data, null, 2)}\`\`\``,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Action Required:* Manual intervention needed. Check logs for details.',
            },
          },
        ],
      }),
      
      email_send_started: () => ({
        text: '📧 Email distribution started',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Email Distribution Started*\n${event.message}`,
            },
          },
        ],
      }),
      
      email_send_completed: () => {
        const data = event.data as { sent: number; failed: number; duration: number };
        return {
          text: '📮 Email distribution completed!',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '📮 Newsletter Sent Successfully',
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Sent:*\n${data.sent} emails`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Failed:*\n${data.failed} emails`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Success Rate:*\n${((data.sent / (data.sent + data.failed)) * 100).toFixed(1)}%`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Duration:*\n${data.duration} seconds`,
                },
              ],
            },
          ],
        };
      },
      
      email_send_failed: () => ({
        text: '🚨 Email distribution failed!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🚨 *Email Distribution Failed*\n${event.message}`,
            },
          },
        ],
      }),
      
      sponsor_payment_received: () => {
        const data = event.data as { sponsor: string; amount: number; package: string };
        return {
          text: '💰 New sponsor payment received!',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `💰 *New Sponsor Payment*\n*Sponsor:* ${data.sponsor}\n*Package:* ${data.package}\n*Amount:* $${(data.amount / 100).toFixed(2)}`,
              },
            },
          ],
        };
      },
      
      system_error: () => ({
        text: '🚨 System error detected!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🚨 *System Error*\n${event.message}\n\n\`\`\`${JSON.stringify(event.data, null, 2)}\`\`\``,
            },
          },
        ],
      }),
      
      analytics_updated: () => {
        const data = event.data as NewsletterAnalytics;
        const openRate = ((data.opens / data.sent) * 100).toFixed(1);
        const clickRate = ((data.clicks / data.opens) * 100).toFixed(1);
        
        return {
          text: `📊 Analytics Update: ${openRate}% open rate, ${clickRate}% CTR`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `📊 *Newsletter Analytics Update*`,
              },
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Sent:* ${data.sent}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Delivered:* ${data.delivered}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Opens:* ${data.opens} (${openRate}%)`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Clicks:* ${data.clicks} (${clickRate}%)`,
                },
              ],
            },
          ],
        };
      },
    };
    
    const formatter = formatters[event.type];
    if (!formatter) {
      return {
        text: event.message,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${event.type}*\n${event.message}`,
            },
          },
        ],
      };
    }
    
    return formatter();
  }
  
  async sendWeeklySummary(
    newsletters: number,
    totalSent: number,
    avgOpenRate: number,
    revenue: number,
    topPerformer: { title: string; openRate: number }
  ): Promise<void> {
    const message: SlackMessage = {
      text: '📊 Weekly Newsletter Summary',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Weekly Newsletter Performance',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Newsletters Sent:*\n${newsletters}`,
            },
            {
              type: 'mrkdwn',
              text: `*Total Recipients:*\n${totalSent.toLocaleString()}`,
            },
            {
              type: 'mrkdwn',
              text: `*Avg Open Rate:*\n${avgOpenRate.toFixed(1)}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Revenue Generated:*\n$${revenue.toLocaleString()}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Top Performer:*\n"${topPerformer.title}" - ${topPerformer.openRate.toFixed(1)}% open rate`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Generated at ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
    };
    
    await this.send('analytics', message);
  }
  
  async sendSystemHealthAlert(health: SystemHealth): Promise<void> {
    if (health.status === 'healthy') return;
    
    const statusEmoji = health.status === 'degraded' ? '⚠️' : '🚨';
    const failedServices = Object.entries(health.services)
      .filter(([_, status]) => status.status !== 'up')
      .map(([name, status]) => `• ${name}: ${status.status} ${status.error || ''}`);
    
    const message: SlackMessage = {
      text: `${statusEmoji} System health: ${health.status}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${statusEmoji} *System Health Alert*\nStatus: *${health.status}*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Failed Services:*\n${failedServices.join('\n')}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Error Rate:*\n${health.metrics.errorRate.toFixed(2)}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Uptime:*\n${health.metrics.uptime.toFixed(2)}%`,
            },
          ],
        },
      ],
    };
    
    await this.send('alerts', message);
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const testMessage: SlackMessage = {
        text: '🧪 Slack integration test',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '✅ Slack integration is working correctly!',
            },
          },
        ],
      };
      
      // Test the main webhook
      if (this.webhooks.size > 0) {
        const firstWebhook = this.webhooks.values().next().value;
        await firstWebhook.send(testMessage);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Slack connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const slackService = new SlackService();