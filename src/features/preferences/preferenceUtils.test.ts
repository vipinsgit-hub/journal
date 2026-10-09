import { describe, it, expect } from 'vitest';
import {
  normalizeSymbol,
  normalizeStrategy,
  isDuplicateSymbol,
  isDuplicateStrategy,
  DEFAULT_FOREX_PAIRS,
  DEFAULT_STRATEGIES,
} from './preferenceUtils';

describe('preferenceUtils', () => {
  describe('normalizeSymbol', () => {
    it('normalizes lowercase pairs to uppercase', () => {
      expect(normalizeSymbol('eur/usd')).toBe('EUR/USD');
      expect(normalizeSymbol('gbp/jpy')).toBe('GBP/JPY');
    });

    it('inserts slash for 6-letter currency codes without slash', () => {
      expect(normalizeSymbol('eurusd')).toBe('EUR/USD');
      expect(normalizeSymbol('USDJPY')).toBe('USD/JPY');
    });

    it('preserves slash for custom symbols like XAU/USD or BTC/USD', () => {
      expect(normalizeSymbol('xau/usd')).toBe('XAU/USD');
      expect(normalizeSymbol('btc/usd')).toBe('BTC/USD');
    });

    it('trims whitespace', () => {
      expect(normalizeSymbol('  AUD/USD  ')).toBe('AUD/USD');
    });

    it('handles empty input', () => {
      expect(normalizeSymbol('')).toBe('');
      expect(normalizeSymbol('   ')).toBe('');
    });
  });

  describe('normalizeStrategy', () => {
    it('trims whitespace', () => {
      expect(normalizeStrategy('  Breakout  ')).toBe('Breakout');
    });

    it('handles empty input', () => {
      expect(normalizeStrategy('')).toBe('');
    });
  });

  describe('isDuplicateSymbol', () => {
    it('detects duplicate symbols case-insensitively', () => {
      const list = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
      expect(isDuplicateSymbol('eur/usd', list)).toBe(true);
      expect(isDuplicateSymbol('EURUSD', list)).toBe(true);
      expect(isDuplicateSymbol('AUD/USD', list)).toBe(false);
    });
  });

  describe('isDuplicateStrategy', () => {
    it('detects duplicate strategies case-insensitively', () => {
      const list = ['Breakout', 'Trend Following', 'Pullback'];
      expect(isDuplicateStrategy('breakout', list)).toBe(true);
      expect(isDuplicateStrategy('BREAKOUT', list)).toBe(true);
      expect(isDuplicateStrategy('Scalping', list)).toBe(false);
    });
  });

  describe('Defaults', () => {
    it('has non-empty default Forex pairs and strategies', () => {
      expect(DEFAULT_FOREX_PAIRS.length).toBeGreaterThan(5);
      expect(DEFAULT_FOREX_PAIRS).toContain('EUR/USD');
      expect(DEFAULT_STRATEGIES.length).toBeGreaterThan(5);
      expect(DEFAULT_STRATEGIES).toContain('Breakout');
    });
  });
});
