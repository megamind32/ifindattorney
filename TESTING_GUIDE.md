# Testing Guide: AI-Powered Lawyer Matching System

**Last Updated:** January 8, 2026  
**Dev Server:** http://localhost:3001

---

## 🧪 Quick Test: Form → Results Flow

### Step 1: Start the Dev Server
```bash
cd /Users/mac/Documents/ifindattorney
npm run dev
# Server will run on http://localhost:3001
```

### Step 2: Fill Out the Form
1. Open http://localhost:3001/form
2. **Step 1 - Legal Need:**
   - Select "Corporate Law" checkbox
   - (Optional) Add custom issue in textarea
   - Click "Next"

3. **Step 2 - Location:**
   - State: Select "Lagos"
   - LGA: Select "Ikoyi" (or any available LGA)
   - Click "Next"

4. **Step 3 - Budget:**
   - Select "100,000 - 500,000 NGN"
   - Click "Next"

5. **Step 4 - Review:**
   - Verify all details
   - Click "Find Lawyers" button
   - Form data saved to sessionStorage
   - Redirects to `/results` page

### Step 3: View Results Page
- Page loads with matching lawyers
- Displays 4 sections:
  1. **Header** - Red banner with back button
  2. **Case Summary** - Shows Legal Issue, Location, Budget
  3. **Matching Strategy** - Blue banner explaining strategy used
  4. **Exact Matches** - Green-bordered lawyer cards (if any)
  5. **Alternative Lawyers** - Amber-bordered lawyer cards

---

## 🔍 Test Different Scenarios

### Scenario 1: Exact Match (Corporate Law)
- Legal Need: Corporate Law
- Location: Lagos → Any LGA
- Result: 1 exact match (Adekunle & Partners)
- 4 alternatives
- Strategy: "✓ EXACT MATCH"

### Scenario 2: Employment Law Match
- Legal Need: Employment Law
- Location: Lagos → Any LGA
- Result: 1 exact match (Emeka Nwankwo & Co)
- 4 alternatives
- Strategy: "✓ EXACT MATCH"

### Scenario 3: Family Law (Partial Match)
- Legal Need: Family Law
- Location: Lagos → Any LGA
- Result: 1 exact match (Grace Okonkwo & Associates)
- 4 alternatives
- Strategy: "✓ EXACT MATCH"

### Scenario 4: Immigration Law
- Legal Need: Immigration Law
- Location: Lagos → Any LGA
- Result: 1 exact match (Zainab Mohammed Legal Services)
- 4 alternatives
- Strategy: "✓ EXACT MATCH"

---

## 📱 Test Mobile Responsiveness

1. Open DevTools (F12 in Chrome)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Test form on:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

Expected: All elements responsive, readable, and functional

---

## 🗺️ Test Google Maps Integration

### Test "View on Map"
1. Fill form and go to results
2. Find any lawyer card
3. Click "Track on Maps" button
4. Modal dialog appears
5. Click "View on Map"
6. Google Maps opens in new tab showing lawyer location

### Test "Get Directions"
1. From Map Modal, click "Get Directions"
2. Browser requests location permission
3. If approved: Google Maps opens with directions from your location
4. If denied: Falls back to "View on Map"

---

## 🔧 Test API Directly

### Test Exact Match
```bash
curl -X POST http://localhost:3001/api/get-lawyers \
  -H "Content-Type: application/json" \
  -d '{
    "practiceAreas": ["Corporate Law"],
    "legalIssue": "Business formation",
    "state": "Lagos",
    "lga": "Ikoyi",
    "budget": "100,000-500,000"
  }' | python3 -m json.tool
```

Expected Response:
```json
{
  "success": true,
  "exactMatchesFound": 1,
  "alternativesFound": 4,
  "totalRecommendations": 5,
  "matchingStrategy": "✓ EXACT MATCH: Found law firms specializing in your legal need",
  "exactMatches": [
    {
      "firmName": "Adekunle & Partners Law Firm",
      "contactPerson": "Chioma Adekunle",
      "location": "Victoria Island, Lagos",
      "phone": "+234-801-1234567",
      ...
    }
  ],
  "alternatives": [...]
}
```

### Test Multiple Practice Areas
```bash
curl -X POST http://localhost:3001/api/get-lawyers \
  -H "Content-Type: application/json" \
  -d '{
    "practiceAreas": ["Corporate Law", "Commercial Law"],
    "state": "Lagos",
    "lga": "Lagos Island",
    "budget": "200,000-1,000,000"
  }' | python3 -m json.tool
```

Expected: Both Corporate and Commercial law firms in results

---

## 🎯 Test Contact Buttons

### Phone Button
1. Click "Call Now" button on any lawyer card
2. Browser initiates phone call (tel: link)
3. On mobile: Opens phone app with number pre-filled
4. On desktop: Allows copying number

### Email Button
1. Click "Send Email" on any lawyer card
2. Browser opens email client (mailto: link)
3. Subject pre-filled: "Legal Consultation Inquiry"
4. User composes message

### Website Link
1. Click website link in contact details
2. Opens lawyer's website in new tab
3. All links properly formatted with https:// protocol

---

## ✅ Validation Checklist

### Form Validation
- [x] Can't proceed without selecting practice area or entering custom issue
- [x] Can't proceed without selecting state
- [x] Can't proceed without selecting LGA
- [x] Can't proceed without selecting budget
- [x] All selections properly stored in sessionStorage

### Results Page Validation
- [x] Loads data from sessionStorage after form submission
- [x] Displays correct legal issue in summary
- [x] Displays correct location in summary
- [x] Displays correct budget in summary
- [x] Shows appropriate number of exact matches
- [x] Shows appropriate number of alternatives
- [x] Lawyer cards have all contact details
- [x] All buttons are functional (Call, Email, Maps)

### API Validation
- [x] Returns 200 status code
- [x] Returns valid JSON response
- [x] Includes success flag
- [x] Includes matching strategy label
- [x] Includes exact matches array
- [x] Includes alternatives array
- [x] Includes total recommendations count
- [x] All lawyers have coordinates (latitude, longitude)
- [x] All lawyers have contact information
- [x] Response under 5KB

---

## 🐛 Troubleshooting

### Form doesn't submit
1. Check browser console for errors (F12)
2. Verify all form fields are filled
3. Check sessionStorage is enabled
4. Clear browser cache and try again

### Results page shows error
1. Check that form data saved to sessionStorage
2. Verify API endpoint is accessible: `curl http://localhost:3001/api/get-lawyers`
3. Check browser console for network errors
4. Try filling form again

### Map doesn't open
1. Verify coordinates are valid
2. Check that lawyer object has latitude & longitude
3. Try "View on Map" first (simpler than Get Directions)
4. Check browser console for errors

### Lawyer card shows no contact info
1. This shouldn't happen - all mock lawyers have full contact info
2. Check API response includes phone, email, address, website
3. Verify results page properly destructures lawyer object

---

## 📊 Performance Testing

### Page Load Time
```bash
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/form
```

Expected: <500ms

### API Response Time
```bash
time curl -X POST http://localhost:3001/api/get-lawyers \
  -H "Content-Type: application/json" \
  -d '{"practiceAreas": ["Corporate Law"], "state": "Lagos", "lga": "Ikoyi", "budget": "100,000"}'
```

Expected: <300ms

### Build Size
```bash
du -sh /Users/mac/Documents/ifindattorney/.next
```

Expected: <50MB

---

## 🎨 Visual Testing

### Check Colors
- Exact matches: Green (#10b981)
- Alternatives: Amber (#d97706)
- Headings: Black on white
- Buttons: Proper contrast, hover states

### Check Typography
- Headings: Khand font, bold, larger size
- Body text: Inter/Poppins font, readable
- Links: Blue with underline/hover effect

### Check Spacing
- Cards have proper padding and margins
- Grid layout is balanced
- Mobile layout has adequate spacing
- No content overflow

---

## 🚀 Running Full Test Suite

```bash
# 1. Start dev server
npm run dev &

# 2. Wait for server to start
sleep 3

# 3. Test homepage
curl -s http://localhost:3001 | grep -q "AI" && echo "✓ Home page loads"

# 4. Test form page
curl -s http://localhost:3001/form | grep -q "Legal" && echo "✓ Form page loads"

# 5. Test API
curl -s -X POST http://localhost:3001/api/get-lawyers \
  -H "Content-Type: application/json" \
  -d '{"practiceAreas": ["Corporate Law"], "state": "Lagos", "lga": "Ikoyi", "budget": "100,000"}' \
  | grep -q "success" && echo "✓ API working"

# 6. Test build
npm run build && echo "✓ Build successful"
```

---

## 📋 Test Results Template

```
TEST DATE: ___________
TESTER: ___________

FORM TESTS:
- [ ] Can fill out all 4 steps
- [ ] Data saves to sessionStorage
- [ ] Redirect to results works

RESULTS PAGE TESTS:
- [ ] Page loads within 3 seconds
- [ ] All lawyer cards display
- [ ] Contact buttons work
- [ ] Maps buttons work
- [ ] Back to Home button works

API TESTS:
- [ ] Exact match scenario works
- [ ] Response includes all fields
- [ ] Response time < 300ms
- [ ] Error handling works

MOBILE TESTS:
- [ ] Form responsive on small screens
- [ ] Results page readable on mobile
- [ ] Buttons clickable on touch

NOTES:
_________________________________
_________________________________
```

---

## 🎯 Sign-Off

Once all tests pass, the system is ready for:
1. ✅ Expanding lawyer database
2. ✅ Integrating real lawyer data from Supabase
3. ✅ Adding more Nigerian states
4. ✅ Production deployment

**Current Status:** MVP Complete ✅
