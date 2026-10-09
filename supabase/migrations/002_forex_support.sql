-- Migration: 002_forex_support.sql
-- Safe additive migration for Forex trading fields on trades table

ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS lot_size NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS contract_size NUMERIC DEFAULT 100000 NULL,
  ADD COLUMN IF NOT EXISTS commission NUMERIC DEFAULT 0 NULL,
  ADD COLUMN IF NOT EXISTS swap NUMERIC DEFAULT 0 NULL,
  ADD COLUMN IF NOT EXISTS other_fees NUMERIC DEFAULT 0 NULL,
  ADD COLUMN IF NOT EXISTS pips NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS trade_time TEXT NULL;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
