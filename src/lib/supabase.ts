import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getLawyersByPracticeArea(practiceArea: string, location?: string) {
  try {
    let query = supabase
      .from('lawyers')
      .select('*, practice_areas(name)')
      .eq('is_active', true);

    // Filter by practice area
    if (practiceArea) {
      query = query.eq('practice_areas.name', practiceArea);
    }

    // Filter by location if provided
    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lawyers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

export async function getRecommendedLawyers(
  practiceArea: string,
  location: string,
  limit: number = 5
) {
  try {
    const { data, error } = await supabase
      .from('lawyers')
      .select('*')
      .eq('is_active', true)
      .order('experience_years', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recommended lawyers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

export async function saveContactSubmission(submission: {
  userName: string;
  userEmail: string;
  userLocation?: string;
  practiceArea?: string;
  urgency?: string;
  budgetSensitivity?: string;
  message: string;
}) {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          user_name: submission.userName,
          user_email: submission.userEmail,
          user_location: submission.userLocation,
          practice_area: submission.practiceArea,
          urgency: submission.urgency,
          budget_sensitivity: submission.budgetSensitivity,
          message: submission.message,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving submission:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}
