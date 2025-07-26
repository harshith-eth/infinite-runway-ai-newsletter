import { NextRequest, NextResponse } from 'next/server';

// Simplified mock for frontend-only development
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }
    
    console.log('Mock Stripe webhook received');
    
    // Mock successful response for frontend development
    return NextResponse.json({ 
      received: true,
      message: 'Mock webhook processed successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      message: 'Mock error for frontend development'
    }, { status: 500 });
  }
}

// GET method for testing webhook configuration
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    webhook: 'stripe',
    configured: true,
    message: 'Mock Stripe webhook endpoint'
  });
}