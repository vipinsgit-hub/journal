import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getMonthName } from '../../lib/dates';
import type { MonthlySummaryData } from '../../types/trade';
import { PnlValue } from '../shared/PnlValue';

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  monthlySummary: MonthlySummaryData;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  preferredCurrency?: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  currentYear,
  monthlySummary,
  onPrevMonth,
  onNextMonth,
  onToday,
  preferredCurrency = 'USD',
}) => {
  return (
    <div className="bg-[#12151A] border border-[#272C35] rounded-2xl p-3.5 sm:p-6 mb-4 sm:mb-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
      {/* Left Navigation controls */}
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
        <div className="flex items-center gap-1 bg-[#0D0F12] border border-[#272C35] rounded-xl p-1 shrink-0">
          <button
            onClick={onPrevMonth}
            className="p-2 sm:p-1.5 rounded-lg text-[#969EAB] hover:text-[#F4F5F7] active:bg-[#181C23] hover:bg-[#181C23] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-[#181C23] active:bg-[#181C23] transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 sm:p-1.5 rounded-lg text-[#969EAB] hover:text-[#F4F5F7] active:bg-[#181C23] hover:bg-[#181C23] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Next Month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold text-[#F4F5F7] tracking-tight flex items-center gap-2 truncate">
          <CalendarIcon size={20} className="text-white shrink-0 hidden sm:inline-block" />
          <span>{getMonthName(currentMonth)} {currentYear}</span>
        </h2>
      </div>

      {/* Right Metrics Cards */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4 bg-[#0D0F12] border border-[#272C35] p-2 sm:p-3 rounded-xl">
        <div className="px-1.5 sm:px-3 py-1 text-center sm:text-left border-r border-[#272C35]">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#969EAB] block uppercase tracking-wider truncate">
            Monthly P&L
          </span>
          <PnlValue value={monthlySummary.net_pnl} currency={preferredCurrency} size="md" className="sm:text-lg text-xs" />
        </div>

        <div className="px-1.5 sm:px-3 py-1 text-center sm:text-left border-r border-[#272C35]">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#969EAB] block uppercase tracking-wider truncate">
            Days
          </span>
          <span className="text-sm sm:text-lg font-bold text-[#F4F5F7]">
            {monthlySummary.trading_days_count}
          </span>
        </div>

        <div className="px-1.5 sm:px-3 py-1 text-center sm:text-left">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#969EAB] block uppercase tracking-wider truncate">
            Trades
          </span>
          <span className="text-sm sm:text-lg font-bold text-[#F4F5F7]">
            {monthlySummary.total_trades}
          </span>
        </div>
      </div>
    </div>
  );
};
