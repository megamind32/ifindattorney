# AI Agent Quick Reference

## What Changed?

The website now uses a **separate AI agent** (`/api/search-lawyers-agent`) to search for law firms instead of returning hardcoded results.

## Architecture

```
Form Submission
     ↓
Results Page triggers Agent
     ↓
/api/search-lawyers-agent (AI Agent)
     ↓
Search Google Maps OR Database
     ↓
Returns: { success, results: [...], message }
     ↓
Results Page displays to user
```

## Key Endpoints

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/api/search-lawyers-agent` | AI Agent - Searches for lawyers | ✅ ACTIVE |
| `/api/get-lawyers` | Old endpoint (still works as fallback) | ⏸️ BACKUP |

## Testing

### Quick Test - Agent Returns Lagos Lawyers:
```bash
curl -X POST http://localhost:3000/api/search-lawyers-agent \
  -H "Content-Type: application/json" \
  -d '{"state":"Lagos","lga":"VI","practiceAreas":["Corporate Law"],"budget":"medium"}'
```

Expected: Returns 2+ Lagos lawyers with full contact info

### Test Form-to-Results Flow:
1. Go to http://localhost:3000/form
2. Fill out the form and submit
3. Check that results page shows location-specific lawyers
4. Click "View on Google Maps" - should open Google Maps

## States Supported

Agent has lawyers in:
- Lagos ✅
- Adamawa ✅
- Abia ✅
- Kano ✅
- Rivers ✅
- Oyo ✅
- Enugu ✅
- Katsina ✅
- Edo ✅
- Akwa Ibom ✅
- Abuja/FCT ✅

## How to Enable Google Maps Live Search

1. Get a Google Maps API key from Google Cloud Console
2. Add to `.env.local`:
   ```
   GOOGLE_MAPS_API_KEY=your_key_here
   ```
3. Restart dev server
4. Agent will now search live Google Maps instead of database

## Lawyer Data Structure

Each lawyer returned by agent has:
```typescript
{
  firmName: string
  location: string
  phone: string
  email: string
  address: string
  website: string
  practiceAreas: string[]
  matchScore: number (0-100)
  latitude: number
  longitude: number
  gmapsUrl: string
  source: string // "AI Agent - Database" or "Google Maps"
}
```

## Common Issues

**Agent returns 0 results?**
- Check state name matches exactly (case-sensitive in some cases)
- Verify fallback database has entry for that state
- Check dev server logs for [AGENT] messages

**Google Maps link not working?**
- Coordinates might be missing
- URLs are auto-generated from coordinates

**Form doesn't trigger agent?**
- Check Results page is calling `/api/search-lawyers-agent`
- Check browser console for errors
- Verify form data is being sent in sessionStorage

## Developer Notes

- Agent is in `/src/app/api/search-lawyers-agent/route.ts`
- Fallback database updated with 14+ states
- Results page automatically calls agent on load
- Google Maps integration ready but currently using fallback
- All responses include `source` field to track data origin

## Quick Debugging

Enable more logs by checking `/tmp/dev.log`:
```bash
tail -50 /tmp/dev.log | grep AGENT
```

You'll see messages like:
- `[AGENT] Using fallback database for Lagos`
- `[AGENT] Fallback returned 2 results`
- `[AGENT] Found 2 law firms for Lagos`
