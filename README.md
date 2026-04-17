# FastFulfill — Ecommerce Sourcing & Fulfillment Platform

A production-ready SaaS platform for ecommerce sellers to source products from China, manage orders, track shipments, and scale operations.

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Framework  | Next.js 15 (App Router)        |
| Database   | Supabase (PostgreSQL)          |
| Auth       | Supabase Auth                  |
| Styling    | Tailwind CSS                   |
| Language   | TypeScript                     |
| Deployment | Vercel (recommended)           |

---

## Project Structure

```
fastfullfill_sourcing/
├── app/
│   ├── (public)/               # Public marketing pages
│   │   ├── page.tsx            # Homepage
│   │   ├── catalog/            # Product catalog
│   │   ├── tracking/           # Public shipment tracker
│   │   ├── services/           # Services page
│   │   └── pricing/            # Pricing page
│   ├── auth/
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── dashboard/              # Protected app
│   │   ├── page.tsx            # Overview / stats
│   │   ├── orders/             # Order management
│   │   ├── tracking/           # Shipment tracking
│   │   ├── inventory/          # Inventory view
│   │   └── source/             # Source requests
│   ├── api/
│   │   ├── orders/             # Orders API
│   │   ├── source-requests/    # Source requests API
│   │   ├── tracking/           # Tracking API
│   │   ├── inventory/          # Inventory API
│   │   └── auth/callback/      # Auth callback
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Button, Card, Input, Badge, etc.
│   ├── layout/                 # Navbar, Sidebar, Footer
│   └── home/                   # Homepage sections
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── utils.ts                # Helpers, formatters, constants
│   └── dummy-data.ts           # Demo data
├── types/
│   └── database.ts             # TypeScript DB types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
└── middleware.ts               # Auth route protection
```

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, region, and strong database password
3. Wait for project to provision (~2 minutes)

### 2. Run the Migration

1. In your Supabase project, click **SQL Editor**
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

This creates all tables with proper RLS policies.

### 3. Get Your API Keys

In your Supabase dashboard → **Project Settings → API**:
- Copy **Project URL**
- Copy **anon / public** key

---

## Local Development

### 1. Clone & Install

```bash
cd fastfullfill_sourcing
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Demo Mode (No Supabase Required)

All dashboard pages work with **dummy data** out of the box — no Supabase connection needed to explore the UI. Create an account to activate the real database backend.

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/fastfullfill
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Import Project
2. Select your GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

### 3. Configure Supabase Auth Redirect

In Supabase → **Authentication → URL Configuration**:
- Site URL: `https://your-vercel-app.vercel.app`
- Redirect URLs: `https://your-vercel-app.vercel.app/api/auth/callback`

---

## Features

| Feature                     | Status |
|-----------------------------|--------|
| Email Auth (signup/login)   | ✅     |
| Dashboard overview + stats  | ✅     |
| Order management            | ✅     |
| CSV order import            | ✅     |
| Shipment tracking (public)  | ✅     |
| Inventory management        | ✅     |
| Source request form         | ✅     |
| Product catalog             | ✅     |
| Services page               | ✅     |
| Pricing page (3 tiers)      | ✅     |
| Homepage (high-conversion)  | ✅     |
| Row Level Security (RLS)    | ✅     |
| Mobile responsive           | ✅     |

---

## API Reference

All API routes are under `/api/`.

| Method | Endpoint                  | Auth | Description                    |
|--------|---------------------------|------|-------------------------------|
| GET    | `/api/orders`             | Yes  | List user's orders             |
| POST   | `/api/orders`             | Yes  | Create new order               |
| GET    | `/api/source-requests`    | Yes  | List user's source requests    |
| POST   | `/api/source-requests`    | Yes  | Submit sourcing request        |
| GET    | `/api/tracking?tracking_number=X` | No | Public shipment lookup |
| GET    | `/api/inventory`          | Yes  | List user's inventory          |

---

## Customization

- **Branding**: Update colors in `tailwind.config.ts` (brand palette)
- **Products**: Edit `lib/dummy-data.ts` → `DUMMY_CATALOG`
- **Pricing tiers**: Edit `app/(public)/pricing/page.tsx`
- **Testimonials**: Edit `components/home/testimonials.tsx`
