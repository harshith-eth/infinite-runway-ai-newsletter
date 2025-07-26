import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripeService } from '@/lib/services/stripe';
import { supabase } from '@/lib/services/supabase';
import { slackService } from '@/lib/services/slack';
import { statusUpdater } from '@/automation/update-status';
import { 
  NotificationEvent,
  SponsorInfo,
  CompanyRaising,
  CompanyHiring
} from '@/lib/types/newsletter.types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Disable body parsing for raw webhook payload
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log(`Processing Stripe webhook event: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(invoice);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Notify critical error
    const notification: NotificationEvent = {
      type: 'webhook_error',
      level: 'critical',
      title: 'Stripe Webhook Error',
      message: 'Failed to process Stripe webhook',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(notification);
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing checkout completion:', session.id);
    
    // Get the customer details
    const customer = await stripe.customers.retrieve(session.customer as string);
    
    // Extract metadata
    const metadata = session.metadata || {};
    const sponsorType = metadata.sponsor_type || 'main';
    const newsletterTypes = metadata.newsletter_types?.split(',') || ['all'];
    const startDate = metadata.start_date || new Date().toISOString();
    
    // Determine package details
    let packageName = '';
    let slotsPerNewsletter = 1;
    
    switch (sponsorType) {
      case 'main':
        packageName = 'Main Sponsor';
        slotsPerNewsletter = 1;
        break;
      case 'companies_raising':
        packageName = 'Companies Raising';
        slotsPerNewsletter = 3;
        break;
      case 'companies_hiring':
        packageName = 'Companies Hiring';
        slotsPerNewsletter = 3;
        break;
    }
    
    // Create sponsor info
    const sponsorInfo: Partial<SponsorInfo | CompanyRaising | CompanyHiring> = {
      name: metadata.company_name || (customer as any).name || 'Unknown Company',
      email: session.customer_details?.email || '',
      status: 'active',
      startDate: new Date(startDate),
    };
    
    // Add type-specific fields
    if (sponsorType === 'main') {
      (sponsorInfo as SponsorInfo).logo = metadata.logo_url || '';
      (sponsorInfo as SponsorInfo).link = metadata.website || '';
      (sponsorInfo as SponsorInfo).description = metadata.description || '';
      (sponsorInfo as SponsorInfo).ctaText = metadata.cta_text || 'Learn More';
      (sponsorInfo as SponsorInfo).ctaLink = metadata.cta_link || metadata.website || '';
    } else if (sponsorType === 'companies_raising') {
      (sponsorInfo as CompanyRaising).round = metadata.funding_round || '';
      (sponsorInfo as CompanyRaising).amount = metadata.funding_amount || '';
      (sponsorInfo as CompanyRaising).investors = metadata.investors?.split(',') || [];
      (sponsorInfo as CompanyRaising).description = metadata.description || '';
      (sponsorInfo as CompanyRaising).link = metadata.website || '';
    } else if (sponsorType === 'companies_hiring') {
      (sponsorInfo as CompanyHiring).roles = metadata.roles?.split(',') || [];
      (sponsorInfo as CompanyHiring).location = metadata.location || '';
      (sponsorInfo as CompanyHiring).stack = metadata.tech_stack || '';
      (sponsorInfo as CompanyHiring).description = metadata.description || '';
      (sponsorInfo as CompanyHiring).link = metadata.careers_link || metadata.website || '';
    }
    
    // Save sponsor to database
    await supabase.createSponsor({
      ...sponsorInfo,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      packageType: sponsorType,
      newsletterTypes: newsletterTypes,
      slotsPerNewsletter: slotsPerNewsletter,
      amount: session.amount_total || 0,
    });
    
    // Notify payment received
    await statusUpdater.notifySponsorPayment(
      sponsorInfo.name!,
      (session.amount_total || 0) / 100,
      packageName
    );
    
    // Send success notification
    const notification: NotificationEvent = {
      type: 'sponsor_activated',
      level: 'success',
      title: 'New Sponsor Activated',
      message: `${sponsorInfo.name} has been activated as a ${packageName}`,
      data: {
        sponsorName: sponsorInfo.name,
        package: packageName,
        amount: (session.amount_total || 0) / 100,
        startDate: startDate,
        newsletterTypes: newsletterTypes.join(', '),
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(notification);
    
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment successful: ${paymentIntent.id}, amount: ${paymentIntent.amount / 100}`);
  
  // Log successful payment
  const notification: NotificationEvent = {
    type: 'payment_received',
    level: 'info',
    title: 'Payment Received',
    message: `Payment of $${paymentIntent.amount / 100} received`,
    data: {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    },
    timestamp: new Date(),
  };
  
  await slackService.sendNotification(notification);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription change:', subscription.id);
    
    // Update sponsor status in database
    await supabase.updateSponsorByStripeId(subscription.id, {
      status: subscription.status === 'active' ? 'active' : 'inactive',
      endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : undefined,
    });
    
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription cancellation:', subscription.id);
    
    // Update sponsor status to inactive
    await supabase.updateSponsorByStripeId(subscription.id, {
      status: 'inactive',
      endDate: new Date(),
    });
    
    // Notify cancellation
    const notification: NotificationEvent = {
      type: 'sponsor_cancelled',
      level: 'info',
      title: 'Sponsor Cancelled',
      message: `Subscription ${subscription.id} has been cancelled`,
      data: {
        subscriptionId: subscription.id,
        cancelledAt: new Date().toISOString(),
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(notification);
    
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  try {
    console.log('Processing failed payment:', invoice.id);
    
    // Notify payment failure
    const notification: NotificationEvent = {
      type: 'payment_failed',
      level: 'critical',
      title: 'Sponsor Payment Failed',
      message: `Payment failed for invoice ${invoice.id}`,
      data: {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amountDue: (invoice.amount_due || 0) / 100,
        attemptCount: invoice.attempt_count,
      },
      timestamp: new Date(),
    };
    
    await slackService.sendNotification(notification);
    
    // Update sponsor status if multiple failures
    if (invoice.attempt_count && invoice.attempt_count >= 3 && invoice.subscription) {
      await supabase.updateSponsorByStripeId(invoice.subscription as string, {
        status: 'payment_failed',
      });
    }
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

// GET method for testing webhook configuration
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    webhook: 'stripe',
    configured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
}