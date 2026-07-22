import React from 'react';
import { X, Terminal, CheckCircle2, Clock, AlertTriangle, Copy, Check } from 'lucide-react';

export default function LogModal({ task, isOpen, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !task) return null;

  const handleCopyResult = () => {
    if (task.result) {
      navigator.clipboard.writeText(task.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Success
          </span>
        );
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            Running
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">{task.title}</h2>
              {getStatusBadge(task.status)}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              ID: {task._id} • Operation: <span className="text-indigo-400 font-semibold">{task.operationType}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-5 space-y-4 flex-1 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Payload */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Input Payload
              </span>
              <p className="text-xs font-mono text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-850 break-all leading-relaxed">
                {task.inputText}
              </p>
            </div>

            {/* Output Result */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Output Result
                </span>
                {task.result && (
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              {task.result ? (
                <p className="text-xs font-mono text-emerald-400 bg-slate-950 p-3 rounded-xl border border-emerald-500/30 font-semibold break-all leading-relaxed">
                  {task.result}
                </p>
              ) : (
                <p className="text-xs font-mono text-slate-500 italic bg-slate-950 p-3 rounded-xl border border-slate-850">
                  {task.status === 'Pending' ? 'Waiting in Redis queue...' : 'Processing in Python worker...'}
                </p>
              )}
            </div>
          </div>

          {/* Execution Logs */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span>Python Worker Execution Logs</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md">
                Execution Time: {task.executionTimeMs || 0} ms
              </span>
            </div>
            <div className="p-4 font-mono text-[11px] space-y-2 max-h-52 overflow-y-auto leading-relaxed">
              {task.logs && task.logs.length > 0 ? (
                task.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-slate-500 shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`font-bold shrink-0 ${
                        log.level === 'ERROR'
                          ? 'text-red-400'
                          : log.level === 'WARN'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {log.level}:
                    </span>
                    <span className="text-slate-300 break-words">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic">No execution logs recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
