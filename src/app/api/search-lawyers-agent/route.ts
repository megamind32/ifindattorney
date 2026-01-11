import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * =============================================================================
 * TWO-AGENT AI ARCHITECTURE FOR LAW FIRM SEARCH
 * =============================================================================
 * 
 * AGENT 1 (Location Agent):
 * - Searches Google Maps for ALL law firms in user's preferred location
 * - Returns all firms regardless of practice area
 * - Passes raw data to Agent 2
 * 
 * AGENT 2 (Research Agent):
 * - Takes firm names and website URLs from Agent 1
 * - Conducts Google Search to research each firm
 * - Visits firm websites or collects data from online sources
 * - Determines practice areas from research
 * - Filters firms based on user's required practice areas
 * - Generates summary of firm's goals and objectives using OpenAI
 * 
 * =============================================================================
 */

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// ==================== INTERFACES ====================

interface RawFirmData {
  firmName: string;
  address: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  placeId?: string;
  gmapsUrl?: string;
}

interface ResearchedFirmData {
  firmName: string;
  address: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  practiceAreas: string[];
  specializations: string[];  // Specific areas of expertise
  firmSummary: string;        // About the firm - goals and objectives
  lawyersInfo: string;        // Information about lawyers/partners
  servicesOffered: string;    // Services they provide
  matchScore: number;
  matchReason: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  gmapsUrl?: string;
  source: string;
  researchSource: string;     // Where the practice area info came from
}

interface AgentRequest {
  state: string;
  lga: string;
  practiceAreas: string[];
  budget: string;
  legalIssue?: string;
}

interface AgentResponse {
  success: boolean;
  state: string;
  lga: string;
  searchQuery: string;
  firmsFound: number;
  results: ResearchedFirmData[];
  message: string;
  searchStrategy?: string;
  error?: string;
}

// ==================== STATE DATA ====================

const NIGERIAN_STATE_DATA: Record<string, { lat: number; lng: number; radius: number; capital: string; majorCities: string[] }> = {
  'Lagos': { lat: 6.5244, lng: 3.3792, radius: 30000, capital: 'Ikeja', majorCities: ['Victoria Island', 'Lekki', 'Ikoyi', 'Surulere'] },
  'Adamawa': { lat: 9.1765, lng: 12.4833, radius: 50000, capital: 'Yola', majorCities: ['Jimeta', 'Mubi', 'Numan'] },
  'Abia': { lat: 5.4527, lng: 7.5248, radius: 40000, capital: 'Umuahia', majorCities: ['Aba', 'Ohafia'] },
  'Kano': { lat: 12.0022, lng: 8.6753, radius: 40000, capital: 'Kano', majorCities: ['Fagge', 'Nassarawa', 'Tarauni'] },
  'Rivers': { lat: 4.8156, lng: 7.0498, radius: 40000, capital: 'Port Harcourt', majorCities: ['Obio-Akpor', 'Eleme'] },
  'Oyo': { lat: 7.3775, lng: 3.8800, radius: 40000, capital: 'Ibadan', majorCities: ['Ogbomoso', 'Oyo'] },
  'Enugu': { lat: 6.4584, lng: 7.5464, radius: 40000, capital: 'Enugu', majorCities: ['Nsukka', 'Agbani'] },
  'Katsina': { lat: 12.9908, lng: 7.6018, radius: 50000, capital: 'Katsina', majorCities: ['Daura', 'Funtua'] },
  'Edo': { lat: 6.3350, lng: 5.6037, radius: 40000, capital: 'Benin City', majorCities: ['Ekpoma', 'Auchi'] },
  'Akwa Ibom': { lat: 5.0079, lng: 7.8500, radius: 40000, capital: 'Uyo', majorCities: ['Eket', 'Ikot Ekpene'] },
  'Cross River': { lat: 4.9517, lng: 8.3220, radius: 50000, capital: 'Calabar', majorCities: ['Ogoja', 'Ikom'] },
  'Delta': { lat: 5.8904, lng: 5.6800, radius: 40000, capital: 'Asaba', majorCities: ['Warri', 'Sapele', 'Ughelli'] },
  'Imo': { lat: 5.4833, lng: 7.0333, radius: 40000, capital: 'Owerri', majorCities: ['Orlu', 'Okigwe'] },
  'Kwara': { lat: 8.4799, lng: 4.5418, radius: 40000, capital: 'Ilorin', majorCities: ['Offa', 'Jebba'] },
  'Abuja': { lat: 9.0765, lng: 7.3986, radius: 35000, capital: 'Abuja', majorCities: ['Garki', 'Wuse', 'Maitama', 'Gwarinpa'] },
  'FCT': { lat: 9.0765, lng: 7.3986, radius: 35000, capital: 'Abuja', majorCities: ['Garki', 'Wuse', 'Maitama', 'Gwarinpa'] },
  'Anambra': { lat: 6.2109, lng: 7.0700, radius: 40000, capital: 'Awka', majorCities: ['Onitsha', 'Nnewi'] },
  'Bauchi': { lat: 10.3158, lng: 9.8442, radius: 50000, capital: 'Bauchi', majorCities: ['Azare', 'Misau'] },
  'Bayelsa': { lat: 4.9261, lng: 6.2677, radius: 40000, capital: 'Yenagoa', majorCities: ['Brass', 'Ogbia'] },
  'Benue': { lat: 7.7322, lng: 8.5391, radius: 50000, capital: 'Makurdi', majorCities: ['Otukpo', 'Gboko'] },
  'Borno': { lat: 11.8333, lng: 13.1500, radius: 50000, capital: 'Maiduguri', majorCities: ['Biu', 'Dikwa'] },
  'Ebonyi': { lat: 6.2649, lng: 8.0137, radius: 40000, capital: 'Abakaliki', majorCities: ['Onueke', 'Afikpo'] },
  'Ekiti': { lat: 7.6333, lng: 5.2333, radius: 40000, capital: 'Ado-Ekiti', majorCities: ['Ikere', 'Ikole'] },
  'Gombe': { lat: 10.2833, lng: 11.1667, radius: 50000, capital: 'Gombe', majorCities: ['Kumo', 'Billiri'] },
  'Jigawa': { lat: 12.2280, lng: 9.5616, radius: 50000, capital: 'Dutse', majorCities: ['Hadejia', 'Gumel'] },
  'Kaduna': { lat: 10.5167, lng: 7.4333, radius: 50000, capital: 'Kaduna', majorCities: ['Zaria', 'Kafanchan'] },
  'Kebbi': { lat: 12.4539, lng: 4.1975, radius: 50000, capital: 'Birnin Kebbi', majorCities: ['Argungu', 'Yauri'] },
  'Kogi': { lat: 7.7969, lng: 6.7406, radius: 50000, capital: 'Lokoja', majorCities: ['Okene', 'Idah'] },
  'Nasarawa': { lat: 8.5167, lng: 8.5167, radius: 50000, capital: 'Lafia', majorCities: ['Keffi', 'Akwanga'] },
  'Niger': { lat: 9.9333, lng: 5.9667, radius: 50000, capital: 'Minna', majorCities: ['Suleja', 'Bida'] },
  'Ogun': { lat: 6.9167, lng: 3.5833, radius: 40000, capital: 'Abeokuta', majorCities: ['Sagamu', 'Ijebu-Ode'] },
  'Ondo': { lat: 7.2500, lng: 5.1950, radius: 40000, capital: 'Akure', majorCities: ['Ondo', 'Owo'] },
  'Osun': { lat: 7.5167, lng: 4.5167, radius: 40000, capital: 'Osogbo', majorCities: ['Ile-Ife', 'Ilesa'] },
  'Plateau': { lat: 9.8965, lng: 8.8583, radius: 50000, capital: 'Jos', majorCities: ['Bukuru', 'Pankshin'] },
  'Sokoto': { lat: 13.0667, lng: 5.2333, radius: 50000, capital: 'Sokoto', majorCities: ['Tambuwal', 'Wurno'] },
  'Taraba': { lat: 8.8833, lng: 11.3667, radius: 50000, capital: 'Jalingo', majorCities: ['Wukari', 'Bali'] },
  'Yobe': { lat: 11.7500, lng: 11.9667, radius: 50000, capital: 'Damaturu', majorCities: ['Potiskum', 'Gashua'] },
  'Zamfara': { lat: 12.1667, lng: 6.2500, radius: 50000, capital: 'Gusau', majorCities: ['Kaura Namoda', 'Talata Mafara'] },
};

// State validation mapping
const STATE_IDENTIFIERS: Record<string, string[]> = {
  'lagos': ['lagos', 'ikeja', 'victoria island', 'lekki', 'ikoyi', 'surulere', 'yaba', 'maryland'],
  'adamawa': ['adamawa', 'yola', 'jimeta', 'mubi'],
  'abia': ['abia', 'umuahia', 'aba'],
  'kano': ['kano', 'fagge', 'nassarawa'],
  'rivers': ['rivers', 'port harcourt'],
  'oyo': ['oyo', 'ibadan', 'ogbomoso'],
  'enugu': ['enugu', 'nsukka'],
  'katsina': ['katsina', 'daura'],
  'edo': ['edo', 'benin city', 'benin'],
  'akwa ibom': ['akwa ibom', 'uyo', 'eket'],
  'cross river': ['cross river', 'calabar'],
  'delta': ['delta', 'asaba', 'warri'],
  'imo': ['imo', 'owerri'],
  'kwara': ['kwara', 'ilorin'],
  'abuja': ['abuja', 'fct', 'garki', 'wuse', 'maitama', 'gwarinpa'],
  'fct': ['fct', 'abuja', 'garki', 'wuse', 'maitama', 'gwarinpa'],
  'anambra': ['anambra', 'awka', 'onitsha', 'nnewi'],
  'bauchi': ['bauchi', 'azare'],
  'bayelsa': ['bayelsa', 'yenagoa'],
  'benue': ['benue', 'makurdi', 'otukpo', 'gboko'],
  'borno': ['borno', 'maiduguri'],
  'ebonyi': ['ebonyi', 'abakaliki'],
  'ekiti': ['ekiti', 'ado-ekiti', 'ado ekiti'],
  'gombe': ['gombe'],
  'jigawa': ['jigawa', 'dutse'],
  'kaduna': ['kaduna', 'zaria'],
  'kebbi': ['kebbi', 'birnin kebbi'],
  'kogi': ['kogi', 'lokoja'],
  'nasarawa': ['nasarawa', 'lafia', 'keffi'],
  'niger': ['niger', 'minna', 'suleja'],
  'ogun': ['ogun', 'abeokuta', 'sagamu'],
  'ondo': ['ondo', 'akure'],
  'osun': ['osun', 'osogbo', 'oshogbo', 'ile-ife'],
  'plateau': ['plateau', 'jos'],
  'sokoto': ['sokoto'],
  'taraba': ['taraba', 'jalingo'],
  'yobe': ['yobe', 'damaturu', 'potiskum'],
  'zamfara': ['zamfara', 'gusau']
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if an address is within the user's preferred Nigerian state
 */
function isWithinState(address: string, state: string): boolean {
  const addressLower = address.toLowerCase();
  const stateLower = state.toLowerCase();
  
  // Direct state name match
  if (addressLower.includes(stateLower)) {
    return true;
  }
  
  // Check state identifiers
  const identifiers = STATE_IDENTIFIERS[stateLower] || [];
  for (const identifier of identifiers) {
    if (addressLower.includes(identifier)) {
      return true;
    }
  }
  
  // Must be in Nigeria at minimum
  if (!addressLower.includes('nigeria')) {
    return false;
  }
  
  return false;
}

/**
 * Check if a place name is a government entity (not a law firm)
 * Filters out ministries, departments, agencies, and other government bodies
 */
function isGovernmentEntity(placeName: string): boolean {
  const nameLower = placeName.toLowerCase();
  
  // Government keywords to filter out
  const governmentKeywords = [
    // Federal/State/Local Government
    'ministry', 'department', 'agency',
    'federal government', 'state government', 'local government',
    'government of nigeria', 'government office',
    
    // Immigration and Border
    'immigration', 'customs', 'border',
    
    // Specific Agencies
    'nis', 'nigeria immigration service',
    'firs', 'federal inland revenue',
    'efcc', 'economic and financial crimes',
    'icpc', 'independent corrupt practices',
    'ndlea', 'drug law enforcement',
    'nnpc', 'nigerian national petroleum',
    'cbn', 'central bank of nigeria',
    'inec', 'electoral commission',
    'ncc', 'communications commission',
    'sec', 'securities and exchange',
    'cac', 'corporate affairs commission',
    'frsc', 'road safety',
    'npf', 'nigeria police',
    'police headquarters', 'police station',
    'dss', 'state security service',
    'nia', 'national intelligence',
    'nscdc', 'civil defence',
    
    // Commissions and Parastatals
    'commission', 'parastatal', 'authority',
    'bureau', 'board', 'council',
    'secretariat', 'directorate',
    
    // Courts and Judiciary (not law firms)
    'high court', 'magistrate court', 'supreme court',
    'court of appeal', 'federal court', 'state court',
    'tribunal', 'judiciary',
    
    // Embassies and International
    'embassy', 'consulate', 'high commission',
    
    // Military
    'army', 'navy', 'air force', 'military', 'barracks',
    
    // Education and Health (not law firms)
    'university', 'polytechnic', 'college',
    'hospital', 'health centre', 'clinic',
    'school', 'institute',
    
    // Other Government Services
    'passport office', 'visa office',
    'tax office', 'revenue office',
    'local council', 'lga', 'local government area'
  ];
  
  // Check if name contains any government keyword
  for (const keyword of governmentKeywords) {
    if (nameLower.includes(keyword)) {
      console.log(`🚫 Filtered out government entity: "${placeName}" (matched: "${keyword}")`);
      return true;
    }
  }
  
  return false;
}

/**
 * Fetch detailed place information from Google Maps
 */
async function fetchPlaceDetails(placeId: string, apiKey: string): Promise<Record<string, unknown> | null> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', 'formatted_phone_number,website,url,rating,user_ratings_total,opening_hours');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    return data.result || null;
  } catch {
    return null;
  }
}

// ==================== AGENT 1: LOCATION AGENT ====================

/**
 * AGENT 1 - Location Agent
 * 
 * Purpose: Search Google Maps for ALL law firms in user's preferred location
 * Output: Raw firm data (name, address, phone, website, coordinates)
 * 
 * This agent does NOT filter by practice area - it finds ALL law firms
 */
async function agent1_SearchLocation(
  state: string,
  lga: string,
  apiKey: string
): Promise<{ firms: RawFirmData[]; searchStrategy: string }> {
  console.log(`\n[AGENT 1 - LOCATION] Starting search for law firms in ${lga || state}, ${state}`);
  
  const stateData = NIGERIAN_STATE_DATA[state] || {
    lat: 9.0820, lng: 8.6753, radius: 50000,
    capital: state,
    majorCities: []
  };

  const allFirms: RawFirmData[] = [];
  let searchStrategy = '';

  // Build search queries for the location - searching for ALL law firms
  const searchQueries = lga 
    ? [
        `law firm in ${lga}, ${state}, Nigeria`,
        `lawyer ${lga}, ${state}`,
        `legal services ${lga}, ${state}, Nigeria`,
        `barrister ${lga} ${state}`,
        `solicitor ${lga} ${state}`,
        `attorney ${lga}, ${state}`,
      ]
    : [
        `law firm in ${stateData.capital}, ${state}, Nigeria`,
        `lawyer ${state} Nigeria`,
        `legal services ${state}, Nigeria`,
        `barrister ${state} Nigeria`,
        `solicitor ${state} Nigeria`,
      ];

  // Add major cities to search
  for (const city of stateData.majorCities.slice(0, 2)) {
    searchQueries.push(`law firm ${city}, ${state}, Nigeria`);
  }

  console.log(`[AGENT 1] Executing ${searchQueries.length} location searches...`);

  // Execute searches
  for (const query of searchQueries) {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      url.searchParams.append('query', query);
      url.searchParams.append('location', `${stateData.lat},${stateData.lng}`);
      url.searchParams.append('radius', String(stateData.radius));
      url.searchParams.append('type', 'lawyer');
      url.searchParams.append('key', apiKey);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      console.log(`[AGENT 1] Query "${query}" - Found: ${data.results?.length || 0} results`);

      if (data.results && Array.isArray(data.results)) {
        for (const place of data.results) {
          const address = place.formatted_address || '';
          
          // Filter to user's state only
          if (!isWithinState(address, state)) {
            console.log(`[AGENT 1] Skipping "${place.name}" - not in ${state}`);
            continue;
          }

          // Filter out government entities (ministries, agencies, departments, etc.)
          if (isGovernmentEntity(place.name)) {
            continue;
          }

          // Avoid duplicates by place_id
          if (allFirms.some(f => f.placeId === place.place_id)) {
            continue;
          }

          // Get detailed info
          let phone: string | undefined;
          let website: string | undefined;
          let gmapsUrl: string | undefined;
          
          if (place.place_id) {
            const details = await fetchPlaceDetails(place.place_id, apiKey);
            if (details) {
              phone = details.formatted_phone_number as string;
              website = details.website as string;
              gmapsUrl = details.url as string;
            }
          }

          allFirms.push({
            firmName: place.name,
            address: address,
            phone,
            website,
            latitude: place.geometry?.location?.lat,
            longitude: place.geometry?.location?.lng,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            placeId: place.place_id,
            gmapsUrl,
          });
        }
      }

      // Stop if we have enough firms
      if (allFirms.length >= 25) break;

    } catch (error) {
      console.warn(`[AGENT 1] Search failed:`, error instanceof Error ? error.message : error);
      continue;
    }
  }

  // Remove duplicates by firm name
  const uniqueFirms = Array.from(
    new Map(allFirms.map(f => [f.firmName.toLowerCase(), f])).values()
  );

  console.log(`[AGENT 1 - LOCATION] Complete. Found ${uniqueFirms.length} unique law firms in ${state}`);
  
  searchStrategy = uniqueFirms.length > 0 
    ? `Agent 1 found ${uniqueFirms.length} law firms in ${lga || stateData.capital}, ${state}`
    : `No law firms found in ${state} on Google Maps`;

  return { firms: uniqueFirms, searchStrategy };
}

// ==================== AGENT 2: RESEARCH AGENT ====================

/**
 * Research result structure with rich firm information
 */
interface FirmResearchResult {
  firmSummary: string;
  practiceAreas: string[];
  specializations: string[];
  lawyersInfo: string;
  servicesOffered: string;
  headOfChambers: string;
  yearsPostCall: number | null;
  teamSize: string;
  achievements: string;
  source: string;
}

/**
 * NBA Lawyer verification result
 */
interface NBALawyerInfo {
  name: string;
  yearCalled: number | null;
  yearsPostCall: number | null;
  scn: string | null; // Supreme Court Number
  branch: string | null;
  verified: boolean;
}

/**
 * Search NBA website for lawyer verification and call-to-bar date
 * https://www.nigerianbar.org.ng/find-a-lawyer
 */
async function searchNBAForLawyer(lawyerName: string): Promise<NBALawyerInfo | null> {
  try {
    console.log(`[NBA] Searching for: ${lawyerName}`);
    
    // The NBA website has a search API - try to search for the lawyer
    const searchName = lawyerName
      .replace(/^(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?|Hon\.?|Justice|SAN)\s+/gi, '')
      .trim();
    
    // Try NBA search endpoint
    const searchUrl = `https://www.nigerianbar.org.ng/find-a-lawyer?search=${encodeURIComponent(searchName)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`[NBA] Search returned ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Parse the HTML to find lawyer information
    // Look for year called to bar pattern
    const yearPatterns = [
      /called\s+(?:to\s+(?:the\s+)?bar\s+)?(?:in\s+)?(\d{4})/gi,
      /year\s+(?:of\s+)?call[:\s]+(\d{4})/gi,
      /(\d{4})\s+call/gi,
      /enrolled[:\s]+(\d{4})/gi,
    ];
    
    let yearCalled: number | null = null;
    for (const pattern of yearPatterns) {
      const match = html.match(pattern);
      if (match) {
        const yearMatch = match[0].match(/(\d{4})/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          if (year >= 1960 && year <= new Date().getFullYear()) {
            yearCalled = year;
            break;
          }
        }
      }
    }
    
    // Look for SCN (Supreme Court Number)
    const scnMatch = html.match(/SCN[:\s]*([A-Z0-9\/\-]+)/i);
    const scn = scnMatch ? scnMatch[1] : null;
    
    // Look for branch
    const branchMatch = html.match(/branch[:\s]*([A-Za-z\s]+(?:branch)?)/i);
    const branch = branchMatch ? branchMatch[1].trim() : null;
    
    const currentYear = new Date().getFullYear();
    const yearsPostCall = yearCalled ? currentYear - yearCalled : null;
    
    if (yearCalled || scn) {
      console.log(`[NBA] ✓ Found: ${searchName} - Called: ${yearCalled || 'Unknown'}, ${yearsPostCall || '?'} years post-call`);
      return {
        name: searchName,
        yearCalled,
        yearsPostCall,
        scn,
        branch,
        verified: true
      };
    }
    
    console.log(`[NBA] No detailed info found for ${searchName}`);
    return null;
    
  } catch (error) {
    console.warn(`[NBA] Search error:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Search Google for head of chambers / principal partner
 */
async function searchForHeadOfChambers(
  firmName: string,
  apiKey: string,
  searchEngineId: string
): Promise<{ name: string; title: string } | null> {
  try {
    const queries = [
      `"${firmName}" Nigeria "head of chambers" OR "principal partner" OR "managing partner" OR "founder"`,
      `"${firmName}" Nigeria "senior partner" OR "lead partner" lawyer`,
    ];
    
    // Words that should NOT be in a person's name
    const invalidNameWords = [
      'the', 'of', 'and', 'at', 'in', 'for', 'to', 'with', 'by',
      'year', 'award', 'firm', 'law', 'legal', 'nigeria', 'lagos', 'abuja',
      'chambers', 'associates', 'partners', 'solicitors', 'company', 'office',
      'services', 'practice', 'best', 'top', 'leading', 'excellent', 'professional',
      'about', 'contact', 'home', 'team', 'client', 'case', 'court', 'nomos',
      'resolution', 'osuya', 'principal', 'managing', 'senior', 'founding'
    ];
    
    for (const query of queries) {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.append('key', apiKey);
      url.searchParams.append('cx', searchEngineId);
      url.searchParams.append('q', query);
      url.searchParams.append('num', '5');
      
      console.log(`[AGENT 2] Searching for head of chambers: "${query}"`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const snippet = (item.snippet || '') + ' ' + (item.title || '');
          
          // Look for name patterns
          const namePatterns = [
            /(?:headed|managed|founded|led)\s+by\s+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?|Hon\.?|Justice)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
            /(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*(?:,?\s*SAN)?\s*(?:is\s+the|,\s*(?:the\s+)?(?:head|principal|managing|senior|founding))/gi,
            /(?:head|principal|managing|senior|founding)\s+(?:partner|counsel)\s*[:\-]?\s*(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*(?:,?\s*SAN)?\s*[,\-]\s*(?:Head|Principal|Managing|Senior|Founding)/gi,
          ];
          
          for (const pattern of namePatterns) {
            const matches = snippet.matchAll(pattern);
            for (const match of matches) {
              if (match[1]) {
                const name = match[1].trim();
                const nameLower = name.toLowerCase();
                
                // Validate it looks like a person's name
                const hasInvalidWord = invalidNameWords.some(word => nameLower.includes(word));
                const hasValidLength = name.length > 5 && name.length < 50;
                const looksLikeName = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(name);
                const hasAtLeastTwoWords = name.split(/\s+/).length >= 2;
                
                if (hasValidLength && !hasInvalidWord && looksLikeName && hasAtLeastTwoWords) {
                  console.log(`[AGENT 2] ✓ Found head of chambers: ${name}`);
                  return { name, title: 'Head of Chambers' };
                }
              }
            }
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`[AGENT 2] Head of chambers search error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Extract head of chambers from website content
 */
function extractHeadFromContent(content: string): string | null {
  // Words that should NOT be in a person's name
  const invalidNameWords = [
    'the', 'of', 'and', 'at', 'in', 'for', 'to', 'with', 'by',
    'year', 'award', 'firm', 'law', 'legal', 'nigeria', 'lagos', 'abuja',
    'chambers', 'associates', 'partners', 'solicitors', 'company', 'office',
    'services', 'practice', 'best', 'top', 'leading', 'excellent', 'professional',
    'about', 'contact', 'home', 'team', 'client', 'case', 'court', 'founder',
    'nomos', 'resolution', 'osuya', 'principal', 'managing', 'senior', 'founding'
  ];
  
  const patterns = [
    /(?:head\s+of\s+chambers|principal\s+partner|managing\s+partner|senior\s+partner)[:\s\-]+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
    /(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*(?:,?\s*SAN)?\s*(?:is\s+(?:the\s+)?(?:head|principal|managing|founder))/gi,
    /(?:founded|established)\s+by\s+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Barrister|Barr\.?)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const nameMatch = match[0].match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim();
        const nameLower = name.toLowerCase();
        
        // Validate it looks like a person's name
        const hasInvalidWord = invalidNameWords.some(word => nameLower.includes(word));
        const hasValidLength = name.length > 5 && name.length < 50;
        const hasAtLeastTwoWords = name.split(/\s+/).length >= 2;
        
        if (hasValidLength && !hasInvalidWord && hasAtLeastTwoWords) {
          return name;
        }
      }
    }
  }
  
  return null;
}

/**
 * Extract team size information from content
 */
function extractTeamInfo(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Look for team size mentions
  const teamPatterns = [
    /team\s+of\s+(\d+)\s+(?:lawyers|attorneys|legal\s+professionals)/gi,
    /(\d+)\s+(?:lawyers|attorneys|partners|associates)/gi,
    /(?:over|more\s+than)\s+(\d+)\s+(?:lawyers|legal)/gi,
    /comprises?\s+(?:of\s+)?(\d+)\s+(?:lawyers|partners)/gi,
  ];
  
  for (const pattern of teamPatterns) {
    const match = content.match(pattern);
    if (match) {
      const numMatch = match[0].match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1]);
        if (num > 0 && num < 500) {
          return `${num} legal professionals`;
        }
      }
    }
  }
  
  // Look for qualitative descriptions
  if (lowerContent.includes('large team') || lowerContent.includes('extensive team')) {
    return 'a large team of legal professionals';
  }
  if (lowerContent.includes('experienced team') || lowerContent.includes('team of experienced')) {
    return 'a team of experienced legal professionals';
  }
  if (lowerContent.includes('partners') && lowerContent.includes('associates')) {
    return 'partners and associates';
  }
  
  return '';
}

/**
 * Extract achievements and goals from website content
 */
function extractAchievements(content: string, firmName: string): string {
  const sentences = content
    .split(/[.!]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 300);
  
  const achievementKeywords = [
    'award', 'recognized', 'recognition', 'leading', 'top', 'best',
    'excellence', 'achievement', 'successful', 'milestone', 'notable',
    'landmark', 'prestigious', 'renowned', 'committed', 'dedicated',
    'mission', 'vision', 'goal', 'objective', 'strive', 'deliver'
  ];
  
  const achievements: string[] = [];
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (achievementKeywords.some(kw => lower.includes(kw))) {
      // Clean up the sentence
      const cleaned = sentence
        .replace(/\s+/g, ' ')
        .trim();
      if (cleaned.length > 20 && !achievements.includes(cleaned)) {
        achievements.push(cleaned);
      }
    }
  }
  
  if (achievements.length > 0) {
    return achievements.slice(0, 2).join('. ') + '.';
  }
  
  return '';
}

/**
 * Generate firm summary using OpenAI GPT-4o-mini for accurate, detailed content
 * This provides much higher accuracy than regex-based extraction
 */
async function generateFirmSummaryWithAI(
  firmName: string,
  websiteContent: string,
  googleSearchSnippets: string,
  practiceAreas: string[],
  headOfChambers: string | null,
  yearsPostCall: number | null
): Promise<string | null> {
  if (!openai) {
    console.log('[AGENT 2] OpenAI not configured, falling back to regex extraction');
    return null;
  }

  try {
    // Combine and truncate content for API call
    const combinedContent = `
Website Content:
${websiteContent.substring(0, 6000)}

Search Results:
${googleSearchSnippets.substring(0, 2000)}
    `.trim();

    const systemPrompt = `You are a professional legal content writer for iFind Attorney, a Nigerian lawyer recommendation platform. Your task is to generate accurate, factual "About the Firm" summaries for Nigerian law firms.

CRITICAL RULES:
1. ONLY use information explicitly stated in the provided content
2. DO NOT invent names, dates, achievements, or any details not in the content
3. If specific information is missing, use generic professional language
4. Never make up the head of chambers name - use ONLY if provided or clearly stated in content
5. All content must be factual and verifiable from the source material

OUTPUT FORMAT (follow this structure exactly):
- Sentence 1: Who manages/leads the firm (use provided name or say "This professional law firm" if unknown)
- Sentence 2: What practice areas they specialize in
- Sentence 3: Brief info about the team composition (if available)
- Sentence 4: The head's experience/years post-call (ONLY if provided)
- Sentence 5: Firm's goals, achievements, or commitment to clients

Keep the summary between 3-5 sentences. Be professional and accurate.`;

    const userPrompt = `Generate an "About the Firm" summary for: ${firmName}

${headOfChambers ? `Verified Head of Chambers: ${headOfChambers}` : 'Head of Chambers: Not verified'}
${yearsPostCall ? `Years Post-Call: ${yearsPostCall}` : ''}
Practice Areas: ${practiceAreas.length > 0 ? practiceAreas.join(', ') : 'General Practice'}

Source Content:
${combinedContent}

Generate the summary following the exact format specified. Only include facts that can be verified from the content above.`;

    console.log(`[AGENT 2] 🤖 Generating AI summary for ${firmName}...`);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Low temperature for more factual output
      max_tokens: 300,
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    
    if (summary && summary.length > 50) {
      console.log(`[AGENT 2] ✓ AI summary generated (${summary.length} chars)`);
      return summary;
    }
    
    return null;
  } catch (error) {
    console.error(`[AGENT 2] OpenAI error:`, error);
    return null;
  }
}

/**
 * Build structured firm summary with the required format
 * Format: "This law firm is managed by {name}. They specialise in {areas}. 
 * The firm consists of a legal team ranging from {team info}. 
 * The head of the firm {name} is a lawyer with {x} years post-call experience.
 * {Goals and achievements from website}."
 */
function buildStructuredSummary(
  firmName: string,
  headOfChambers: string | null,
  practiceAreas: string[],
  teamInfo: string,
  yearsPostCall: number | null,
  achievements: string,
  website: string | undefined
): string {
  const parts: string[] = [];
  
  // Part 1: Head of chambers introduction
  if (headOfChambers) {
    parts.push(`This law firm is managed by ${headOfChambers}`);
  } else {
    // Extract potential name from firm name (e.g., "Okafor & Co" -> "Okafor")
    const firmNameParts = firmName.split(/[\s&,]+/);
    const potentialFounder = firmNameParts[0];
    if (potentialFounder && potentialFounder.length > 2 && 
        !['the', 'law', 'legal', 'chambers', 'associates'].includes(potentialFounder.toLowerCase())) {
      parts.push(`${firmName} is a law firm likely founded by ${potentialFounder}`);
    } else {
      parts.push(`${firmName} is a professional law firm in Nigeria`);
    }
  }
  
  // Part 2: Practice areas (always include if available)
  if (practiceAreas.length > 0) {
    const areasList = practiceAreas.slice(0, 5).join(', ');
    parts.push(`They specialise in a range of practice areas including ${areasList}`);
  } else {
    parts.push(`They provide comprehensive legal services to individuals and businesses`);
  }
  
  // Part 3: Team composition
  if (teamInfo && teamInfo.length > 0) {
    parts.push(`The firm consists of a legal team comprising ${teamInfo}`);
  } else {
    parts.push(`The firm has a team of qualified legal professionals`);
  }
  
  // Part 4: Head's experience with years post-call
  if (headOfChambers && yearsPostCall && yearsPostCall > 0) {
    parts.push(`The head of the firm, ${headOfChambers}, is a lawyer with ${yearsPostCall} years post-call experience`);
  } else if (headOfChambers) {
    parts.push(`The firm is led by ${headOfChambers}, an experienced legal practitioner`);
  }
  
  // Part 5: Achievements and goals (from website analysis)
  if (achievements && achievements.length > 20) {
    parts.push(achievements);
  } else {
    // Add a generic but professional closing
    parts.push(`The firm is committed to providing quality legal representation and services to their clients`);
  }
  
  // Join with proper punctuation
  let summary = parts.map((part, index) => {
    // Clean up each part
    let cleaned = part.trim();
    // Remove trailing punctuation
    cleaned = cleaned.replace(/[.,;:]+$/, '');
    return cleaned;
  }).join('. ');
  
  // Add final period
  summary += '.';
  
  // Clean up any double periods or spacing issues
  summary = summary
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
  
  return summary;
}

/**
 * Directly fetch and parse a webpage to extract text content
 */
async function fetchWebpageContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; iFind Attorney Bot/1.0; +https://ifindattorney.ng)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract text content from HTML (basic parsing without external libs)
    let text = html
      // Remove scripts and styles
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove HTML tags but keep content
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&ndash;/g, '-')
      .replace(/&mdash;/g, '-')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit length
    return text.substring(0, 15000);
  } catch (error) {
    console.warn(`[AGENT 2] Failed to fetch ${url}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Find common page URLs on a website (about, services, team pages)
 */
function getCommonPageUrls(baseUrl: string): { about: string[], services: string[], team: string[] } {
  // Normalize base URL
  let base = baseUrl.replace(/\/$/, '');
  if (!base.startsWith('http')) {
    base = 'https://' + base;
  }
  
  return {
    about: [
      `${base}/about`,
      `${base}/about-us`,
      `${base}/about-us/`,
      `${base}/our-firm`,
      `${base}/who-we-are`,
      `${base}/company`,
      base // Homepage often has about info
    ],
    services: [
      `${base}/services`,
      `${base}/practice-areas`,
      `${base}/practice`,
      `${base}/expertise`,
      `${base}/areas-of-practice`,
      `${base}/what-we-do`
    ],
    team: [
      `${base}/team`,
      `${base}/our-team`,
      `${base}/lawyers`,
      `${base}/attorneys`,
      `${base}/people`,
      `${base}/partners`,
      `${base}/professionals`
    ]
  };
}

/**
 * Summarize raw text content into a coherent description
 */
function summarizeContent(rawText: string, firmName: string, maxLength: number = 500): string {
  if (!rawText || rawText.length < 50) return '';
  
  // Find sentences that are likely about the firm
  const sentences = rawText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 400)
    .filter(s => {
      const lower = s.toLowerCase();
      // Keep sentences about the firm, services, or expertise
      return (
        lower.includes('law') ||
        lower.includes('legal') ||
        lower.includes('firm') ||
        lower.includes('practice') ||
        lower.includes('client') ||
        lower.includes('service') ||
        lower.includes('experience') ||
        lower.includes('speciali') ||
        lower.includes('expertise') ||
        lower.includes('years') ||
        lower.includes('team') ||
        lower.includes('established') ||
        lower.includes('founded') ||
        lower.includes('partner') ||
        lower.includes('attorney') ||
        lower.includes('counsel') ||
        firmName.toLowerCase().split(/\s+/).some(word => word.length > 2 && lower.includes(word.toLowerCase()))
      );
    })
    // Filter out navigation/menu text
    .filter(s => {
      const lower = s.toLowerCase();
      return !(
        lower.includes('click here') ||
        lower.includes('read more') ||
        lower.includes('learn more') ||
        lower.includes('cookie') ||
        lower.includes('privacy policy') ||
        lower.includes('terms of use') ||
        lower.includes('subscribe') ||
        lower.includes('newsletter') ||
        lower.includes('login') ||
        lower.includes('sign up') ||
        lower.includes('search') ||
        lower.includes('menu')
      );
    });
  
  if (sentences.length === 0) return '';
  
  // Take the best sentences (prioritize those mentioning firm name or key terms)
  const prioritized = sentences.sort((a, b) => {
    const aScore = (a.toLowerCase().includes(firmName.toLowerCase().split(/\s+/)[0]) ? 10 : 0) +
                   (a.toLowerCase().includes('founded') || a.toLowerCase().includes('established') ? 5 : 0) +
                   (a.toLowerCase().includes('experience') ? 3 : 0) +
                   (a.toLowerCase().includes('speciali') ? 3 : 0);
    const bScore = (b.toLowerCase().includes(firmName.toLowerCase().split(/\s+/)[0]) ? 10 : 0) +
                   (b.toLowerCase().includes('founded') || b.toLowerCase().includes('established') ? 5 : 0) +
                   (b.toLowerCase().includes('experience') ? 3 : 0) +
                   (b.toLowerCase().includes('speciali') ? 3 : 0);
    return bScore - aScore;
  });
  
  // Build summary from best sentences
  let summary = '';
  for (const sentence of prioritized) {
    if (summary.length + sentence.length + 2 <= maxLength) {
      summary += (summary ? '. ' : '') + sentence;
    } else {
      break;
    }
  }
  
  // Clean up the summary
  summary = summary
    .replace(/\s+/g, ' ')
    .replace(/\.+/g, '.')
    .replace(/\s+\./g, '.')
    .trim();
  
  if (summary && !summary.endsWith('.')) {
    summary += '.';
  }
  
  return summary;
}

/**
 * Research a firm by directly fetching their website
 * Now includes NBA verification for head of chambers
 */
async function researchFirmWebsite(
  firmName: string,
  website: string | undefined,
  googleSearchApiKey?: string,
  searchEngineId?: string
): Promise<FirmResearchResult | null> {
  if (!website) return null;
  
  console.log(`[AGENT 2] 📖 Reading website: ${website}`);
  
  const pageUrls = getCommonPageUrls(website);
  let aboutContent = '';
  let servicesContent = '';
  let teamContent = '';
  let homepageContent = '';
  
  // Fetch homepage and about page
  for (const url of pageUrls.about.slice(0, 3)) {
    const content = await fetchWebpageContent(url);
    if (content && content.length > 200) {
      if (url === pageUrls.about[pageUrls.about.length - 1]) {
        homepageContent = content;
      } else {
        aboutContent += ' ' + content;
      }
      console.log(`[AGENT 2] ✓ Fetched: ${url} (${content.length} chars)`);
      break; // Got about content, stop trying
    }
  }
  
  // Fetch services/practice areas page
  for (const url of pageUrls.services.slice(0, 2)) {
    const content = await fetchWebpageContent(url);
    if (content && content.length > 200) {
      servicesContent = content;
      console.log(`[AGENT 2] ✓ Fetched: ${url} (${content.length} chars)`);
      break;
    }
  }
  
  // Fetch team page
  for (const url of pageUrls.team.slice(0, 2)) {
    const content = await fetchWebpageContent(url);
    if (content && content.length > 200) {
      teamContent = content;
      console.log(`[AGENT 2] ✓ Fetched: ${url} (${content.length} chars)`);
      break;
    }
  }
  
  // Use homepage if no about content found
  if (!aboutContent && homepageContent) {
    aboutContent = homepageContent;
  }
  
  // If we couldn't fetch anything, return null
  if (!aboutContent && !servicesContent && !teamContent) {
    console.log(`[AGENT 2] ✗ Could not fetch content from ${website}`);
    return null;
  }
  
  // Combine all content for analysis
  const allContent = `${aboutContent} ${servicesContent} ${teamContent}`;
  const allContentLower = allContent.toLowerCase();
  
  // Extract practice areas
  const practiceAreas: Set<string> = new Set();
  const specializations: Set<string> = new Set();
  extractPracticeAreas(allContentLower, practiceAreas, specializations);
  
  // Extract head of chambers from website content
  let headOfChambers = extractHeadFromContent(allContent);
  
  // If not found on website and Google Search is available, search Google
  if (!headOfChambers && googleSearchApiKey && searchEngineId) {
    const headResult = await searchForHeadOfChambers(firmName, googleSearchApiKey, searchEngineId);
    if (headResult) {
      headOfChambers = headResult.name;
    }
  }
  
  // Search NBA for head of chambers verification and call-to-bar year
  let yearsPostCall: number | null = null;
  if (headOfChambers) {
    console.log(`[AGENT 2] 🔍 Verifying ${headOfChambers} on NBA website...`);
    const nbaInfo = await searchNBAForLawyer(headOfChambers);
    if (nbaInfo && nbaInfo.yearsPostCall) {
      yearsPostCall = nbaInfo.yearsPostCall;
      console.log(`[AGENT 2] ✓ NBA verified: ${headOfChambers} - ${yearsPostCall} years post-call`);
    }
  }
  
  // Extract team information
  const teamInfo = extractTeamInfo(allContent);
  
  // Extract achievements and goals
  const achievements = extractAchievements(allContent, firmName);
  
  // Try AI-generated summary first (much more accurate)
  let firmSummary = await generateFirmSummaryWithAI(
    firmName,
    allContent,
    '', // No Google snippets for website research
    Array.from(practiceAreas),
    headOfChambers,
    yearsPostCall
  );
  
  // Fallback to regex-based summary if AI fails
  if (!firmSummary) {
    firmSummary = buildStructuredSummary(
      firmName,
      headOfChambers,
      Array.from(practiceAreas),
      teamInfo,
      yearsPostCall,
      achievements,
      website
    );
  }
  
  // Build services and lawyers info
  const servicesOffered = practiceAreas.size > 0 
    ? `Legal services including ${Array.from(practiceAreas).slice(0, 5).join(', ')}.`
    : '';
  
  const lawyersInfo = teamInfo 
    ? `The legal team comprises ${teamInfo}.`
    : teamContent ? summarizeContent(teamContent, firmName, 200) : '';
  
  return {
    firmSummary,
    practiceAreas: Array.from(practiceAreas),
    specializations: Array.from(specializations),
    lawyersInfo,
    servicesOffered,
    headOfChambers: headOfChambers || '',
    yearsPostCall,
    teamSize: teamInfo,
    achievements,
    source: 'Firm Website'
  };
}

/**
 * Conduct Google Custom Search to research a firm (fallback when website not accessible)
 * Extracts: firm summary, practice areas, specializations, lawyers info, services
 */
async function googleSearch(
  firmName: string,
  website: string | undefined,
  apiKey: string,
  searchEngineId: string
): Promise<FirmResearchResult | null> {
  try {
    // Build search queries
    const queries: string[] = [];
    
    if (website) {
      const cleanDomain = website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      queries.push(`site:${cleanDomain} "about us" OR "our firm" OR "who we are" OR "our story"`);
      queries.push(`site:${cleanDomain} "practice areas" OR "services" OR "expertise" OR "specialization"`);
    } else {
      queries.push(`"${firmName}" Nigeria law firm "about" OR "practice areas" OR "services"`);
      queries.push(`"${firmName}" lawyers partners team Nigeria`);
    }

    let allSnippets: string[] = [];
    let firmWebsiteSnippets: string[] = [];
    let source = 'Google Search';
    const foundPracticeAreas: Set<string> = new Set();
    const foundSpecializations: Set<string> = new Set();
    let aboutUsContent = '';
    let servicesContent = '';
    let teamContent = '';

    for (const query of queries) {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.append('key', apiKey);
      url.searchParams.append('cx', searchEngineId);
      url.searchParams.append('q', query);
      url.searchParams.append('num', '8');

      console.log(`[AGENT 2] Google Search: "${query}"`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[AGENT 2] Google Search API returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const snippet = item.snippet || '';
          const title = item.title || '';
          const link = item.link || '';
          const pagemap = item.pagemap || {};
          
          let metaDescription = '';
          if (pagemap.metatags && pagemap.metatags[0]) {
            metaDescription = pagemap.metatags[0]['og:description'] || pagemap.metatags[0]['description'] || '';
          }
          
          const fullSnippet = `${title} - ${snippet} ${metaDescription}`.trim();
          allSnippets.push(fullSnippet);
          
          if (website) {
            const websiteClean = website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
            if (link.includes(websiteClean)) {
              firmWebsiteSnippets.push(fullSnippet);
              source = 'Firm Website';
              
              const linkLower = link.toLowerCase();
              const titleLower = title.toLowerCase();
              
              if (linkLower.includes('about') || titleLower.includes('about') || titleLower.includes('who we are') || titleLower.includes('our firm')) {
                aboutUsContent += ` ${fullSnippet}`;
              }
              if (linkLower.includes('practice') || linkLower.includes('service') || linkLower.includes('expertise') || titleLower.includes('practice')) {
                servicesContent += ` ${fullSnippet}`;
              }
              if (linkLower.includes('team') || linkLower.includes('lawyer') || linkLower.includes('partner') || linkLower.includes('people') || titleLower.includes('team')) {
                teamContent += ` ${fullSnippet}`;
              }
            }
          }

          const content = fullSnippet.toLowerCase();
          extractPracticeAreas(content, foundPracticeAreas, foundSpecializations);
        }
      }
    }

    const websiteContent = firmWebsiteSnippets.join(' ');
    const allContent = allSnippets.join(' ');
    
    let firmSummary = '';
    if (aboutUsContent.length > 50) {
      firmSummary = cleanAndTruncate(aboutUsContent, 400);
      source = 'Firm Website';
    } else if (websiteContent.length > 50) {
      firmSummary = cleanAndTruncate(websiteContent, 400);
      source = 'Firm Website';
    } else if (allContent.length > 50) {
      firmSummary = cleanAndTruncate(allContent, 400);
    } else {
      firmSummary = `${firmName} is a law firm providing professional legal services.`;
    }

    let lawyersInfo = '';
    if (teamContent.length > 30) {
      lawyersInfo = cleanAndTruncate(teamContent, 200);
    } else {
      lawyersInfo = extractLawyersInfo(allContent);
    }
    
    let servicesOffered = '';
    if (servicesContent.length > 30) {
      servicesOffered = cleanAndTruncate(servicesContent, 200);
    } else {
      servicesOffered = extractServicesInfo(allContent, Array.from(foundPracticeAreas));
    }
    
    // Try to find head of chambers from search results
    let headOfChambers = extractHeadFromContent(allContent);
    
    // Extract team info
    const teamInfo = extractTeamInfo(allContent);
    
    // If we found head of chambers, try NBA verification
    let yearsPostCall: number | null = null;
    if (headOfChambers) {
      const nbaInfo = await searchNBAForLawyer(headOfChambers);
      if (nbaInfo && nbaInfo.yearsPostCall) {
        yearsPostCall = nbaInfo.yearsPostCall;
      }
    }
    
    // Extract achievements
    const achievements = extractAchievements(allContent, firmName);
    
    // Try AI-generated summary first (much more accurate)
    let aiSummary: string | null = null;
    if (headOfChambers || foundPracticeAreas.size > 0) {
      aiSummary = await generateFirmSummaryWithAI(
        firmName,
        allContent,
        allSnippets.join(' '), // Include Google snippets
        Array.from(foundPracticeAreas),
        headOfChambers,
        yearsPostCall
      );
    }
    
    // Use AI summary if available, otherwise fall back to regex-based
    if (aiSummary) {
      firmSummary = aiSummary;
    } else if (headOfChambers || foundPracticeAreas.size > 0) {
      firmSummary = buildStructuredSummary(
        firmName,
        headOfChambers,
        Array.from(foundPracticeAreas),
        teamInfo,
        yearsPostCall,
        achievements,
        website
      );
    }

    return {
      firmSummary,
      practiceAreas: Array.from(foundPracticeAreas),
      specializations: Array.from(foundSpecializations),
      lawyersInfo,
      servicesOffered,
      headOfChambers: headOfChambers || '',
      yearsPostCall,
      teamSize: teamInfo,
      achievements,
      source
    };

  } catch (error) {
    console.warn(`[AGENT 2] Google Search error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Extract practice areas and specializations from content
 */
function extractPracticeAreas(
  content: string, 
  practiceAreas: Set<string>, 
  specializations: Set<string>
): void {
  const practiceKeywords: Record<string, string[]> = {
    'Corporate Law': ['corporate', 'company', 'business law', 'mergers', 'acquisitions', 'corporate governance', 'incorporation'],
    'Commercial Law': ['commercial', 'trade', 'contracts', 'business transactions', 'sale of goods'],
    'Family Law': ['family', 'divorce', 'matrimonial', 'custody', 'child support', 'adoption', 'marriage'],
    'Property Law': ['property', 'real estate', 'land', 'conveyancing', 'tenancy', 'lease', 'mortgage'],
    'Employment Law': ['employment', 'labor', 'labour', 'workplace', 'hr legal', 'wrongful termination', 'unfair dismissal'],
    'Dispute Resolution': ['dispute', 'litigation', 'arbitration', 'mediation', 'adr', 'court'],
    'Criminal Law': ['criminal', 'defense', 'prosecution', 'crime', 'bail', 'criminal defense'],
    'Immigration Law': ['immigration', 'visa', 'citizenship', 'asylum', 'work permit', 'expatriate'],
    'Intellectual Property': ['intellectual property', 'ip', 'patent', 'trademark', 'copyright', 'brand protection'],
    'Tax Law': ['tax', 'taxation', 'revenue', 'vat', 'fiscal'],
    'Banking & Finance': ['banking', 'finance', 'financial', 'investment', 'securities', 'capital markets'],
    'Oil & Gas': ['oil', 'gas', 'energy', 'petroleum', 'mining'],
    'Maritime Law': ['maritime', 'shipping', 'admiralty', 'marine'],
    'Insurance Law': ['insurance', 'claims', 'underwriting'],
    'Human Rights': ['human rights', 'civil rights', 'constitutional'],
    'Environmental Law': ['environmental', 'climate', 'pollution'],
    'General Practice': ['general practice', 'legal services', 'law firm', 'legal advice']
  };

  // Specific specialization keywords
  const specializationKeywords = [
    'mergers and acquisitions', 'm&a', 'capital markets', 'project finance',
    'private equity', 'venture capital', 'debt restructuring', 'insolvency',
    'anti-corruption', 'compliance', 'regulatory', 'fintech', 'blockchain',
    'data protection', 'privacy', 'cybersecurity', 'infrastructure',
    'public procurement', 'ppp', 'joint ventures', 'cross-border',
    'international trade', 'foreign investment', 'exchange control'
  ];

  for (const [area, keywords] of Object.entries(practiceKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        practiceAreas.add(area);
        break;
      }
    }
  }

  for (const spec of specializationKeywords) {
    if (content.includes(spec)) {
      specializations.add(spec.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  }
}

/**
 * Extract information about lawyers/partners from content
 */
function extractLawyersInfo(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Look for partner/lawyer mentions
  const partnerPatterns = [
    /(?:founding|managing|senior|junior)\s*partner/gi,
    /(?:principal|associate|counsel)/gi,
    /team of (?:\d+|experienced|qualified) (?:lawyers|attorneys|legal professionals)/gi,
  ];

  for (const pattern of partnerPatterns) {
    const match = content.match(pattern);
    if (match) {
      return `The firm has ${match[0].toLowerCase()}.`;
    }
  }

  // Check for team size indicators
  if (lowerContent.includes('team') || lowerContent.includes('lawyers') || lowerContent.includes('attorneys')) {
    return 'The firm has a team of experienced legal professionals.';
  }

  return 'Contact the firm for information about their legal team.';
}

/**
 * Extract services offered from content
 */
function extractServicesInfo(content: string, practiceAreas: string[]): string {
  if (practiceAreas.length === 0) {
    return 'Full range of legal services available. Contact the firm for details.';
  }
  
  const topAreas = practiceAreas.slice(0, 4);
  return `Offers legal services in ${topAreas.join(', ')}${practiceAreas.length > 4 ? ` and ${practiceAreas.length - 4} more areas` : ''}.`;
}

/**
 * Clean and truncate text for display
 */
function cleanAndTruncate(text: string, maxLength: number): string {
  // Remove extra whitespace and clean up
  let cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s*\.\s*/g, '. ')
    .trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Truncate at sentence boundary if possible
  const truncated = cleaned.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  
  if (lastPeriod > maxLength * 0.6) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  return truncated.trim() + '...';
}

/**
 * Fallback: Analyze firm name and website URL to infer practice areas
 */
function inferPracticeAreasFromName(firmName: string, website?: string): string[] {
  const textToAnalyze = (firmName + ' ' + (website || '')).toLowerCase();
  const areas: Set<string> = new Set();

  const nameKeywords: Record<string, string[]> = {
    'Corporate Law': ['corporate', 'business', 'company', 'commercial'],
    'Commercial Law': ['commercial', 'trade', 'mercantile'],
    'Family Law': ['family', 'matrimonial', 'divorce'],
    'Property Law': ['property', 'estate', 'land', 'conveyancing'],
    'Dispute Resolution': ['litigation', 'dispute', 'chambers', 'arbitration'],
    'Criminal Law': ['criminal', 'defense', 'prosecution'],
    'Immigration Law': ['immigration', 'visa', 'expatriate'],
    'Intellectual Property': ['ip', 'patent', 'trademark', 'intellectual'],
    'Maritime Law': ['maritime', 'shipping', 'admiralty'],
    'Oil & Gas': ['oil', 'gas', 'energy', 'petroleum'],
    'Tax Law': ['tax', 'taxation', 'fiscal'],
    'Banking & Finance': ['banking', 'finance', 'capital']
  };

  for (const [area, keywords] of Object.entries(nameKeywords)) {
    if (keywords.some(kw => textToAnalyze.includes(kw))) {
      areas.add(area);
    }
  }

  // Default to general practice
  if (areas.size === 0) {
    areas.add('General Practice');
  }

  return Array.from(areas);
}

/**
 * AGENT 2 - Research Agent
 * 
 * Purpose: Research each firm found by Agent 1
 * - First tries to directly fetch and read the firm's website
 * - Falls back to Google Search if website not accessible
 * - Extracts: firm summary, practice areas, specializations, lawyers info
 * - Filters firms based on user's required practice areas
 * - Generates comprehensive summary for display on cards
 */
async function agent2_ResearchFirms(
  rawFirms: RawFirmData[],
  userPracticeAreas: string[],
  googleSearchApiKey: string | undefined,
  searchEngineId: string | undefined
): Promise<ResearchedFirmData[]> {
  console.log(`\n[AGENT 2 - RESEARCH] Starting research on ${rawFirms.length} firms`);
  console.log(`[AGENT 2] User requires practice areas: ${userPracticeAreas.join(', ')}`);
  
  const researchedFirms: ResearchedFirmData[] = [];
  const hasGoogleSearch = googleSearchApiKey && searchEngineId;

  if (!hasGoogleSearch) {
    console.log(`[AGENT 2] ⚠️ Google Search API not configured - will rely on direct website access`);
  }

  for (const firm of rawFirms) {
    console.log(`[AGENT 2] Researching: ${firm.firmName}`);
    
    let practiceAreas: string[] = [];
    let specializations: string[] = [];
    let firmSummary = '';
    let lawyersInfo = '';
    let servicesOffered = '';
    let researchSource = 'Name Analysis';
    
    // STEP 1: Try to directly fetch and read the firm's website
    if (firm.website) {
      console.log(`[AGENT 2] 🌐 Attempting direct website access: ${firm.website}`);
      const websiteResult = await researchFirmWebsite(
        firm.firmName, 
        firm.website,
        googleSearchApiKey,  // Pass API keys for head of chambers search
        searchEngineId
      );
      
      if (websiteResult && websiteResult.firmSummary.length > 100) {
        practiceAreas = websiteResult.practiceAreas;
        specializations = websiteResult.specializations;
        firmSummary = websiteResult.firmSummary;
        lawyersInfo = websiteResult.lawyersInfo;
        servicesOffered = websiteResult.servicesOffered;
        researchSource = 'Firm Website (Direct)';
        
        console.log(`[AGENT 2] ✓ Successfully read website content: ${firmSummary.substring(0, 80)}...`);
      }
    }
    
    // STEP 2: Fall back to Google Search if website access failed
    if (!firmSummary && hasGoogleSearch) {
      console.log(`[AGENT 2] 🔍 Falling back to Google Search for ${firm.firmName}`);
      const searchResult = await googleSearch(
        firm.firmName,
        firm.website,
        googleSearchApiKey,
        searchEngineId
      );
      
      if (searchResult) {
        practiceAreas = searchResult.practiceAreas;
        specializations = searchResult.specializations;
        firmSummary = searchResult.firmSummary;
        lawyersInfo = searchResult.lawyersInfo;
        servicesOffered = searchResult.servicesOffered;
        researchSource = searchResult.source;
        
        console.log(`[AGENT 2] ✓ Found info from ${researchSource}: ${practiceAreas.length} practice areas`);
      }
    }
    
    // STEP 3: Fallback - Infer from firm name if no practice areas found
    if (practiceAreas.length === 0) {
      practiceAreas = inferPracticeAreasFromName(firm.firmName, firm.website);
    }
    
    // STEP 4: Always generate structured summary if we don't have one yet
    if (!firmSummary || firmSummary.length < 100) {
      // Try AI-generated summary first
      const aiSummary = await generateFirmSummaryWithAI(
        firm.firmName,
        '', // No website content available
        '', // No Google snippets
        practiceAreas,
        null, // No head of chambers found
        null  // No years post-call
      );
      
      if (aiSummary) {
        firmSummary = aiSummary;
        researchSource = 'AI Analysis';
      } else {
        // Fall back to regex-based summary
        firmSummary = buildStructuredSummary(
          firm.firmName,
          null,  // headOfChambers - not found
          practiceAreas,
          '',    // teamInfo - not found
          null,  // yearsPostCall - not verified
          '',    // achievements - not found
          firm.website
        );
        researchSource = 'Analysis';
      }
    }
    
    // Ensure services and lawyers info are populated
    if (!servicesOffered || servicesOffered.length < 10) {
      servicesOffered = practiceAreas.length > 0 
        ? `Legal services including ${practiceAreas.join(', ')}.`
        : 'Comprehensive legal services for individuals and businesses.';
    }
    if (!lawyersInfo) {
      lawyersInfo = 'The firm has qualified legal professionals ready to assist with your legal needs.';
    }

    // Check if firm matches user's required practice areas
    const userAreasLower = userPracticeAreas.map(a => a.toLowerCase());
    
    const matchedAreas = practiceAreas.filter(area => {
      const areaLower = area.toLowerCase();
      return userAreasLower.some(userArea => 
        areaLower.includes(userArea) ||
        userArea.includes(areaLower) ||
        // Partial matching for compound terms
        areaLower.split(' ').some(word => word.length > 3 && userArea.includes(word)) ||
        userArea.split(' ').some(word => word.length > 3 && areaLower.includes(word))
      );
    });

    // Include firm if it has at least one matching practice area OR is general practice
    const hasMatch = matchedAreas.length > 0 || practiceAreas.includes('General Practice');

    if (hasMatch) {
      // Calculate match score
      let matchScore = 60; // Base score
      
      if (matchedAreas.length > 0) {
        matchScore = 70 + (matchedAreas.length * 8); // +8 per matched area
      }
      
      if (firm.rating) {
        matchScore += firm.rating * 3; // +3 per rating star
      }
      
      if (researchSource === 'Firm Website') {
        matchScore += 10; // Bonus for verified info from website
      } else if (researchSource === 'Google Search') {
        matchScore += 5;
      }
      
      matchScore = Math.min(98, matchScore); // Cap at 98

      const matchReason = matchedAreas.length > 0
        ? `Specializes in ${matchedAreas.slice(0, 3).join(', ')}`
        : `General practice firm that may assist with ${userPracticeAreas[0]}`;

      researchedFirms.push({
        firmName: firm.firmName,
        address: firm.address,
        location: firm.address.split(',').slice(-2).join(',').trim(),
        phone: firm.phone,
        website: firm.website,
        practiceAreas,
        specializations,
        firmSummary,
        lawyersInfo,
        servicesOffered,
        matchScore,
        matchReason,
        latitude: firm.latitude,
        longitude: firm.longitude,
        rating: firm.rating,
        reviewCount: firm.reviewCount,
        gmapsUrl: firm.gmapsUrl,
        source: 'Google Maps',
        researchSource
      });

      console.log(`[AGENT 2] ✓ ${firm.firmName} - Matched: ${matchedAreas.join(', ') || 'General Practice'}`);
    } else {
      console.log(`[AGENT 2] ✗ ${firm.firmName} - No matching practice areas`);
    }
  }

  // Sort by match score
  researchedFirms.sort((a, b) => b.matchScore - a.matchScore);

  console.log(`[AGENT 2 - RESEARCH] Complete. ${researchedFirms.length}/${rawFirms.length} firms match criteria`);
  
  return researchedFirms;
}

// ==================== MAIN HANDLER ====================

/**
 * Main POST handler - Orchestrates both agents
 */
export async function POST(request: NextRequest) {
  try {
    const body: AgentRequest = await request.json();
    const { state, lga, practiceAreas, budget } = body;

    console.log('\n========================================');
    console.log('🤖 TWO-AGENT AI SEARCH INITIATED');
    console.log('========================================');
    console.log(`📍 State: ${state}`);
    console.log(`📍 LGA: ${lga || 'Not specified'}`);
    console.log(`⚖️ Practice Areas: ${practiceAreas.join(', ')}`);
    console.log(`💰 Budget: ${budget}`);
    console.log('========================================\n');

    if (!state || !practiceAreas || practiceAreas.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: state, practiceAreas',
        results: []
      } as Partial<AgentResponse>, { status: 400 });
    }

    // Get API keys
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const searchApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    console.log(`[CONFIG] Google Maps API: ${mapsApiKey ? '✓ Configured' : '✗ Missing'}`);
    console.log(`[CONFIG] Google Search API: ${searchApiKey ? '✓ Configured' : '✗ Missing'}`);
    console.log(`[CONFIG] Search Engine ID: ${searchEngineId ? '✓ Configured' : '✗ Missing'}`);

    if (!mapsApiKey) {
      console.error('[MAIN] No Google Maps API key configured');
      return NextResponse.json({
        success: false,
        state,
        lga,
        searchQuery: '',
        firmsFound: 0,
        results: [],
        message: 'Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY to environment variables.',
        error: 'API key missing'
      } as AgentResponse, { status: 500 });
    }

    // ==================== AGENT 1: LOCATION SEARCH ====================
    console.log('\n🔍 AGENT 1: LOCATION SEARCH');
    console.log('─'.repeat(40));
    
    const agent1Result = await agent1_SearchLocation(state, lga, mapsApiKey);
    
    if (agent1Result.firms.length === 0) {
      return NextResponse.json({
        success: false,
        state,
        lga,
        searchQuery: `law firms in ${lga || state}, ${state}`,
        firmsFound: 0,
        results: [],
        searchStrategy: agent1Result.searchStrategy,
        message: `No law firms found in ${state} on Google Maps. Try a different location or contact the Nigerian Bar Association for referrals.`
      } as AgentResponse);
    }

    // ==================== AGENT 2: RESEARCH & FILTER ====================
    console.log('\n🔬 AGENT 2: RESEARCH & FILTER');
    console.log('─'.repeat(40));
    
    const agent2Result = await agent2_ResearchFirms(
      agent1Result.firms,
      practiceAreas,
      searchApiKey,
      searchEngineId
    );

    // Build response message
    let message = '';
    let searchStrategy = agent1Result.searchStrategy;

    if (agent2Result.length > 0) {
      const withGoogleSearch = searchApiKey && searchEngineId;
      message = `Found ${agent2Result.length} law firms matching your criteria in ${state}.`;
      searchStrategy += withGoogleSearch 
        ? ` Agent 2 researched each firm via Google Search to verify practice areas.`
        : ` Agent 2 analyzed firm names to determine practice areas. Configure Google Search API for more accurate results.`;
    } else {
      message = `Found ${agent1Result.firms.length} law firms in ${state}, but none match your specific practice area (${practiceAreas.join(', ')}). Consider selecting "General Practice" or contact these firms directly.`;
      // Return all firms with a note
      const allFirmsAsResults: ResearchedFirmData[] = agent1Result.firms.map(firm => {
        const inferredAreas = inferPracticeAreasFromName(firm.firmName, firm.website);
        return {
          firmName: firm.firmName,
          address: firm.address,
          location: firm.address.split(',').slice(-2).join(',').trim(),
          phone: firm.phone,
          website: firm.website,
          practiceAreas: inferredAreas,
          specializations: [],
          firmSummary: `${firm.firmName} is a professional law firm located in ${state}. Contact them directly to confirm if they handle ${practiceAreas[0]} matters and to learn about their areas of expertise.`,
          lawyersInfo: 'Contact the firm for information about their legal team.',
          servicesOffered: `Offers legal services in ${inferredAreas.slice(0, 3).join(', ')}.`,
          matchScore: 50,
          matchReason: `Located in ${state} - confirm practice areas directly`,
          latitude: firm.latitude,
          longitude: firm.longitude,
          rating: firm.rating,
          reviewCount: firm.reviewCount,
          gmapsUrl: firm.gmapsUrl,
          source: 'Google Maps',
          researchSource: 'Name Analysis'
        };
      });

      console.log('\n========================================');
      console.log('🤖 TWO-AGENT AI SEARCH COMPLETE');
      console.log(`Agent 1 found: ${agent1Result.firms.length} firms`);
      console.log(`Agent 2 filtered to: 0 exact matches`);
      console.log(`Returning all ${allFirmsAsResults.length} firms for user review`);
      console.log('========================================\n');

      return NextResponse.json({
        success: true,
        state,
        lga,
        searchQuery: `law firms in ${lga || state}, ${state}`,
        firmsFound: allFirmsAsResults.length,
        results: allFirmsAsResults.slice(0, 15),
        searchStrategy: searchStrategy + ' No exact matches found - showing all law firms in the area.',
        message
      } as AgentResponse & { searchStrategy: string });
    }

    console.log('\n========================================');
    console.log('🤖 TWO-AGENT AI SEARCH COMPLETE');
    console.log(`Agent 1 found: ${agent1Result.firms.length} firms`);
    console.log(`Agent 2 filtered to: ${agent2Result.length} matching firms`);
    console.log('========================================\n');

    return NextResponse.json({
      success: agent2Result.length > 0,
      state,
      lga,
      searchQuery: `law firms in ${lga || state}, ${state}`,
      firmsFound: agent2Result.length,
      results: agent2Result.slice(0, 15), // Limit to 15 results
      searchStrategy,
      message
    } as AgentResponse & { searchStrategy: string });

  } catch (error) {
    console.error('[MAIN] Error:', error);
    
    return NextResponse.json({
      success: false,
      state: 'Unknown',
      lga: 'Unknown',
      searchQuery: '',
      firmsFound: 0,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error searching for law firms. Please try again.'
    } as AgentResponse, { status: 500 });
  }
}
