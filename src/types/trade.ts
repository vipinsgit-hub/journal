export type MarketType = 'Forex Major' | 'Forex Minor' | 'Forex Exotic' | 'Metals (XAU/XAG)' | 'Crypto' | 'Indices' | 'Other';
export type DirectionType = 'Long' | 'Short';

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string; // YYYY-MM-DD
  trade_time?: string | null; // HH:mm
  instrument: string; // e.g. EUR/USD, GBP/JPY, XAU/USD
  market: MarketType;
  direction: DirectionType;
  entry_price: number;
  exit_price: number;
  quantity: number; // lot size or position units
  lot_size?: number | null;
  contract_size?: number | null;
  stop_loss?: number | null;
  target?: number | null;
  gross_pnl: number;
  commission?: number | null;
  swap?: number | null;
  other_fees?: number | null;
  fees: number; // total fees = commission + swap + other_fees
  net_pnl: number;
  pips?: number | null;
  strategy?: string | null;
  setup?: string | null;
  notes?: string | null;
  screenshot_path?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TradeFormData {
  trade_date: string;
  trade_time?: string;
  instrument: string;
  market: MarketType;
  direction: DirectionType;
  entry_price: number | '';
  exit_price: number | '';
  quantity: number | ''; // lot size
  lot_size?: number | '';
  contract_size?: number | '';
  stop_loss?: number | '' | null;
  target?: number | '' | null;
  gross_pnl: number | '';
  commission?: number | '';
  swap?: number | '';
  other_fees?: number | '';
  fees: number | '';
  net_pnl: number | '';
  pips?: number | '';
  strategy?: string;
  setup?: string;
  notes?: string;
  screenshot_file?: File | null;
  screenshot_path?: string | null;
}

export interface DailySummaryData {
  trade_date: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  gross_pnl: number;
  total_fees: number;
  net_pnl: number;
  win_rate: number; // percentage 0-100
  best_trade: Trade | null;
  worst_trade: Trade | null;
}

export interface MonthlySummaryData {
  month: number; // 0-11
  year: number;
  total_trades: number;
  trading_days_count: number;
  net_pnl: number;
  gross_pnl: number;
  total_fees: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  win_rate: number;
  profit_factor: number;
}

export interface OverallPerformanceSummary {
  total_net_pnl: number;
  total_gross_pnl: number;
  total_fees: number;
  total_closed_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  win_rate: number;
  profit_factor: number;
  
  // Monthly overview
  current_month_net_pnl: number;
  previous_month_net_pnl: number;
  trading_days_count: number;
  best_trading_day: { date: string; pnl: number } | null;
  worst_trading_day: { date: string; pnl: number } | null;
  avg_daily_net_pnl: number;
  avg_winning_trade: number;
  avg_losing_trade: number;
}
