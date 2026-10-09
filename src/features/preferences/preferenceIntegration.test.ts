import { describe, it, expect, beforeEach, vi } from 'vitest';

// Polyfill localStorage for Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    length: 0,
    key: (index: number) => Array.from(store.keys())[index] || null,
  };
}

// Mock lib/supabase so unit tests run deterministically in isolated local mode
vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

import { profileService } from '../profiles/profileService';
import { tradeService } from '../trades/tradeService';
import {
  DEFAULT_FOREX_PAIRS,
  DEFAULT_STRATEGIES,
  normalizeSymbol,
  isDuplicateSymbol,
  isDuplicateStrategy,
} from './preferenceUtils';

const USER_1 = '11111111-1111-4111-8111-111111111111';
const USER_2 = '22222222-2222-4222-8222-222222222222';
const USER_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const USER_HIST = '99999999-9999-4999-8999-999999999999';

describe('Preference Integration & End-to-End Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Forex Pair Preferences', () => {
    it('1. loads default pairs when no custom preferences are set', async () => {
      const profile = await profileService.getProfile(USER_1);
      expect(profile).not.toBeNull();
      expect(profile?.forex_pairs).toEqual(DEFAULT_FOREX_PAIRS);
    });

    it('2. allows adding new custom pair and persisting it', async () => {
      const initial = await profileService.getProfile(USER_2);
      const updatedPairs = [...(initial?.forex_pairs || DEFAULT_FOREX_PAIRS), 'BTC/USD'];

      const updated = await profileService.updateProfile(USER_2, {
        forex_pairs: updatedPairs,
      });

      expect(updated.forex_pairs).toContain('BTC/USD');

      const reloaded = await profileService.getProfile(USER_2);
      expect(reloaded?.forex_pairs).toContain('BTC/USD');
    });

    it('3. removes pairs without affecting defaults of other users', async () => {
      const userAPairs = DEFAULT_FOREX_PAIRS.filter((p) => p !== 'EUR/USD');
      await profileService.updateProfile(USER_A, { forex_pairs: userAPairs });

      const profileA = await profileService.getProfile(USER_A);
      const profileB = await profileService.getProfile(USER_B);

      expect(profileA?.forex_pairs).not.toContain('EUR/USD');
      expect(profileB?.forex_pairs).toContain('EUR/USD');
    });

    it('4. normalizes symbols cleanly (e.g. eurusd -> EUR/USD)', () => {
      expect(normalizeSymbol('eurusd')).toBe('EUR/USD');
      expect(normalizeSymbol('gbpjpy')).toBe('GBP/JPY');
      expect(normalizeSymbol('xau/usd')).toBe('XAU/USD');
    });

    it('5. prevents duplicate symbol insertion', () => {
      const current = ['EUR/USD', 'GBP/USD'];
      expect(isDuplicateSymbol('eur/usd', current)).toBe(true);
      expect(isDuplicateSymbol('EURUSD', current)).toBe(true);
      expect(isDuplicateSymbol('USD/JPY', current)).toBe(false);
    });
  });

  describe('Trading Strategy Preferences', () => {
    it('1. loads default strategies when no custom strategies are set', async () => {
      const profile = await profileService.getProfile(USER_1);
      expect(profile?.strategies).toEqual(DEFAULT_STRATEGIES);
    });

    it('2. adds and renames custom strategies', async () => {
      const updatedStrats = ['Custom Liquidity Sweep', 'Asian Session Breakout'];
      const updated = await profileService.updateProfile(USER_2, {
        strategies: updatedStrats,
      });

      expect(updated.strategies).toEqual(updatedStrats);
    });

    it('3. prevents duplicate strategies case-insensitively', () => {
      const current = ['Breakout', 'ICT / SMC'];
      expect(isDuplicateStrategy('breakout', current)).toBe(true);
      expect(isDuplicateStrategy('  BREAKOUT  ', current)).toBe(true);
      expect(isDuplicateStrategy('Pullback', current)).toBe(false);
    });
  });

  describe('User Isolation & Data Persistence', () => {
    it('1. isolates user A preferences from user B preferences', async () => {
      await profileService.updateProfile(USER_A, {
        display_name: 'Trader Alpha',
        forex_pairs: ['EUR/USD', 'GBP/USD'],
        strategies: ['Alpha Breakout'],
      });

      await profileService.updateProfile(USER_B, {
        display_name: 'Trader Beta',
        forex_pairs: ['USD/JPY', 'XAU/USD'],
        strategies: ['Beta Trend'],
      });

      const alpha = await profileService.getProfile(USER_A);
      const beta = await profileService.getProfile(USER_B);

      expect(alpha?.forex_pairs).toEqual(['EUR/USD', 'GBP/USD']);
      expect(beta?.forex_pairs).toEqual(['USD/JPY', 'XAU/USD']);
      expect(alpha?.strategies).toEqual(['Alpha Breakout']);
      expect(beta?.strategies).toEqual(['Beta Trend']);
    });

    it('2. preserves historical trade pair and strategy when omitted from active preferences', async () => {
      // Historical trade created with 'NZD/CAD' and 'Legacy Pattern'
      const demoTrade = await tradeService.createTrade(USER_HIST, {
        trade_date: '2026-10-01',
        instrument: 'NZD/CAD',
        market: 'Forex Minor',
        direction: 'Long',
        entry_price: 0.8100,
        exit_price: 0.8150,
        quantity: 1.0,
        lot_size: 1.0,
        contract_size: 100000,
        gross_pnl: 500,
        commission: 7,
        swap: 0,
        other_fees: 0,
        fees: 7,
        net_pnl: 493,
        strategy: 'Legacy Pattern',
      });

      expect(demoTrade.instrument).toBe('NZD/CAD');
      expect(demoTrade.strategy).toBe('Legacy Pattern');

      // User preferences updated without 'NZD/CAD'
      await profileService.updateProfile(USER_HIST, {
        forex_pairs: ['EUR/USD', 'GBP/USD'],
        strategies: ['Breakout'],
      });

      const userProfile = await profileService.getProfile(USER_HIST);
      expect(userProfile?.forex_pairs).not.toContain('NZD/CAD');

      // Helper logic for AddTradeModal available options
      const activePairs = userProfile?.forex_pairs || [];
      const formPairOptions = activePairs.includes(demoTrade.instrument)
        ? activePairs
        : [demoTrade.instrument, ...activePairs];

      expect(formPairOptions).toContain('NZD/CAD');
    });
  });
});
