import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Image as ImageIcon, Trophy, AlertTriangle } from 'lucide-react';
import type { DailySummaryData, Trade } from '../../types/trade';
import { formatFullDate } from '../../lib/dates';
import { PnlValue } from '../shared/PnlValue';
import { formatCurrency } from '../../lib/currency';
import { tradeService } from '../../features/trades/tradeService';

interface DailyTradingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  dailySummary: DailySummaryData;
  trades: Trade[];
  onOpenAddTrade: () => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  preferredCurrency?: string;
}

export const DailyTradingDrawer: React.FC<DailyTradingDrawerProps> = ({
  isOpen,
  onClose,
  selectedDate,
  dailySummary,
  trades,
  onOpenAddTrade,
  onEditTrade,
  onDeleteTrade,
  preferredCurrency = 'INR',
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenScreenshot = async (path: string) => {
    const url = await tradeService.getScreenshotUrl(path);
    if (url) setPreviewScreenshotUrl(url);
  };

  return (
    <>
      {/* Drawer Overlay (Mobile / Backdrop) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
      />

      {/* Drawer Body */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[540px] bg-[#111827] border-l border-slate-800 z-50 flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0D1322] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
              Daily Journal
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
              {formatFullDate(selectedDate)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Daily Performance Cards */}
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Daily Net P&L</span>
                <PnlValue value={dailySummary.net_pnl} currency={preferredCurrency} size="2xl" />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Win Rate</span>
                <span className="text-lg font-bold text-slate-100">
                  {dailySummary.win_rate}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-[#1A2234]">
                <span className="text-slate-400 text-[10px] block">Gross P&L</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(dailySummary.gross_pnl, preferredCurrency)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#1A2234]">
                <span className="text-slate-400 text-[10px] block">Total Fees</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency(dailySummary.total_fees, preferredCurrency)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#1A2234]">
                <span className="text-slate-400 text-[10px] block">Total Trades</span>
                <span className="font-semibold text-slate-200">{dailySummary.total_trades}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-emerald-400 font-bold block">{dailySummary.winning_trades}</span>
                <span className="text-[10px] text-slate-400">Wins</span>
              </div>
              <div>
                <span className="text-rose-400 font-bold block">{dailySummary.losing_trades}</span>
                <span className="text-[10px] text-slate-400">Losses</span>
              </div>
              <div>
                <span className="text-slate-300 font-bold block">{dailySummary.breakeven_trades}</span>
                <span className="text-[10px] text-slate-400">Break-even</span>
              </div>
            </div>

            {/* Best & Worst Trades if available */}
            {(dailySummary.best_trade || dailySummary.worst_trade) && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                {dailySummary.best_trade && (
                  <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Trophy size={11} /> Best Trade
                    </span>
                    <p className="font-bold text-emerald-300 mt-0.5">
                      {dailySummary.best_trade.instrument} ({formatCurrency(dailySummary.best_trade.net_pnl, preferredCurrency, true)})
                    </p>
                  </div>
                )}
                {dailySummary.worst_trade && (
                  <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle size={11} /> Worst Trade
                    </span>
                    <p className="font-bold text-rose-300 mt-0.5">
                      {dailySummary.worst_trade.instrument} ({formatCurrency(dailySummary.worst_trade.net_pnl, preferredCurrency, true)})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trade List Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trades ({trades.length})
            </h3>
            <button
              onClick={onOpenAddTrade}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/20"
            >
              <Plus size={14} />
              <span>Add Trade</span>
            </button>
          </div>

          {/* Trade Cards List */}
          {trades.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl p-6">
              <p className="text-xs text-slate-400 mb-3">No trades recorded for this date.</p>
              <button
                onClick={onOpenAddTrade}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add First Trade for {selectedDate}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => {
                return (
                  <div
                    key={trade.id}
                    className="bg-[#131B2E] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            trade.direction === 'Long'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {trade.direction}
                        </span>
                        <span className="font-bold text-sm text-slate-100">{trade.instrument}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {trade.market}
                        </span>
                      </div>

                      {/* Trade Net PnL */}
                      <PnlValue value={trade.net_pnl} currency={preferredCurrency} size="lg" />
                    </div>

                    {/* Execution Stats */}
                    <div className="grid grid-cols-3 gap-2 my-3 text-xs text-slate-300 bg-[#1A2234] p-2 rounded-lg">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Entry</span>
                        <span className="font-semibold">{trade.entry_price}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Exit</span>
                        <span className="font-semibold">{trade.exit_price}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Qty</span>
                        <span className="font-semibold">{trade.quantity}</span>
                      </div>
                    </div>

                    {/* Breakdown & Strategy */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                      <div>
                        Gross: {formatCurrency(trade.gross_pnl, preferredCurrency)} | Fees: {formatCurrency(trade.fees, preferredCurrency)}
                      </div>
                      {trade.strategy && (
                        <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-medium">
                          {trade.strategy}
                        </span>
                      )}
                    </div>

                    {trade.notes && (
                      <p className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80 italic">
                        "{trade.notes}"
                      </p>
                    )}

                    {/* Actions & Screenshot */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      {trade.screenshot_path ? (
                        <button
                          onClick={() => handleOpenScreenshot(trade.screenshot_path!)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                        >
                          <ImageIcon size={13} />
                          <span>View Chart Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-600">No screenshot</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditTrade(trade)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                          title="Edit trade"
                        >
                          <Edit3 size={14} />
                        </button>

                        {confirmDeleteId === trade.id ? (
                          <div className="flex items-center gap-1 bg-rose-950 p-1 rounded border border-rose-500/30">
                            <span className="text-[10px] text-rose-300 font-medium">Delete?</span>
                            <button
                              onClick={() => {
                                onDeleteTrade(trade.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(trade.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Viewer Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-2">
            <button
              onClick={() => setPreviewScreenshotUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black rounded-full text-white z-10"
            >
              <X size={20} />
            </button>
            <img
              src={previewScreenshotUrl}
              alt="Trade Screenshot Full"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
