# iFind Attorney

A lawyer recommendation platform for Lagos State, Nigeria. Uses AI to help non-lawyers find attorneys matched to their legal needs.

## 🎯 MVP Scope

- **Location:** Lagos State only
- **Users:** Non-lawyers seeking legal help
- **Purpose:** Match users with lawyers by practice area + proximity
- **Tech:** Next.js, Supabase, OpenAI (or Anthropic), Google Maps

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env.local` and fill in your API keys:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
OPENAI_API_KEY=your_key
```

### 3. Set Up Supabase Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, paste and run the contents of `database-schema.sql`
3. This creates all tables, indexes, and sample lawyer data for Lagos

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📚 Pages

- **Home** (`/`) — AI chat interface for lawyer discovery
- **About** (`/about`) — Mission, how it works, disclaimers
- **Projects** (`/projects`) — MVP status and roadmap

## 🤖 How AI Intake Works

1. **User inputs problem** — "I need help with employment law"
2. **AI asks questions** — Clarifies urgency, budget, location
3. **AI classifies** — Practice area, urgency level, budget sensitivity, location hint
4. **Match lawyers** — Recommends attorneys from database by expertise + proximity
5. **User connects** — Direct contact with recommended lawyers

**Important:** AI does NOT provide legal advice. Only intake classification & matching.

## 📊 Database Tables

- `lawyers` — Attorney profiles with practice areas, fees, location
- `practice_areas` — Categories (Employment, Family, Property, Corporate, etc.)
- `lawyer_specialties` — Many-to-many mapping
- `contact_submissions` — User inquiries with AI classifications
- `recommendations` — Matched lawyer results per submission

See `database-schema.sql` for full schema, indexes, and 5 sample Lagos lawyers.

## 🎨 Design System

- **Fonts:** Khand (headings), Switzer (body)
- **Colors:** White background, black text, red accent (#dc2626)
- **Layout:** Minimalist, large whitespace, responsive
- **Max-width:** 6xl container

## 🔑 Key Constraints

✅ **DO:**
- Use AI for intake & classification only
- Manually seed or self-register lawyers
- Use Google Maps for location awareness
- Make neutral recommendations (no rankings)
- Collect minimal user data

❌ **DON'T:**
- Provide legal advice
- Scrape Google Maps or websites
- Auto-verify lawyers
- Build payments or authentication (yet)
- Over-engineer the MVP

## ⚖️ Legal Disclaimers

This platform:
- Does **NOT** provide legal advice
- Is **NOT** a law firm
- Makes **recommendations only** (not endorsements)
- Cannot guarantee legal outcomes
- Operates **Lagos State only** (MVP phase)

**Users must vet lawyers independently before engaging.**

## 📝 API Endpoints

### POST `/api/classify-intake`

Receives user input and conversation history. Returns AI classification and response.

**Request:**
```json
{
  "userInput": "I was fired unfairly",
  "conversationHistory": [...]
}
```

**Response:**
```json
{
  "response": "Tell me more...",
  "classification": {
    "practiceArea": "Employment Law",
    "urgency": "high",
    "budgetSensitivity": "medium",
    "locationHint": "Lagos Island"
  }
}
```

## 🚀 Deployment

**Frontend:** [Vercel](https://vercel.com) (native Next.js support)
```bash
vercel deploy
```

**Backend/Database:** [Supabase](https://supabase.com) (serverless PostgreSQL, no deployment needed)

## 🛣️ Future Roadmap

- **Q2 2024:** Lawyer self-registration portal
- **Q3 2024:** Expand to other Nigerian states
- **Q4 2024:** Optional verified client reviews
- **2025:** Consultation booking + escrow payments

## 📄 License

© 2024 iFind Attorney. All rights reserved.

---

**Made with ❤️ for Lagos State, Nigeria.**
