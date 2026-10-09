-- Migration: 002_forex_and_preferences.sql
-- Add Forex fields to trades table and user preferences (pairs & strategies) to profiles table

-- 1. Ensure trades table has all Forex fields
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS lot_size NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS contract_size NUMERIC DEFAULT 100000 NULL,
  ADD COLUMN IF NOT EXISTS commission NUMERIC DEFAULT 0 NULL,
  ADD COLUMN IF NOT EXISTS swap NUMERIC DEFAULT 0 NULL,
  ADD COLUMN IF NOT EXISTS other_fees NUMERIC DEFAULT 0 NULL,
  ADD COLUMN IF NOT EXISTS pips NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS trade_time TEXT NULL;

-- 2. Ensure profiles table has forex_pairs and strategies preference columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS forex_pairs TEXT[] DEFAULT ARRAY[
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD'
  ]::TEXT[],
  ADD COLUMN IF NOT EXISTS strategies TEXT[] DEFAULT ARRAY[
    'Breakout', 'Trend Following', 'Pullback', 'Liquidity Sweep', 'ICT', 'SMC', 'Range Reversal'
  ]::TEXT[];

-- 3. Update trigger function for automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, timezone, forex_pairs, strategies)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'Asia/Kolkata',
    ARRAY['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAU/USD']::TEXT[],
    ARRAY['Breakout', 'Trend Following', 'Pullback', 'Liquidity Sweep', 'ICT', 'SMC', 'Range Reversal']::TEXT[]
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
