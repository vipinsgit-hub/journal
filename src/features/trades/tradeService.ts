import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Trade, TradeFormData } from '../../types/trade';
import { calculateNetPnl } from './tradeCalculations';

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
    const fees = Number(formData.fees || 0);
    const netPnl = calculateNetPnl(grossPnl, fees);

    const newTradePayload = {
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
      fees: fees,
      net_pnl: netPnl,
      strategy: formData.strategy || null,
      setup: formData.setup || null,
      notes: formData.notes || null,
      screenshot_path: formData.screenshot_path || null,
    };

    if (!isSupabaseConfigured) {
      const demoTrade: Trade = {
        ...newTradePayload,
        id: 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = getLocalTrades();
      saveLocalTrades([demoTrade, ...existing]);
      return demoTrade;
    }

    const { data, error } = await supabase
      .from('trades')
      .insert(newTradePayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating trade:', error);
      throw new Error(error.message);
    }

    return formatTradeFromDb(data);
  },

  async updateTrade(tradeId: string, userId: string, formData: TradeFormData): Promise<Trade> {
    const grossPnl = Number(formData.gross_pnl);
    const fees = Number(formData.fees || 0);
    const netPnl = calculateNetPnl(grossPnl, fees);

    const updatePayload = {
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
      fees: fees,
      net_pnl: netPnl,
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
        const updated = { ...existing[index], ...updatePayload };
        existing[index] = updated;
        saveLocalTrades(existing);
        return updated;
      }
      throw new Error('Trade not found locally');
    }

    const { data, error } = await supabase
      .from('trades')
      .update(updatePayload)
      .eq('id', tradeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating trade:', error);
      throw new Error(error.message);
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
      // Return data URL preview in demo mode
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
    if (path.startsWith('data:')) return path; // local preview

    if (!isSupabaseConfigured) return path;

    const { data } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(path, 3600);

    return data?.signedUrl || null;
  },
};

function formatTradeFromDb(row: any): Trade {
  return {
    id: row.id,
    user_id: row.user_id,
    trade_date: row.trade_date,
    instrument: row.instrument,
    market: row.market,
    direction: row.direction,
    entry_price: Number(row.entry_price),
    exit_price: Number(row.exit_price),
    quantity: Number(row.quantity),
    stop_loss: row.stop_loss !== null ? Number(row.stop_loss) : null,
    target: row.target !== null ? Number(row.target) : null,
    gross_pnl: Number(row.gross_pnl),
    fees: Number(row.fees),
    net_pnl: Number(row.net_pnl),
    strategy: row.strategy,
    setup: row.setup,
    notes: row.notes,
    screenshot_path: row.screenshot_path,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
