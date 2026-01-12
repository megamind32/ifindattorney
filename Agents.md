# iFind Attorney - Project Documentation for Agents

**Date Updated:** January 8, 2026 (Geolocation Permissions Policy Fix)  
**Project Status:** MVP Phase - Geolocation Fix in Deployment  
**Primary Location:** `/Users/mac/Documents/ifindattorney/`

**CRITICAL UPDATE - Geolocation Permissions Fix (IN PROGRESS):**
✅ Implemented 3-layer geolocation permission fix:
- Layer 1: Middleware HTTP headers with `Permissions-Policy: geolocation=(self)`
- Layer 2: Vercel deployment headers configuration
- Layer 3: HTML metadata declaration in layout.tsx
🔄 **Status:** Committed to GitHub, Vercel auto-deployment in progress (ETA: 2-3 minutes)
📋 **See:** `GEOLOCATION_FIX_SUMMARY.md` for complete technical details

---

## FORM PAGE OVERHAUL - COMPLETE ✅

The `/form` page has been **completely redesigned** with a modern 4-step form that enables users across all 37 Nigerian states (all 36 states + FCT) to find legal services. **Status:** Build succeeds, dev server running at localhost:3000/form.

**New Features:**
- Multi-step form (4 steps: Legal Need → Location → Budget → Review)
- Nigeria-wide coverage (state dropdown + dynamic zone selector for 30+ states)
- Fluid, modern design (Playfair Display + Poppins fonts, red gradient buttons)
- Smooth animations (fadeIn on steps, shake on errors)
- Progress bar (25%, 50%, 75%, 100%)
- Form validation per step
- SessionStorage integration with results page

**See:** `FORM_OVERHAUL_SUMMARY.md` and `FORM_VISUAL_GUIDE.md` for complete details.

---

## 1. Project Overview

**Mission:** Build a lawyer recommendation platform for Nigeria that uses AI to classify user legal problems and match them with appropriate lawyers.

**Core Constraint:** AI is responsible ONLY for conversational intake and problem classification—NOT legal advice.

**Target Users:** Nigerians nationwide seeking legal assistance who need quick, trustworthy lawyer referrals.

**MVP Scope (Updated):**
- ✅ AI-powered intake chat with structured follow-up questions
- ✅ Classification into 8 practice areas (Employment, Family, Property, Corporate, Commercial, Dispute Resolution, Immigration, IP)
- ✅ **NEW:** Nigeria-wide lawyer matching (all 37 states + zones)
- ✅ **NEW:** Multi-step form with state/zone selection
- ✅ Simple, modern UI with legal disclaimers and animations
- ✅ 5 sample lawyers in Lagos (needs expansion to 37 states)
- ⏳ Newsletter email capture (frontend complete, backend pending)

---

## 2. Technical Stack

### Frontend
- **Framework:** Next.js 16.1.1 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Custom CSS animations
- **State Management:** React 19.2.3 hooks (useState, useRef, useEffect)
- **Fonts:** 
  - Playfair Display (headings, italic, expressive serif) **NEW**
  - Poppins (body text, modern sans-serif) **NEW**
  - Khand (bold accents)
  - Inter (fallback)

### Backend
- **API Routes:** Next.js API routes at `/api/classify-intake`, `/api/get-lawyers`
- **Database:** Supabase PostgreSQL
- **Database Utilities:** `src/lib/supabase.ts` (query functions)

### Environment Configuration
- `.env.local` file with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (Future) `OPENAI_API_KEY` for LLM integration
  - (Future) `GOOGLE_MAPS_API_KEY` for zone visualization

---

## 3. Project Structure

```
/Users/mac/Documents/ifindattorney/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home page with AI chat UI
│   │   ├── layout.tsx               # Root layout, nav, footer, fonts
│   │   ├── globals.css              # Global Tailwind styles
│   │   ├── about/
│   │   │   └── page.tsx             # Mission, disclaimers, how it works
│   │   ├── projects/
│   │   │   └── page.tsx             # MVP status and roadmap
│   │   └── api/
│   │       └── classify-intake/
│   │           └── route.ts         # AI classification endpoint (mock)
│   └── lib/
│       └── supabase.ts              # Database query utilities
├── public/                          # Static assets
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── eslint.config.mjs                # ESLint rules
├── next.config.ts                   # Next.js config
├── postcss.config.mjs               # PostCSS/Tailwind config
├── database-schema.sql              # Supabase schema (5 tables + sample data)
├── .env.local                       # Local environment variables (gitignored)
├── .env.example                     # Template for .env.local
├── README.md                        # Project overview
├── SETUP.md                         # Step-by-step setup guide
├── PROJECT_SUMMARY.md               # Detailed architecture and progress
├── QUICK_REFERENCE.md               # Fast lookup card
└── Agents.md                        # This file - Agent documentation
```

---

## 4. Database Schema

### Tables

**practice_areas**
- id, name (UNIQUE), slug (UNIQUE), description, created_at
- 8 rows: Employment, Family, Property, Corporate, Commercial, Dispute Resolution, Immigration, IP

**lawyers**
- id, name, email (UNIQUE), phone
- location (e.g., "Victoria Island"), office_address, latitude, longitude
- practice_area_id (FK → practice_areas)
- bio, experience_years
- consultation_fee_min, consultation_fee_max (in NGN)
- is_active, is_verified
- created_at, updated_at
- 5 sample Lagos lawyers: Chioma, Adebayo, Grace, Emeka, Zainab

**lawyer_specialties** (many-to-many)
- id, lawyer_id (FK), practice_area_id (FK)
- UNIQUE(lawyer_id, practice_area_id)

**contact_submissions**
- id, user_name, user_email, user_location
- practice_area, urgency (low/medium/high), budget_sensitivity
- message, status (new/matched/archived)
- created_at

**recommendations**
- id, submission_id (FK), lawyer_id (FK)
- rank (1-5), match_reason, created_at

### Schema Status
✅ Applied to Supabase  
✅ Contains IF NOT EXISTS and ON CONFLICT clauses for idempotency  
✅ Indexes created for query performance  

---

## 5. Key Files & Code Patterns

### src/app/page.tsx (Home - Chat Interface)
**Purpose:** Main user-facing page with AI intake chat

**Key Components:**
```tsx
// Message state management
const [messages, setMessages] = useState<Message[]>([])
const [loading, setLoading] = useState(false)

// Send message handler
const handleSendMessage = async () => {
  // POST to /api/classify-intake
  // Update messages state with response
  // Scroll to latest message
}

// Chat bubbles with conditional styling
<div className={`${msg.role === 'user' ? 'bg-gray-200 text-black' : 'bg-gray-100 text-black'} font-semibold`}>
  {msg.content}
</div>
```

**Current Styling (as of Jan 8, 2026):**
- User messages: Gray background (`bg-gray-200`), black text (`text-black`), bold (`font-semibold`)
- AI messages: Light gray background (`bg-gray-100`), black text, bold, subtle border
- Both messages use Inter font

**Newsletter Form:**
- Email input with success state
- No backend storage yet (frontend-only)

---

### src/app/layout.tsx (Root Layout)
**Purpose:** Navigation, footer, font setup

**Font Configuration:**
```tsx
const inter = Inter({ subsets: ['latin'] })
const khand = Khand({ subsets: ['latin'], weight: ['400', '700'] })
```

Uses CSS variables:
- `--font-inter` (body text)
- `--font-khand` (headings)

**Navigation Links:**
- Home (`/`)
- About (`/about`)
- Projects (`/projects`)

**Footer:** Copyright and legal disclaimer

---

### src/app/api/classify-intake/route.ts (AI Endpoint)
**Purpose:** Process user messages and classify legal problems

**Current Status:** Mock implementation

**Behavior:**
- Accepts POST with `{ message: string }`
- Returns response object with `{ reply: string, classification?: {...} }`
- After 3 messages, returns mock classification:
  ```json
  {
    "practiceArea": "Employment Law",
    "urgency": "high",
    "budgetSensitivity": "medium",
    "locationHint": "Lagos"
  }
  ```

**Needs:** Replace mock logic with real OpenAI/Anthropic API calls

---

### src/lib/supabase.ts (Database Utilities)
**Purpose:** Query functions for database operations

**Written Functions (not all actively used yet):**
- `getLawyersByPracticeArea(areaId: number)`
- `getRecommendedLawyers(areaId: number, location: string)`
- `saveContactSubmission(data: {...})`

**Dependencies:** `@supabase/supabase-js`

---

## 6. Design System

**Colors:**
- Background: White
- Text: Black
- Accent: Red (#dc2626) - used sparingly
- Chat bubbles: Gray backgrounds with subtle borders

**Typography:**
- Headings (`<h1>-<h3>`): Khand font, bold
- Body text: Inter font
- Chat messages: Inter font, bold (`font-semibold`)

**Layout:**
- Minimalist with generous whitespace
- Max-width container: `max-w-6xl`
- Centered content with padding

**Chat UI:**
- User messages: Right-aligned, gray background
- AI messages: Left-aligned, light gray background
- Maximum width: `max-w-md` on desktop, `max-w-xs` on mobile
- Rounded corners with subtle borders

---

## 7. Development Server

**Start Command:** `npm run dev`  
**URL:** `http://localhost:3000`  
**Status:** ✅ Running cleanly (as of Jan 8, 2026)

**Known Issues Resolved:**
1. Font import error (Switzer → Inter) - FIXED
2. Dev server lock file conflict - FIXED
3. Database constraint errors - FIXED (added IF NOT EXISTS, ON CONFLICT clauses)

---

## 8. Progress Tracking

### ✅ Completed (MVP Core)
- Next.js project initialized with TypeScript, Tailwind, ESLint, App Router
- All core pages created (home with chat, about, projects)
- Chat UI fully functional with message display, input, async handling
- Supabase schema created and applied (5 tables, 8 practice areas, 5 sample lawyers)
- Database utilities written (`supabase.ts`)
- API endpoint skeleton created (`classify-intake` with mock responses)
- Newsletter form with frontend submission capability
- Font system configured (Khand + Inter)
- Chat message styling with bold fonts for all messages
- Comprehensive documentation (4 guides + README + this file)
- Dev server running without errors

### ⏳ Partially Complete (Blocking MVP)
- **AI Classification Logic:** Mock implementation working, needs real LLM integration
- **Lawyer Recommendations Endpoint:** Database queries designed, `/api/recommend` endpoint not implemented
- **Newsletter Backend:** UI captures email, no Supabase storage wired

### ❌ Not Started (Post-MVP)
- Google Maps integration (location detection, map display, proximity sorting)
- Real OpenAI/Anthropic API integration
- Lawyer self-registration portal
- Geographic expansion beyond Lagos
- Deployment to Vercel + Supabase

---

## 9. Critical Next Steps (Priority Order)

### 🔴 HIGH PRIORITY - Blocking MVP

**Task 1: Integrate Real LLM to `/api/classify-intake`**
- Replace mock responses with actual OpenAI/Anthropic API calls
- Requires: `OPENAI_API_KEY` in `.env.local`
- Implementation pattern:
  ```ts
  import OpenAI from 'openai'
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.chat.completions.create({...})
  ```
- Return structured JSON classification as designed

**Task 2: Build `/api/recommend` Endpoint**
- Accept classification output from chat
- Query `lawyers` table filtered by practice_area + location
- Rank by experience_years and proximity
- Return top 5 with consultation fee ranges
- Store submission in `contact_submissions` table
- Create `recommendations` records for matched lawyers

### 🟡 MEDIUM PRIORITY - MVP Enhancement

**Task 3: Wire Newsletter to Backend**
- Create POST endpoint for newsletter signup
- Save email to `contact_submissions` with status='newsletter'
- Add backend validation (email format, deduplication)

**Task 4: Google Maps Integration**
- Request user location (with consent prompt)
- Add Google Maps component showing lawyer locations
- Calculate distances from user to lawyers
- Sort recommendations by proximity

### 🟢 LOW PRIORITY - Post-MVP

**Task 5: Lawyer Self-Registration Portal**
- Create `/register` page for lawyers
- Form with name, email, location, practice areas, fees
- Email verification before is_verified=TRUE

**Task 6: Deploy to Vercel**
- Run `vercel deploy` from project root
- Copy `.env.local` settings to Vercel project secrets
- Configure custom domain (optional)

---

## 10. Common Commands

**Start Dev Server:**
```bash
cd /Users/mac/Documents/ifindattorney
npm run dev
```

**Install Dependencies:**
```bash
npm install
```

**Check ESLint & TypeScript:**
```bash
npm run lint
npm run build
```

**Apply Database Schema:**
1. Go to Supabase dashboard
2. Create new project or select existing
3. Paste contents of `database-schema.sql` into SQL editor
4. Execute

**Access Local App:**
- Open browser to `http://localhost:3000`
- Chat should work (with mock AI responses)
- About page explains project scope
- Projects page shows roadmap

---

## 11. Important Constraints & Design Decisions

**AI Scope:**
- ✅ Conversational intake
- ✅ Asking structured follow-up questions
- ✅ Classifying problems into: practice area, urgency, budget sensitivity, location hints
- ❌ NOT providing legal advice
- ❌ NOT guaranteeing lawyer quality (disclaimer on about page)

**Lawyer Data:**
- Currently: 5 hardcoded sample Lagos lawyers
- Future: Lawyer self-registration portal with verification
- No lawyer reviews/ratings in MVP (future feature)

**Privacy & Legal:**
- All disclaimers on `/about` page
- No data persistence beyond Supabase
- GDPR/CCPA compliance deferred to post-MVP
- User accepts terms implicitly on first message

**MVP Geographic Scope:**
- Lagos State only
- All 5 sample lawyers based in Lagos
- Expansion to other states deferred

---

## 12. File Locations for Quick Reference

| Purpose | File Path |
|---------|-----------|
| Home/Chat UI | `src/app/page.tsx` |
| Root Layout | `src/app/layout.tsx` |
| About Page | `src/app/about/page.tsx` |
| Projects Page | `src/app/projects/page.tsx` |
| AI Endpoint | `src/app/api/classify-intake/route.ts` |
| Database Utilities | `src/lib/supabase.ts` |
| Database Schema | `database-schema.sql` |
| Env Template | `.env.example` |
| Dev Server Config | `next.config.ts` |
| TypeScript Config | `tsconfig.json` |

---

## 13. Recent Changes (Jan 8, 2026)

1. **Font System Update:**
   - Replaced Switzer (unavailable on Google Fonts) with Inter
   - Updated all references across 4 files
   - Khand remains for headings

2. **Chat Message Styling:**
   - AI messages: Made bold with `font-semibold`
   - User messages: Made bold with `font-semibold`
   - User messages: Changed from black bg/white text to gray bg/black text (`bg-gray-200 text-black`)

3. **Newsletter Form:**
   - Added email capture UI on home page
   - Success state on submit
   - No backend storage yet

---

## 14. Troubleshooting Guide

**Dev server won't start:**
```bash
pkill -f "next dev" || true
rm -rf .next
npm run dev
```

**Database errors on schema apply:**
- Ensure `IF NOT EXISTS` is present (prevents duplicate table errors)
- Ensure `ON CONFLICT` clauses are present (prevents constraint violations)
- Schema in `database-schema.sql` is pre-configured with these

**Chat messages not sending:**
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Open browser DevTools (F12) to see network errors
- Verify `/api/classify-intake` endpoint is accessible

**Font not loading:**
- Clear browser cache (Cmd+Shift+Delete on Chrome)
- Delete `.next` folder and restart dev server
- Verify Google Fonts are imported in `layout.tsx`

---

## 15. For Next Agent: Immediate Action Items

If you are picking up this project:

1. **Read** `SETUP.md` for manual setup instructions
2. **Verify** dev server runs: `npm run dev` at `http://localhost:3000`
3. **Check** `.env.local` exists with Supabase keys
4. **Test** chat functionality by typing a message
5. **Identify** which task from Section 9 you're starting on
6. **Update** this Agents.md file with your changes

---

**Last Updated:** January 8, 2026 by GitHub Copilot  
**Project Health:** ✅ Green (MVP core working, LLM integration pending)
