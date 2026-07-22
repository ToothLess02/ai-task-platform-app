import React, { useState } from 'react';
import { X, Play, FileText, Type, Sparkles, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create New AI Task</h2>
            <p className="text-xs text-slate-400">Task will be queued to Redis for Python background processing</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
            <div className="relative">
              <Type className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Process Customer Feedback String"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Operation Type</label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="Uppercase">Uppercase (Convert text to UPPERCASE)</option>
              <option value="Lowercase">Lowercase (Convert text to lowercase)</option>
              <option value="Reverse String">Reverse String (Reverse input characters)</option>
              <option value="Word Count">Word Count (Calculate total word count)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Input Payload / Text</label>
            <div className="relative">
              <textarea
                required
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter string content to process..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glow-button flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
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
