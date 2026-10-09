import { describe, it, expect } from 'vitest';
import {
  calculateNetPnl,
  calculateDailySummary,
  calculateProfitFactor,
  calculateMonthlySummary,
  calculateOverallPerformance,
} from './tradeCalculations';
import type { Trade } from '../../types/trade';

describe('tradeCalculations', () => {
  it('correctly calculates net PnL from gross PnL and fees', () => {
    expect(calculateNetPnl(2500, 50)).toBe(2450);
    expect(calculateNetPnl(-800, 20)).toBe(-820);
    expect(calculateNetPnl(0, 15)).toBe(-15);
  });

  it('handles zero trades safely without division by zero or errors', () => {
    const daily = calculateDailySummary('2026-10-09', []);
    expect(daily.total_trades).toBe(0);
    expect(daily.win_rate).toBe(0);
    expect(daily.best_trade).toBeNull();
    expect(daily.worst_trade).toBeNull();

    expect(calculateProfitFactor([])).toBe(0);

    const monthly = calculateMonthlySummary(9, 2026, []);
    expect(monthly.total_trades).toBe(0);
    expect(monthly.win_rate).toBe(0);
    expect(monthly.profit_factor).toBe(0);

    const overall = calculateOverallPerformance([], { month: 9, year: 2026 });
    expect(overall.total_closed_trades).toBe(0);
    expect(overall.avg_daily_net_pnl).toBe(0);
    expect(overall.best_trading_day).toBeNull();
  });

  it('correctly classifies winning, losing, and breakeven trades in daily summary', () => {
    const dummyTrades: Trade[] = [
      {
        id: '1',
        user_id: 'u1',
        trade_date: '2026-10-09',
        instrument: 'NIFTY',
        market: 'Options',
        direction: 'Long',
        entry_price: 100,
        exit_price: 150,
        quantity: 50,
        gross_pnl: 2500,
        fees: 50,
        net_pnl: 2450,
      },
      {
        id: '2',
        user_id: 'u1',
        trade_date: '2026-10-09',
        instrument: 'BANKNIFTY',
        market: 'Options',
        direction: 'Short',
        entry_price: 300,
        exit_price: 310,
        quantity: 25,
        gross_pnl: -800,
        fees: 20,
        net_pnl: -820,
      },
      {
        id: '3',
        user_id: 'u1',
        trade_date: '2026-10-09',
        instrument: 'RELIANCE',
        market: 'Equity',
        direction: 'Long',
        entry_price: 2500,
        exit_price: 2500,
        quantity: 10,
        gross_pnl: 0,
        fees: 0,
        net_pnl: 0,
      },
    ];

    const daily = calculateDailySummary('2026-10-09', dummyTrades);
    expect(daily.total_trades).toBe(3);
    expect(daily.winning_trades).toBe(1);
    expect(daily.losing_trades).toBe(1);
    expect(daily.breakeven_trades).toBe(1);
    expect(daily.net_pnl).toBe(1630); // 2450 - 820 + 0
    expect(daily.win_rate).toBeCloseTo(33.3, 1);
    expect(daily.best_trade?.id).toBe('1');
    expect(daily.worst_trade?.id).toBe('2');
  });

  it('calculates profit factor correctly including no-loss Infinity edge case', () => {
    const onlyWins: Trade[] = [
      {
        id: '1',
        user_id: 'u1',
        trade_date: '2026-10-09',
        instrument: 'NIFTY',
        market: 'Options',
        direction: 'Long',
        entry_price: 100,
        exit_price: 120,
        quantity: 50,
        gross_pnl: 1000,
        fees: 0,
        net_pnl: 1000,
      },
    ];
    expect(calculateProfitFactor(onlyWins)).toBe(Infinity);

    const winAndLoss: Trade[] = [
      ...onlyWins,
      {
        id: '2',
        user_id: 'u1',
        trade_date: '2026-10-09',
        instrument: 'NIFTY',
        market: 'Options',
        direction: 'Short',
        entry_price: 100,
        exit_price: 110,
        quantity: 50,
        gross_pnl: -500,
        fees: 0,
        net_pnl: -500,
      },
    ];
    expect(calculateProfitFactor(winAndLoss)).toBe(2.0); // 1000 / 500 = 2.0
  });

  it('aggregates overall performance and identifies best/worst trading days correctly', () => {
    const trades: Trade[] = [
      {
        id: '1',
        user_id: 'u1',
        trade_date: '2026-10-01',
        instrument: 'NIFTY',
        market: 'Options',
        direction: 'Long',
        entry_price: 100,
        exit_price: 150,
        quantity: 50,
        gross_pnl: 2500,
        fees: 50,
        net_pnl: 2450,
      },
      {
        id: '2',
        user_id: 'u1',
        trade_date: '2026-10-02',
        instrument: 'BANKNIFTY',
        market: 'Options',
        direction: 'Short',
        entry_price: 300,
        exit_price: 350,
        quantity: 25,
        gross_pnl: -1250,
        fees: 50,
        net_pnl: -1300,
      },
    ];

    const perf = calculateOverallPerformance(trades, { month: 9, year: 2026 });
    expect(perf.total_closed_trades).toBe(2);
    expect(perf.trading_days_count).toBe(2);
    expect(perf.total_net_pnl).toBe(1150); // 2450 - 1300
    expect(perf.best_trading_day?.date).toBe('2026-10-01');
    expect(perf.best_trading_day?.pnl).toBe(2450);
    expect(perf.worst_trading_day?.date).toBe('2026-10-02');
    expect(perf.worst_trading_day?.pnl).toBe(-1300);
    expect(perf.avg_daily_net_pnl).toBe(575); // 1150 / 2
  });
});
