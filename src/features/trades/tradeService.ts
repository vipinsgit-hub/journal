import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Trade, TradeFormData } from '../../types/trade';
import { calculateNetPnl, calculateTotalFees } from './tradeCalculations';

const LOCAL_STORAGE_TRADES_KEY = 'trading_journal_demo_trades';

// Helper for local demo storage
function getLocalTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRADES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTrades(trades: Trade[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TRADES_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

export const tradeService = {
  async fetchTrades(userId: string): Promise<Trade[]> {
    if (!isSupabaseConfigured) {
      return getLocalTrades();
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
      throw new Error(error.message);
    }

    return (data || []).map(formatTradeFromDb);
  },

  async createTrade(userId: string, formData: TradeFormData): Promise<Trade> {
    const grossPnl = Number(formData.gross_pnl);
    const commission = formData.commission !== '' && formData.commission !== undefined ? Number(formData.commission) : 0;
    const swap = formData.swap !== '' && formData.swap !== undefined ? Number(formData.swap) : 0;
    const otherFees = formData.other_fees !== '' && formData.other_fees !== undefined ? Number(formData.other_fees) : 0;
    const legacyFees = formData.fees !== '' && formData.fees !== undefined ? Number(formData.fees) : 0;

    const totalFees = calculateTotalFees(commission, swap, otherFees, legacyFees);
    const netPnl = calculateNetPnl(grossPnl, totalFees);

    const fullPayload = {
      user_id: userId,
      trade_date: formData.trade_date,
      trade_time: formData.trade_time || null,
      instrument: formData.instrument,
      market: formData.market,
      direction: formData.direction,
      entry_price: Number(formData.entry_price),
      exit_price: Number(formData.exit_price),
      quantity: Number(formData.quantity),
      lot_size: formData.lot_size !== '' && formData.lot_size !== undefined ? Number(formData.lot_size) : Number(formData.quantity),
      contract_size: formData.contract_size !== '' && formData.contract_size !== undefined ? Number(formData.contract_size) : 100000,
      stop_loss: formData.stop_loss ? Number(formData.stop_loss) : null,
      target: formData.target ? Number(formData.target) : null,
      gross_pnl: grossPnl,
      commission: commission,
      swap: swap,
      other_fees: otherFees,
      fees: totalFees,
      net_pnl: netPnl,
      pips: formData.pips !== '' && formData.pips !== undefined ? Number(formData.pips) : null,
      strategy: formData.strategy || null,
      setup: formData.setup || null,
      notes: formData.notes || null,
      screenshot_path: formData.screenshot_path || null,
    };

    if (!isSupabaseConfigured) {
      const demoTrade: Trade = {
        ...fullPayload,
        id: 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = getLocalTrades();
      saveLocalTrades([demoTrade, ...existing]);
      return demoTrade;
    }

    // Attempt insert with full Forex payload
    const { data, error } = await supabase
      .from('trades')
      .insert(fullPayload)
      .select()
      .single();

    if (error) {
      console.warn('Error creating trade with full Forex columns:', error.message);

      // Check if error is due to missing Forex columns on un-migrated DB
      if (error.message.includes('schema cache') || error.message.includes('column') || error.code === 'PGRST204') {
        const fallbackPayload = {
          user_id: userId,
          trade_date: formData.trade_date,
          instrument: formData.instrument,
          market: formData.market,
          direction: formData.direction,
          entry_price: Number(formData.entry_price),
          exit_price: Number(formData.exit_price),
          quantity: Number(formData.quantity),
          stop_loss: formData.stop_loss ? Number(formData.stop_loss) : null,
          target: formData.target ? Number(formData.target) : null,
          gross_pnl: grossPnl,
          fees: totalFees,
          net_pnl: netPnl,
          strategy: formData.strategy || null,
          setup: formData.setup || null,
          notes: formData.notes || null,
          screenshot_path: formData.screenshot_path || null,
        };

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('trades')
          .insert(fallbackPayload)
          .select()
          .single();

        if (fallbackError) {
          console.error('Error creating trade on fallback payload:', fallbackError);
          throw new Error(fallbackError.message);
        }

        return formatTradeFromDb({
          ...fallbackData,
          commission: commission,
          swap: swap,
          other_fees: otherFees,
          lot_size: fullPayload.lot_size,
          contract_size: fullPayload.contract_size,
          pips: fullPayload.pips,
          trade_time: fullPayload.trade_time,
        });
      }

      throw new Error(error.message);
    }

    return formatTradeFromDb(data);
  },

  async updateTrade(tradeId: string, userId: string, formData: TradeFormData): Promise<Trade> {
    const grossPnl = Number(formData.gross_pnl);
    const commission = formData.commission !== '' && formData.commission !== undefined ? Number(formData.commission) : 0;
    const swap = formData.swap !== '' && formData.swap !== undefined ? Number(formData.swap) : 0;
    const otherFees = formData.other_fees !== '' && formData.other_fees !== undefined ? Number(formData.other_fees) : 0;
    const legacyFees = formData.fees !== '' && formData.fees !== undefined ? Number(formData.fees) : 0;

    const totalFees = calculateTotalFees(commission, swap, otherFees, legacyFees);
    const netPnl = calculateNetPnl(grossPnl, totalFees);

    const fullPayload = {
      trade_date: formData.trade_date,
      trade_time: formData.trade_time || null,
      instrument: formData.instrument,
      market: formData.market,
      direction: formData.direction,
      entry_price: Number(formData.entry_price),
      exit_price: Number(formData.exit_price),
      quantity: Number(formData.quantity),
      lot_size: formData.lot_size !== '' && formData.lot_size !== undefined ? Number(formData.lot_size) : Number(formData.quantity),
      contract_size: formData.contract_size !== '' && formData.contract_size !== undefined ? Number(formData.contract_size) : 100000,
      stop_loss: formData.stop_loss ? Number(formData.stop_loss) : null,
      target: formData.target ? Number(formData.target) : null,
      gross_pnl: grossPnl,
      commission: commission,
      swap: swap,
      other_fees: otherFees,
      fees: totalFees,
      net_pnl: netPnl,
      pips: formData.pips !== '' && formData.pips !== undefined ? Number(formData.pips) : null,
      strategy: formData.strategy || null,
      setup: formData.setup || null,
      notes: formData.notes || null,
      screenshot_path: formData.screenshot_path || null,
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      const existing = getLocalTrades();
      const index = existing.findIndex((t) => t.id === tradeId);
      if (index !== -1) {
        const updated = { ...existing[index], ...fullPayload };
        existing[index] = updated;
        saveLocalTrades(existing);
        return updated;
      }
      throw new Error('Trade not found locally');
    }

    const { data, error } = await supabase
      .from('trades')
      .update(fullPayload)
      .eq('id', tradeId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Error updating trade with full Forex columns:', error.message);

      if (error.message.includes('schema cache') || error.message.includes('column') || error.code === 'PGRST204') {
        const fallbackPayload = {
          trade_date: formData.trade_date,
          instrument: formData.instrument,
          market: formData.market,
          direction: formData.direction,
          entry_price: Number(formData.entry_price),
          exit_price: Number(formData.exit_price),
          quantity: Number(formData.quantity),
          stop_loss: formData.stop_loss ? Number(formData.stop_loss) : null,
          target: formData.target ? Number(formData.target) : null,
          gross_pnl: grossPnl,
          fees: totalFees,
          net_pnl: netPnl,
          strategy: formData.strategy || null,
          setup: formData.setup || null,
          notes: formData.notes || null,
          screenshot_path: formData.screenshot_path || null,
          updated_at: new Date().toISOString(),
        };

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('trades')
          .update(fallbackPayload)
          .eq('id', tradeId)
          .eq('user_id', userId)
          .select()
          .maybeSingle();

        if (fallbackError) {
          console.error('Error updating trade on fallback payload:', fallbackError);
          throw new Error(fallbackError.message);
        }

        if (!fallbackData) {
          throw new Error('Failed to update trade record.');
        }

        return formatTradeFromDb({
          ...fallbackData,
          commission: commission,
          swap: swap,
          other_fees: otherFees,
          lot_size: fullPayload.lot_size,
          contract_size: fullPayload.contract_size,
          pips: fullPayload.pips,
          trade_time: fullPayload.trade_time,
        });
      }

      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to update trade record.');
    }

    return formatTradeFromDb(data);
  },

  async deleteTrade(tradeId: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const existing = getLocalTrades();
      const filtered = existing.filter((t) => t.id !== tradeId);
      saveLocalTrades(filtered);
      return;
    }

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting trade:', error);
      throw new Error(error.message);
    }
  },

  async uploadScreenshot(userId: string, file: File): Promise<string> {
    if (!isSupabaseConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('trade-screenshots')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Error uploading screenshot:', error);
      throw new Error(error.message);
    }

    return fileName;
  },

  async getScreenshotUrl(path: string): Promise<string | null> {
    if (!path) return null;
    if (path.startsWith('data:')) return path;

    if (!isSupabaseConfigured) return path;

    const { data } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(path, 3600);

    return data?.signedUrl || null;
  },
};

function formatTradeFromDb(row: any): Trade {
  const comm = row.commission !== null && row.commission !== undefined ? Number(row.commission) : 0;
  const swp = row.swap !== null && row.swap !== undefined ? Number(row.swap) : 0;
  const oth = row.other_fees !== null && row.other_fees !== undefined ? Number(row.other_fees) : 0;
  const legacyFees = row.fees !== null && row.fees !== undefined ? Number(row.fees) : 0;

  const totalFees = calculateTotalFees(comm, swp, oth, legacyFees);

  return {
    id: row.id,
    user_id: row.user_id,
    trade_date: row.trade_date,
    trade_time: row.trade_time,
    instrument: row.instrument,
    market: row.market || 'Forex Major',
    direction: row.direction,
    entry_price: Number(row.entry_price),
    exit_price: Number(row.exit_price),
    quantity: Number(row.quantity),
    lot_size: row.lot_size !== null && row.lot_size !== undefined ? Number(row.lot_size) : Number(row.quantity),
    contract_size: row.contract_size !== null && row.contract_size !== undefined ? Number(row.contract_size) : 100000,
    stop_loss: row.stop_loss !== null && row.stop_loss !== undefined ? Number(row.stop_loss) : null,
    target: row.target !== null && row.target !== undefined ? Number(row.target) : null,
    gross_pnl: Number(row.gross_pnl),
    commission: comm,
    swap: swp,
    other_fees: oth,
    fees: totalFees,
    net_pnl: Number(row.net_pnl),
    pips: row.pips !== null && row.pips !== undefined ? Number(row.pips) : null,
    strategy: row.strategy,
    setup: row.setup,
    notes: row.notes,
    screenshot_path: row.screenshot_path,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
