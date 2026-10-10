import React from 'react';
import { Calendar, LayoutDashboard, TrendingUp, LogOut, Plus, User } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';

export type ActiveTab = 'calendar' | 'dashboard';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
  onOpenAddTrade?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenProfile,
  onOpenAddTrade,
}) => {
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Trader';

  return (
    <>
      {/* Top Application Header */}
      <header className="bg-[#0D0F12] border-b border-[#272C35] sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="font-bold text-[#F4F5F7] text-base tracking-tight block leading-none">
                PipLedger
              </span>
              <span className="text-[10px] text-[#969EAB] tracking-wider uppercase font-semibold">
                Forex Terminal
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#12151A] p-1 rounded-xl border border-[#272C35]">
            <button
              onClick={() => onTabChange('calendar')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23]'
              }`}
            >
              <Calendar size={15} />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23]'
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* User Account Menu (Desktop & Mobile Top Right) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#12151A] border border-[#272C35] hover:border-white/40 text-[#F4F5F7] text-xs font-medium transition-all"
              title="Profile & Settings"
            >
              <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold border border-white/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline-block max-w-[120px] truncate">{displayName}</span>
            </button>

            <button
              onClick={signOut}
              className="p-2 text-[#969EAB] hover:text-[#FF647C] hover:bg-[#FF647C]/10 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0F12]/95 backdrop-blur-lg border-t border-[#272C35] pb-[env(safe-area-inset-bottom,8px)] px-3 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onTabChange('calendar')}
          className={`flex flex-col items-center gap-1 min-w-[64px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
            activeTab === 'calendar'
              ? 'text-white font-bold'
              : 'text-[#969EAB] hover:text-[#F4F5F7]'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'calendar' ? 'bg-white/10' : ''}`}>
            <Calendar size={18} />
          </div>
          <span>Calendar</span>
        </button>

        {onOpenAddTrade && (
          <button
            onClick={onOpenAddTrade}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-white text-black font-bold shadow-lg shadow-white/20 -mt-5 hover:scale-105 active:scale-95 transition-all"
            title="Add Trade"
          >
            <Plus size={22} />
          </button>
        )}

        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-1 min-w-[64px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'text-white font-bold'
              : 'text-[#969EAB] hover:text-[#F4F5F7]'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-white/10' : ''}`}>
            <LayoutDashboard size={18} />
          </div>
          <span>Dashboard</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 min-w-[64px] py-1 px-2 rounded-xl text-[10px] font-semibold text-[#969EAB] hover:text-[#F4F5F7] transition-all"
        >
          <div className="p-1 rounded-lg">
            <User size={18} />
          </div>
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
};
