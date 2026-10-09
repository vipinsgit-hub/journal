import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({
  title = 'No trades recorded',
  description = 'Start logging your trades to build your journal and see performance analytics.',
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#111827]/60 border border-dashed border-slate-800 rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-3">
        {icon || <Inbox size={22} />}
      </div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading trade data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <RefreshCw size={24} className="animate-spin text-indigo-500 mb-3" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-3 text-xs">
      <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
      <div className="flex-1">
        <p className="font-semibold text-rose-200">Something went wrong</p>
        <p className="mt-0.5 text-rose-300">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded text-xs font-medium transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
