# iFind Attorney MVP — Project Summary

**Date:** January 8, 2026  
**Status:** Ready for Supabase setup & local testing  
**Location:** Lagos State, Nigeria (MVP)

---

## 🎯 What's Been Built

A **lawyer discovery platform** that uses AI to help non-lawyers in Lagos find attorneys matched to their legal needs.

### Core Features (MVP)

✅ **AI Chat Interface**
- User describes their legal problem in natural language
- AI asks clarifying questions
- AI classifies into: practice area, urgency, budget, location
- Extracts structured data for lawyer matching

✅ **Lawyer Database** (Supabase)
- 5 sample lawyers seeded with Lagos locations
- Practice areas: Employment, Family, Property, Corporate, Dispute Resolution
- Consultation fee ranges
- Experience levels

✅ **Pages**
- **Home:** Chat interface + newsletter signup
- **About:** Mission, how it works, disclaimers
- **Projects:** MVP status + roadmap

✅ **Design**
- Minimalist, clean aesthetic
- Fonts: Khand (headings), Switzer (body)
- Colors: White, black, red accent
- Responsive mobile design

✅ **API Infrastructure**
- `/api/classify-intake` — AI classification endpoint (mock, needs real LLM)
- Supabase utilities for database queries
- Environment variables for secrets

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page with chat UI |
| `src/app/about/page.tsx` | About page |
| `src/app/projects/page.tsx` | Projects & roadmap page |
| `src/app/api/classify-intake/route.ts` | AI classification API (mock) |
| `src/lib/supabase.ts` | Database utilities |
| `database-schema.sql` | Supabase schema + sample data |
| `.env.example` | Environment template |
| `README.md` | Project overview |
| `SETUP.md` | Step-by-step setup guide |

---

## 🚀 Next Steps (4-5 Items)

### Immediate (Before Running)
1. **Create Supabase account** → Get URL & anon key
2. **Run `database-schema.sql`** in Supabase SQL Editor
3. **Fill in `.env.local`** with API keys (Supabase, OpenAI, Google Maps)
4. **Run locally** with `npm run dev`

### Short-term (This Week)
5. **Integrate real LLM** in `/api/classify-intake` (OpenAI/Anthropic)
6. **Build `/api/recommend`** endpoint to match lawyers by practice area + location
7. **Wire up newsletter** to Supabase `contact_submissions` table
8. **Test end-to-end flow** — Chat → Classification → Recommendations

### Medium-term (Next 2 Weeks)
9. **Add Google Maps** for location detection & distance calculation
10. **Lawyer self-registration** portal
11. **Deploy to Vercel** (frontend) + Supabase (backend)

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS + Google Fonts |
| Backend | Supabase (serverless PostgreSQL) |
| AI/LLM | OpenAI (or Anthropic Claude, or Google Gemini) |
| Maps | Google Maps API |
| Hosting | Vercel (frontend), Supabase (database) |

---

## 📋 Constraints (Strictly Enforced)

### ✅ What We DO:
- AI for **intake classification only** (not advice)
- Manually seed or self-register lawyers
- Use Google Maps for location awareness
- Make **neutral recommendations** (no "best lawyer" rankings)
- Collect minimal user data

### ❌ What We DON'T:
- Provide legal advice
- Scrape Google Maps or websites
- Auto-verify lawyers
- Build payments, reviews, or dashboards (yet)
- Expose API keys or secrets

---

## 🎨 Design & Copy

**Tone:** Professional, calm, trustworthy  
**Disclaimers:** "This platform does NOT provide legal advice"  
**Neutral language:** "Recommended based on your inputs" (not "best")  
**Color System:**
- White (background)
- Black (text/borders)
- Red #dc2626 (accent, sparingly)

**Fonts:**
- Khand (headings)
- Switzer (body text)

---

## 🗂️ Database Schema (Quick Reference)

```
lawyers
├── id, name, email, phone
├── location, office_address, lat/lng
├── practice_area_id, bio, experience_years
├── consultation_fee_min/max
└── is_active, is_verified

practice_areas
├── id, name (slug), description

lawyer_specialties
├── lawyer_id, practice_area_id (many-to-many)

contact_submissions
├── user_name, user_email, user_location
├── practice_area, urgency, budget_sensitivity, message
└── status, created_at

recommendations
├── submission_id, lawyer_id, rank, match_reason
```

Sample data: 5 Lagos lawyers across multiple practice areas

---

## 🏃 Quick Commands

```bash
# Install dependencies
npm install

# Run locally (dev mode)
npm run dev

# Check for errors
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 📚 Documentation

- **README.md** — Project overview & architecture
- **SETUP.md** — Step-by-step setup guide
- **database-schema.sql** — Full database schema with comments
- **.env.example** — Environment variable template

---

## ✅ MVP Definition (In Scope)

- ✓ AI intake chat (mock LLM)
- ✓ Lawyer database (Supabase)
- ✓ Practice area classification
- ✓ Location awareness
- ✓ Basic UI (home, about, projects)
- ✓ Newsletter signup (frontend)
- ✓ Legal disclaimers
- ✓ Lagos State only

## ❌ Out of Scope (Not MVP)

- ✗ Lawyer verification
- ✗ Client reviews
- ✗ Booking system
- ✗ Payment processing
- ✗ User authentication
- ✗ Admin dashboard
- ✗ Multiple countries (Phase 2+)

---

## 🎬 Ready to Go!

**The MVP is ready for local development.**

Next action: Follow `SETUP.md` to configure Supabase & environment, then run `npm run dev`.

---

**Questions? Check:**
1. `SETUP.md` — Detailed setup steps
2. `README.md` — Project overview
3. `database-schema.sql` — Database schema
4. Code comments in `src/app/api/classify-intake/route.ts`

**Goal:** Get to first working version (chat → classification) by end of week.
