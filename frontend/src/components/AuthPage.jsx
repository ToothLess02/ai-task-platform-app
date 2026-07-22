import React, { useState } from 'react';
import { Cpu, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Sparkles, ShieldCheck, Zap, Layers, Server } from 'lucide-react';
import axios from 'axios';

export default function AuthPage({ onAuthSuccess, apiUrl }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const response = await axios.post(`${apiUrl}${endpoint}`, payload);
      const userData = response.data;
      
      localStorage.setItem('task_platform_token', userData.token);
      localStorage.setItem('task_platform_user', JSON.stringify(userData));
      
      // Trigger smooth authentication success unlock animation
      setIsSuccessAnim(true);
      setTimeout(() => {
        onAuthSuccess(userData);
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Check if Backend API is running on port 5000.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden transition-all duration-700 ${isSuccessAnim ? 'scale-105 opacity-0 blur-md' : 'opacity-100 scale-100'}`}>
      
      {/* Background Animated Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="w-full max-w-6xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-11 w-11 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
              <Cpu className="h-6 w-6 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                TaskPulse AI
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                GitOps MERN
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Enterprise AI Processing Platform</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>JWT Secured Auth</span>
        </div>
      </header>

      {/* Main Glassmorphic Auth Card */}
      <main className="w-full max-w-md my-auto z-10">
        <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-700/60 relative overflow-hidden">
          
          {/* Top Rainbow Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          {/* Form Title & Toggle */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-1">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {isLogin ? 'Access Platform' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-400">
              {isLogin
                ? 'Sign in to access your asynchronous AI task pipeline'
                : 'Register a new profile to start queuing computational tasks'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-400 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sujay Dey"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSuccessAnim}
              className="w-full glow-btn flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-xs font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In & Launch Dashboard' : 'Register Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer Feature Badges */}
      <footer className="w-full max-w-4xl z-10 py-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          <Server className="h-3.5 w-3.5 text-indigo-400" /> Node.js Express API
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          <Zap className="h-3.5 w-3.5 text-amber-400" /> Redis Queue
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          <Cpu className="h-3.5 w-3.5 text-cyan-400" /> Python Worker Service
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800">
          <Layers className="h-3.5 w-3.5 text-purple-400" /> Kubernetes & Argo CD GitOps
        </span>
      </footer>
    </div>
  );
}
