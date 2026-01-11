import { NextRequest, NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to test Google Maps API connection
 * GET /api/test-google-maps
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    apiKeyPresent: !!apiKey,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : null,
    tests: [] as any[],
    recommendations: [] as string[],
  };

  if (!apiKey) {
    diagnostics.recommendations.push(
      '1. Add GOOGLE_MAPS_API_KEY to your .env.local file',
      '2. Get an API key from https://console.cloud.google.com/apis/credentials'
    );
    return NextResponse.json(diagnostics);
  }

  // Test 1: Simple Places API text search
  try {
    const testQuery = 'law firm Lagos Nigeria';
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', testQuery);
    url.searchParams.append('location', '6.5244,3.3792'); // Lagos coordinates
    url.searchParams.append('radius', '30000');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    diagnostics.tests.push({
      name: 'Places Text Search',
      query: testQuery,
      httpStatus: response.status,
      apiStatus: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message || null,
    });

    // Add recommendations based on status
    if (data.status === 'REQUEST_DENIED') {
      diagnostics.recommendations.push(
        '❌ API REQUEST DENIED - Check the following:',
        '1. Enable "Places API" at https://console.cloud.google.com/apis/library',
        '2. Enable billing at https://console.cloud.google.com/billing',
        '3. Check API key restrictions at https://console.cloud.google.com/apis/credentials'
      );
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      diagnostics.recommendations.push(
        '❌ OVER QUERY LIMIT - You have exceeded your quota',
        '1. Check your quota at https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas',
        '2. Enable billing to increase quota'
      );
    } else if (data.status === 'INVALID_REQUEST') {
      diagnostics.recommendations.push(
        '❌ INVALID REQUEST - Check query parameters'
      );
    } else if (data.status === 'OK') {
      diagnostics.recommendations.push(
        '✅ API is working correctly!',
        `Found ${data.results.length} results for test query`
      );
    } else if (data.status === 'ZERO_RESULTS') {
      diagnostics.recommendations.push(
        '⚠️ API is working but returned no results for this query',
        'This could mean no law firms are indexed in this area'
      );
    }
  } catch (error) {
    diagnostics.tests.push({
      name: 'Places Text Search',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    diagnostics.recommendations.push(
      '❌ Network error connecting to Google Maps API'
    );
  }

  // Test 2: Check if key works with Geocoding API
  try {
    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    geocodeUrl.searchParams.append('address', 'Lagos, Nigeria');
    geocodeUrl.searchParams.append('key', apiKey);

    const response = await fetch(geocodeUrl.toString());
    const data = await response.json();

    diagnostics.tests.push({
      name: 'Geocoding API',
      httpStatus: response.status,
      apiStatus: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message || null,
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Geocoding API',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 3: Check with type filter for lawyers
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', 'lawyer');
    url.searchParams.append('location', '6.5244,3.3792');
    url.searchParams.append('radius', '50000');
    url.searchParams.append('type', 'lawyer');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    diagnostics.tests.push({
      name: 'Places with Type Filter (lawyer)',
      httpStatus: response.status,
      apiStatus: data.status,
      resultsCount: data.results?.length || 0,
      sampleResults: data.results?.slice(0, 3).map((r: any) => ({
        name: r.name,
        address: r.formatted_address,
        rating: r.rating,
      })) || [],
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Places with Type Filter',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
