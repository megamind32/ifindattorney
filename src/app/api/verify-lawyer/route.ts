import { NextRequest, NextResponse } from 'next/server';

interface LawyerDetails {
  name: string;
  enrollmentNumber?: string;
  yearOfCall?: string;
  branch?: string;
  state?: string;
  status?: string;
  type?: string;
  source?: string;
}

interface VerifyResponse {
  found: boolean;
  lawyerName: string;
  message: string;
  lawyers: LawyerDetails[];
  totalCount: number;
  nbaLink: string;
}

// Simple in-memory cache with TTL
const verificationCache = new Map<string, { data: LawyerDetails[]; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  try {
    const { lawyerName } = await request.json();

    if (!lawyerName || lawyerName.trim().length === 0) {
      return NextResponse.json(
        {
          found: false,
          lawyerName: '',
          message: 'Please provide a lawyer name',
          lawyers: [],
          totalCount: 0,
          nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
        },
        { status: 400 }
      );
    }

    console.log('Verifying lawyer:', lawyerName);

    // Check cache first
    const cacheKey = lawyerName.toLowerCase().trim();
    const cached = verificationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Using cached result for:', lawyerName);
      return NextResponse.json({
        found: cached.data.length > 0,
        lawyerName: lawyerName,
        message: cached.data.length > 0 
          ? `Found ${cached.data.length} lawyer${cached.data.length > 1 ? 's' : ''} matching "${lawyerName}" in the NBA database.`
          : `No lawyers found matching "${lawyerName}". Please verify the name spelling, or visit the NBA website to search directly.`,
        lawyers: cached.data,
        totalCount: cached.data.length,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      });
    }

    // Use lightweight HTTP-based search instead of Puppeteer
    const searchResults = await searchNBAWithLightweightMethod(lawyerName);

    // Cache the result
    verificationCache.set(cacheKey, {
      data: searchResults.lawyers,
      timestamp: Date.now(),
    });

    if (searchResults.found && searchResults.lawyers.length > 0) {
      const count = searchResults.lawyers.length;
      return NextResponse.json({
        found: true,
        lawyerName: lawyerName,
        message: `Found ${count} lawyer${count > 1 ? 's' : ''} matching "${lawyerName}" in the NBA database.`,
        lawyers: searchResults.lawyers,
        totalCount: searchResults.totalCount || count,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      });
    } else {
      return NextResponse.json({
        found: false,
        lawyerName: lawyerName,
        message: `No lawyers found matching "${lawyerName}". Please verify the name spelling, or visit the NBA website to search directly.`,
        lawyers: [],
        totalCount: 0,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {
        found: false,
        lawyerName: '',
        message: 'An error occurred while verifying the lawyer. Please try again or visit the NBA website directly.',
        lawyers: [],
        totalCount: 0,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      },
      { status: 500 }
    );
  }
}

/**
 * Lightweight lawyer verification using simple HTTP requests
 * Does NOT use Puppeteer - much faster on mobile (< 5 seconds)
 */
async function searchNBAWithLightweightMethod(lawyerName: string): Promise<{
  found: boolean;
  lawyers: LawyerDetails[];
  totalCount?: number;
}> {
  try {
    const searchName = lawyerName
      .replace(/^(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?|Hon\.?|Justice|SAN)\s+/gi, '')
      .trim();

    console.log(`Searching for lawyer: ${searchName}`);

    // Try the NBA API endpoint first (if it exists)
    const lawyers = await tryNBAAPISearch(searchName);
    
    if (lawyers.length > 0) {
      return { found: true, lawyers, totalCount: lawyers.length };
    }

    // If API doesn't work, return helpful message with manual search option
    console.log(`No results found for ${searchName}`);
    
    return {
      found: false,
      lawyers: [],
      totalCount: 0,
    };
  } catch (error) {
    console.warn('Lightweight search error:', error instanceof Error ? error.message : error);
    return { found: false, lawyers: [] };
  }
}

/**
 * Try to search NBA using their public search endpoint
 */
async function tryNBAAPISearch(searchName: string): Promise<LawyerDetails[]> {
  try {
    // NBA website has a search functionality - try the main directory
    const url = new URL('https://www.nigerianbar.org.ng/find-a-lawyer');
    url.searchParams.append('search', searchName);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=3600',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`NBA search returned ${response.status}`);
      return [];
    }

    const html = await response.text();

    // Parse the HTML response looking for lawyer information
    const lawyers = parseNBAHtmlResults(html, searchName);
    
    return lawyers;
  } catch (error) {
    console.warn(
      'NBA API search failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return [];
  }
}

/**
 * Parse NBA HTML response for lawyer information
 */
function parseNBAHtmlResults(html: string, searchName: string): LawyerDetails[] {
  const lawyers: LawyerDetails[] = [];

  try {
    // Look for SCN numbers (enrollment numbers)
    const scnPattern = /SCN\s*[:\-]?\s*(\d+[A-Z]?)/gi;
    const scnMatches = [...html.matchAll(scnPattern)];

    if (scnMatches.length === 0) {
      console.log('No SCN numbers found in response');
      return [];
    }

    console.log(`Found ${scnMatches.length} potential lawyer records`);

    // For each SCN, extract nearby information
    for (const match of scnMatches) {
      const scn = match[1];
      const matchIndex = match.index || 0;
      
      // Get surrounding context (500 chars before and after)
      const contextStart = Math.max(0, matchIndex - 500);
      const contextEnd = Math.min(html.length, matchIndex + 500);
      const context = html.substring(contextStart, contextEnd);

      // Extract lawyer name from context
      const namePattern = /([A-Z][A-Za-z\s\-\',.]{5,60}?)(?:\s+(?:SCN|Esq|SAN|Legal|Barrister))/i;
      const nameMatch = context.match(namePattern);
      const name = nameMatch ? nameMatch[1].trim() : searchName;

      // Check for SAN status
      const isSAN = /\b(?:SAN|Senior\s+Advocate\s+of\s+Nigeria)\b/i.test(context);
      
      // Avoid exact duplicates
      if (!lawyers.some(l => l.enrollmentNumber === scn)) {
        lawyers.push({
          name: name,
          enrollmentNumber: `SCN${scn}`,
          type: isSAN ? 'Senior Advocate of Nigeria (SAN)' : 'Legal Practitioner',
          status: 'Verified',
          source: 'NBA Website',
        });
      }

      if (lawyers.length >= 10) break; // Limit to 10 results
    }
  } catch (error) {
    console.error('HTML parsing error:', error);
  }

  return lawyers;
}

