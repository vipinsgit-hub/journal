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
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#12151A] border border-dashed border-[#272C35] rounded-2xl">
      <div className="w-12 h-12 rounded-2xl bg-[#181C23] border border-[#272C35] flex items-center justify-center text-[#8170FF] mb-3">
        {icon || <Inbox size={22} />}
      </div>
      <h3 className="text-sm font-semibold text-[#F4F5F7]">{title}</h3>
      <p className="text-xs text-[#969EAB] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading trade data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#969EAB]">
      <RefreshCw size={24} className="animate-spin text-[#8170FF] mb-3" />
      <span className="text-xs font-medium text-[#F4F5F7]">{message}</span>
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  const isTableMissing =
    message.toLowerCase().includes('could not find the table') ||
    message.toLowerCase().includes('schema cache') ||
    message.includes('PGRST204') ||
    message.includes('42P01');

  return (
    <div className="p-5 bg-[#FF647C]/10 border border-[#FF647C]/20 rounded-2xl text-[#FF647C] text-xs shadow-xl">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="shrink-0 mt-0.5 text-[#FF647C]" />
        <div className="flex-1 space-y-2">
          <p className="font-bold text-sm text-[#FF647C]">
            {isTableMissing ? 'Database Tables Not Found in Supabase' : 'Database Error'}
          </p>
          <p className="text-[#FF647C] leading-relaxed font-mono bg-[#0D0F12] p-2.5 rounded-xl border border-[#FF647C]/20 text-[11px]">
            {message}
          </p>

          {isTableMissing && (
            <div className="mt-3 p-4 bg-[#12151A] border border-[#272C35] rounded-xl text-[#F4F5F7] text-xs space-y-2.5">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>⚡ Action Required: Run Database Migration in Supabase</span>
              </p>
              <p className="text-[#969EAB] leading-relaxed">
                Your frontend is successfully connected to your Supabase project, but the PostgreSQL tables (<code className="bg-[#181C23] px-1.5 py-0.5 rounded text-[#8170FF] font-mono">public.trades</code> and <code className="bg-[#181C23] px-1.5 py-0.5 rounded text-[#8170FF] font-mono">public.profiles</code>) have not been created yet in your Supabase database.
              </p>
              <div className="bg-[#08090B] p-3 rounded-xl border border-[#272C35] space-y-1.5 text-[#969EAB]">
                <p className="font-semibold text-xs text-[#8170FF]">Quick 3-step setup:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px]">
                  <li>
                    Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#8170FF] underline font-bold hover:text-[#6C56FF]">Supabase SQL Editor</a> for project <code className="text-[#F4F5F7]">shgihvzkwprpmxcvbjfi</code>.
                  </li>
                  <li>
                    Copy the complete SQL query from <code className="bg-[#181C23] px-1 py-0.5 rounded text-[#8170FF] font-mono">supabase/migrations/001_initial_schema.sql</code> in this repository.
                  </li>
                  <li>
                    Paste into the SQL Editor and click <span className="bg-[#20C997] text-white px-1.5 py-0.5 rounded font-bold">RUN</span>, then click <strong>Retry Connection</strong> below.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {onRetry && (
            <div className="pt-2">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-[#8170FF] hover:bg-[#6C56FF] text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-md shadow-[#8170FF]/20"
              >
                <RefreshCw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
