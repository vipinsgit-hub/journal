export const DEFAULT_FOREX_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'USD/CHF',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'XAU/USD',
];

export const DEFAULT_STRATEGIES = [
  'Breakout',
  'Trend Following',
  'Pullback',
  'Liquidity Sweep',
  'ICT',
  'SMC',
  'Range Reversal',
];

/**
 * Normalizes a currency pair or symbol input.
 * Converts 'eur/usd' -> 'EUR/USD', 'gbp/jpy' -> 'GBP/JPY', 'eurusd' -> 'EUR/USD'.
 */
export function normalizeSymbol(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (!trimmed) return '';
  if (!trimmed.includes('/') && trimmed.length === 6 && /^[A-Z]{6}$/.test(trimmed)) {
    return `${trimmed.slice(0, 3)}/${trimmed.slice(3)}`;
  }
  return trimmed;
}

/**
 * Normalizes a strategy name by trimming leading and trailing whitespace.
 */
export function normalizeStrategy(raw: string): string {
  if (!raw) return '';
  return raw.trim();
}

/**
 * Checks if a symbol already exists in the list (case-insensitive and normalized).
 */
export function isDuplicateSymbol(symbol: string, existingList: string[]): boolean {
  const norm = normalizeSymbol(symbol);
  if (!norm) return false;
  return existingList.some((item) => normalizeSymbol(item) === norm);
}

/**
 * Checks if a strategy already exists in the list (case-insensitive, trimmed).
 */
export function isDuplicateStrategy(strategy: string, existingList: string[]): boolean {
  const norm = normalizeStrategy(strategy).toLowerCase();
  if (!norm) return false;
  return existingList.some((item) => normalizeStrategy(item).toLowerCase() === norm);
}
