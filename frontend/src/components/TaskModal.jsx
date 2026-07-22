import React, { useState } from 'react';
import { X, Play, Type, Sparkles, AlertCircle, Cpu } from 'lucide-react';
import axios from 'axios';

export default function TaskModal({ isOpen, onClose, onTaskCreated, apiUrl, token }) {
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operationType, setOperationType] = useState('Uppercase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/tasks`,
        { title, inputText, operationType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onTaskCreated(response.data);
      onClose();
      setTitle('');
      setInputText('');
      setOperationType('Uppercase');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit task to processing queue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-full"></div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Create AI Processing Task</h2>
            <p className="text-xs text-slate-400">Pushes payload to Redis queue for Python background worker execution</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Task Title</label>
            <div className="relative">
              <Type className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Process Customer Review String"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Supported Operation</label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium"
            >
              <option value="Uppercase">Uppercase (Convert text to UPPERCASE)</option>
              <option value="Lowercase">Lowercase (Convert text to lowercase)</option>
              <option value="Reverse String">Reverse String (Reverse sequence of characters)</option>
              <option value="Word Count">Word Count (Calculate total word count)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Input Payload / Text</label>
            <textarea
              required
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste the input payload here..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glow-btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-lg transition disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{loading ? 'Queuing Task...' : 'Run Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
