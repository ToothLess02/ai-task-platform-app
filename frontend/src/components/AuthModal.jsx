import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, apiUrl }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      
      onAuthSuccess(userData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Make sure backend API is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-full"></div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {isLogin
                ? 'Enter your credentials to manage AI tasks'
                : 'Register to start queuing asynchronous tasks'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sujay Dey"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold text-white shadow-lg transition disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In to Platform' : 'Register Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? "Don't have an account? " : 'Already registered? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
          >
            {isLogin ? 'Create one now' : 'Log in here'}
          </button>
        </div>
      </div>
    </div>
  );
}
