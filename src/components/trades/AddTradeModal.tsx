import React, { useState, useEffect } from 'react';
import { X, Upload, Calculator, AlertCircle } from 'lucide-react';
import type { Trade, TradeFormData, MarketType } from '../../types/trade';
import { tradeService } from '../../features/trades/tradeService';
import { calculateNetPnl, calculateTotalFees, getPipSize, calculatePips } from '../../features/trades/tradeCalculations';
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

const FOREX_MARKETS: MarketType[] = [
  'Forex Major',
  'Forex Minor',
  'Forex Exotic',
  'Metals (XAU/XAG)',
  'Crypto',
  'Indices',
  'Other',
];

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  userId,
  selectedDate,
  tradeToEdit,
  onTradeSaved,
  preferredCurrency = 'USD',
}) => {
  const [formData, setFormData] = useState<TradeFormData>({
    trade_date: selectedDate,
    trade_time: '14:30',
    instrument: 'EURUSD',
    market: 'Forex Major',
    direction: 'Long',
    entry_price: '',
    exit_price: '',
    quantity: 1.0,
    lot_size: 1.0,
    contract_size: 100000,
    stop_loss: '',
    target: '',
    gross_pnl: '',
    commission: 7,
    swap: 0,
    other_fees: 0,
    fees: 7,
    net_pnl: '',
    pips: '',
    strategy: 'Breakout',
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
      const comm = tradeToEdit.commission ?? 0;
      const swp = tradeToEdit.swap ?? 0;
      const oth = tradeToEdit.other_fees ?? 0;
      const totFees = tradeToEdit.fees ?? (comm + swp + oth);

      setFormData({
        trade_date: tradeToEdit.trade_date,
        trade_time: tradeToEdit.trade_time || '',
        instrument: tradeToEdit.instrument,
        market: tradeToEdit.market || 'Forex Major',
        direction: tradeToEdit.direction,
        entry_price: tradeToEdit.entry_price,
        exit_price: tradeToEdit.exit_price,
        quantity: tradeToEdit.quantity || tradeToEdit.lot_size || 1.0,
        lot_size: tradeToEdit.lot_size || tradeToEdit.quantity || 1.0,
        contract_size: tradeToEdit.contract_size || 100000,
        stop_loss: tradeToEdit.stop_loss ?? '',
        target: tradeToEdit.target ?? '',
        gross_pnl: tradeToEdit.gross_pnl,
        commission: comm,
        swap: swp,
        other_fees: oth,
        fees: totFees,
        net_pnl: tradeToEdit.net_pnl,
        pips: tradeToEdit.pips ?? '',
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
        trade_time: new Date().toTimeString().slice(0, 5),
        instrument: 'EURUSD',
        market: 'Forex Major',
        direction: 'Long',
        entry_price: '',
        exit_price: '',
        quantity: 1.0,
        lot_size: 1.0,
        contract_size: 100000,
        stop_loss: '',
        target: '',
        gross_pnl: '',
        commission: 7,
        swap: 0,
        other_fees: 0,
        fees: 7,
        net_pnl: '',
        pips: '',
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

  // Automatic Pips & P&L Calculation whenever entry, exit, direction, instrument, lot_size change
  useEffect(() => {
    const entry = Number(formData.entry_price);
    const exit = Number(formData.exit_price);
    const lots = Number(formData.lot_size || formData.quantity || 1.0);

    if (entry > 0 && exit > 0 && lots > 0 && formData.instrument.trim() !== '') {
      const pipInfo = getPipSize(formData.instrument);
      const calculatedPips = calculatePips(formData.direction, entry, exit, pipInfo.pipSize);

      let estGross = 0;
      const cleanInst = formData.instrument.toUpperCase().replace('/', '').trim();

      if (pipInfo.pipSize === 0.0001) {
        estGross = calculatedPips * 10 * lots;
      } else if (pipInfo.pipSize === 0.01 && cleanInst.includes('JPY')) {
        estGross = (calculatedPips * 10 * lots) / (entry / 150);
      } else if (cleanInst.includes('XAU') || cleanInst.includes('GOLD')) {
        estGross = (formData.direction === 'Long' ? exit - entry : entry - exit) * 100 * lots;
      } else {
        estGross = (formData.direction === 'Long' ? exit - entry : entry - exit) * lots * Number(formData.contract_size || 100000);
      }
      estGross = Math.round((estGross + Number.EPSILON) * 100) / 100;

      const comm = Number(formData.commission || 0);
      const swp = Number(formData.swap || 0);
      const oth = Number(formData.other_fees || 0);
      const totFees = calculateTotalFees(comm, swp, oth, 0);
      const calcNet = calculateNetPnl(estGross, totFees);

      setFormData((prev) => ({
        ...prev,
        pips: calculatedPips,
        gross_pnl: estGross,
        fees: totFees,
        net_pnl: calcNet,
      }));
    }
  }, [formData.entry_price, formData.exit_price, formData.direction, formData.instrument, formData.lot_size, formData.commission, formData.swap, formData.other_fees]);

  if (!isOpen) return null;

  const handleFeesChange = (
    commVal: number | '' | undefined,
    swpVal: number | '' | undefined,
    othVal: number | '' | undefined,
    grossVal: number | '' | undefined
  ) => {
    const comm = Number(commVal || 0);
    const swp = Number(swpVal || 0);
    const oth = Number(othVal || 0);
    const gross = Number(grossVal || 0);

    const totFees = calculateTotalFees(comm, swp, oth, 0);
    const net = calculateNetPnl(gross, totFees);

    setFormData((prev) => ({
      ...prev,
      commission: commVal ?? '',
      swap: swpVal ?? '',
      other_fees: othVal ?? '',
      gross_pnl: grossVal ?? '',
      fees: totFees,
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

    const cleanSymbol = formData.instrument.trim().toUpperCase();

    if (!cleanSymbol) {
      setError('Please enter a valid symbol (e.g. EURUSD, GBPUSD, XAUUSD).');
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
    if (formData.lot_size === '' || Number(formData.lot_size || formData.quantity) <= 0) {
      setError('Please enter a valid positive lot size.');
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
        instrument: cleanSymbol,
        strategy: formData.strategy?.trim() || '',
        quantity: Number(formData.lot_size || formData.quantity),
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

  const currentTotalFees = calculateTotalFees(
    Number(formData.commission || 0),
    Number(formData.swap || 0),
    Number(formData.other_fees || 0),
    0
  );
  const currentNetPnl = calculateNetPnl(Number(formData.gross_pnl || 0), currentTotalFees);
  const pipInfo = getPipSize(formData.instrument);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#12151A] border border-[#272C35] rounded-2xl w-full max-w-2xl my-6 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#272C35] bg-[#0D0F12] shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F4F5F7]">
              {tradeToEdit ? 'Edit Forex Trade' : 'Add New Forex Trade'}
            </h2>
            <p className="text-xs text-[#969EAB]">Date: {formData.trade_date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-[#F4F5F7]">
          {error && (
            <div className="p-3 bg-[#FF647C]/10 border border-[#FF647C]/20 rounded-xl text-[#FF647C] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#FF647C]" />
              <span>{error}</span>
            </div>
          )}

          {/* Section A: Forex Instrument & Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white border-b border-[#272C35] pb-1.5">
              A. Trade Details & Symbol
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Date</label>
                <input
                  type="date"
                  value={formData.trade_date}
                  onChange={(e) => setFormData({ ...formData, trade_date: e.target.value })}
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Time (Optional)</label>
                <input
                  type="time"
                  value={formData.trade_time || ''}
                  onChange={(e) => setFormData({ ...formData, trade_time: e.target.value })}
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Forex Pair / Symbol</label>
                <input
                  type="text"
                  value={formData.instrument}
                  onChange={(e) => setFormData({ ...formData, instrument: e.target.value.toUpperCase() })}
                  placeholder="Enter pair, e.g. EURUSD, GBPUSD, XAUUSD"
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] font-semibold uppercase focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-mono tracking-wider"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Market Category</label>
                <select
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value as MarketType })}
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
                >
                  {FOREX_MARKETS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Trade Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, direction: 'Long' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.direction === 'Long'
                        ? 'bg-[#20C997]/20 border-[#20C997] text-[#20C997] shadow-sm'
                        : 'bg-[#181C23] border-[#272C35] text-[#969EAB] hover:text-[#F4F5F7]'
                    }`}
                  >
                    ▲ Buy (Long)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, direction: 'Short' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.direction === 'Short'
                        ? 'bg-[#FF647C]/20 border-[#FF647C] text-[#FF647C] shadow-sm'
                        : 'bg-[#181C23] border-[#272C35] text-[#969EAB] hover:text-[#F4F5F7]'
                    }`}
                  >
                    ▼ Sell (Short)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Forex Execution & Lots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#272C35] pb-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                B. Execution & Lot Size
              </h3>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                <Calculator size={13} className="text-white" />
                <span>Auto Pip Calc Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Entry Price</label>
                <input
                  type="number"
                  step="any"
                  value={formData.entry_price}
                  onChange={(e) =>
                    setFormData({ ...formData, entry_price: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="1.08500"
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={formData.exit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, exit_price: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="1.09000"
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Lot Size</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lot_size ?? formData.quantity}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setFormData({ ...formData, lot_size: val, quantity: val });
                  }}
                  placeholder="1.00"
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-semibold"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-[#969EAB]">Pips</label>
                  {pipInfo.label && (
                    <span className="text-[10px] text-slate-400 font-mono">{pipInfo.label}</span>
                  )}
                </div>
                <input
                  type="number"
                  step="any"
                  value={formData.pips ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, pips: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="+50.0"
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section C: Risk Management (Stop Loss & Take Profit) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white border-b border-[#272C35] pb-1.5">
              C. Risk Management (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Stop Loss (Price)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.stop_loss ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, stop_loss: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="e.g. 1.08200"
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Take Profit (Target)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.target ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="e.g. 1.09200"
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section D: Forex PnL & Fee Breakdown ($ USD) */}
          <div className="space-y-3 bg-[#0D0F12] p-4 rounded-xl border border-[#272C35]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white border-b border-[#272C35] pb-2">
              D. Realized Result & Forex Fees Breakdown ($ USD)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Gross P&L ($)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.gross_pnl}
                  onChange={(e) =>
                    handleFeesChange(
                      formData.commission,
                      formData.swap,
                      formData.other_fees,
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="500"
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Commission ($)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.commission ?? ''}
                  onChange={(e) =>
                    handleFeesChange(
                      e.target.value === '' ? '' : Number(e.target.value),
                      formData.swap,
                      formData.other_fees,
                      formData.gross_pnl
                    )
                  }
                  placeholder="7.00"
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Swap / Financing ($)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.swap ?? ''}
                  onChange={(e) =>
                    handleFeesChange(
                      formData.commission,
                      e.target.value === '' ? '' : Number(e.target.value),
                      formData.other_fees,
                      formData.gross_pnl
                    )
                  }
                  placeholder="2.50"
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Net Realized P&L</label>
                <div
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    currentNetPnl > 0
                      ? 'bg-[#20C997]/10 border-[#20C997]/30 text-[#20C997]'
                      : currentNetPnl < 0
                      ? 'bg-[#FF647C]/10 border-[#FF647C]/30 text-[#FF647C]'
                      : 'bg-[#181C23] border-[#272C35] text-[#969EAB]'
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white border-b border-[#272C35] pb-1.5">
              E. Strategy & Trade Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Trading Strategy</label>
                <input
                  type="text"
                  value={formData.strategy || ''}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  placeholder="Enter strategy, e.g. Liquidity Sweep"
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969EAB] mb-1">Setup / Pattern</label>
                <input
                  type="text"
                  value={formData.setup}
                  onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                  placeholder="e.g. London Sweep, H&S Pattern"
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#969EAB] mb-1">Trade Notes / Psychological Review</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Market context, session state, emotions during trade..."
                className="w-full bg-[#181C23] border border-[#272C35] rounded-xl px-3 py-2 text-xs text-[#F4F5F7] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Section F: Screenshot Attachment */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white border-b border-[#272C35] pb-1.5">
              F. Screenshot Attachment (Optional)
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto cursor-pointer bg-[#181C23] hover:bg-[#272C35] border border-dashed border-[#272C35] hover:border-white/40 rounded-xl px-4 py-3 text-center transition-all flex items-center justify-center gap-2 text-xs text-[#969EAB] hover:text-[#F4F5F7]">
                <Upload size={16} className="text-white" />
                <span>Upload Chart Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {screenshotPreview && (
                <div className="relative group w-20 h-14 rounded-xl overflow-hidden border border-[#272C35] bg-[#0D0F12] shrink-0">
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
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FF647C] transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#272C35] bg-[#0D0F12] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#181C23] hover:bg-[#272C35] text-[#969EAB] hover:text-[#F4F5F7] rounded-xl text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="px-5 py-2 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow"
          >
            {saving ? (
              <span>Saving Trade...</span>
            ) : (
              <span>{tradeToEdit ? 'Update Forex Trade' : 'Save Forex Trade'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
