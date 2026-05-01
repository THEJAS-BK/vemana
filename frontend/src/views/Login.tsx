import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  Eye,
  EyeOff,
  LogIn,
  Info,
  Verified,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { api, saveAuth } from '../lib/api';

const DEMO_HINTS = [
  { email: 'admin@aethera.gov', password: 'admin', role: 'Administrator' },
  { email: 'auditor@aethera.gov', password: 'auditor', role: 'Auditor' },
  { email: 'public@aethera.gov', password: 'public', role: 'Institutional Observer' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fillDemo = (hint: typeof DEMO_HINTS[0]) => {
    setEmail(hint.email);
    setPassword(hint.password);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.login(email, password);
      saveAuth(res.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-secondary/20 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] animate-pulse duration-5000" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[100px] animate-pulse duration-7000 delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)]" />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-16 relative z-10">
        <div className="max-w-[480px] w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
          {/* Main Card */}
          <div className="glass-card overflow-hidden">
            <div className="px-12 py-10 text-center bg-white/5 border-b border-white/10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary-container/20 text-secondary rounded-2xl flex items-center justify-center border border-secondary/30 shadow-[0_0_20px_rgba(192,38,211,0.2)]">
                  <ShieldCheck size={36} />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Transparency Portal</h1>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] px-8 leading-relaxed">
                Public Fund Oversight & Institutional Integrity
              </p>
            </div>

            <div className="p-12 space-y-8">
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-xs font-bold text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.1em] mb-2" htmlFor="email">
                      Institutional Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@aethera.gov"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all hover:bg-white/10"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.1em]" htmlFor="password">
                        Security Credential
                      </label>
                    </div>
                    <div className="relative group">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all hover:bg-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-white/30 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full bg-secondary text-white py-4 rounded-xl shadow-[0_0_30px_rgba(192,38,211,0.2)] font-black text-sm uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all',
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary-container hover:shadow-secondary/40 hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={18} /> : (
                    <>Authorize Connection <LogIn size={18} /></>
                  )}
                </button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-surface text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Demo Accounts</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {DEMO_HINTS.map((h) => (
                  <button
                    key={h.email}
                    type="button"
                    onClick={() => fillDemo(h)}
                    className="flex flex-col items-center gap-1.5 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-secondary/30 transition-all group"
                  >
                    <span className="text-[9px] font-black text-secondary uppercase tracking-wider">{h.role}</span>
                    <span className="text-[9px] text-white/30 font-mono">{h.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="flex items-center space-x-2 text-white/40 font-black text-[10px] uppercase tracking-widest py-2 px-6 rounded-full border border-white/10 bg-white/5 shadow-inner backdrop-blur-md">
              <Verified size={14} className="text-emerald-500" />
              <span>AES-256 Protocol Verified Connection</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
