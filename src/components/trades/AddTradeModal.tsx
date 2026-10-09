import React, { useState, useEffect } from 'react';
import { X, Upload, Calculator, AlertCircle } from 'lucide-react';
import type { Trade, TradeFormData, MarketType } from '../../types/trade';
import { tradeService } from '../../features/trades/tradeService';
import { calculateNetPnl } from '../../features/trades/tradeCalculations';
import { formatCurrency } from '../../lib/currency';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedDate: string;
  tradeToEdit?: Trade | null;
  onTradeSaved: () => void;
  preferredCurrency?: string;
}

const MARKET_OPTIONS: MarketType[] = ['Equity', 'Options', 'Futures', 'Forex', 'Crypto', 'Other'];
const DEFAULT_STRATEGIES = ['Breakout', 'Reversal', 'Trend Following', 'Scalping', 'Support/Resistance', 'Momentum'];

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  userId,
  selectedDate,
  tradeToEdit,
  onTradeSaved,
  preferredCurrency = 'INR',
}) => {
  const [formData, setFormData] = useState<TradeFormData>({
    trade_date: selectedDate,
    instrument: 'NIFTY',
    market: 'Options',
    direction: 'Long',
    entry_price: '',
    exit_price: '',
    quantity: '',
    stop_loss: '',
    target: '',
    gross_pnl: '',
    fees: '',
    net_pnl: '',
    strategy: '',
    setup: '',
    notes: '',
    screenshot_file: null,
    screenshot_path: null,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  useEffect(() => {
    if (tradeToEdit) {
      setFormData({
        trade_date: tradeToEdit.trade_date,
        instrument: tradeToEdit.instrument,
        market: tradeToEdit.market,
        direction: tradeToEdit.direction,
        entry_price: tradeToEdit.entry_price,
        exit_price: tradeToEdit.exit_price,
        quantity: tradeToEdit.quantity,
        stop_loss: tradeToEdit.stop_loss ?? '',
        target: tradeToEdit.target ?? '',
        gross_pnl: tradeToEdit.gross_pnl,
        fees: tradeToEdit.fees,
        net_pnl: tradeToEdit.net_pnl,
        strategy: tradeToEdit.strategy || '',
        setup: tradeToEdit.setup || '',
        notes: tradeToEdit.notes || '',
        screenshot_file: null,
        screenshot_path: tradeToEdit.screenshot_path || null,
      });

      if (tradeToEdit.screenshot_path) {
        tradeService.getScreenshotUrl(tradeToEdit.screenshot_path).then((url) => {
          setScreenshotPreview(url);
        });
      } else {
        setScreenshotPreview(null);
      }
    } else {
      setFormData({
        trade_date: selectedDate,
        instrument: 'NIFTY',
        market: 'Options',
        direction: 'Long',
        entry_price: '',
        exit_price: '',
        quantity: '',
        stop_loss: '',
        target: '',
        gross_pnl: '',
        fees: 0,
        net_pnl: '',
        strategy: 'Breakout',
        setup: '',
        notes: '',
        screenshot_file: null,
        screenshot_path: null,
      });
      setScreenshotPreview(null);
    }
    setError(null);
  }, [tradeToEdit, selectedDate, isOpen]);

  if (!isOpen) return null;

  // Auto calculate P&L preview when inputs change
  const handleCalculatePnl = () => {
    const entry = Number(formData.entry_price);
    const exit = Number(formData.exit_price);
    const qty = Number(formData.quantity);

    if (entry > 0 && exit > 0 && qty > 0) {
      let calcGross = 0;
      if (formData.direction === 'Long') {
        calcGross = (exit - entry) * qty;
      } else {
        calcGross = (entry - exit) * qty;
      }
      calcGross = Math.round((calcGross + Number.EPSILON) * 100) / 100;
      const currentFees = Number(formData.fees || 0);
      const calcNet = calculateNetPnl(calcGross, currentFees);

      setFormData((prev) => ({
        ...prev,
        gross_pnl: calcGross,
        net_pnl: calcNet,
      }));
    }
  };

  const handleGrossOrFeesChange = (grossVal: number | '', feesVal: number | '') => {
    const gross = Number(grossVal || 0);
    const fees = Number(feesVal || 0);
    const net = calculateNetPnl(gross, fees);
    setFormData((prev) => ({
      ...prev,
      gross_pnl: grossVal,
      fees: feesVal,
      net_pnl: net,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, screenshot_file: file }));
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!formData.instrument.trim()) {
      setError('Please enter an instrument (e.g., NIFTY, BANKNIFTY).');
      return;
    }
    if (formData.entry_price === '' || Number(formData.entry_price) <= 0) {
      setError('Please enter a valid positive entry price.');
      return;
    }
    if (formData.exit_price === '' || Number(formData.exit_price) <= 0) {
      setError('Please enter a valid positive exit price.');
      return;
    }
    if (formData.quantity === '' || Number(formData.quantity) <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }
    if (formData.gross_pnl === '') {
      setError('Please specify gross realized P&L.');
      return;
    }

    setSaving(true);

    try {
      let screenshotPath = formData.screenshot_path || null;

      if (formData.screenshot_file) {
        setUploading(true);
        screenshotPath = await tradeService.uploadScreenshot(userId, formData.screenshot_file);
        setUploading(false);
      }

      const updatedFormData = {
        ...formData,
        screenshot_path: screenshotPath,
      };

      if (tradeToEdit) {
        await tradeService.updateTrade(tradeToEdit.id, userId, updatedFormData);
      } else {
        await tradeService.createTrade(userId, updatedFormData);
      }

      onTradeSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save trade record.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Current Net PnL preview
  const currentNetPnl = calculateNetPnl(Number(formData.gross_pnl || 0), Number(formData.fees || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl my-6 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#0D1322] shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              {tradeToEdit ? 'Edit Trade' : 'Add New Trade'}
            </h2>
            <p className="text-xs text-slate-400">Date: {formData.trade_date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section A: Trade Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 border-b border-slate-800/80 pb-1">
              A. Trade Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.trade_date}
                  onChange={(e) => setFormData({ ...formData, trade_date: e.target.value })}
                  required
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Instrument</label>
                <input
                  type="text"
                  value={formData.instrument}
                  onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                  placeholder="e.g. NIFTY, RELIANCE"
                  required
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 uppercase focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Market</label>
                <select
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value as MarketType })}
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                >
                  {MARKET_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Direction</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, direction: 'Long' })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    formData.direction === 'Long'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-[#1A2234] border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ▲ Long (Buy)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, direction: 'Short' })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    formData.direction === 'Short'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-[#1A2234] border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ▼ Short (Sell)
                </button>
              </div>
            </div>
          </div>

          {/* Section B: Execution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                B. Execution & Prices
              </h3>
              <button
                type="button"
                onClick={handleCalculatePnl}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Calculator size={13} />
                <span>Auto-Calc PnL</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={formData.entry_price}
                  onChange={(e) =>
                    setFormData({ ...formData, entry_price: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="100.00"
                  required
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={formData.exit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, exit_price: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="150.00"
                  required
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="50"
                  required
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section C: Risk Management */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 border-b border-slate-800/80 pb-1">
              C. Risk Management (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Stop Loss</label>
                <input
                  type="number"
                  step="any"
                  value={formData.stop_loss ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, stop_loss: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="e.g. 90.00"
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target</label>
                <input
                  type="number"
                  step="any"
                  value={formData.target ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="e.g. 160.00"
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section D: PnL & Result */}
          <div className="space-y-3 bg-[#131B2E] p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 border-b border-slate-800/80 pb-2">
              D. Realized Result & Net PnL
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Gross Realized P&L</label>
                <input
                  type="number"
                  step="any"
                  value={formData.gross_pnl}
                  onChange={(e) =>
                    handleGrossOrFeesChange(
                      e.target.value === '' ? '' : Number(e.target.value),
                      formData.fees
                    )
                  }
                  placeholder="2500"
                  required
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Brokerage & Fees</label>
                <input
                  type="number"
                  step="any"
                  value={formData.fees}
                  onChange={(e) =>
                    handleGrossOrFeesChange(
                      formData.gross_pnl,
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="50"
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Net Realized P&L</label>
                <div
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-between ${
                    currentNetPnl > 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : currentNetPnl < 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <span>Net:</span>
                  <span>{formatCurrency(currentNetPnl, preferredCurrency, true)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section E: Strategy & Notes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 border-b border-slate-800/80 pb-1">
              E. Strategy & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Strategy</label>
                <input
                  type="text"
                  list="strategies-list"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  placeholder="e.g. Breakout, Reversal"
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
                <datalist id="strategies-list">
                  {DEFAULT_STRATEGIES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Setup / Pattern</label>
                <input
                  type="text"
                  value={formData.setup}
                  onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                  placeholder="e.g. Double Bottom, VWAP Bounce"
                  className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Trade Notes / Reflections</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="What went well? Mistakes made? Market context..."
                className="w-full bg-[#1A2234] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section F: Screenshot Attachment */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 border-b border-slate-800/80 pb-1">
              F. Screenshot Attachment (Optional)
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto cursor-pointer bg-[#1A2234] hover:bg-slate-800 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl px-4 py-3 text-center transition-all flex items-center justify-center gap-2 text-xs text-slate-300">
                <Upload size={16} className="text-indigo-400" />
                <span>Upload Chart Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {screenshotPreview && (
                <div className="relative group w-20 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                  <img
                    src={screenshotPreview}
                    alt="Trade setup screenshot preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, screenshot_file: null, screenshot_path: null });
                      setScreenshotPreview(null);
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0D1322] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
          >
            {saving ? (
              <span>Saving Trade...</span>
            ) : (
              <span>{tradeToEdit ? 'Update Trade' : 'Save Trade'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
