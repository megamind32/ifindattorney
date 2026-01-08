# Quick Reference Card

## 🚀 Start Here

1. **Read:** `SETUP.md` (5 min setup walkthrough)
2. **Create:** Supabase account, get URL + key
3. **Run:** `database-schema.sql` in Supabase SQL Editor
4. **Fill:** `.env.local` with API keys
5. **Go:** `npm run dev` → http://localhost:3000

## 📍 Key URLs

- **Local dev:** http://localhost:3000
- **Supabase:** https://supabase.com
- **OpenAI Keys:** https://platform.openai.com/api-keys
- **Google Cloud:** https://console.cloud.google.com

## 🔑 Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
OPENAI_API_KEY=
```

## 📂 Important Files

| What | Where |
|------|-------|
| Home page (chat) | `src/app/page.tsx` |
| About page | `src/app/about/page.tsx` |
| AI endpoint | `src/app/api/classify-intake/route.ts` |
| DB utils | `src/lib/supabase.ts` |
| Database schema | `database-schema.sql` |
| Layout & nav | `src/app/layout.tsx` |

## 🎯 Current Status

✅ UI/Chat interface built  
✅ Database schema created  
✅ Sample lawyers seeded  
✅ API skeleton ready  
⏳ Needs real LLM integration  
⏳ Needs recommendation endpoint  

## 🧠 What Happens When You Chat

```
User types: "I was fired"
    ↓
POST /api/classify-intake
    ↓
AI asks: "When did this happen?"
    ↓
User replies
    ↓
AI classifies (after 2-3 msgs):
  - practice_area: "Employment Law"
  - urgency: "high"
  - budget: "medium"
    ↓
Frontend shows classification box
    ↓
User clicks "Get Recommendations"
    ↓
(TODO) Call /api/recommend
    ↓
Show matching lawyers
```

## 🐛 If Something Breaks

**Chat not responding?**
- Check `.env.local` has `OPENAI_API_KEY`
- Check browser console for errors
- Restart dev server: `npm run dev`

**Database errors?**
- Verify `database-schema.sql` ran in Supabase
- Check Supabase URL & key in `.env.local`
- Try: `npx supabase link` (if using Supabase CLI)

**Build errors?**
- Clear cache: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`
- Check: `npm run lint`

## 📚 Documentation Map

```
README.md
  ↓ (Overview of project)
  
SETUP.md
  ↓ (Step-by-step setup)
  
PROJECT_SUMMARY.md
  ↓ (What's been built, what's next)
  
QUICK_REFERENCE.md (this file)
  ↓ (Fast lookup)
  
Code comments in src/
  ↓ (Implementation details)
```

## 💡 Key Constraints

- ✋ Don't provide legal advice
- ✋ Don't scrape Google Maps
- ✋ Don't verify lawyers automatically
- ✓ Do collect minimal data
- ✓ Do show disclaimers
- ✓ Do make neutral recommendations

## 🎨 Design System

**Fonts:** Khand (h1-h3), Switzer (body, buttons)  
**Colors:** White bg, black text, #dc2626 red accent  
**Max-width:** 6xl container (1152px)  
**Spacing:** Minimalist, large whitespace  

## 🚢 Deployment (When Ready)

```bash
# Deploy frontend to Vercel
vercel deploy

# Database stays on Supabase (no deploy needed)
```

## 📞 Common Tasks

```bash
# Run locally
npm run dev

# Check for errors
npm run lint

# Build for production
npm run build

# View database
# → Supabase Dashboard → Table Editor

# Test API endpoint
curl -X POST http://localhost:3000/api/classify-intake \
  -H "Content-Type: application/json" \
  -d '{"userInput":"I need legal help","conversationHistory":[]}'
```

## 🗂️ Database Tables (Quick Look)

```
lawyers (5 sample rows)
  ├─ name, email, phone
  ├─ location (e.g., "Victoria Island")
  ├─ practice_area_id
  ├─ consultation_fee_min/max
  └─ is_verified

practice_areas (8 categories)
  ├─ Employment Law
  ├─ Family Law
  ├─ Property Law
  ├─ Corporate Law
  ├─ Commercial Law
  ├─ Dispute Resolution
  ├─ Immigration Law
  └─ Intellectual Property

contact_submissions (user inquiries)
  ├─ user_name, user_email
  ├─ practice_area (classified by AI)
  ├─ urgency, budget_sensitivity
  └─ message

recommendations (matches)
  ├─ submission_id
  ├─ lawyer_id
  └─ match_reason
```

---

**Next step:** Open `SETUP.md` and follow the 4 setup steps, then `npm run dev` 🚀
