# LifeMed

A modern, AI-powered cross-platform healthcare application for securely storing, organizing, understanding, and sharing your complete health history from birth to present day.

## Features

- **Authentication** — Email, Google, and Apple sign-in with biometric support (ready for Supabase Auth)
- **Personal Health Profile** — Allergies, medications, emergency contacts, chronic conditions
- **Lifetime Medical Timeline** — Chronological view of vaccinations, diagnoses, surgeries, and more
- **Document Storage** — Upload PDFs, images, and scans with drag-and-drop, folders, and search
- **Expandable Health Categories** — Cardiology, neurology, immunology, lab results, and more
- **AI Health Assistant** — Summaries, lab explanations, and doctor-ready reports (with medical disclaimers)
- **Doctor Sharing** — Temporary QR codes and secure access links
- **Emergency Mode** — Quick-access medical card with blood type, allergies, and contacts
- **Family Accounts** — Manage health records for children and elderly parents
- **Dark Mode & PWA** — Beautiful on phone, tablet, and desktop

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **AI:** OpenAI API (optional — demo mode works without a key)
- **UI:** Framer Motion, Lucide icons, custom design system

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes npm)
- A [Supabase](https://supabase.com/) project (optional for demo mode)

### Installation

```bash
cd Projects/LifeMed
npm install
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-api-key   # optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the SQL schema in your Supabase SQL editor:

```bash
# File: supabase/schema.sql
```

Enable Google and Apple OAuth in Supabase Auth settings.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Landing page:** `/`
- **Demo dashboard:** `/dashboard` (works without auth using demo data)
- **Sign in:** `/login`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Main app routes with sidebar layout
│   │   ├── dashboard/
│   │   ├── timeline/
│   │   ├── documents/
│   │   ├── categories/
│   │   ├── ai-assistant/
│   │   ├── share/
│   │   ├── emergency/
│   │   ├── family/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/ai/         # AI assistant endpoint
│   ├── login/
│   └── signup/
├── components/
│   ├── ui/             # Design system components
│   └── layout/         # App shell, navigation
├── data/               # Demo data
├── lib/                # Supabase clients, utilities
└── types/              # TypeScript types
```

## Design Philosophy

LifeMed is intentionally **human-centered**, not hospital-cold:

- Soft rounded UI with calm teal/sage palette
- Smooth Framer Motion animations
- Clear medical disclaimers on all AI features
- HIPAA-inspired privacy messaging throughout
- Mobile-first with bottom navigation on phones

## Security & Privacy

- Row Level Security (RLS) on all Supabase tables
- Private storage bucket for health documents
- End-to-end encryption messaging (production deployment should enable client-side encryption)
- Temporary, revocable share links for doctor access

## Medical Disclaimer

LifeMed provides health information organization and gentle insights only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.

## License

Private — All rights reserved.
