export type MarketType = 'Equity' | 'Options' | 'Futures' | 'Forex' | 'Crypto' | 'Other';
export type DirectionType = 'Long' | 'Short';

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string; // YYYY-MM-DD
  instrument: string;
  market: MarketType;
  direction: DirectionType;
  entry_price: number;
  exit_price: number;
  quantity: number;
  stop_loss?: number | null;
  target?: number | null;
  gross_pnl: number;
  fees: number;
  net_pnl: number;
  strategy?: string | null;
  setup?: string | null;
  notes?: string | null;
  screenshot_path?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TradeFormData {
  trade_date: string;
  instrument: string;
  market: MarketType;
  direction: DirectionType;
  entry_price: number | '';
  exit_price: number | '';
  quantity: number | '';
  stop_loss?: number | '' | null;
  target?: number | '' | null;
  gross_pnl: number | '';
  fees: number | '';
  net_pnl: number | '';
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
