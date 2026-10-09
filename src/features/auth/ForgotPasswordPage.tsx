import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { TrendingUp, AlertCircle, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env');
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccessMsg('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#08090B]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#8170FF]/15 border border-[#8170FF]/30 flex items-center justify-center text-[#8170FF] mb-3 shadow-xl shadow-[#8170FF]/10">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#F4F5F7] tracking-tight">Reset Password</h1>
          <p className="text-xs text-[#969EAB] mt-1">Enter your email to receive recovery instructions</p>
        </div>

        <div className="bg-[#12151A] border border-[#272C35] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#FF647C]/10 border border-[#FF647C]/20 text-[#FF647C] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#FF647C]" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-[#20C997]/10 border border-[#20C997]/20 text-[#20C997] text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-[#20C997]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#969EAB] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#969EAB]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@example.com"
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F4F5F7] placeholder-[#969EAB]/50 focus:outline-none focus:border-[#8170FF] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8170FF] hover:bg-[#6C56FF] disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#8170FF]/20"
            >
              {loading ? 'Sending email...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#272C35] text-center">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-[#969EAB] hover:text-[#F4F5F7] transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
