import Stripe from 'stripe';
import { 
  SponsorInfo,
  NewsletterType,
  CompanyRaising,
  CompanyHiring
} from '@/lib/types/newsletter.types';

export interface SponsorPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'main' | 'company-raising' | 'company-hiring';
  duration: 'single' | 'weekly' | 'monthly';
  features: string[];
}

export interface CheckoutSessionData {
  sponsorName: string;
  companyName: string;
  email: string;
  packageType: 'main' | 'company-raising' | 'company-hiring';
  newsletterDate: string;
  newsletterType: NewsletterType;
  customCopy?: string;
  logoUrl?: string;
  additionalInfo?: Record<string, any>;
}

export interface SponsorPayment {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: Stripe.PaymentIntent.Status;
  metadata: CheckoutSessionData;
}

export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;
  
  // Pricing in cents
  private readonly PRICES = {
    main: {
      single: 200000, // $2,000
      weekly: 700000, // $7,000 (discounted from $8,000)
      monthly: 2400000, // $24,000 (discounted from $32,000)
    },
    'company-raising': {
      single: 50000, // $500
      weekly: 175000, // $1,750 (discounted from $2,000)
      monthly: 600000, // $6,000 (discounted from $8,000)
    },
    'company-hiring': {
      single: 50000, // $500
      weekly: 175000, // $1,750 (discounted from $2,000)
      monthly: 600000, // $6,000 (discounted from $8,000)
    },
  };
  
  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  
  async createCheckoutSession(data: CheckoutSessionData): Promise<string> {
    try {
      const price = this.PRICES[data.packageType].single;
      const productName = this.getProductName(data.packageType, data.newsletterType);
      
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: productName,
                description: `Sponsorship for ${data.newsletterDate} newsletter`,
                metadata: {
                  type: data.packageType,
                  newsletterDate: data.newsletterDate,
                  newsletterType: data.newsletterType,
                },
              },
              unit_amount: price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sponsors/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/sponsors/cancel`,
        customer_email: data.email,
        metadata: {
          sponsorName: data.sponsorName,
          companyName: data.companyName,
          packageType: data.packageType,
          newsletterDate: data.newsletterDate,
          newsletterType: data.newsletterType,
          customCopy: data.customCopy || '',
          logoUrl: data.logoUrl || '',
          ...data.additionalInfo,
        },
        payment_intent_data: {
          metadata: {
            type: 'newsletter_sponsorship',
            packageType: data.packageType,
          },
        },
      });
      
      return session.url || '';
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }
  
  async createSubscription(
    customerId: string,
    packageType: 'main' | 'company-raising' | 'company-hiring',
    duration: 'weekly' | 'monthly'
  ): Promise<Stripe.Subscription> {
    try {
      // First, create or get the price
      const amount = this.PRICES[packageType][duration];
      const interval = duration === 'weekly' ? 'week' : 'month';
      
      const price = await this.stripe.prices.create({
        currency: 'usd',
        unit_amount: amount,
        recurring: { interval },
        product_data: {
          name: `${this.getPackageName(packageType)} - ${duration}`,
        },
      });
      
      // Create the subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          packageType,
          duration,
        },
      });
      
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
  
  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<{ type: string; data: any }> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      
      let result = { type: event.type, data: null };
      
      switch (event.type) {
        case 'checkout.session.completed':
          result.data = await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session
          );
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          result.data = await this.handleSubscriptionChange(
            event.data.object as Stripe.Subscription
          );
          break;
          
        case 'customer.subscription.deleted':
          result.data = await this.handleSubscriptionCanceled(
            event.data.object as Stripe.Subscription
          );
          break;
          
        case 'invoice.payment_succeeded':
          result.data = await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice
          );
          break;
          
        case 'invoice.payment_failed':
          result.data = await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice
          );
          break;
      }
      
      return result;
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }
  
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata || {};
    
    // Extract sponsor information
    const sponsorData = {
      customerId: session.customer as string,
      email: session.customer_email || '',
      sponsorName: metadata.sponsorName,
      companyName: metadata.companyName,
      packageType: metadata.packageType as 'main' | 'company-raising' | 'company-hiring',
      newsletterDate: metadata.newsletterDate,
      newsletterType: metadata.newsletterType as NewsletterType,
      customCopy: metadata.customCopy,
      logoUrl: metadata.logoUrl,
      paymentIntentId: session.payment_intent as string,
      amountTotal: session.amount_total || 0,
    };
    
    return sponsorData;
  }
  
  private async handleSubscriptionChange(subscription: Stripe.Subscription) {
    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      metadata: subscription.metadata,
    };
  }
  
  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      metadata: subscription.metadata,
    };
  }
  
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    return {
      invoiceId: invoice.id,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string,
      amountPaid: invoice.amount_paid,
      billingReason: invoice.billing_reason,
    };
  }
  
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    return {
      invoiceId: invoice.id,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string,
      attemptCount: invoice.attempt_count,
      nextPaymentAttempt: invoice.next_payment_attempt 
        ? new Date(invoice.next_payment_attempt * 1000) 
        : null,
    };
  }
  
  async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'newsletter_sponsorship',
          ...metadata,
        },
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
  
  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return null;
    }
  }
  
  async createPaymentIntent(amount: number, customerId?: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customerId,
        metadata: {
          type: 'newsletter_sponsorship',
        },
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }
  
  async getAvailablePackages(): Promise<SponsorPackage[]> {
    return [
      {
        id: 'main-single',
        name: 'Main Sponsor - Single Newsletter',
        description: 'Premium placement with 500 words of custom content',
        price: 2000,
        currency: 'usd',
        type: 'main',
        duration: 'single',
        features: [
          'Top placement in newsletter',
          '500 words of custom content',
          'Company logo and CTA button',
          'Performance analytics report',
        ],
      },
      {
        id: 'main-weekly',
        name: 'Main Sponsor - Weekly Package',
        description: '3 newsletters per week with 12.5% discount',
        price: 7000,
        currency: 'usd',
        type: 'main',
        duration: 'weekly',
        features: [
          'All 3 weekly newsletters',
          'Save $1,000 per week',
          'Consistent brand presence',
          'Weekly performance reports',
        ],
      },
      {
        id: 'raising-single',
        name: 'Companies Raising - Single Slot',
        description: 'Feature your funding round',
        price: 500,
        currency: 'usd',
        type: 'company-raising',
        duration: 'single',
        features: [
          'Company name and funding details',
          'Brief description',
          'Link to your website',
          'Included in 3 slots per newsletter',
        ],
      },
      {
        id: 'hiring-single',
        name: 'Companies Hiring - Single Slot',
        description: 'Showcase your open positions',
        price: 500,
        currency: 'usd',
        type: 'company-hiring',
        duration: 'single',
        features: [
          'Company name and open roles',
          'Location and tech stack',
          'Link to careers page',
          'Included in 3 slots per newsletter',
        ],
      },
    ];
  }
  
  private getProductName(packageType: string, newsletterType: NewsletterType): string {
    const typeNames = {
      'weekly-digest': 'Weekly AI Digest',
      'innovation-report': 'AI Innovation Report',
      'business-careers': 'AI Business & Careers',
    };
    
    const packageNames = {
      'main': 'Main Sponsorship',
      'company-raising': 'Companies Raising Slot',
      'company-hiring': 'Companies Hiring Slot',
    };
    
    return `${packageNames[packageType]} - ${typeNames[newsletterType]}`;
  }
  
  private getPackageName(packageType: string): string {
    const names = {
      'main': 'Main Sponsorship',
      'company-raising': 'Companies Raising',
      'company-hiring': 'Companies Hiring',
    };
    return names[packageType] || packageType;
  }
  
  async testConnection(): Promise<boolean> {
    try {
      // Try to retrieve account details to test connection
      await this.stripe.accounts.retrieve();
      return true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      return false;
    }
  }
  
  async createInvoice(customerId: string, items: Array<{ amount: number; description: string }>): Promise<Stripe.Invoice> {
    try {
      // Create invoice items
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          amount: item.amount,
          currency: 'usd',
          description: item.description,
        });
      }
      
      // Create and finalize the invoice
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        collection_method: 'charge_automatically',
      });
      
      return await this.stripe.invoices.finalizeInvoice(invoice.id);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }
  
  async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount, // If not specified, refunds the full amount
      });
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();