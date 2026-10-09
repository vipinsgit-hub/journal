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
    <div className={`bg-[#12151A] border border-[#272C35] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl transition-all hover:border-[#8170FF]/40 ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-[#969EAB] uppercase tracking-wider">{label}</span>
        {icon && <div className="text-[#8170FF] p-1.5 rounded-xl bg-[#181C23] border border-[#272C35]">{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="text-xl sm:text-2xl font-bold text-[#F4F5F7]">{value}</div>
        {subtitle && <p className="text-xs text-[#969EAB]/80 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
