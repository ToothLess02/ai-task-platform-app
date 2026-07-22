import React from 'react';
import { Cpu, LogOut, User, Sparkles, ShieldCheck, Activity } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
              <Cpu className="h-5 w-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                TaskPulse AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-inner">
                GitOps MERN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Enterprise AI Processing Pipeline</p>
          </div>
        </div>

        {/* Right Section: System Live Status & User Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Cluster Healthy</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-medium text-slate-200">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all shadow-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="glow-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all"
            >
              <User className="h-4 w-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
