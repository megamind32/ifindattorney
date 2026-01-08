# Setup Guide: iFind Attorney MVP

This guide walks you through setting up the lawyer recommendation platform for local development and deployment.

## ✅ What's Already Done

- ✓ Next.js project initialized with TypeScript
- ✓ Tailwind CSS + custom fonts (Khand, Switzer)
- ✓ Core pages: Home, About, Projects
- ✓ AI chat interface UI (client-side)
- ✓ API skeleton for classification (`/api/classify-intake`)
- ✓ Database schema SQL file with sample data
- ✓ Environment templates (`.env.example`, `.env.local`)
- ✓ Supabase utilities module (`src/lib/supabase.ts`)

## 📋 Next Steps (Before Running Locally)

### 1. Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (free tier is fine for MVP)
3. Note your project URL and anonymous key

### 2. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `database-schema.sql`
4. Click **Run**
5. Wait for all tables to be created (should see 5 sample lawyers in `lawyers` table)

### 3. Fill in `.env.local`

```bash
cd /Users/mac/Documents/ifindattorney
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
NEXT_PUBLIC_AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

**Get these from:**
- **Supabase URL/Key:** Settings → API → Project Settings
- **Google Maps Key:** [Google Cloud Console](https://console.cloud.google.com) → Create project → Enable Maps API → Create API key
- **OpenAI Key:** [platform.openai.com](https://platform.openai.com) → API Keys → Create new secret key

### 4. Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in browser.

**Test the flow:**
1. Type in the chat: "I was wrongfully fired"
2. AI should ask a follow-up question
3. After 2-3 messages, it should classify your issue
4. Click "Get Recommendations" button

## 🎯 What to Test Locally

- [ ] Chat interface responds
- [ ] Messages appear correctly (user on right, AI on left)
- [ ] AI classification appears after a few messages
- [ ] Newsletter form can be filled out
- [ ] All pages load without errors (run `npm run lint`)
- [ ] Mobile responsive (test in Chrome DevTools)

## 🔧 Development Tips

### Restart the dev server if you make changes to:
- `.env.local`
- `next.config.ts`
- `/src/lib/` files

### View database in Supabase:
- Dashboard → Table Editor
- Check `lawyers` table to see sample data

### Debug API calls:
```bash
# In browser console:
console.log(messages)  # See chat messages
```

### Check for build errors:
```bash
npm run build
```

## 🚀 Next Major Tasks (Not in MVP Yet)

Once you're comfortable with the setup, consider:

1. **Integrate Real AI** (`/api/classify-intake`)
   - Currently returns mock data
   - Needs OpenAI/Anthropic/Gemini integration
   - Should ask dynamic follow-up questions

2. **Add Lawyer Recommendations** (`/api/recommend`)
   - Query Supabase by practice area + location
   - Rank by proximity to user

3. **Google Maps Integration**
   - Detect user location (with permission)
   - Show lawyer locations on map
   - Calculate distances

4. **Newsletter Backend**
   - Currently client-side only
   - Add email capture to Supabase
   - Set up SendGrid/Mailgun for confirmations

## 📞 Troubleshooting

### "Cannot find module @supabase/supabase-js"
```bash
npm install
```

### "NEXT_PUBLIC_SUPABASE_URL is undefined"
- Make sure `.env.local` is filled in correctly
- Restart `npm run dev`

### Chat not responding
- Check `.env.local` has `OPENAI_API_KEY`
- Check OpenAI account has credits
- Look at browser console for errors

### Build errors with fonts
- Make sure `Khand` and `Switzer` are imported in `layout.tsx`
- Clear `.next/` folder: `rm -rf .next && npm run dev`

## 📚 Project Structure

```
src/
  app/
    api/
      classify-intake/route.ts    ← AI classification (NEEDS REAL LLM)
      recommend/route.ts          ← Lawyer recommendations (TODO)
    about/page.tsx
    projects/page.tsx
    page.tsx                       ← Home (chat interface)
  lib/
    supabase.ts                    ← Database utilities
  globals.css                      ← Tailwind config

database-schema.sql                 ← Supabase setup
.env.example                        ← Template
.env.local                          ← Your secrets (DON'T COMMIT)
README.md                           ← Project overview
```

## 🎨 Design System (Already Applied)

- **Fonts:** Khand (headings), Switzer (body)
- **Colors:** White bg, black text, red accent
- **Spacing:** Minimalist, max-width 6xl
- **Responsive:** Tailwind responsive classes

## ⚖️ Remember

- ✋ **Don't** provide legal advice
- ✋ **Don't** auto-verify lawyers
- ✋ **Don't** scrape Google or other sites
- ✋ **Don't** expose API keys in code
- ✓ **Do** collect minimal user data
- ✓ **Do** show disclaimers
- ✓ **Do** make recommendations neutral

## 🚢 Deployment (Later)

When ready to launch:

**Frontend → Vercel:**
```bash
vercel deploy
```

**Database:** Already on Supabase (serverless, no deploy needed)

---

**Next step: Set up Supabase and fill in `.env.local`, then run `npm run dev`**
