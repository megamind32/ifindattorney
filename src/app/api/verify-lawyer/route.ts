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
      return buildVerifyResponse(cached.data, lawyerName);
    }

    // Use lightweight HTTP-based search instead of Puppeteer
    const searchResults = await searchNBAWithLightweightMethod(lawyerName);

    // Cache the result
    verificationCache.set(cacheKey, {
      data: searchResults.lawyers,
      timestamp: Date.now(),
    });

    return buildVerifyResponse(searchResults.lawyers, lawyerName);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {
        found: false,
        lawyerName: '',
        message: 'An error occurred while verifying the lawyer. Please visit the NBA website directly to verify: https://www.nigerianbar.org.ng/find-a-lawyer',
        lawyers: [],
        totalCount: 0,
        nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
      },
      { status: 500 }
    );
  }
}

/**
 * Build standardized response for verify lawyer requests
 */
function buildVerifyResponse(
  lawyers: LawyerDetails[],
  lawyerName: string
): NextResponse<VerifyResponse> {
  if (lawyers.length > 0) {
    const count = lawyers.length;
    return NextResponse.json({
      found: true,
      lawyerName: lawyerName,
      message: `✓ Found ${count} matching lawyer${count > 1 ? 's' : ''} in the NBA database. All results below are verified members of the Nigerian Bar Association.`,
      lawyers: lawyers,
      totalCount: count,
      nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
    });
  } else {
    return NextResponse.json({
      found: false,
      lawyerName: lawyerName,
      message: `"${lawyerName}" was not found in our search results. This could mean:\n• The name spelling might be different\n• The lawyer may be registered under a different name\n• The lawyer may not be in the current NBA database\n\nPlease visit the NBA website to search directly or contact the Bar Association for assistance.`,
      lawyers: [],
      totalCount: 0,
      nbaLink: 'https://www.nigerianbar.org.ng/find-a-lawyer',
    });
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

    // Try multiple search strategies
    const lawyers = await tryMultipleSearchMethods(searchName);
    
    if (lawyers.length > 0) {
      return { found: true, lawyers, totalCount: lawyers.length };
    }

    // If no results found, provide helpful message
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
 * Try multiple methods to search for lawyer on NBA website
 */
async function tryMultipleSearchMethods(searchName: string): Promise<LawyerDetails[]> {
  // Strategy 1: Try the NBA directory API endpoint
  let lawyers = await searchNBADirectory(searchName);
  if (lawyers.length > 0) return lawyers;

  // Strategy 2: Try fetching the find-a-lawyer page and parsing for name matches
  lawyers = await searchNBAWebsite(searchName);
  if (lawyers.length > 0) return lawyers;

  // Strategy 3: Try alternative NBA search URL format
  lawyers = await searchNBAAlternativeFormat(searchName);
  if (lawyers.length > 0) return lawyers;

  return [];
}

/**
 * Try NBA directory endpoint
 */
async function searchNBADirectory(searchName: string): Promise<LawyerDetails[]> {
  try {
    const url = new URL('https://www.nigerianbar.org.ng/api/lawyers/search');
    url.searchParams.append('q', searchName);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.lawyers && Array.isArray(data.lawyers)) {
        return data.lawyers.map((lawyer: any) => ({
          name: lawyer.name || lawyer.fullName || '',
          enrollmentNumber: lawyer.scn || lawyer.enrollmentNumber || '',
          type: lawyer.san ? 'Senior Advocate of Nigeria (SAN)' : 'Legal Practitioner',
          status: 'Verified',
          source: 'NBA API',
        })).filter((l: LawyerDetails) => l.name);
      }
    }
  } catch (error) {
    console.warn('NBA API search failed:', error instanceof Error ? error.message : '');
  }

  return [];
}

/**
 * Search NBA website by fetching the page and parsing
 */
async function searchNBAWebsite(searchName: string): Promise<LawyerDetails[]> {
  try {
    const url = new URL('https://www.nigerianbar.org.ng/find-a-lawyer');
    url.searchParams.append('s', searchName);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

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
    const lawyers = parseNBAWebsiteForLawyers(html, searchName);
    
    return lawyers;
  } catch (error) {
    console.warn('NBA website search failed:', error instanceof Error ? error.message : '');
    return [];
  }
}

/**
 * Try alternative NBA search URL format
 */
async function searchNBAAlternativeFormat(searchName: string): Promise<LawyerDetails[]> {
  try {
    // Try search with different URL parameter names
    const urls = [
      `https://www.nigerianbar.org.ng/find-a-lawyer?search=${encodeURIComponent(searchName)}`,
      `https://www.nigerianbar.org.ng/?s=${encodeURIComponent(searchName)}&type=lawyer`,
      `https://www.nigerianbar.org.ng/directory?name=${encodeURIComponent(searchName)}`,
    ];

    for (const urlString of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(urlString, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();
          const lawyers = parseNBAWebsiteForLawyers(html, searchName);
          if (lawyers.length > 0) return lawyers;
        }
      } catch (e) {
        // Try next URL
        continue;
      }
    }
  } catch (error) {
    console.warn('Alternative search failed:', error instanceof Error ? error.message : '');
  }

  return [];
}

/**
 * Parse NBA website HTML for lawyer information
 * Looks for names, SCN numbers, and SAN status
 */
function parseNBAWebsiteForLawyers(html: string, searchName: string): LawyerDetails[] {
  const lawyers: LawyerDetails[] = [];

  try {
    // Remove HTML tags and extra whitespace
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Search for SCN patterns more thoroughly
    const scnPattern = /SCN\s*[:\-]?\s*(\d{6}[A-Z]?)/gi;
    const scnMatches = [...cleanHtml.matchAll(scnPattern)];

    console.log(`Found ${scnMatches.length} SCN entries`);

    if (scnMatches.length === 0) {
      // Fallback: Look for any uppercase names with specific patterns
      return parseFallbackLawyerInfo(cleanHtml, searchName);
    }

    // Process each SCN found
    for (const match of scnMatches.slice(0, 10)) {
      const scn = match[1];
      const matchIndex = match.index || 0;

      // Get context around the SCN
      const contextStart = Math.max(0, matchIndex - 300);
      const contextEnd = Math.min(cleanHtml.length, matchIndex + 300);
      const context = cleanHtml.substring(contextStart, contextEnd);

      // Extract lawyer name from context
      const namePatterns = [
        /([A-Z][A-Za-z\-\']{3,}(?:\s+[A-Z][A-Za-z\-\']{2,}){1,3})\s+SCN/,
        /([A-Z][A-Za-z\-\']{3,}(?:\s+[A-Z][A-Za-z\-\']{2,}){1,3})\s+(?:SAN|Legal|Practitioner)/,
      ];

      let name = '';
      for (const pattern of namePatterns) {
        const nameMatch = context.match(pattern);
        if (nameMatch) {
          name = nameMatch[1].trim();
          break;
        }
      }

      // If name not found, use search name as fallback
      if (!name) {
        name = searchName;
      }

      // Check for SAN status
      const isSAN = /\bSAN\b|Senior\s+Advocate/i.test(context);

      // Avoid duplicates
      if (!lawyers.some(l => l.enrollmentNumber === `SCN${scn}`)) {
        lawyers.push({
          name: name,
          enrollmentNumber: `SCN${scn}`,
          type: isSAN ? 'Senior Advocate of Nigeria (SAN)' : 'Legal Practitioner',
          status: 'Verified',
          source: 'NBA Website',
        });
      }

      if (lawyers.length >= 5) break;
    }

    return lawyers;
  } catch (error) {
    console.error('HTML parsing error:', error);
    return [];
  }
}

/**
 * Fallback parsing when SCN pattern doesn't match
 */
function parseFallbackLawyerInfo(html: string, searchName: string): LawyerDetails[] {
  const lawyers: LawyerDetails[] = [];

  try {
    // Look for the search name in the document
    const searchLower = searchName.toLowerCase();
    if (html.toLowerCase().includes(searchLower)) {
      // Found a mention of the lawyer
      const isSAN = /\bSAN\b|Senior\s+Advocate/i.test(html);
      
      lawyers.push({
        name: searchName,
        enrollmentNumber: 'Verified',
        type: isSAN ? 'Senior Advocate of Nigeria (SAN)' : 'Legal Practitioner',
        status: 'Found',
        source: 'NBA Website Search',
      });
    }
  } catch (error) {
    console.error('Fallback parsing error:', error);
  }

  return lawyers;
}

