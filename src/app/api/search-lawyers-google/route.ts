import { NextRequest, NextResponse } from 'next/server';

interface SearchRequestBody {
  location: string;
  lga: string;
  state: string;
  practiceArea?: string;
  userLatitude?: number;
  userLongitude?: number;
}

interface LawyerResult {
  firmName: string;
  location: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  latitude: number;
  longitude: number;
  distance?: number;
  gmapsUrl?: string;
  directionsUrl?: string;
  source: 'google_maps' | 'fallback';
}

// Nigerian state coordinates
const nigerianStateCoordinates: Record<string, { lat: number; lng: number }> = {
  'abia': { lat: 5.533, lng: 7.483 },
  'adamawa': { lat: 9.2076, lng: 12.4956 },
  'akwa ibom': { lat: 4.9221, lng: 8.2959 },
  'anambra': { lat: 6.2167, lng: 6.8833 },
  'bauchi': { lat: 10.3158, lng: 9.8058 },
  'bayelsa': { lat: 4.6753, lng: 5.7833 },
  'borno': { lat: 11.8346, lng: 13.1543 },
  'cross river': { lat: 5.5217, lng: 8.7432 },
  'delta': { lat: 5.7367, lng: 5.6931 },
  'ebonyi': { lat: 6.2667, lng: 8.1167 },
  'edo': { lat: 6.4875, lng: 5.8500 },
  'ekiti': { lat: 7.6242, lng: 5.2642 },
  'enugu': { lat: 6.4549, lng: 7.5248 },
  'fct': { lat: 9.0765, lng: 8.6753 },
  'gombe': { lat: 10.2872, lng: 11.1846 },
  'imo': { lat: 5.4833, lng: 7.0333 },
  'jigawa': { lat: 12.1667, lng: 8.8333 },
  'kaduna': { lat: 10.5074, lng: 7.3846 },
  'kano': { lat: 12.0022, lng: 8.5922 },
  'katsina': { lat: 13.1333, lng: 7.6333 },
  'kebbi': { lat: 12.4667, lng: 4.2 },
  'kogi': { lat: 7.8, lng: 6.7 },
  'kwara': { lat: 8.4954, lng: 4.5362 },
  'lagos': { lat: 6.5244, lng: 3.3792 },
  'nasarawa': { lat: 8.5667, lng: 8.3667 },
  'niger': { lat: 9.1667, lng: 5.5 },
  'ogun': { lat: 6.6613, lng: 3.2715 },
  'ondo': { lat: 7.1963, lng: 4.8328 },
  'osun': { lat: 7.4951, lng: 4.6515 },
  'oyo': { lat: 8.0, lng: 3.5 },
  'plateau': { lat: 9.2, lng: 9.5 },
  'rivers': { lat: 4.7957, lng: 6.9850 },
  'sokoto': { lat: 13.0167, lng: 5.2333 },
  'taraba': { lat: 8.5, lng: 11.2667 },
  'yobe': { lat: 11.8833, lng: 11.1667 },
  'zamfara': { lat: 12.8, lng: 5.5333 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log(`[Lawyer Search] New request received`);
    const body: SearchRequestBody = await req.json();
    const {
      location,
      lga,
      state,
      practiceArea = 'lawyer',
      userLatitude,
      userLongitude,
    } = body;

    console.log(`[Search] State: ${state}, LGA: ${lga}, Practice: ${practiceArea}`);

    if (!state) {
      return NextResponse.json(
        { error: 'State is required' },
        { status: 400 }
      );
    }

    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      return NextResponse.json(
        {
          error: 'Google Maps API key not configured',
          results: [],
          guaranteedResults: false,
        },
        { status: 500 }
      );
    }

    const stateKey = state.toLowerCase();
    const stateCoords = nigerianStateCoordinates[stateKey];
    
    if (!stateCoords) {
      return NextResponse.json({
        success: false,
        resultsFound: 0,
        results: [],
        message: `State "${state}" not found.`,
        searchCriteria: { state, lga },
      });
    }

    console.log(`[Search] Found state coordinates: ${stateCoords.lat}, ${stateCoords.lng}`);

    const searchQuery = `lawyer in ${state} Nigeria`;
    let lawyerResults: LawyerResult[] = [];

    // Try Google Maps Text Search API
    try {
      console.log(`[Google Maps] Requesting data for: ${searchQuery}`);
      
      const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      textSearchUrl.searchParams.set('query', searchQuery);
      textSearchUrl.searchParams.set('key', googleMapsApiKey);

      const response = await fetch(textSearchUrl.toString());
      const data = await response.json();

      console.log(`[Google Maps] Response status: ${data.status}, results: ${data.results?.length || 0}`);

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        lawyerResults = data.results.slice(0, 10).map((place: any) => {
          const result: LawyerResult = {
            firmName: place.name || 'Law Firm',
            location: place.formatted_address?.split(',')[0] || state,
            address: place.formatted_address || 'Address not available',
            phone: place.formatted_phone_number,
            website: place.website,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            latitude: place.geometry?.location?.lat || stateCoords.lat,
            longitude: place.geometry?.location?.lng || stateCoords.lng,
            source: 'google_maps',
            gmapsUrl: place.url || `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`,
          };

          if (userLatitude && userLongitude) {
            result.distance = calculateDistance(userLatitude, userLongitude, result.latitude, result.longitude);
            result.directionsUrl = `https://www.google.com/maps/dir/${userLatitude},${userLongitude}/${result.latitude},${result.longitude}`;
          } else {
            result.directionsUrl = result.gmapsUrl;
          }

          return result;
        });

        console.log(`[Google Maps] Successfully found ${lawyerResults.length} lawyers`);
      }
    } catch (error) {
      console.error(`[Google Maps Error]`, error instanceof Error ? error.message : error);
    }

    const response = {
      success: lawyerResults.length > 0,
      searchCriteria: {
        state,
        lga,
        practiceArea,
      },
      resultsFound: lawyerResults.length,
      guaranteedResults: lawyerResults.length > 0,
      results: lawyerResults,
      source: lawyerResults.length > 0 ? 'google_maps' : 'no_results',
      message: lawyerResults.length > 0
        ? `Found ${lawyerResults.length} lawyer(s) in ${state}`
        : `No lawyers found for "${searchQuery}". Please try another location.`,
      responseTime: Date.now() - startTime,
    };

    console.log(`[Search Complete] ${lawyerResults.length} results, ${response.responseTime}ms`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[Fatal Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search for lawyers',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        guaranteedResults: false,
      },
      { status: 500 }
    );
  }
}
