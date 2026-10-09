/**
 * Centralized Indian Rupee (INR ₹) currency formatting utility.
 */

export const SUPPORTED_CURRENCIES: Record<string, { symbol: string; code: string; name: string }> = {
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
};

export function formatCurrency(
  amount: number | null | undefined,
  _currencyCode: string = 'INR',
  showSign: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }

  const absoluteVal = Math.abs(amount);
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absoluteVal);

  let sign = '';
  if (amount > 0) {
    sign = showSign ? '+' : '';
  } else if (amount < 0) {
    sign = '-';
  }

  return `${sign}₹${formattedNumber}`;
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
