import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { Navigation, type ActiveTab } from './components/layout/Navigation';
import { ProfileModal } from './components/layout/ProfileModal';
import { TradingCalendar } from './components/calendar/TradingCalendar';
import { TradingDashboard } from './components/dashboard/TradingDashboard';
import { tradeService } from './features/trades/tradeService';
import type { Trade } from './types/trade';
import { LoadingState, ErrorState } from './components/shared/States';

// Initial sample Forex trades for demo mode preview if no live data present
const DEMO_INITIAL_TRADES: Trade[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    trade_date: new Date().toISOString().split('T')[0],
    trade_time: '14:30',
    instrument: 'EUR/USD',
    market: 'Forex Major',
    direction: 'Long',
    entry_price: 1.0850,
    exit_price: 1.0910,
    quantity: 1.0, // 1 Lot
    lot_size: 1.0,
    contract_size: 100000,
    stop_loss: 1.0820,
    target: 1.0920,
    gross_pnl: 600,
    commission: 7,
    swap: 2,
    other_fees: 0,
    fees: 9,
    net_pnl: 591,
    pips: 60,
    strategy: 'Breakout',
    setup: 'London Session High Breakout',
    notes: 'Strong volume expansion on 15m timeframe.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    trade_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    trade_time: '18:15',
    instrument: 'GBP/JPY',
    market: 'Forex Minor',
    direction: 'Short',
    entry_price: 198.50,
    exit_price: 198.95,
    quantity: 0.5,
    lot_size: 0.5,
    contract_size: 100000,
    stop_loss: 198.20,
    target: 197.80,
    gross_pnl: -180,
    commission: 3.5,
    swap: 1.5,
    other_fees: 0,
    fees: 5,
    net_pnl: -185,
    pips: -45,
    strategy: 'Reversal',
    setup: 'Daily Resistance Rejection',
    notes: 'Exited on momentum shift.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    trade_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    trade_time: '09:45',
    instrument: 'XAU/USD',
    market: 'Metals (XAU/XAG)',
    direction: 'Long',
    entry_price: 2650.00,
    exit_price: 2665.50,
    quantity: 0.2,
    lot_size: 0.2,
    contract_size: 100,
    stop_loss: 2642.00,
    target: 2670.00,
    gross_pnl: 310,
    commission: 4,
    swap: 0,
    other_fees: 0,
    fees: 4,
    net_pnl: 306,
    pips: 155,
    strategy: 'Trend Following',
    setup: 'VWAP Hold & NY Open Momentum',
    notes: 'Clean continuation pattern on Gold.',
    created_at: new Date().toISOString(),
  },
];

const MainAppContent: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();

  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [demoMode, setDemoMode] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [tradesError, setTradesError] = useState<string | null>(null);

  const effectiveUserId = user?.id || (demoMode ? 'demo-user' : null);
  const preferredCurrency = profile?.preferred_currency || 'INR';

  // Fetch trades when user or demoMode changes
  const loadTrades = async () => {
    if (!effectiveUserId) return;

    setTradesLoading(true);
    setTradesError(null);
    try {
      const data = await tradeService.fetchTrades(effectiveUserId);
      if (demoMode && data.length === 0) {
        setTrades(DEMO_INITIAL_TRADES);
      } else {
        setTrades(data);
      }
    } catch (err: any) {
      setTradesError(err.message || 'Failed to load trading records.');
    } finally {
      setTradesLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveUserId) {
      loadTrades();
    }
  }, [effectiveUserId]);

  const handleDeleteTrade = async (tradeId: string) => {
    if (!effectiveUserId) return;
    try {
      await tradeService.deleteTrade(tradeId, effectiveUserId);
      await loadTrades();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08090B] flex items-center justify-center">
        <LoadingState message="Initializing Forex Trading Journal..." />
      </div>
    );
  }

  // If not logged in and not in demo mode, show Auth pages
  if (!user && !demoMode) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot_password') {
      return <ForgotPasswordPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onNavigateToRegister={() => setAuthView('register')}
        onNavigateToForgotPassword={() => setAuthView('forgot_password')}
        onDemoLogin={() => setDemoMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F4F5F7] flex flex-col font-sans">
      {/* Top Application Header Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1">
        {tradesLoading && trades.length === 0 ? (
          <LoadingState message="Loading Forex journal records..." />
        ) : tradesError ? (
          <div className="max-w-xl mx-auto mt-12 px-4">
            <ErrorState message={tradesError} onRetry={loadTrades} />
          </div>
        ) : activeTab === 'calendar' ? (
          <TradingCalendar
            userId={effectiveUserId!}
            trades={trades}
            onTradeSaved={loadTrades}
            onDeleteTrade={handleDeleteTrade}
            preferredCurrency={preferredCurrency}
          />
        ) : (
          <TradingDashboard trades={trades} preferredCurrency={preferredCurrency} />
        )}
      </main>

      {/* Account Preferences Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
