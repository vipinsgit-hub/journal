import React from 'react';
import type { CalendarCellDate } from '../../lib/dates';
import type { DailySummaryData } from '../../types/trade';
import { formatCurrency } from '../../lib/currency';

interface CalendarDayProps {
  cell: CalendarCellDate;
  dailySummary?: DailySummaryData;
  onClickDate: (dateString: string) => void;
  preferredCurrency?: string;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  cell,
  dailySummary,
  onClickDate,
  preferredCurrency = 'USD',
}) => {
  const hasTrades = (dailySummary?.total_trades || 0) > 0;
  const netPnl = dailySummary?.net_pnl ?? 0;
  const isPositive = netPnl > 0;
  const isNegative = netPnl < 0;
  const isBreakeven = hasTrades && netPnl === 0;

  // Visual card styles for premium black terminal theme
  let stateStyles = 'bg-[#12151A] border-[#272C35] hover:border-white/30';

  if (!cell.isCurrentMonth) {
    stateStyles = 'bg-[#08090B]/50 border-[#181C23] opacity-40 hover:opacity-75';
  } else if (hasTrades) {
    if (isPositive) {
      stateStyles = 'bg-[#20C997]/10 border-[#20C997]/40 hover:border-[#20C997]/80 shadow-sm shadow-[#20C997]/5';
    } else if (isNegative) {
      stateStyles = 'bg-[#FF647C]/10 border-[#FF647C]/40 hover:border-[#FF647C]/80 shadow-sm shadow-[#FF647C]/5';
    } else if (isBreakeven) {
      stateStyles = 'bg-[#181C23] border-[#272C35] hover:border-white/30';
    }
  }

  return (
    <button
      onClick={() => onClickDate(cell.dateString)}
      className={`min-h-[90px] sm:min-h-[110px] p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between group relative overflow-hidden ${stateStyles}`}
    >
      {/* Today Highlight Indicator */}
      {cell.isToday && (
        <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-full bg-white shadow-sm shadow-white/50" />
      )}

      {/* Day Header */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-xs sm:text-sm font-semibold rounded-lg px-2 py-0.5 ${
            cell.isToday
              ? 'bg-white text-black font-bold'
              : cell.isCurrentMonth
              ? 'text-[#F4F5F7]'
              : 'text-[#969EAB]'
          }`}
        >
          {cell.dayNumber}
        </span>

        {hasTrades && (
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-[#181C23] text-[#969EAB] font-medium border border-[#272C35]">
            {dailySummary?.total_trades} {dailySummary?.total_trades === 1 ? 'trade' : 'trades'}
          </span>
        )}
      </div>

      {/* Day P&L Content */}
      <div className="mt-2">
        {hasTrades ? (
          <div>
            <span
              className={`text-xs sm:text-sm font-bold block tracking-tight ${
                isPositive
                  ? 'text-[#20C997]'
                  : isNegative
                  ? 'text-[#FF647C]'
                  : 'text-[#F4F5F7]'
              }`}
            >
              {formatCurrency(netPnl, preferredCurrency, true)}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[#969EAB]/50 block font-normal group-hover:text-[#969EAB] transition-colors">
            No trades
          </span>
        )}
      </div>
    </button>
  );
};
