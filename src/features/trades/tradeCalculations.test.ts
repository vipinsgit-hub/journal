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
import { formatCurrency, formatPnl } from '../../lib/currency';
import type { Trade } from '../../types/trade';

describe('Forex Financial & Calculation Suite', () => {
  it('identifies correct pip sizes for Forex, JPY, Gold, Silver, Crypto, and Indices', () => {
    expect(getPipSize('EUR/USD').pipSize).toBe(0.0001);
    expect(getPipSize('GBPUSD').pipSize).toBe(0.0001);
    expect(getPipSize('USD/JPY').pipSize).toBe(0.01);
    expect(getPipSize('EURJPY').pipSize).toBe(0.01);
    expect(getPipSize('XAUUSD').pipSize).toBe(0.10);
    expect(getPipSize('GOLD').pipSize).toBe(0.10);
    expect(getPipSize('XAGUSD').pipSize).toBe(0.01);
    expect(getPipSize('BTCUSD').pipSize).toBe(1.0);
    expect(getPipSize('US30').pipSize).toBe(1.0);
    expect(getPipSize('NAS100').pipSize).toBe(1.0);
    expect(getPipSize('CUSTOM123').isKnown).toBe(false);
  });

  it('calculates pips accurately for Long Winning Trade', () => {
    // Buy EUR/USD from 1.08500 to 1.09000 = +50.0 pips
    const pips = calculatePips('Long', 1.0850, 1.0900, 0.0001);
    expect(pips).toBe(50.0);
  });

  it('calculates pips accurately for Long Losing Trade', () => {
    // Buy EUR/USD from 1.09000 to 1.08500 = -50.0 pips
    const pips = calculatePips('Long', 1.0900, 1.0850, 0.0001);
    expect(pips).toBe(-50.0);
  });

  it('calculates pips accurately for Short Winning Trade', () => {
    // Sell USD/JPY from 155.50 to 154.50 = +100.0 pips
    const pips = calculatePips('Short', 155.50, 154.50, 0.01);
    expect(pips).toBe(100.0);
  });

  it('calculates pips accurately for Short Losing Trade', () => {
    // Sell EUR/USD from 1.0850 to 1.0900 = -50.0 pips
    const pips = calculatePips('Short', 1.0850, 1.0900, 0.0001);
    expect(pips).toBe(-50.0);
  });

  it('handles missing entry or exit price, equal prices, and invalid numeric inputs', () => {
    expect(calculatePips('Long', 0, 1.0900, 0.0001)).toBe(0);
    expect(calculatePips('Long', 1.0850, 0, 0.0001)).toBe(0);
    expect(calculatePips('Long', 1.0850, 1.0850, 0.0001)).toBe(0);
    expect(calculatePips('Long', -1, 1.0900, 0.0001)).toBe(0);
  });

  it('calculates total fees combining commission, swap, and other fees', () => {
    expect(calculateTotalFees(7, 2.5, 0, 0)).toBe(9.5);
    expect(calculateTotalFees(10, -1.5, 2, 0)).toBe(10.5);
  });

  it('calculates net PnL from gross PnL and total fees', () => {
    expect(calculateNetPnl(500, 9.5)).toBe(490.5);
    expect(calculateNetPnl(-250, 10)).toBe(-260);
  });

  it('formats currency consistently in USD ($)', () => {
    expect(formatCurrency(125.5)).toBe('$125.50');
    expect(formatCurrency(125.5, 'USD', true)).toBe('+$125.50');
    expect(formatCurrency(-25)).toBe('-$25.00');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(null)).toBe('$0.00');
    expect(formatCurrency(undefined)).toBe('$0.00');

    const pnlPos = formatPnl(100);
    expect(pnlPos.text).toBe('+$100.00');
    expect(pnlPos.isPositive).toBe(true);

    const pnlNeg = formatPnl(-50);
    expect(pnlNeg.text).toBe('-$50.00');
    expect(pnlNeg.isNegative).toBe(true);
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
        instrument: 'EURUSD',
        market: 'Forex Major',
        direction: 'Long',
        entry_price: 1.0850,
        exit_price: 1.0900,
        quantity: 1.0,
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
        instrument: 'USDJPY',
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
    expect(daily.best_trade?.instrument).toBe('EURUSD');
  });
});
