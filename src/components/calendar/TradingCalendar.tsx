import React, { useState, useMemo } from 'react';
import { getCalendarGrid } from '../../lib/dates';
import type { Trade, DailySummaryData } from '../../types/trade';
import { calculateMonthlySummary, calculateDailySummary } from '../../features/trades/tradeCalculations';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { DailyTradingDrawer } from './DailyTradingDrawer';
import { AddTradeModal } from '../trades/AddTradeModal';
import { Plus } from 'lucide-react';

interface TradingCalendarProps {
  userId: string;
  trades: Trade[];
  onTradeSaved: () => void;
  onDeleteTrade: (tradeId: string) => void;
  preferredCurrency?: string;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TradingCalendar: React.FC<TradingCalendarProps> = ({
  userId,
  trades,
  onTradeSaved,
  onDeleteTrade,
  preferredCurrency = 'USD',
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    return calculateMonthlySummary(currentMonth, currentYear, trades);
  }, [currentMonth, currentYear, trades]);

  // Group trades by date string (YYYY-MM-DD)
  const tradesByDateMap = useMemo(() => {
    const map: Record<string, Trade[]> = {};
    for (const t of trades) {
      if (!map[t.trade_date]) {
        map[t.trade_date] = [];
      }
      map[t.trade_date].push(t);
    }
    return map;
  }, [trades]);

  // Generate grid cells for Monday-Sunday alignment
  const calendarGrid = useMemo(() => {
    return getCalendarGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setIsDrawerOpen(true);
  };

  const handleOpenAddTrade = () => {
    setTradeToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsAddModalOpen(true);
  };

  // Selected date trades and daily summary
  const selectedDateTrades = selectedDate ? tradesByDateMap[selectedDate] || [] : [];
  const selectedDateSummary: DailySummaryData = useMemo(() => {
    if (!selectedDate) {
      return {
        trade_date: '',
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        breakeven_trades: 0,
        gross_pnl: 0,
        total_fees: 0,
        net_pnl: 0,
        win_rate: 0,
        best_trade: null,
        worst_trade: null,
      };
    }
    return calculateDailySummary(selectedDate, selectedDateTrades);
  }, [selectedDate, selectedDateTrades]);

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Calendar Header */}
      <CalendarHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthlySummary={monthlySummary}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        preferredCurrency={preferredCurrency}
      />

      {/* Main Calendar View Container */}
      <div className="bg-[#12151A] border border-[#272C35] rounded-2xl p-2.5 sm:p-6 shadow-2xl">
        {/* Days of Week Row Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-3 text-center">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div
              key={day}
              className={`py-1 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                idx >= 5 ? 'text-[#969EAB]/60' : 'text-[#969EAB]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-3">
          {calendarGrid.map((cell) => {
            const dateTrades = tradesByDateMap[cell.dateString] || [];
            const dailySummary = dateTrades.length > 0
              ? calculateDailySummary(cell.dateString, dateTrades)
              : undefined;

            return (
              <CalendarDay
                key={cell.dateString}
                cell={cell}
                dailySummary={dailySummary}
                onClickDate={handleSelectDate}
                preferredCurrency={preferredCurrency}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Action Button (Positioned above mobile bottom bar) */}
      <button
        onClick={() => {
          const nowStr = new Date().toISOString().split('T')[0];
          setSelectedDate(nowStr);
          setTradeToEdit(null);
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-neutral-200 text-black font-bold flex items-center justify-center shadow-2xl shadow-white/20 transition-all hover:scale-105 active:scale-95"
        title="Add Trade"
      >
        <Plus size={22} />
      </button>

      {/* Daily Journal Drawer */}
      {selectedDate && (
        <DailyTradingDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          selectedDate={selectedDate}
          dailySummary={selectedDateSummary}
          trades={selectedDateTrades}
          onOpenAddTrade={handleOpenAddTrade}
          onEditTrade={handleEditTrade}
          onDeleteTrade={onDeleteTrade}
          preferredCurrency={preferredCurrency}
        />
      )}

      {/* Add / Edit Trade Form Modal */}
      {selectedDate && (
        <AddTradeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          userId={userId}
          selectedDate={selectedDate}
          tradeToEdit={tradeToEdit}
          onTradeSaved={() => {
            onTradeSaved();
            setIsAddModalOpen(false);
          }}
          preferredCurrency={preferredCurrency}
        />
      )}
    </div>
  );
};
