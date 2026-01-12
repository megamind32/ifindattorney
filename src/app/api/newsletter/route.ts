import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface NewsletterSignupRequest {
  email: string;
  name?: string;
  location?: string;
}

/**
 * Newsletter Signup Endpoint
 * 
 * Captures user emails for newsletter signup
 * Deduplicates entries and stores in contact_submissions table
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as NewsletterSignupRequest;
    const { email, name, location } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed (deduplicate)
    const { data: existing } = await supabase
      .from('contact_submissions')
      .select('id')
      .eq('user_email', normalizedEmail)
      .eq('status', 'newsletter')
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: 'You are already subscribed to our newsletter',
          isNewSubscriber: false,
        },
        { status: 200 }
      );
    }

    // Save to database
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          user_name: name || 'Newsletter Subscriber',
          user_email: normalizedEmail,
          user_location: location || 'Not specified',
          practice_area: 'Newsletter',
          urgency: 'low',
          budget_sensitivity: 'low',
          message: 'Newsletter signup',
          status: 'newsletter',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving newsletter signup:', error);
      // Don't expose database errors to client
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to newsletter',
        isNewSubscriber: true,
        subscriptionId: data?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription request' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check subscription status
 * GET /api/newsletter?email=user@example.com
 */
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email parameter is required' },
        { status: 400 }
      );
    }

    const { data } = await supabase
      .from('contact_submissions')
      .select('id, created_at')
      .eq('user_email', email.toLowerCase())
      .eq('status', 'newsletter')
      .single();

    if (data) {
      return NextResponse.json({
        isSubscribed: true,
        subscribedAt: data.created_at,
      });
    }

    return NextResponse.json({
      isSubscribed: false,
    });
  } catch (error) {
    console.error('Newsletter status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
