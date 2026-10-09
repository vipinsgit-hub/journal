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
  preferredCurrency = 'INR',
}) => {
  return (
    <div className="bg-[#12151A] border border-[#272C35] rounded-2xl p-4 sm:p-6 mb-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left Navigation controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[#0D0F12] border border-[#272C35] rounded-xl p-1">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23] transition-colors"
            title="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-[#8170FF] hover:text-[#6C56FF] hover:bg-[#181C23] transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23] transition-colors"
            title="Next Month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#F4F5F7] tracking-tight flex items-center gap-2">
          <CalendarIcon size={22} className="text-[#8170FF]" />
          <span>{getMonthName(currentMonth)} {currentYear}</span>
        </h2>
      </div>

      {/* Right Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-[#0D0F12] border border-[#272C35] p-2.5 sm:p-3 rounded-xl">
        <div className="px-2 sm:px-3 py-1 text-center sm:text-left border-r border-[#272C35]">
          <span className="text-[11px] font-medium text-[#969EAB] block uppercase tracking-wider">
            Monthly P&L
          </span>
          <PnlValue value={monthlySummary.net_pnl} currency={preferredCurrency} size="lg" />
        </div>

        <div className="px-2 sm:px-3 py-1 text-center sm:text-left border-r border-[#272C35]">
          <span className="text-[11px] font-medium text-[#969EAB] block uppercase tracking-wider">
            Trading Days
          </span>
          <span className="text-base sm:text-lg font-bold text-[#F4F5F7]">
            {monthlySummary.trading_days_count}
          </span>
        </div>

        <div className="px-2 sm:px-3 py-1 text-center sm:text-left">
          <span className="text-[11px] font-medium text-[#969EAB] block uppercase tracking-wider">
            Total Trades
          </span>
          <span className="text-base sm:text-lg font-bold text-[#F4F5F7]">
            {monthlySummary.total_trades}
          </span>
        </div>
      </div>
    </div>
  );
};
