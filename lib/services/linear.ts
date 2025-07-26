import { LinearClient } from '@linear/sdk';
import { 
  LinearTask,
  Newsletter,
  NewsletterType,
  NewsletterAnalytics,
  SystemHealth
} from '@/lib/types/newsletter.types';

export interface LinearTaskUpdate {
  taskId: string;
  status?: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';
  description?: string;
  comment?: string;
}

export interface LinearProject {
  id: string;
  name: string;
}

export interface NewsletterTaskData {
  newsletterId: string;
  title: string;
  type: NewsletterType;
  scheduledDate: Date;
  metrics?: {
    articlesScraped?: number;
    wordCount?: number;
    generationTime?: number;
    subscriberCount?: number;
  };
}

export class LinearService {
  private client: LinearClient;
  private teamId: string;
  private projectId: string;
  private initialized: boolean = false;
  
  constructor() {
    const apiKey = process.env.LINEAR_API_KEY;
    this.teamId = process.env.LINEAR_TEAM_ID || '';
    this.projectId = process.env.LINEAR_PROJECT_ID || '';
    
    if (!apiKey) {
      console.warn('No LINEAR_API_KEY configured');
      this.client = {} as LinearClient; // Placeholder
      return;
    }
    
    this.client = new LinearClient({ apiKey });
    this.initialized = true;
  }
  
  async createNewsletterTask(data: NewsletterTaskData): Promise<string | null> {
    if (!this.initialized) return null;
    
    try {
      const task: LinearTask = {
        title: `Newsletter #${data.scheduledDate.toISOString().split('T')[0]} - ${data.title}`,
        description: this.formatNewsletterDescription(data),
        status: 'backlog',
        priority: 2, // Normal priority
        labels: ['automated', 'newsletter', data.type],
        projectId: this.projectId,
        dueDate: data.scheduledDate,
        metadata: {
          newsletterId: data.newsletterId,
          type: data.type,
        },
      };
      
      const issue = await this.client.createIssue({
        teamId: this.teamId,
        projectId: this.projectId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate?.toISOString(),
        labelIds: await this.getOrCreateLabels(task.labels),
      });
      
      // Create sub-issues for the newsletter workflow
      await this.createSubTasks(issue.id, data.scheduledDate);
      
      return issue.id;
    } catch (error) {
      console.error('Error creating Linear task:', error);
      return null;
    }
  }
  
  private async createSubTasks(parentId: string, scheduledDate: Date): Promise<void> {
    const subtasks = [
      { title: 'Content Scraping', order: 1 },
      { title: 'AI Content Generation', order: 2 },
      { title: 'Image Generation', order: 3 },
      { title: 'Sponsor Integration', order: 4 },
      { title: 'Publishing to Website', order: 5 },
      { title: 'Email Distribution', order: 6 },
      { title: 'Analytics Collection', order: 7 },
      { title: 'Sponsor Reports', order: 8 },
    ];
    
    for (const subtask of subtasks) {
      try {
        await this.client.createIssue({
          teamId: this.teamId,
          projectId: this.projectId,
          title: subtask.title,
          parentId: parentId,
          sortOrder: subtask.order,
        });
      } catch (error) {
        console.error(`Error creating subtask ${subtask.title}:`, error);
      }
    }
  }
  
  async updateTaskStatus(update: LinearTaskUpdate): Promise<boolean> {
    if (!this.initialized) return false;
    
    try {
      const issue = await this.client.issue(update.taskId);
      
      const updateData: any = {};
      
      if (update.status) {
        const stateMap = {
          'backlog': 'Backlog',
          'todo': 'To Do',
          'in_progress': 'In Progress',
          'done': 'Done',
          'canceled': 'Canceled',
        };
        
        const states = await this.client.workflowStates({
          filter: { team: { id: { eq: this.teamId } } }
        });
        
        const targetState = states.nodes.find(s => s.name === stateMap[update.status!]);
        if (targetState) {
          updateData.stateId = targetState.id;
        }
      }
      
      if (update.description) {
        updateData.description = update.description;
      }
      
      await issue.update(updateData);
      
      if (update.comment) {
        await this.client.createComment({
          issueId: update.taskId,
          body: update.comment,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating Linear task:', error);
      return false;
    }
  }
  
  async createAnalyticsReport(
    newsletter: Newsletter,
    analytics: NewsletterAnalytics
  ): Promise<string | null> {
    if (!this.initialized) return null;
    
    try {
      const openRate = ((analytics.opens / analytics.sent) * 100).toFixed(1);
      const clickRate = ((analytics.clicks / analytics.opens) * 100).toFixed(1);
      
      const issue = await this.client.createIssue({
        teamId: this.teamId,
        projectId: this.projectId,
        title: `Analytics Report - ${newsletter.title}`,
        description: `
📊 **Performance Metrics**

**Email Performance:**
• Sent: ${analytics.sent} subscribers
• Delivered: ${analytics.delivered} (${((analytics.delivered / analytics.sent) * 100).toFixed(1)}%)
• Opens: ${analytics.opens} (${openRate}%)
• Clicks: ${analytics.clicks} (${clickRate}%)
• Unsubscribes: ${analytics.unsubscribes}

**Content Metrics:**
• Newsletter Type: ${newsletter.type}
• Published: ${newsletter.publishDate.toLocaleDateString()}
• Generation Time: ${newsletter.metadata?.generationTime || 'N/A'} seconds

**Sponsor Performance:**
${this.formatSponsorClicks(analytics.sponsorClicks)}

**Recommendations:**
${this.generateRecommendations(analytics)}
        `,
        priority: 3, // Low priority
        labelIds: await this.getOrCreateLabels(['analytics', 'automated', 'report']),
      });
      
      return issue.id;
    } catch (error) {
      console.error('Error creating analytics report:', error);
      return null;
    }
  }
  
  async createHealthCheckIssue(health: SystemHealth): Promise<string | null> {
    if (!this.initialized || health.status === 'healthy') return null;
    
    try {
      const priority = health.status === 'down' ? 1 : 2; // Urgent if down, normal if degraded
      
      const issue = await this.client.createIssue({
        teamId: this.teamId,
        projectId: this.projectId,
        title: `System Health Alert: ${health.status.toUpperCase()}`,
        description: `
🏥 **System Health Check**

**Status:** ${health.status}
**Checked at:** ${health.lastChecked.toLocaleString()}

**Service Status:**
${this.formatServiceStatus(health.services)}

**Metrics:**
• API Quotas: ${JSON.stringify(health.metrics.apiQuotaRemaining)}
• Error Rate: ${health.metrics.errorRate.toFixed(2)}%
• Avg Generation Time: ${health.metrics.avgGenerationTime} seconds
• Uptime: ${health.metrics.uptime.toFixed(2)}%

**Action Required:** ${health.status === 'down' ? 'Immediate intervention needed!' : 'Monitor closely'}
        `,
        priority: priority,
        labelIds: await this.getOrCreateLabels(['health', 'automated', health.status]),
      });
      
      return issue.id;
    } catch (error) {
      console.error('Error creating health check issue:', error);
      return null;
    }
  }
  
  private formatNewsletterDescription(data: NewsletterTaskData): string {
    return `
**Newsletter Production Task**

**Type:** ${data.type}
**Scheduled Date:** ${data.scheduledDate.toLocaleDateString()}
**Newsletter ID:** ${data.newsletterId}

**Current Metrics:**
${data.metrics ? this.formatMetrics(data.metrics) : 'Pending...'}

**Workflow Steps:**
- [ ] Content Scraping
- [ ] AI Content Generation
- [ ] Image Generation
- [ ] Sponsor Integration
- [ ] Publishing to Website
- [ ] Email Distribution
- [ ] Analytics Collection
- [ ] Sponsor Reports

**Status Updates:**
_This task will be automatically updated as the newsletter progresses through each stage._
    `;
  }
  
  private formatMetrics(metrics: any): string {
    const lines = [];
    if (metrics.articlesScraped) lines.push(`• Articles Scraped: ${metrics.articlesScraped}`);
    if (metrics.wordCount) lines.push(`• Word Count: ${metrics.wordCount}`);
    if (metrics.generationTime) lines.push(`• Generation Time: ${metrics.generationTime}s`);
    if (metrics.subscriberCount) lines.push(`• Subscribers: ${metrics.subscriberCount}`);
    return lines.join('\n');
  }
  
  private formatSponsorClicks(sponsorClicks: Record<string, number>): string {
    if (!sponsorClicks || Object.keys(sponsorClicks).length === 0) {
      return '• No sponsor data available';
    }
    
    return Object.entries(sponsorClicks)
      .map(([sponsor, clicks]) => `• ${sponsor}: ${clicks} clicks`)
      .join('\n');
  }
  
  private formatServiceStatus(services: any): string {
    return Object.entries(services)
      .map(([name, status]: [string, any]) => {
        const emoji = status.status === 'up' ? '✅' : status.status === 'degraded' ? '⚠️' : '❌';
        return `${emoji} ${name}: ${status.status}${status.error ? ` (${status.error})` : ''}`;
      })
      .join('\n');
  }
  
  private generateRecommendations(analytics: NewsletterAnalytics): string {
    const recommendations = [];
    
    const openRate = (analytics.opens / analytics.sent) * 100;
    const clickRate = (analytics.clicks / analytics.opens) * 100;
    
    if (openRate < 20) {
      recommendations.push('• Consider A/B testing subject lines to improve open rates');
    }
    if (clickRate < 5) {
      recommendations.push('• Review content relevance and CTA placement');
    }
    if (analytics.unsubscribes > analytics.sent * 0.01) {
      recommendations.push('• High unsubscribe rate detected - survey readers for feedback');
    }
    
    return recommendations.length > 0 
      ? recommendations.join('\n') 
      : '• Performance is within expected ranges';
  }
  
  private async getOrCreateLabels(labelNames: string[]): Promise<string[]> {
    const labelIds: string[] = [];
    
    try {
      const existingLabels = await this.client.issueLabels({
        filter: { team: { id: { eq: this.teamId } } }
      });
      
      for (const name of labelNames) {
        let label = existingLabels.nodes.find(l => l.name === name);
        
        if (!label) {
          // Create the label if it doesn't exist
          label = await this.client.createIssueLabel({
            teamId: this.teamId,
            name: name,
            color: this.getLabelColor(name),
          });
        }
        
        if (label?.id) {
          labelIds.push(label.id);
        }
      }
    } catch (error) {
      console.error('Error managing labels:', error);
    }
    
    return labelIds;
  }
  
  private getLabelColor(labelName: string): string {
    const colors: Record<string, string> = {
      'automated': '#8B5CF6', // Purple
      'newsletter': '#3B82F6', // Blue
      'analytics': '#10B981', // Green
      'health': '#EF4444', // Red
      'report': '#F59E0B', // Yellow
      'weekly-digest': '#6366F1', // Indigo
      'innovation-report': '#14B8A6', // Teal
      'business-careers': '#F97316', // Orange
      'down': '#DC2626', // Red
      'degraded': '#F59E0B', // Yellow
    };
    
    return colors[labelName] || '#6B7280'; // Gray default
  }
  
  async searchTasks(query: string): Promise<any[]> {
    if (!this.initialized) return [];
    
    try {
      const issues = await this.client.issues({
        filter: {
          team: { id: { eq: this.teamId } },
          searchableContent: { contains: query },
        },
        first: 50,
      });
      
      return issues.nodes;
    } catch (error) {
      console.error('Error searching Linear tasks:', error);
      return [];
    }
  }
  
  async testConnection(): Promise<boolean> {
    if (!this.initialized) return false;
    
    try {
      const viewer = await this.client.viewer;
      return !!viewer;
    } catch (error) {
      console.error('Linear connection test failed:', error);
      return false;
    }
  }
  
  async getProjectInfo(): Promise<LinearProject | null> {
    if (!this.initialized) return null;
    
    try {
      const project = await this.client.project(this.projectId);
      return {
        id: project.id,
        name: project.name,
      };
    } catch (error) {
      console.error('Error getting project info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const linearService = new LinearService();