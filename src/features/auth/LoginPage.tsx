import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { TrendingUp, AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onDemoLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onDemoLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      if (onDemoLogin) {
        onDemoLogin();
      } else {
        setError('Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.');
      }
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#08090B]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#8170FF]/15 border border-[#8170FF]/30 flex items-center justify-center text-[#8170FF] mb-3 shadow-xl shadow-[#8170FF]/10">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[#F4F5F7] tracking-tight">Forex Trading Journal</h1>
          <p className="text-xs text-[#969EAB] mt-1">Sign in to your personal trading journal</p>
        </div>

        {/* Unconfigured Warning Banner */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200">Supabase Not Configured</p>
              <p className="mt-1">
                Add <code className="bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/20 text-amber-200">VITE_SUPABASE_URL</code> and <code className="bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/20 text-amber-200">VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code className="bg-amber-950/60 px-1 py-0.5 rounded">.env</code> to enable live database auth.
              </p>
              {onDemoLogin && (
                <button
                  type="button"
                  onClick={onDemoLogin}
                  className="mt-2 text-xs text-[#8170FF] underline hover:text-[#6C56FF] transition-colors font-medium inline-block"
                >
                  Click here to explore with Demo Mode
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-[#12151A] border border-[#272C35] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#FF647C]/10 border border-[#FF647C]/20 text-[#FF647C] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#FF647C]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-[#969EAB]">Password</label>
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="text-xs text-[#8170FF] hover:text-[#6C56FF] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#969EAB]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#181C23] border border-[#272C35] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F4F5F7] placeholder-[#969EAB]/50 focus:outline-none focus:border-[#8170FF] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#8170FF] hover:bg-[#6C56FF] disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#8170FF]/20"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-[#272C35] text-center">
            <p className="text-xs text-[#969EAB]">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-[#8170FF] hover:text-[#6C56FF] font-semibold transition-colors ml-1"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
