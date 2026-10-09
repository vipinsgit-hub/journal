import React from 'react';
import type { Trade } from '../../types/trade';
import { calculateOverallPerformance } from '../../features/trades/tradeCalculations';
import { StatCard } from '../shared/StatCard';
import { PnlValue } from '../shared/PnlValue';
import { PnlChart } from './PnlChart';
import { formatCurrency } from '../../lib/currency';
import { formatDateString } from '../../lib/dates';
import {
  TrendingUp,
  Award,
  BarChart3,
  Calendar,
  Zap,
  ShieldAlert,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface TradingDashboardProps {
  trades: Trade[];
  preferredCurrency?: string;
}

export const TradingDashboard: React.FC<TradingDashboardProps> = ({
  trades,
  preferredCurrency = 'USD',
}) => {
  const today = new Date();
  const currentDate = { month: today.getMonth(), year: today.getFullYear() };

  const perf = React.useMemo(() => {
    return calculateOverallPerformance(trades, currentDate);
  }, [trades, currentDate]);

  const recentTrades = React.useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
    ).slice(0, 10);
  }, [trades]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Dashboard Section 1: Top Key Metric Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#F4F5F7] mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-white" />
          <span>Forex Performance Overview</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            label="Total Net P&L"
            value={<PnlValue value={perf.total_net_pnl} currency={preferredCurrency} size="xl" />}
            subtitle={`Gross: ${formatCurrency(perf.total_gross_pnl, preferredCurrency)}`}
            icon={<TrendingUp size={16} />}
          />

          <StatCard
            label="Forex Trades"
            value={perf.total_closed_trades}
            subtitle={`${perf.trading_days_count} active trading days`}
            icon={<Calendar size={16} />}
          />

          <StatCard
            label="Win Rate"
            value={`${perf.win_rate}%`}
            subtitle={`${perf.winning_trades} W / ${perf.losing_trades} L / ${perf.breakeven_trades} BE`}
            icon={<Award size={16} />}
          />

          <StatCard
            label="Profit Factor"
            value={
              perf.profit_factor === Infinity
                ? '∞ (No losses)'
                : perf.profit_factor === 0
                ? '0.00'
                : perf.profit_factor.toFixed(2)
            }
            subtitle="Gross Wins ÷ Gross Losses"
            icon={<PieChart size={16} />}
          />

          <StatCard
            label="Avg Daily P&L"
            value={<PnlValue value={perf.avg_daily_net_pnl} currency={preferredCurrency} size="lg" />}
            subtitle="Average per active day"
            icon={<Zap size={16} />}
          />

          <StatCard
            label="Comm & Swap Paid"
            value={formatCurrency(perf.total_fees, preferredCurrency)}
            subtitle="Brokerage & Financing"
            icon={<ShieldAlert size={16} />}
          />
        </div>
      </div>

      {/* Dashboard Section 2: Detailed Performance & PnL Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (2 columns on desktop) */}
        <div className="lg:col-span-2 bg-[#12151A] border border-[#272C35] rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#F4F5F7]">Daily P&L Timeline</h3>
              <p className="text-xs text-[#969EAB]">Net daily profit and loss distribution across Forex pairs</p>
            </div>
            <span className="text-xs text-[#969EAB] bg-[#181C23] px-3 py-1 rounded-xl border border-[#272C35] font-medium">
              {trades.length} Executions
            </span>
          </div>
          <PnlChart trades={trades} preferredCurrency={preferredCurrency} />
        </div>

        {/* Monthly Breakdown Stats Card */}
        <div className="bg-[#12151A] border border-[#272C35] rounded-2xl p-5 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-[#F4F5F7] border-b border-[#272C35] pb-3">
            Forex Analytics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D0F12] border border-[#272C35]">
              <span className="text-[#969EAB]">Current Month Net P&L</span>
              <PnlValue value={perf.current_month_net_pnl} currency={preferredCurrency} size="md" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D0F12] border border-[#272C35]">
              <span className="text-[#969EAB]">Previous Month Net P&L</span>
              <PnlValue value={perf.previous_month_net_pnl} currency={preferredCurrency} size="md" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D0F12] border border-[#272C35]">
              <span className="text-[#969EAB]">Average Winning Trade</span>
              <span className="font-bold text-[#20C997]">
                +{formatCurrency(perf.avg_winning_trade, preferredCurrency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D0F12] border border-[#272C35]">
              <span className="text-[#969EAB]">Average Losing Trade</span>
              <span className="font-bold text-[#FF647C]">
                -{formatCurrency(Math.abs(perf.avg_losing_trade), preferredCurrency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D0F12] border border-[#272C35]">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight size={15} className="text-[#20C997]" />
                <span className="text-[#969EAB]">Best Trading Day</span>
              </div>
              {perf.best_trading_day ? (
                <div className="text-right">
                  <span className="font-bold text-[#20C997] block">
                    +{formatCurrency(perf.best_trading_day.pnl, preferredCurrency)}
                  </span>
                  <span className="text-[10px] text-[#969EAB]">{formatDateString(perf.best_trading_day.date)}</span>
                </div>
              ) : (
                <span className="text-[#969EAB]/50">N/A</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D0F12] border border-[#272C35]">
              <div className="flex items-center gap-1.5">
                <ArrowDownRight size={15} className="text-[#FF647C]" />
                <span className="text-[#969EAB]">Worst Trading Day</span>
              </div>
              {perf.worst_trading_day ? (
                <div className="text-right">
                  <span className="font-bold text-[#FF647C] block">
                    {formatCurrency(perf.worst_trading_day.pnl, preferredCurrency)}
                  </span>
                  <span className="text-[10px] text-[#969EAB]">{formatDateString(perf.worst_trading_day.date)}</span>
                </div>
              ) : (
                <span className="text-[#969EAB]/50">N/A</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Section 3: Recent Trades List */}
      <div className="bg-[#12151A] border border-[#272C35] rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#F4F5F7]">Recent Forex Trades</h3>
            <p className="text-xs text-[#969EAB]">Latest trade executions across currency pairs & metals</p>
          </div>
        </div>

        {recentTrades.length === 0 ? (
          <div className="text-center py-8 text-[#969EAB] text-xs border border-dashed border-[#272C35] rounded-2xl bg-[#0D0F12]">
            No trade history recorded yet.
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F4F5F7]">
                <thead className="bg-[#0D0F12] text-[#969EAB] uppercase font-semibold text-[10px] tracking-wider border-b border-[#272C35]">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Instrument</th>
                    <th className="py-3.5 px-4">Direction</th>
                    <th className="py-3.5 px-4 text-right">Entry</th>
                    <th className="py-3.5 px-4 text-right">Exit</th>
                    <th className="py-3.5 px-4 text-right">Lot Size</th>
                    <th className="py-3.5 px-4 text-right">Pips</th>
                    <th className="py-3.5 px-4 text-right">Gross P&L</th>
                    <th className="py-3.5 px-4 text-right">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272C35]/60">
                  {recentTrades.map((t) => {
                    const lots = t.lot_size || t.quantity;
                    return (
                      <tr key={t.id} className="hover:bg-[#181C23]/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#F4F5F7]">{formatDateString(t.trade_date)}</td>
                        <td className="py-3.5 px-4 font-bold text-[#F4F5F7]">{t.instrument}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              t.direction === 'Long'
                                ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30'
                                : 'bg-[#FF647C]/20 text-[#FF647C] border border-[#FF647C]/30'
                            }`}
                          >
                            {t.direction === 'Long' ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#F4F5F7]">{t.entry_price}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#F4F5F7]">{t.exit_price}</td>
                        <td className="py-3.5 px-4 text-right font-semibold">{lots}</td>
                        <td className={`py-3.5 px-4 text-right font-mono font-semibold ${(t.pips || 0) >= 0 ? 'text-[#20C997]' : 'text-[#FF647C]'}`}>
                          {t.pips !== null && t.pips !== undefined ? `${t.pips > 0 ? '+' : ''}${t.pips}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#969EAB]">
                          {formatCurrency(t.gross_pnl, preferredCurrency)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          <PnlValue value={t.net_pnl} currency={preferredCurrency} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {recentTrades.map((t) => {
                const lots = t.lot_size || t.quantity;
                return (
                  <div key={t.id} className="bg-[#0D0F12] border border-[#272C35] p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#969EAB]">{formatDateString(t.trade_date)}</span>
                      <PnlValue value={t.net_pnl} currency={preferredCurrency} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#F4F5F7]">{t.instrument}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          t.direction === 'Long'
                            ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30'
                            : 'bg-[#FF647C]/20 text-[#FF647C] border border-[#FF647C]/30'
                        }`}
                      >
                        {t.direction === 'Long' ? 'BUY' : 'SELL'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#969EAB] pt-2 border-t border-[#272C35] font-mono">
                      <span>Entry: {t.entry_price}</span>
                      <span>Exit: {t.exit_price}</span>
                      <span>Lots: {lots}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
