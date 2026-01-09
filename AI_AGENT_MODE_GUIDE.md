# AI Agent Mode - Complete Architecture Guide

**Date:** January 9, 2026  
**Status:** ✅ Implementation Complete  
**Version:** 2.0 - AI Agent Search Mode

---

## Overview

The website now operates in **AI Agent Search Mode**, where a separate AI agent searches Google Maps for law firms in the user's location and sends the results back to the main site for display.

### How It Works

```
┌─────────────────┐
│   User Form     │
│  (Step 1-4)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Form Submission                         │
│ - Legal Need                            │
│ - Location (State + LGA)                │
│ - Budget                                │
│ - Practice Areas                        │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ /api/search-lawyers-agent (AI Agent)             │
│ - Receives user data                             │
│ - Searches Google Maps Places API                │
│ - Extracts law firm details                      │
│ - Ranks by relevance & location                  │
│ - Returns structured firm data                   │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Main Site (/results page)        │
│ - Receives firm data from agent  │
│ - Displays best matches          │
│ - Shows firm details, location   │
│ - Provides contact options       │
└──────────────────────────────────┘
```

---

## Architecture Components

### 1. User Form (`src/app/form/page.tsx`)

**Modified to:**
- Collect legal issue, location, budget, and practice areas
- Call `/api/search-lawyers-agent` on submission
- Pass collected data to agent endpoint
- Store agent results in session storage for results page

**Key Changes:**
```typescript
// Form submission now triggers agent
const agentRequest = {
  state: formData.state,
  lga: formData.lga,
  practiceAreas: formData.practiceAreas,
  budget: formData.budget,
  legalIssue: formData.legalIssue,
};

const agentResponse = await fetch('/api/search-lawyers-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(agentRequest),
});

// Store agent results for results page
sessionStorage.setItem('userFormData', JSON.stringify({
  ...agentRequest,
  agentResults: agentData,
}));
```

### 2. AI Agent Endpoint (`src/app/api/search-lawyers-agent/route.ts`)

**Purpose:** Search Google Maps for law firms and return structured data

**Process:**
1. Receive user criteria (state, LGA, practice areas, budget)
2. Build search queries:
   - `"law firms {LGA} Nigeria"`
   - `"attorneys {State}"`
   - `"lawyers {State}"`
   - `"legal services {LGA}"`
3. Call Google Maps Places API with location radius (25-35km per state)
4. Extract firm data:
   - Name
   - Address
   - Phone
   - Website (if available)
   - Coordinates (latitude/longitude)
   - Google Maps URL
5. Remove duplicates and sort by relevance
6. Return top 10 results

**Fallback Logic:**
- If Google Maps API key is not configured, use hardcoded database of law firms
- Fallback data covers all major Nigerian states
- Ensures user always gets results

**Response Format:**
```json
{
  "success": true,
  "state": "Lagos",
  "lga": "Ikoyi",
  "searchQuery": "law firms Ikoyi Employment Law",
  "firmsFound": 8,
  "results": [
    {
      "firmName": "Adekunle & Partners",
      "location": "Victoria Island, Lagos",
      "address": "12 Adekunle Street, VI",
      "phone": "+234-801-123456",
      "website": "www.adekunle.com",
      "practiceAreas": ["Corporate Law", "Employment Law"],
      "matchScore": 95,
      "latitude": 6.4321,
      "longitude": 3.4254,
      "source": "google_maps"
    }
    // ... more results
  ],
  "source": "google_maps_places_api",
  "message": "AI Agent found 8 law firms in Lagos..."
}
```

### 3. Results Page (`src/app/results/page.tsx`)

**Modified to:**
- Accept agent results from form submission
- Transform agent data to display format
- Show firm details with action buttons
- Provide contact and map viewing options

**Key Changes:**
```typescript
// Check if agent results included from form
if (formData.agentResults) {
  const transformedResults = {
    success: agentResponse.success,
    state: agentResponse.state,
    lga: agentResponse.lga,
    totalRecommendations: agentResponse.firmsFound,
    results: agentResponse.results,
    source: 'AI Agent - Google Maps',
  };
  setResults(transformedResults);
}
```

---

## Configuration

### Setting Up Google Maps API

**Step 1: Create Google Cloud Project**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project
- Enable "Places API" and "Maps JavaScript API"

**Step 2: Create API Key**
- Go to "Credentials" in Cloud Console
- Create new API Key (restrict to server IP for production)
- Copy the key

**Step 3: Add to Environment**
- Open `.env.local` in project root
- Add: `GOOGLE_MAPS_API_KEY=your_copied_key`
- Restart dev server

**Step 4: Test**
- Fill form and submit
- Check browser console for any errors
- Verify results appear on `/results` page

### Without Google Maps API

If you don't set up Google Maps API:
- Agent automatically falls back to hardcoded lawyer database
- All 36 states + FCT covered with fallback data
- Results will show database lawyers instead of Maps results
- Users still get comprehensive lawyer recommendations

---

## Data Flow in Detail

### User Journey

1. **User visits `/form`**
   - Selects legal issue (Employment, Family, etc.)
   - Chooses location (State → LGA dropdown)
   - Sets budget range
   - Reviews and submits

2. **Form Submission**
   - Validates all fields
   - Creates request payload with user data
   - Calls `/api/search-lawyers-agent`
   - Shows loading state

3. **Agent Search**
   - Receives user request
   - Checks for Google Maps API key
   - If key exists: searches Google Maps Places API
   - If key missing: uses fallback database
   - Processes results and deduplicates
   - Returns top 10 matches sorted by relevance

4. **Results Display**
   - Receives agent response
   - Transforms to display format
   - Renders firm cards with:
     - Firm name & location
     - Contact info (phone, website, email if available)
     - Practice areas
     - Match score / reason
     - Action buttons (Call, Website, Get Directions)
   - Provides map view option

5. **User Actions**
   - Click "Get Directions" → Opens Google Maps
   - Click "Call" → Opens phone dialer
   - Click "Visit Website" → Opens firm website
   - Click "View on Map" → Shows location on map

---

## Key Differences from Old Mode

| Aspect | Old Mode | New Agent Mode |
|--------|----------|---|
| Data Source | Supabase Database | Google Maps Places API |
| Search Trigger | Results page queries DB | Form triggers agent |
| Data Freshness | Static database | Real-time Google Maps |
| Coverage | Only hardcoded lawyers | All law firms on Maps |
| Match Quality | Database matches | AI-ranked by relevance |
| Scale | Limited to DB | Potentially unlimited |
| Fallback | Error page | Hardcoded lawyer DB |

---

## Response Formats

### Successful Agent Response
```json
{
  "success": true,
  "state": "Lagos",
  "lga": "Ikeja",
  "searchQuery": "law firms Ikeja corporate",
  "firmsFound": 12,
  "results": [ /* array of lawyers */ ],
  "source": "google_maps_places_api",
  "message": "AI Agent found 12 law firms in Lagos matching your criteria"
}
```

### Error Response (with Fallback)
```json
{
  "success": false,
  "state": "Kano",
  "results": [ /* fallback lawyers from database */ ],
  "error": "Google Maps API unavailable",
  "source": "fallback_database",
  "message": "Showing lawyers from our database"
}
```

---

## Troubleshooting

### Problem: "Searching..." hangs forever

**Solution:**
- Check network tab in DevTools
- Verify Google Maps API key in `.env.local`
- Check API quotas in Google Cloud Console
- Restart dev server: `npm run dev`

### Problem: Empty results returned

**Solution:**
- Verify LGA name spelling matches exactly
- Check if state/LGA combination is valid
- Try a larger city (state capital)
- Check browser console for specific errors

### Problem: Google Maps API errors

**Possible causes:**
- Invalid API key
- API not enabled in Cloud Console
- Rate limit exceeded
- Incorrect permissions on API key

**Fix:**
- Go to Google Cloud Console
- Verify Places API is enabled
- Check API key restrictions
- Generate new key if needed

### Problem: Results not matching user criteria

**Why it happens:**
- Google Maps returns all law firms in area (no filtering)
- Some firms may be general or non-legal practices

**How agent handles this:**
- Agent ranks results by name keyword matching
- Filters by practice area when possible
- Fallback uses hardcoded practice area data

---

## Configuration Files

### Modified Files
- `src/app/form/page.tsx` - Form now calls agent
- `src/app/results/page.tsx` - Results handle agent data
- `.env.example` - Added Google Maps key requirement
- `src/app/api/search-lawyers-agent/route.ts` - Already supports Google Maps

### Key Environment Variables
```env
# Required for real Google Maps searches
GOOGLE_MAPS_API_KEY=your_key

# Optional for client-side maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=same_or_different_key

# Keep existing Supabase keys
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Testing Checklist

- [ ] Form validates all required fields
- [ ] Submission calls agent endpoint
- [ ] Agent returns results within 10 seconds
- [ ] Results page displays firm list
- [ ] Firm details show all available info
- [ ] "Get Directions" opens Google Maps
- [ ] "Call" opens phone dialer
- [ ] "Visit Website" opens in new tab
- [ ] Fallback works without API key
- [ ] Works across all 36 states + FCT

---

## Performance Notes

- Agent searches take 5-10 seconds (Google Maps API latency)
- Results cache in session storage
- Loading UI shows appropriate messaging
- Fallback is instant (hardcoded data)

---

## Future Enhancements

1. **Caching:** Cache results for same searches to reduce API calls
2. **Filtering:** Add more specific filtering options
3. **Ratings:** Show Google Maps ratings and reviews
4. **Distance:** Calculate actual distance from user location
5. **Booking:** Integrate appointment booking system
6. **Reviews:** Show client reviews and case histories
7. **Analytics:** Track which results users click on

---

## Summary

The new **AI Agent Mode** provides:
- ✅ Real-time law firm search via Google Maps
- ✅ Nationwide coverage (all Nigerian states)
- ✅ Automatic fallback for graceful degradation
- ✅ Better user experience with fresh, relevant results
- ✅ Scalable architecture for future enhancements

**Last Updated:** January 9, 2026
