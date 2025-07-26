import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // For frontend-only development, just return a mock response
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'weekly-digest';
    const testMode = searchParams.get('test') === 'true';

    console.log(`🚀 Mock newsletter generation: ${type}, test: ${testMode}`);

    // Mock response for frontend development
    return NextResponse.json({
      success: true,
      type: type,
      testMode,
      output: `Mock newsletter generation completed for ${type}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Newsletter generation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Newsletter generation endpoint',
    methods: ['POST'],
    params: {
      type: 'Newsletter type (weekly-digest, innovation-report, business-careers, auto)',
      test: 'Test mode (true/false)'
    }
  });
} 