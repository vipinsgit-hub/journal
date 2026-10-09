# Modern Personal Trading Journal Web Application

A modern, professional, dark-mode personal Trading Journal built with React, TypeScript, Tailwind CSS, Vite, and Supabase. Designed for individual traders to record, journal, and analyze daily trade performance across Equities, Options, Futures, Forex, and Crypto markets.

![Trading Journal](/public/vite.svg)

---

## 🌟 Key Features

1. **Supabase Authentication & Row-Level Security (RLS)**
   - Registration, Email/Password Sign-In, Password Recovery, and Session persistence.
   - Strict owner-based database isolation ensuring user data privacy.

2. **Trading Calendar (Page 1)**
   - Monday–Sunday grid layout displaying daily net P&L, trade counts, and visual day states (Profitable, Losing, Break-even, Quiet).
   - Dynamic monthly aggregate metrics: Monthly Net P&L, Active Trading Days count, Total Trades count.
   - Month-to-month navigation and "Today" date reset.

3. **Daily Trading Journal Drawer**
   - Responsive right-hand drawer (Desktop) / full-screen drawer (Mobile).
   - Complete daily P&L breakdown: Gross P&L, Brokerage/Fees, Net P&L, Win Rate, Best & Worst trades of the day.
   - Full list of trade records with entry/exit prices, direction (Long/Short), quantity, strategy, and trade notes.
   - Private chart screenshot viewing with signed URL security.

4. **Add / Edit Trade Modal**
   - 6-section comprehensive trade entry form (Details, Execution, Risk Management, PnL & Result, Journal & Strategy, Screenshot Attachment).
   - Live P&L preview and auto-calculator for Long/Short position results.
   - Custom instrument inputs and user-defined strategy presets.

5. **Performance Dashboard (Page 2)**
   - Overview metrics: Total Net P&L, Closed Trades count, Win Rate %, Profit Factor (`Gross Wins ÷ Gross Losses`), Avg Daily Net P&L, Total Brokerage Fees.
   - Daily P&L Timeline chart built with Recharts.
   - Detailed trade statistics: Current vs Previous Month Net P&L, Average Winning Trade vs Average Losing Trade, Best and Worst trading days.
   - Recent trades table (Desktop) / compact cards (Mobile).

6. **Centralized Preferences & Multi-Currency**
   - Centralized INR (₹) default currency formatting with support for USD ($), EUR (€), and GBP (£).
   - Timezone configuration.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Visualization**: Recharts
- **Backend & Database**: Supabase PostgreSQL, Supabase Auth, Supabase Row Level Security (RLS), Supabase Storage
- **Testing**: Vitest

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Installation
```bash
# Clone or navigate to the workspace
cd journal

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

*Note: If environment variables are omitted, the application automatically enables **Demo Mode** with sample data so you can test all UI features locally without configuring Supabase immediately.*

### 4. Run Development Server
```bash
npm run dev
```

---

## 🗄️ Database Setup & Migrations (Supabase)

The complete SQL schema, RLS policies, automated profile creation triggers, and storage bucket security policies are version-controlled under `supabase/migrations/001_initial_schema.sql`.

### Applying Migrations via Supabase Dashboard
1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy the contents of [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).
4. Run the SQL query to create tables, indexes, triggers, RLS policies, and storage settings.

### Schema Highlights
- **`profiles` table**: User preferences (`display_name`, `preferred_currency`, `timezone`) linked to `auth.users(id)`.
- **`trades` table**: Complete execution logs (`trade_date`, `instrument`, `market`, `direction`, `entry_price`, `exit_price`, `quantity`, `gross_pnl`, `fees`, `net_pnl`, `strategy`, `notes`, `screenshot_path`).
- **Row Level Security (RLS)**: Strictly limits `SELECT`, `INSERT`, `UPDATE`, and `DELETE` access to `auth.uid() = user_id`.
- **`trade-screenshots` Storage Bucket**: Private storage bucket allowing authenticated users to upload and view screenshots stored under their `auth.uid()` directory prefix.

---

## 🧪 Testing

Run unit tests to verify domain math calculations (Net P&L, Win Rate, Profit Factor, zero-trade edge cases):

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

Run TypeScript compilation check & production build:
```bash
npm run build
```

---

## 🌐 Vercel Deployment Instructions

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit of Trading Journal Web App"
git branch -M main
git remote add origin https://github.com/your-username/trading-journal.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your `trading-journal` GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable key
5. Click **Deploy**.

### Step 3: Configure Supabase Auth Redirect URLs
1. In your Supabase Dashboard, go to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your deployed Vercel domain (e.g. `https://your-journal.vercel.app`).
3. Under **Redirect URLs**, add:
   - `https://your-journal.vercel.app/**`
   - `http://localhost:5173/**`

---

## 📄 License

MIT License. Built for personal trading journal and portfolio tracking.
