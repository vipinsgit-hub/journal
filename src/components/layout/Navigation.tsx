import React from 'react';
import { Calendar, LayoutDashboard, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';

export type ActiveTab = 'calendar' | 'dashboard';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenProfile,
}) => {
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Trader';

  return (
    <header className="bg-[#0D1322] border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-base tracking-tight block leading-none">
              Trading Journal
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
              Pro Analytics
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="flex items-center gap-1 bg-[#131B2E] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar size={15} />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* User Account Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#131B2E] border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-all"
            title="Profile & Settings"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold border border-indigo-500/30">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline-block max-w-[120px] truncate">{displayName}</span>
          </button>

          <button
            onClick={signOut}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
