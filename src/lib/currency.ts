/**
 * Centralized currency formatting utility.
 */

export const SUPPORTED_CURRENCIES: Record<string, { symbol: string; code: string; name: string }> = {
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound' },
};

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = 'INR',
  showSign: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  let sign = '';
  if (amount > 0) {
    sign = showSign ? '+' : '';
  } else if (amount < 0) {
    sign = '-';
  }

  return `${sign}${currency.symbol}${formattedNumber}`;
}

export function formatPnl(
  amount: number | null | undefined,
  currencyCode: string = 'INR'
): { text: string; isPositive: boolean; isNegative: boolean; isZero: boolean } {
  const val = amount ?? 0;
  const isPositive = val > 0;
  const isNegative = val < 0;
  const isZero = val === 0;

  const formatted = formatCurrency(val, currencyCode, true);
  return {
    text: formatted,
    isPositive,
    isNegative,
    isZero,
  };
}
