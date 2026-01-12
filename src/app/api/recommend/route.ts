import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ClassificationResult {
  practiceArea: string;
  urgency: 'low' | 'medium' | 'high';
  budgetSensitivity: 'low' | 'medium' | 'high';
  locationHint: string;
}

interface RecommendationRequest {
  classification: ClassificationResult;
  userEmail?: string;
  userName?: string;
  userMessage?: string;
}

interface LawyerRecommendation {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  practice_area: string;
  experience_years: number;
  consultation_fee_min: number;
  consultation_fee_max: number;
  matchScore: number;
  matchReason: string;
  bio?: string;
}

/**
 * Recommendation Endpoint
 * 
 * Flow:
 * 1. Accept classification result from intake chat
 * 2. Query Supabase lawyers table filtered by:
 *    - practice_area matches classification
 *    - location/state matches user's location hint
 * 3. Rank by experience_years (higher is better)
 * 4. Return top 5 recommendations
 * 5. Optionally save submission to contact_submissions table
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RecommendationRequest;
    const { classification, userEmail, userName, userMessage } = body;

    // Validate classification
    if (!classification?.practiceArea || !classification?.urgency) {
      return NextResponse.json(
        { error: 'Invalid classification data' },
        { status: 400 }
      );
    }

    // Map practice area to database practice_area_id
    const practiceAreaMap: Record<string, string> = {
      'Employment Law': 'Employment',
      'Family Law': 'Family',
      'Property Law': 'Property',
      'Corporate Law': 'Corporate',
      'Commercial Law': 'Commercial',
      'Dispute Resolution': 'Dispute Resolution',
      'Immigration Law': 'Immigration',
      'Intellectual Property': 'IP',
    };

    const dbPracticeArea = practiceAreaMap[classification.practiceArea] || classification.practiceArea;

    // Query lawyers by practice area
    let query = supabase
      .from('lawyers')
      .select('*')
      .eq('is_active', true);

    // Filter by practice area - using text search since practice_area_id may not exist directly
    // For now, we'll fetch all active lawyers and filter client-side
    const { data: allLawyers, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching lawyers:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch lawyers', details: fetchError.message },
        { status: 500 }
      );
    }

    // Filter and rank lawyers
    const recommendations = filterAndRankLawyers(
      allLawyers || [],
      classification,
      dbPracticeArea
    );

    // Save submission to database if email provided
    let submissionId: number | null = null;
    if (userEmail) {
      const { data: submission, error: submitError } = await supabase
        .from('contact_submissions')
        .insert([
          {
            user_name: userName || 'Anonymous',
            user_email: userEmail,
            user_location: classification.locationHint,
            practice_area: classification.practiceArea,
            urgency: classification.urgency,
            budget_sensitivity: classification.budgetSensitivity,
            message: userMessage || `Looking for ${classification.practiceArea} services`,
            status: 'matched',
          },
        ])
        .select()
        .single();

      if (submitError) {
        console.warn('Error saving submission:', submitError);
      } else {
        submissionId = submission?.id;

        // Save recommendations
        if (submissionId && recommendations.length > 0) {
          const recommendationRecords = recommendations.map((rec, index) => ({
            submission_id: submissionId,
            lawyer_id: rec.id,
            rank: index + 1,
            match_reason: rec.matchReason,
          }));

          const { error: recError } = await supabase
            .from('recommendations')
            .insert(recommendationRecords);

          if (recError) {
            console.warn('Error saving recommendations:', recError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      classification,
      recommendations: recommendations.slice(0, 5), // Top 5
      submissionId,
      totalMatches: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to process recommendation request' },
      { status: 500 }
    );
  }
}

/**
 * Filter and rank lawyers based on classification
 */
function filterAndRankLawyers(
  lawyers: any[],
  classification: ClassificationResult,
  practiceArea: string
): LawyerRecommendation[] {
  const scored: Array<LawyerRecommendation & { score: number }> = [];

  lawyers.forEach((lawyer) => {
    let score = 0;
    let matchReason = '';

    // Score based on practice area match
    const lawyerAreas = lawyer.practice_areas || [];
    const isExactMatch = lawyerAreas.some((area: string) =>
      area.toLowerCase().includes(practiceArea.toLowerCase()) ||
      practiceArea.toLowerCase().includes(area.toLowerCase())
    );

    if (isExactMatch) {
      score += 50;
      matchReason += 'Specializes in your practice area. ';
    } else {
      score += 10;
    }

    // Score based on experience
    const experience = lawyer.experience_years || 0;
    score += Math.min(experience * 2, 25); // Max 25 points for experience
    if (experience > 10) {
      matchReason += `${experience}+ years of experience. `;
    }

    // Score based on location match
    const userLocation = classification.locationHint.toLowerCase();
    const lawyerLocation = (lawyer.location || '').toLowerCase();

    if (lawyerLocation.includes(userLocation) || userLocation === 'not specified') {
      score += 15;
      matchReason += 'Located in your area. ';
    } else {
      score += 5;
    }

    // Bonus for verified status
    if (lawyer.is_verified) {
      score += 10;
      matchReason += 'Verified lawyer. ';
    }

    // Bonus for reasonable consultation fees
    if (lawyer.consultation_fee_min && lawyer.consultation_fee_min < 100000) {
      score += 5;
      matchReason += 'Reasonable consultation fees. ';
    }

    if (score > 0) {
      scored.push({
        ...lawyer,
        matchScore: score,
        matchReason: matchReason.trim(),
      });
    }
  });

  // Sort by score descending
  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...rest }) => rest);
}

/**
 * Fallback: Get lawyers endpoint (can be used as alternative)
 * GET /api/recommend?practiceArea=Employment&location=Lagos
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const practiceArea = searchParams.get('practiceArea');
    const location = searchParams.get('location');

    if (!practiceArea) {
      return NextResponse.json(
        { error: 'practiceArea query parameter required' },
        { status: 400 }
      );
    }

    const { data: lawyers, error } = await supabase
      .from('lawyers')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lawyers });
  } catch (error) {
    console.error('GET /api/recommend error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
