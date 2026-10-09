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
    <header className="bg-[#0D0F12] border-b border-[#272C35] sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8170FF]/15 border border-[#8170FF]/30 flex items-center justify-center text-[#8170FF] shadow-sm">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="font-bold text-[#F4F5F7] text-base tracking-tight block leading-none">
              Trading Journal
            </span>
            <span className="text-[10px] text-[#969EAB] tracking-wider uppercase font-semibold">
              Forex Terminal
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="flex items-center gap-1 bg-[#12151A] p-1 rounded-xl border border-[#272C35]">
          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-[#8170FF] text-white shadow-sm shadow-[#8170FF]/20'
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
                ? 'bg-[#8170FF] text-white shadow-sm shadow-[#8170FF]/20'
                : 'text-[#969EAB] hover:text-[#F4F5F7] hover:bg-[#181C23]'
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12151A] border border-[#272C35] hover:border-[#8170FF]/50 text-[#F4F5F7] text-xs font-medium transition-all"
            title="Profile & Settings"
          >
            <div className="w-6 h-6 rounded-full bg-[#8170FF]/20 text-[#8170FF] flex items-center justify-center text-[10px] font-bold border border-[#8170FF]/30">
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
  );
};
