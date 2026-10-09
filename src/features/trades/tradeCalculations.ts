import type { Trade, DailySummaryData, MonthlySummaryData, OverallPerformanceSummary } from '../../types/trade';

export interface PipSizeInfo {
  pipSize: number;
  isKnown: boolean;
  label?: string;
}

/**
 * Returns instrument-aware Pip Size for Forex, Metals, Crypto, and Indices.
 */
export function getPipSize(instrument: string): PipSizeInfo {
  if (!instrument || !instrument.trim()) {
    return { pipSize: 0.0001, isKnown: true };
  }

  const clean = instrument.toUpperCase().replace('/', '').replace('-', '').trim();

  // JPY pairs: 0.01 (USDJPY, EURJPY, GBPJPY, etc.)
  if (clean.includes('JPY')) {
    return { pipSize: 0.01, isKnown: true, label: 'JPY (0.01)' };
  }
  // Gold (XAUUSD): 0.10 (10 cents per pip)
  if (clean.includes('XAU') || clean.includes('GOLD')) {
    return { pipSize: 0.10, isKnown: true, label: 'Gold (0.10)' };
  }
  // Silver (XAGUSD): 0.01
  if (clean.includes('XAG') || clean.includes('SILVER')) {
    return { pipSize: 0.01, isKnown: true, label: 'Silver (0.01)' };
  }
  // Crypto (BTCUSD, ETHUSD): 1.0
  if (clean.includes('BTC') || clean.includes('ETH')) {
    return { pipSize: 1.0, isKnown: true, label: 'Crypto (1.0)' };
  }
  // Stock Indices (US30, NAS100, SPX500, GER40, DE30, UK100, DOW)
  if (clean.includes('US30') || clean.includes('NAS') || clean.includes('SPX') || clean.includes('GER') || clean.includes('DE30') || clean.includes('UK100') || clean.includes('DOW') || clean.includes('NDX')) {
    return { pipSize: 1.0, isKnown: true, label: 'Index Points (1.0)' };
  }

  // Standard Forex Pairs (EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDCHF, etc.): 0.0001
  const forexCurrencies = ['EUR', 'GBP', 'AUD', 'NZD', 'USD', 'CAD', 'CHF', 'SEK', 'NOK', 'SGD', 'HKD', 'MXN', 'TRY', 'ZAR'];
  const hasCurrency = forexCurrencies.some((c) => clean.includes(c));

  if (hasCurrency) {
    return { pipSize: 0.0001, isKnown: true, label: 'Standard Forex (0.0001)' };
  }

  // Unknown instrument fallback
  return { pipSize: 0.0001, isKnown: false, label: 'Pip size not configured' };
}

/**
 * Calculates pips gained or lost based on direction, entry, exit, and pip size.
 */
export function calculatePips(direction: 'Long' | 'Short', entry: number, exit: number, pipSize: number): number {
  if (entry <= 0 || exit <= 0 || pipSize <= 0) return 0;
  const diff = direction === 'Long' ? exit - entry : entry - exit;
  const pips = diff / pipSize;
  return Math.round((pips + Number.EPSILON) * 10) / 10;
}

/**
 * Calculates Total Fees from Commission, Swap, Other Fees, and standard Fees.
 */
export function calculateTotalFees(commission: number = 0, swap: number = 0, otherFees: number = 0, legacyFees: number = 0): number {
  const total = (commission || 0) + (swap || 0) + (otherFees || 0) + (legacyFees || 0);
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates Net PnL from Gross PnL and Total Fees safely avoiding JS float issues.
 */
export function calculateNetPnl(grossPnl: number, totalFees: number): number {
  const net = (grossPnl || 0) - (totalFees || 0);
  return Math.round((net + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates trade summary for a single day's trades.
 */
export function calculateDailySummary(tradeDate: string, trades: Trade[]): DailySummaryData {
  if (!trades || trades.length === 0) {
    return {
      trade_date: tradeDate,
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      breakeven_trades: 0,
      gross_pnl: 0,
      total_fees: 0,
      net_pnl: 0,
      win_rate: 0,
      best_trade: null,
      worst_trade: null,
    };
  }

  let totalGross = 0;
  let totalFees = 0;
  let totalNet = 0;
  let winningCount = 0;
  let losingCount = 0;
  let breakevenCount = 0;

  let bestTrade: Trade | null = null;
  let worstTrade: Trade | null = null;

  for (const trade of trades) {
    const tradeFees = trade.fees ?? calculateTotalFees(trade.commission || 0, trade.swap || 0, trade.other_fees || 0);
    totalGross += trade.gross_pnl || 0;
    totalFees += tradeFees;
    totalNet += trade.net_pnl || 0;

    if (trade.net_pnl > 0) {
      winningCount++;
    } else if (trade.net_pnl < 0) {
      losingCount++;
    } else {
      breakevenCount++;
    }

    if (!bestTrade || trade.net_pnl > bestTrade.net_pnl) {
      bestTrade = trade;
    }
    if (!worstTrade || trade.net_pnl < worstTrade.net_pnl) {
      worstTrade = trade;
    }
  }

  const winRate = trades.length > 0 ? (winningCount / trades.length) * 100 : 0;

  return {
    trade_date: tradeDate,
    total_trades: trades.length,
    winning_trades: winningCount,
    losing_trades: losingCount,
    breakeven_trades: breakevenCount,
    gross_pnl: Math.round((totalGross + Number.EPSILON) * 100) / 100,
    total_fees: Math.round((totalFees + Number.EPSILON) * 100) / 100,
    net_pnl: Math.round((totalNet + Number.EPSILON) * 100) / 100,
    win_rate: Math.round((winRate + Number.EPSILON) * 10) / 10,
    best_trade: bestTrade,
    worst_trade: worstTrade,
  };
}

/**
 * Calculates Profit Factor.
 * Gross profits from winning trades / absolute gross losses from losing trades.
 */
export function calculateProfitFactor(trades: Trade[]): number {
  if (!trades || trades.length === 0) return 0;

  let totalWinGross = 0;
  let totalLossGross = 0;

  for (const t of trades) {
    if (t.net_pnl > 0) {
      totalWinGross += t.net_pnl;
    } else if (t.net_pnl < 0) {
      totalLossGross += Math.abs(t.net_pnl);
    }
  }

  if (totalLossGross === 0) {
    return totalWinGross > 0 ? Infinity : 0;
  }

  const pf = totalWinGross / totalLossGross;
  return Math.round((pf + Number.EPSILON) * 100) / 100;
}

/**
 * Aggregates trades into monthly summary data for a given month and year.
 */
export function calculateMonthlySummary(month: number, year: number, trades: Trade[]): MonthlySummaryData {
  const monthTrades = trades.filter((t) => {
    const [tYear, tMonth] = t.trade_date.split('-').map(Number);
    return tYear === year && tMonth === month + 1;
  });

  const tradingDaysSet = new Set(monthTrades.map((t) => t.trade_date));

  let grossPnl = 0;
  let totalFees = 0;
  let netPnl = 0;
  let wins = 0;
  let losses = 0;
  let breakevens = 0;

  for (const t of monthTrades) {
    const tradeFees = t.fees ?? calculateTotalFees(t.commission || 0, t.swap || 0, t.other_fees || 0);
    grossPnl += t.gross_pnl || 0;
    totalFees += tradeFees;
    netPnl += t.net_pnl || 0;
    if (t.net_pnl > 0) wins++;
    else if (t.net_pnl < 0) losses++;
    else breakevens++;
  }

  const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0;
  const profitFactor = calculateProfitFactor(monthTrades);

  return {
    month,
    year,
    total_trades: monthTrades.length,
    trading_days_count: tradingDaysSet.size,
    net_pnl: Math.round((netPnl + Number.EPSILON) * 100) / 100,
    gross_pnl: Math.round((grossPnl + Number.EPSILON) * 100) / 100,
    total_fees: Math.round((totalFees + Number.EPSILON) * 100) / 100,
    winning_trades: wins,
    losing_trades: losses,
    breakeven_trades: breakevens,
    win_rate: Math.round((winRate + Number.EPSILON) * 10) / 10,
    profit_factor: profitFactor,
  };
}

/**
 * Computes overall dashboard performance metrics from all saved trades.
 */
export function calculateOverallPerformance(
  trades: Trade[],
  currentDate: { month: number; year: number }
): OverallPerformanceSummary {
  if (!trades || trades.length === 0) {
    return {
      total_net_pnl: 0,
      total_gross_pnl: 0,
      total_fees: 0,
      total_closed_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      breakeven_trades: 0,
      win_rate: 0,
      profit_factor: 0,
      current_month_net_pnl: 0,
      previous_month_net_pnl: 0,
      trading_days_count: 0,
      best_trading_day: null,
      worst_trading_day: null,
      avg_daily_net_pnl: 0,
      avg_winning_trade: 0,
      avg_losing_trade: 0,
    };
  }

  let totalGross = 0;
  let totalFees = 0;
  let totalNet = 0;
  let wins = 0;
  let losses = 0;
  let breakevens = 0;

  let totalWinningPnl = 0;
  let totalLosingPnl = 0;

  const dailyPnLMap: Record<string, number> = {};

  for (const t of trades) {
    const tradeFees = t.fees ?? calculateTotalFees(t.commission || 0, t.swap || 0, t.other_fees || 0);
    totalGross += t.gross_pnl || 0;
    totalFees += tradeFees;
    totalNet += t.net_pnl || 0;

    dailyPnLMap[t.trade_date] = (dailyPnLMap[t.trade_date] || 0) + (t.net_pnl || 0);

    if (t.net_pnl > 0) {
      wins++;
      totalWinningPnl += t.net_pnl;
    } else if (t.net_pnl < 0) {
      losses++;
      totalLosingPnl += t.net_pnl;
    } else {
      breakevens++;
    }
  }

  const totalClosed = trades.length;
  const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;
  const profitFactor = calculateProfitFactor(trades);

  const tradingDaysCount = Object.keys(dailyPnLMap).length;

  let bestDay: { date: string; pnl: number } | null = null;
  let worstDay: { date: string; pnl: number } | null = null;

  for (const [date, pnl] of Object.entries(dailyPnLMap)) {
    if (!bestDay || pnl > bestDay.pnl) {
      bestDay = { date, pnl };
    }
    if (!worstDay || pnl < worstDay.pnl) {
      worstDay = { date, pnl };
    }
  }

  const avgDailyNetPnl = tradingDaysCount > 0 ? totalNet / tradingDaysCount : 0;
  const avgWinningTrade = wins > 0 ? totalWinningPnl / wins : 0;
  const avgLosingTrade = losses > 0 ? totalLosingPnl / losses : 0;

  const currMonth = currentDate.month;
  const currYear = currentDate.year;

  const prevMonth = currMonth === 0 ? 11 : currMonth - 1;
  const prevYear = currMonth === 0 ? currYear - 1 : currYear;

  const currMonthSummary = calculateMonthlySummary(currMonth, currYear, trades);
  const prevMonthSummary = calculateMonthlySummary(prevMonth, prevYear, trades);

  return {
    total_net_pnl: Math.round((totalNet + Number.EPSILON) * 100) / 100,
    total_gross_pnl: Math.round((totalGross + Number.EPSILON) * 100) / 100,
    total_fees: Math.round((totalFees + Number.EPSILON) * 100) / 100,
    total_closed_trades: totalClosed,
    winning_trades: wins,
    losing_trades: losses,
    breakeven_trades: breakevens,
    win_rate: Math.round((winRate + Number.EPSILON) * 10) / 10,
    profit_factor: profitFactor,
    current_month_net_pnl: currMonthSummary.net_pnl,
    previous_month_net_pnl: prevMonthSummary.net_pnl,
    trading_days_count: tradingDaysCount,
    best_trading_day: bestDay,
    worst_trading_day: worstDay,
    avg_daily_net_pnl: Math.round((avgDailyNetPnl + Number.EPSILON) * 100) / 100,
    avg_winning_trade: Math.round((avgWinningTrade + Number.EPSILON) * 100) / 100,
    avg_losing_trade: Math.round((avgLosingTrade + Number.EPSILON) * 100) / 100,
  };
}
