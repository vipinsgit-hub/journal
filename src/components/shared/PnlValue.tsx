import React from 'react';
import { formatPnl } from '../../lib/currency';

interface PnlValueProps {
  value: number | null | undefined;
  currency?: string;
  showSign?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const PnlValue: React.FC<PnlValueProps> = ({
  value,
  currency = 'USD',
  className = '',
  size = 'md',
}) => {
  const pnl = formatPnl(value, currency);

  let colorClass = 'text-[#969EAB]';
  if (pnl.isPositive) {
    colorClass = 'text-[#20C997]';
  } else if (pnl.isNegative) {
    colorClass = 'text-[#FF647C]';
  }

  let sizeClass = 'text-sm font-semibold';
  if (size === 'sm') sizeClass = 'text-xs font-medium';
  if (size === 'lg') sizeClass = 'text-base font-bold';
  if (size === 'xl') sizeClass = 'text-xl font-bold';
  if (size === '2xl') sizeClass = 'text-2xl font-extrabold';

  return (
    <span className={`inline-flex items-center tracking-tight ${colorClass} ${sizeClass} ${className}`}>
      {pnl.text}
    </span>
  );
};
