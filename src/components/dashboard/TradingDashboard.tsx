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
  preferredCurrency = 'INR',
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
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-400" />
          <span>Performance Overview</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            label="Total Net P&L"
            value={<PnlValue value={perf.total_net_pnl} currency={preferredCurrency} size="xl" />}
            subtitle={`Gross: ${formatCurrency(perf.total_gross_pnl, preferredCurrency)}`}
            icon={<TrendingUp size={16} />}
          />

          <StatCard
            label="Closed Trades"
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
            label="Total Fees Paid"
            value={formatCurrency(perf.total_fees, preferredCurrency)}
            subtitle="Brokerage & Taxes"
            icon={<ShieldAlert size={16} />}
          />
        </div>
      </div>

      {/* Dashboard Section 2: Detailed Performance & PnL Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (2 columns on desktop) */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-100">Daily P&L Timeline</h3>
              <p className="text-xs text-slate-400">Net daily profit and loss distribution</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              {trades.length} Total Executions
            </span>
          </div>
          <PnlChart trades={trades} preferredCurrency={preferredCurrency} />
        </div>

        {/* Monthly Breakdown Stats Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
            Trade Statistics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131B2E] border border-slate-800">
              <span className="text-slate-400">Current Month Net P&L</span>
              <PnlValue value={perf.current_month_net_pnl} currency={preferredCurrency} size="md" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131B2E] border border-slate-800">
              <span className="text-slate-400">Previous Month Net P&L</span>
              <PnlValue value={perf.previous_month_net_pnl} currency={preferredCurrency} size="md" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131B2E] border border-slate-800">
              <span className="text-slate-400">Average Winning Trade</span>
              <span className="font-bold text-emerald-400">
                +{formatCurrency(perf.avg_winning_trade, preferredCurrency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131B2E] border border-slate-800">
              <span className="text-slate-400">Average Losing Trade</span>
              <span className="font-bold text-rose-400">
                -{formatCurrency(Math.abs(perf.avg_losing_trade), preferredCurrency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131B2E] border border-slate-800">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight size={15} className="text-emerald-400" />
                <span className="text-slate-400">Best Trading Day</span>
              </div>
              {perf.best_trading_day ? (
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">
                    +{formatCurrency(perf.best_trading_day.pnl, preferredCurrency)}
                  </span>
                  <span className="text-[10px] text-slate-500">{formatDateString(perf.best_trading_day.date)}</span>
                </div>
              ) : (
                <span className="text-slate-500">N/A</span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131B2E] border border-slate-800">
              <div className="flex items-center gap-1.5">
                <ArrowDownRight size={15} className="text-rose-400" />
                <span className="text-slate-400">Worst Trading Day</span>
              </div>
              {perf.worst_trading_day ? (
                <div className="text-right">
                  <span className="font-bold text-rose-400 block">
                    {formatCurrency(perf.worst_trading_day.pnl, preferredCurrency)}
                  </span>
                  <span className="text-[10px] text-slate-500">{formatDateString(perf.worst_trading_day.date)}</span>
                </div>
              ) : (
                <span className="text-slate-500">N/A</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Section 3: Recent Trades List */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Recent Trades</h3>
            <p className="text-xs text-slate-400">Latest trade executions across all instruments</p>
          </div>
        </div>

        {recentTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No trade history recorded yet.
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0D1322] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">Market</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4 text-right">Entry</th>
                    <th className="py-3 px-4 text-right">Exit</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Gross P&L</th>
                    <th className="py-3 px-4 text-right">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-200">{formatDateString(t.trade_date)}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{t.instrument}</td>
                      <td className="py-3 px-4 text-slate-400">{t.market}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === 'Long'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{t.entry_price}</td>
                      <td className="py-3 px-4 text-right font-medium">{t.exit_price}</td>
                      <td className="py-3 px-4 text-right">{t.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {formatCurrency(t.gross_pnl, preferredCurrency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        <PnlValue value={t.net_pnl} currency={preferredCurrency} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {recentTrades.map((t) => (
                <div key={t.id} className="bg-[#131B2E] border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{formatDateString(t.trade_date)}</span>
                    <PnlValue value={t.net_pnl} currency={preferredCurrency} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100">{t.instrument}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.direction === 'Long'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {t.direction}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Entry: {t.entry_price}</span>
                    <span>Exit: {t.exit_price}</span>
                    <span>Qty: {t.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
