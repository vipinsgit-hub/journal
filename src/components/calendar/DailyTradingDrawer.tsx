import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Image as ImageIcon, Trophy, AlertTriangle, Clock } from 'lucide-react';
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
  preferredCurrency = 'USD',
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
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
      />

      {/* Drawer Body */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[540px] bg-[#12151A] border-l border-[#272C35] z-50 flex flex-col shadow-2xl animate-slideLeft pb-[env(safe-area-inset-bottom,16px)]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#272C35] bg-[#0D0F12] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold text-[#969EAB] uppercase tracking-wider block">
              Daily Forex Journal
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#F4F5F7] mt-0.5">
              {formatFullDate(selectedDate)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23] active:bg-[#181C23] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Daily Performance Cards */}
          <div className="bg-[#0D0F12] border border-[#272C35] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#272C35] pb-3">
              <div>
                <span className="text-xs text-[#969EAB] block font-medium">Daily Net P&L</span>
                <PnlValue value={dailySummary.net_pnl} currency={preferredCurrency} size="2xl" />
              </div>
              <div className="text-right">
                <span className="text-xs text-[#969EAB] block font-medium">Win Rate</span>
                <span className="text-lg font-bold text-[#F4F5F7]">
                  {dailySummary.win_rate}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#181C23] border border-[#272C35]">
                <span className="text-[#969EAB] text-[10px] block">Gross P&L</span>
                <span className="font-semibold text-[#F4F5F7] truncate block">
                  {formatCurrency(dailySummary.gross_pnl, preferredCurrency)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#181C23] border border-[#272C35]">
                <span className="text-[#969EAB] text-[10px] block">Fees & Comm</span>
                <span className="font-semibold text-[#F4F5F7] truncate block">
                  {formatCurrency(dailySummary.total_fees, preferredCurrency)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#181C23] border border-[#272C35]">
                <span className="text-[#969EAB] text-[10px] block">Executions</span>
                <span className="font-semibold text-[#F4F5F7]">{dailySummary.total_trades}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-[#272C35] pt-3">
              <div>
                <span className="text-[#20C997] font-bold block">{dailySummary.winning_trades}</span>
                <span className="text-[10px] text-[#969EAB]">Wins</span>
              </div>
              <div>
                <span className="text-[#FF647C] font-bold block">{dailySummary.losing_trades}</span>
                <span className="text-[10px] text-[#969EAB]">Losses</span>
              </div>
              <div>
                <span className="text-[#F4F5F7] font-bold block">{dailySummary.breakeven_trades}</span>
                <span className="text-[10px] text-[#969EAB]">Break-even</span>
              </div>
            </div>

            {/* Best & Worst Trades if available */}
            {(dailySummary.best_trade || dailySummary.worst_trade) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-[#272C35]">
                {dailySummary.best_trade && (
                  <div className="p-2.5 rounded-xl bg-[#20C997]/10 border border-[#20C997]/30">
                    <span className="text-[10px] text-[#20C997] font-semibold flex items-center gap-1">
                      <Trophy size={11} /> Best Trade
                    </span>
                    <p className="font-bold text-[#20C997] mt-0.5 truncate">
                      {dailySummary.best_trade.instrument} ({formatCurrency(dailySummary.best_trade.net_pnl, preferredCurrency, true)})
                    </p>
                  </div>
                )}
                {dailySummary.worst_trade && (
                  <div className="p-2.5 rounded-xl bg-[#FF647C]/10 border border-[#FF647C]/30">
                    <span className="text-[10px] text-[#FF647C] font-semibold flex items-center gap-1">
                      <AlertTriangle size={11} /> Worst Trade
                    </span>
                    <p className="font-bold text-[#FF647C] mt-0.5 truncate">
                      {dailySummary.worst_trade.instrument} ({formatCurrency(dailySummary.worst_trade.net_pnl, preferredCurrency, true)})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trade List Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#969EAB]">
              Forex Trades ({trades.length})
            </h3>
            <button
              onClick={onOpenAddTrade}
              className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow active:scale-95"
            >
              <Plus size={14} />
              <span>Add Trade</span>
            </button>
          </div>

          {/* Trade Cards List */}
          {trades.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#272C35] rounded-2xl p-6 bg-[#0D0F12]">
              <p className="text-xs text-[#969EAB] mb-3">No trades recorded for this date.</p>
              <button
                onClick={onOpenAddTrade}
                className="px-4 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
              >
                <Plus size={14} />
                <span>Add First Forex Trade for {selectedDate}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => {
                const lots = trade.lot_size || trade.quantity;

                return (
                  <div
                    key={trade.id}
                    className="bg-[#0D0F12] border border-[#272C35] hover:border-white/30 rounded-xl p-3.5 sm:p-4 transition-all relative space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            trade.direction === 'Long'
                              ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30'
                              : 'bg-[#FF647C]/20 text-[#FF647C] border border-[#FF647C]/30'
                          }`}
                        >
                          {trade.direction === 'Long' ? 'BUY' : 'SELL'}
                        </span>
                        <span className="font-bold text-sm text-[#F4F5F7]">{trade.instrument}</span>
                        <span className="text-[10px] text-[#969EAB] bg-[#181C23] px-2 py-0.5 rounded-md border border-[#272C35]">
                          {trade.market || 'Forex'}
                        </span>
                        {trade.trade_time && (
                          <span className="text-[10px] text-[#969EAB] flex items-center gap-0.5">
                            <Clock size={10} /> {trade.trade_time}
                          </span>
                        )}
                      </div>

                      {/* Trade Net PnL */}
                      <PnlValue value={trade.net_pnl} currency={preferredCurrency} size="lg" />
                    </div>

                    {/* Execution Stats Grid (Responsive 2 cols on 320px, 4 cols on desktop) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#F4F5F7] bg-[#181C23] border border-[#272C35] p-2 sm:p-2.5 rounded-xl text-center font-mono">
                      <div>
                        <span className="text-[9px] text-[#969EAB] block font-sans">Entry</span>
                        <span className="font-semibold">{trade.entry_price}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#969EAB] block font-sans">Exit</span>
                        <span className="font-semibold">{trade.exit_price}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#969EAB] block font-sans">Lot Size</span>
                        <span className="font-semibold">{lots}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#969EAB] block font-sans">Pips</span>
                        <span className={`font-semibold ${(trade.pips || 0) >= 0 ? 'text-[#20C997]' : 'text-[#FF647C]'}`}>
                          {trade.pips !== null && trade.pips !== undefined ? `${trade.pips > 0 ? '+' : ''}${trade.pips}` : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Fee & Strategy Breakdown */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-[#969EAB] gap-2">
                      <div>
                        Gross: {formatCurrency(trade.gross_pnl, preferredCurrency)} | Comm: {formatCurrency(trade.commission ?? 0, preferredCurrency)} | Swap: {formatCurrency(trade.swap ?? 0, preferredCurrency)}
                      </div>
                      {trade.strategy && (
                        <span className="bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-md text-[10px] font-medium">
                          {trade.strategy}
                        </span>
                      )}
                    </div>

                    {trade.notes && (
                      <p className="text-xs text-[#F4F5F7] bg-[#181C23] p-2.5 rounded-xl border border-[#272C35] italic">
                        "{trade.notes}"
                      </p>
                    )}

                    {/* Actions & Screenshot */}
                    <div className="pt-2 border-t border-[#272C35] flex items-center justify-between">
                      {trade.screenshot_path ? (
                        <button
                          onClick={() => handleOpenScreenshot(trade.screenshot_path!)}
                          className="text-[11px] text-white hover:text-slate-300 flex items-center gap-1 font-medium min-h-[36px]"
                        >
                          <ImageIcon size={13} />
                          <span>View Chart Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#969EAB]/50">No screenshot</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditTrade(trade)}
                          className="p-2 text-[#969EAB] hover:text-white hover:bg-white/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Edit trade"
                        >
                          <Edit3 size={15} />
                        </button>

                        {confirmDeleteId === trade.id ? (
                          <div className="flex items-center gap-1 bg-[#FF647C]/10 p-1 rounded-lg border border-[#FF647C]/30">
                            <span className="text-[10px] text-[#FF647C] font-medium">Delete?</span>
                            <button
                              onClick={() => {
                                onDeleteTrade(trade.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 bg-[#FF647C] hover:bg-[#E0536A] text-white rounded-md text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 bg-[#181C23] text-[#969EAB] rounded-md text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(trade.id)}
                            className="p-2 text-[#969EAB] hover:text-[#FF647C] hover:bg-[#FF647C]/10 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="Delete trade"
                          >
                            <Trash2 size={15} />
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
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#12151A] border border-[#272C35] p-2">
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
