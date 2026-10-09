import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  className = '',
}) => {
  return (
    <div className={`bg-[#111827] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all hover:border-slate-700 ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-400 p-1.5 rounded-lg bg-slate-800/50">{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="text-xl sm:text-2xl font-bold text-slate-100">{value}</div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
