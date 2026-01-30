# Geolocation "Unable to Retrieve Your Location" - Diagnostic Guide

**Date:** January 28, 2026  
**Issue:** When clicking "Detect My Location," user sees error: "Unable to retrieve your location"

---

## What's Happening

When you click the "📍 Detect My Location" button, the browser attempts to use the **Geolocation API** to determine your coordinates, then maps them to the nearest Nigerian state and LGA. The error you're seeing means one of several things is preventing this from working.

---

## Error Code 2: "POSITION_UNAVAILABLE"

The error message "Unable to retrieve your location" corresponds to **Error Code 2** in the browser's Geolocation API. This error specifically means:

> The device's location service cannot determine your position

### Common Causes (in order of likelihood on macOS):

1. **❌ Location Services Disabled at System Level** (Most Common)
   - macOS requires the system-level Location Services to be enabled
   - Safari and Chrome respect macOS privacy settings
   
2. **❌ Browser Permission Denied Previously**
   - If you clicked "Block" or "Don't Allow" before, the browser cached this
   - Modern browsers remember location decisions for each site
   
3. **❌ No WiFi/GPS Signal Available**
   - `enableHighAccuracy: false` uses cell tower and WiFi triangulation
   - If WiFi is off and you're not near cell towers, position can't be determined
   
4. **❌ Browser Privacy/Incognito Mode**
   - Some browsers block geolocation in Incognito/Private mode
   
5. **❌ VPN or Proxy Interference**
   - Some VPNs interfere with location services

---

## How to Fix This

### Step 1: Check macOS System Settings

**On macOS:**

1. Open **System Settings**
2. Navigate to **Privacy & Security** → **Location Services**
3. Verify the toggle is **ON** (green)
4. Scroll down and check that your browser (Chrome/Safari) is listed and **enabled** ✓

**Screenshot guide:**
```
System Settings
  └─ Privacy & Security
      └─ Location Services (toggle ON)
         └─ Chrome ✓ (should be enabled)
         └─ Safari ✓ (should be enabled)
```

### Step 2: Clear Browser Cache & Reset Permissions

**In Chrome:**

1. Click the **🔒 Lock icon** next to the URL bar
2. Click **Site settings**
3. Find **Location** and set to **"Ask (default)"**
4. Close and reopen the page
5. Try clicking "Detect My Location" again - a **fresh permission prompt** should appear

**Keyboard shortcut to clear cache:**
- macOS: `Cmd + Shift + Delete` (Opens Clear Browsing Data)
- Select: "Cookies and site data"
- Click **Clear data**

### Step 3: Ensure You're Connected to Internet

- WiFi must be turned ON or connected to WiFi network
- This allows WiFi-based location triangulation
- GPS-based location typically requires `enableHighAccuracy: true` (which we disabled for speed)

### Step 4: Try Manual Location Selection

If geolocation still doesn't work:

1. Click **"📝 Enter Location Manually"** in the modal
2. Select your **State** from the dropdown
3. Select your **LGA** (Local Government Area) from the second dropdown
4. Proceed with the form

This alternative method works 100% and requires no system permissions.

---

## Updated Error Messages (v1.1)

We've improved the error messages to provide specific guidance:

### Error Code 1: Permission Denied
```
❌ Location Permission Denied. To fix: Go to your browser settings, 
find this site in the permissions list, and allow location access. 
Then reload and try again.
```

### Error Code 2: Position Unavailable
```
❌ Location Service Not Available. This usually means: 
(1) Location services are disabled on your device, or 
(2) You're in an area without GPS/WiFi signal. 
Please use manual location selection below, or enable location 
services in your system settings.
```

### Error Code 3: Timeout
```
❌ Location Request Timed Out (took too long). 
Please check your internet connection and try again, 
or use manual selection below.
```

---

## Technical Details

### What the Code Does

**File:** `src/app/form/page.tsx`

```typescript
// Step 1: Check if browser supports geolocation
if (!navigator.geolocation) {
  // Geolocation not supported - user sees error message
}

// Step 2: Request permission and position
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Success: Got latitude/longitude
    const { latitude, longitude } = position.coords;
    
    // Step 3: Map coordinates to Nigerian location
    const locationMatch = determineLocationFromCoordinates({
      latitude,
      longitude,
    });
    
    if (locationMatch) {
      // Success: Found matching state/LGA
      // Fill form data and close modal
    }
  },
  (error) => {
    // Error: Show error message based on error.code
    // Provide manual selection option
  },
  {
    enableHighAccuracy: false,    // Uses WiFi/cell triangulation (faster)
    timeout: 15000,               // 15 second timeout
    maximumAge: 300000            // Cache results for 5 minutes
  }
);
```

### Location Mapping

Once coordinates are obtained, we use a pre-built database:

**File:** `src/lib/location-mapping.ts`

- Maps latitude/longitude to nearest Nigerian state
- Uses geofencing with boundary coordinates for all 37 states
- Falls back to manual selection if coordinates are outside Nigeria

---

## Browser Support

| Browser | macOS | Windows | Linux | Mobile |
|---------|-------|---------|-------|--------|
| Chrome | ✓ | ✓ | ✓ | ✓ |
| Safari | ✓ | - | - | ✓ |
| Firefox | ✓ | ✓ | ✓ | ✓ |
| Edge | ✓ | ✓ | ✓ | ✓ |

**Note:** All browsers require:
- HTTPS or localhost
- User permission granted
- System location services enabled (on macOS)

---

## Testing Locally

To test if your system's location services are working:

### Quick Test (in any browser):

1. Open your browser's developer console: `Cmd + Option + I` (macOS)
2. Paste this code:

```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => console.log('✓ Success:', pos.coords.latitude, pos.coords.longitude),
  (err) => console.log('✗ Error Code:', err.code, 'Message:', err.message)
);
```

3. Check the console output
4. If you see "Error Code 2" → follow the fixes above
5. If you see coordinates → system location works

---

## Still Having Issues?

### Nuclear Option: Reset Everything

1. **macOS:**
   - System Settings → Privacy & Security → Location Services → Reset (if available)
   - Reboot your Mac

2. **Chrome:**
   - Go to Chrome Menu → Settings → Privacy → Clear all site data
   - Or: `chrome://settings/content/location`
   - Remove our site from the list
   - Close and reopen Chrome

3. **Safari:**
   - Safari → Settings → Privacy → Manage Website Data
   - Find and delete our site
   - Reset location permissions

4. **Application:**
   - Reload the form page: `Cmd + Shift + R` (hard refresh)
   - Try again

---

## Current Improvements (v1.1)

✅ Better error messages with specific guidance  
✅ Button now shows "⏳ Detecting Location..." while processing  
✅ Modal stays open until location is retrieved or user explicitly cancels  
✅ Clear fallback: "Enter Location Manually" button always available  
✅ All error codes (1, 2, 3) have helpful, actionable messages  

---

## Next Steps for Users

1. **Prefer Manual Selection?** → Click "📝 Enter Location Manually" - no permissions needed
2. **Want to Enable Location?** → Follow Step 1 above (System Settings)
3. **Still Broken?** → Clear browser cache (Step 2) and reload
4. **Still Issues?** → Try a different browser to isolate the problem

---

**Last Updated:** January 28, 2026  
**Form Page:** `/form`  
**Alternative:** Always works using dropdown selectors
