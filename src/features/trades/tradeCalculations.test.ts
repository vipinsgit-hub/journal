import { describe, it, expect } from 'vitest';
import {
  calculateNetPnl,
  calculateDailySummary,
  calculateProfitFactor,
  calculateMonthlySummary,
  calculateOverallPerformance,
  getPipSize,
  calculatePips,
  calculateTotalFees,
} from './tradeCalculations';
import type { Trade } from '../../types/trade';

describe('tradeCalculations Forex tests', () => {
  it('identifies correct pip sizes for Forex, Gold, Silver, JPY pairs, and Crypto', () => {
    expect(getPipSize('EUR/USD')).toBe(0.0001);
    expect(getPipSize('GBP/USD')).toBe(0.0001);
    expect(getPipSize('USD/JPY')).toBe(0.01);
    expect(getPipSize('EUR/JPY')).toBe(0.01);
    expect(getPipSize('XAU/USD')).toBe(0.10);
    expect(getPipSize('GOLD')).toBe(0.10);
    expect(getPipSize('XAG/USD')).toBe(0.01);
    expect(getPipSize('BTC/USD')).toBe(1.0);
  });

  it('calculates pips accurately for Buy and Sell directions', () => {
    // Buy EUR/USD from 1.08500 to 1.09000 = +50.0 pips
    expect(calculatePips('Long', 1.0850, 1.0900, 0.0001)).toBe(50.0);
    // Sell USD/JPY from 155.50 to 154.50 = +100.0 pips
    expect(calculatePips('Short', 155.50, 154.50, 0.01)).toBe(100.0);
    // Sell EUR/USD from 1.0850 to 1.0900 (sl hit) = -50.0 pips
    expect(calculatePips('Short', 1.0850, 1.0900, 0.0001)).toBe(-50.0);
  });

  it('calculates total fees combining commission, swap, and other fees', () => {
    expect(calculateTotalFees(7, 2.5, 0, 0)).toBe(9.5);
    expect(calculateTotalFees(10, -1.5, 2, 0)).toBe(10.5);
  });

  it('calculates net PnL from gross PnL and total fees', () => {
    expect(calculateNetPnl(500, 9.5)).toBe(490.5);
    expect(calculateNetPnl(-250, 10)).toBe(-260);
  });

  it('handles zero trades safely without division by zero or errors', () => {
    const daily = calculateDailySummary('2026-10-10', []);
    expect(daily.total_trades).toBe(0);
    expect(daily.win_rate).toBe(0);
    expect(daily.best_trade).toBeNull();
    expect(daily.worst_trade).toBeNull();

    expect(calculateProfitFactor([])).toBe(0);

    const monthly = calculateMonthlySummary(9, 2026, []);
    expect(monthly.total_trades).toBe(0);

    const overall = calculateOverallPerformance([], { month: 9, year: 2026 });
    expect(overall.total_closed_trades).toBe(0);
  });

  it('aggregates Forex trades with commission and swap correctly', () => {
    const trades: Trade[] = [
      {
        id: '1',
        user_id: 'u1',
        trade_date: '2026-10-10',
        instrument: 'EUR/USD',
        market: 'Forex Major',
        direction: 'Long',
        entry_price: 1.0850,
        exit_price: 1.0900,
        quantity: 1.0, // 1 Lot
        gross_pnl: 500,
        commission: 7,
        swap: 2,
        other_fees: 0,
        fees: 9,
        net_pnl: 491,
        pips: 50,
      },
      {
        id: '2',
        user_id: 'u1',
        trade_date: '2026-10-10',
        instrument: 'USD/JPY',
        market: 'Forex Major',
        direction: 'Short',
        entry_price: 155.00,
        exit_price: 155.50,
        quantity: 0.5,
        gross_pnl: -250,
        commission: 3.5,
        swap: 0,
        other_fees: 0,
        fees: 3.5,
        net_pnl: -253.5,
        pips: -50,
      },
    ];

    const daily = calculateDailySummary('2026-10-10', trades);
    expect(daily.total_trades).toBe(2);
    expect(daily.winning_trades).toBe(1);
    expect(daily.losing_trades).toBe(1);
    expect(daily.net_pnl).toBe(237.5);
    expect(daily.best_trade?.instrument).toBe('EUR/USD');
  });
});
