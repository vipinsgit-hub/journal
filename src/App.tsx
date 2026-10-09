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

// Initial sample trades for demo mode preview if no live data present
const DEMO_INITIAL_TRADES: Trade[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    trade_date: new Date().toISOString().split('T')[0],
    instrument: 'NIFTY 25000 CE',
    market: 'Options',
    direction: 'Long',
    entry_price: 140,
    exit_price: 185,
    quantity: 50,
    stop_loss: 120,
    target: 190,
    gross_pnl: 2250,
    fees: 40,
    net_pnl: 2210,
    strategy: 'Breakout',
    setup: 'Opening Range Breakout',
    notes: 'Strong volume confirmation on 5m chart.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    trade_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    instrument: 'BANKNIFTY 52000 PE',
    market: 'Options',
    direction: 'Short',
    entry_price: 320,
    exit_price: 345,
    quantity: 30,
    stop_loss: 300,
    target: 360,
    gross_pnl: -750,
    fees: 35,
    net_pnl: -785,
    strategy: 'Reversal',
    setup: 'Resistance Rejection',
    notes: 'Exited early as momentum shifted.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    trade_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    instrument: 'RELIANCE',
    market: 'Equity',
    direction: 'Long',
    entry_price: 2750,
    exit_price: 2810,
    quantity: 25,
    stop_loss: 2720,
    target: 2850,
    gross_pnl: 1500,
    fees: 25,
    net_pnl: 1475,
    strategy: 'Trend Following',
    setup: 'VWAP Hold',
    notes: 'Clean trend day.',
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
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <LoadingState message="Initializing Trading Journal..." />
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Application Header Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1">
        {tradesLoading && trades.length === 0 ? (
          <LoadingState message="Loading journal records..." />
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
