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
  preferredCurrency = 'INR',
}) => {
  const hasTrades = (dailySummary?.total_trades || 0) > 0;
  const netPnl = dailySummary?.net_pnl ?? 0;
  const isPositive = netPnl > 0;
  const isNegative = netPnl < 0;
  const isBreakeven = hasTrades && netPnl === 0;

  // Visual card styles
  let stateStyles = 'bg-[#111827] border-slate-800/80 hover:border-slate-700';

  if (!cell.isCurrentMonth) {
    stateStyles = 'bg-[#0B0F19]/40 border-slate-900/60 opacity-40 hover:opacity-70';
  } else if (hasTrades) {
    if (isPositive) {
      stateStyles = 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/80 shadow-sm shadow-emerald-900/10';
    } else if (isNegative) {
      stateStyles = 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/80 shadow-sm shadow-rose-900/10';
    } else if (isBreakeven) {
      stateStyles = 'bg-slate-900 border-slate-700 hover:border-slate-600';
    }
  }

  return (
    <button
      onClick={() => onClickDate(cell.dateString)}
      className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between group relative overflow-hidden ${stateStyles}`}
    >
      {/* Today Highlight Indicator */}
      {cell.isToday && (
        <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
      )}

      {/* Day Header */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-xs sm:text-sm font-semibold rounded-md px-1.5 py-0.5 ${
            cell.isToday
              ? 'bg-indigo-600 text-white font-bold'
              : cell.isCurrentMonth
              ? 'text-slate-200'
              : 'text-slate-500'
          }`}
        >
          {cell.dayNumber}
        </span>

        {hasTrades && (
          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 font-medium border border-slate-700/50">
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
                  ? 'text-emerald-400'
                  : isNegative
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {formatCurrency(netPnl, preferredCurrency, true)}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500/60 block font-normal group-hover:text-slate-400 transition-colors">
            No trades
          </span>
        )}
      </div>
    </button>
  );
};
