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
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left Navigation controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[#1A2234] border border-slate-700/80 rounded-xl p-1">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/60 transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Next Month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <CalendarIcon size={22} className="text-indigo-400" />
          <span>{getMonthName(currentMonth)} {currentYear}</span>
        </h2>
      </div>

      {/* Right Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-[#0D1322] border border-slate-800/80 p-2.5 sm:p-3 rounded-xl">
        <div className="px-2 sm:px-3 py-1 text-center sm:text-left border-r border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Monthly P&L
          </span>
          <PnlValue value={monthlySummary.net_pnl} currency={preferredCurrency} size="lg" />
        </div>

        <div className="px-2 sm:px-3 py-1 text-center sm:text-left border-r border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Trading Days
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-100">
            {monthlySummary.trading_days_count}
          </span>
        </div>

        <div className="px-2 sm:px-3 py-1 text-center sm:text-left">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Total Trades
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-100">
            {monthlySummary.total_trades}
          </span>
        </div>
      </div>
    </div>
  );
};
