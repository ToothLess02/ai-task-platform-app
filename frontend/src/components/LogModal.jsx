import React from 'react';
import { X, Terminal, CheckCircle2, Clock, AlertTriangle, FileCode } from 'lucide-react';

export default function LogModal({ task, isOpen, onClose }) {
  if (!isOpen || !task) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Success
          </span>
        );
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
            <Clock className="h-3.5 w-3.5 animate-spin" />
            Running
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-bold text-white">{task.title}</h2>
              {getStatusBadge(task.status)}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              ID: {task._id} • Operation: <span className="text-indigo-400 font-semibold">{task.operationType}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {/* Input & Output Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Input Text Payload
              </span>
              <p className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-850 break-words">
                {task.inputText}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Execution Result
              </span>
              {task.result ? (
                <p className="text-xs font-mono text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-emerald-500/20 break-words font-medium">
                  {task.result}
                </p>
              ) : (
                <p className="text-xs font-mono text-slate-500 italic bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  {task.status === 'Pending' ? 'Waiting in Redis queue...' : 'Processing in Python worker...'}
                </p>
              )}
            </div>
          </div>

          {/* Execution Logs */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span>Worker Execution Logs</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Duration: {task.executionTimeMs || 0} ms
              </span>
            </div>
            <div className="p-3 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
              {task.logs && task.logs.length > 0 ? (
                task.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`font-semibold shrink-0 ${
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
                <div className="text-slate-500 italic">No logs recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
