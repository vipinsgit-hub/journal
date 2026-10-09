import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { Trade } from '../../types/trade';
import { formatCurrency } from '../../lib/currency';

interface PnlChartProps {
  trades: Trade[];
  preferredCurrency?: string;
}

export const PnlChart: React.FC<PnlChartProps> = ({ trades, preferredCurrency = 'INR' }) => {
  // Aggregate P&L by trade date
  const chartData = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of trades) {
      map[t.trade_date] = (map[t.trade_date] || 0) + (t.net_pnl || 0);
    }

    // Sort by date ascending for timeline chart
    const sortedDates = Object.keys(map).sort();
    return sortedDates.map((date) => {
      const pnl = Math.round((map[date] + Number.EPSILON) * 100) / 100;
      return {
        date: date.substring(5), // MM-DD
        fullDate: date,
        pnl: pnl,
      };
    });
  }, [trades]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
        No trading activity available to display chart.
      </div>
    );
  }

  return (
    <div className="h-72 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(val) => `${val >= 0 ? '₹' : '-₹'}${Math.abs(val)}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#0D1322] border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                    <p className="text-slate-400 font-medium">{data.fullDate}</p>
                    <p className={`font-bold mt-1 ${data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      P&L: {formatCurrency(data.pnl, preferredCurrency, true)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
