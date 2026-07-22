import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TaskModal from './components/TaskModal';
import LogModal from './components/LogModal';
import {
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Server
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Load user token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('task_platform_token');
    const savedUser = localStorage.getItem('task_platform_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
    }
  }, [token]);

  // Initial fetch and auto-polling every 3 seconds for async status updates
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchTasks().finally(() => setLoading(false));
      const interval = setInterval(fetchTasks, 3000);
      return () => clearInterval(interval);
    } else {
      setTasks([]);
    }
  }, [token, fetchTasks]);

  const handleLogout = () => {
    localStorage.removeItem('task_platform_token');
    localStorage.removeItem('task_platform_user');
    setToken('');
    setUser(null);
    setTasks([]);
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const runningCount = tasks.filter((t) => t.status === 'Running').length;
  const successCount = tasks.filter((t) => t.status === 'Success').length;
  const failedCount = tasks.filter((t) => t.status === 'Failed').length;

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.operationType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Hero */}
        <div className="relative rounded-2xl glass-panel p-6 sm:p-8 overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                <Zap className="h-3.5 w-3.5" />
                <span>Asynchronous Redis & Python Worker Processing</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Task Processing Pipeline
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Submit computational tasks asynchronously. Requests are queued in Redis, processed by Python worker pods, and synced seamlessly via Argo CD GitOps architecture.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <button
                  onClick={() => setIsTaskOpen(true)}
                  className="glow-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New AI Task</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="glow-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Sign In to Start</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="glass-card rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Tasks</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalTasks}</p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Pending Queue</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Running Workers</span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400">{runningCount}</p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Success</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{successCount}</p>
          </div>

          <div className="glass-card rounded-xl p-4 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Failed</span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{failedCount}</p>
          </div>
        </div>

        {/* Task Management Table / Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Task Executions</h2>
              <span className="text-xs text-slate-500 font-mono">({filteredTasks.length} items)</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by title/op..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                {['ALL', 'Pending', 'Running', 'Success', 'Failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchTasks}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                title="Refresh Tasks"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Task List Table */}
          {!user ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800/80 space-y-4">
              <Server className="h-12 w-12 text-indigo-400 mx-auto opacity-80" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Authentication Required</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Sign in or register to submit AI processing tasks and view real-time execution logs.
                </p>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="glow-button px-5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
              >
                Sign In Now
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800/80 space-y-3">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No tasks found matching your filter.</p>
              <button
                onClick={() => setIsTaskOpen(true)}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Create your first task →
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Task Details</th>
                      <th className="py-3.5 px-4">Operation</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Result Preview</th>
                      <th className="py-3.5 px-4">Created At</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTasks.map((task) => (
                      <tr
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-slate-800/40 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div className="font-semibold text-slate-100">{task.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                            Payload: {task.inputText}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/50">
                            {task.operationType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {task.status === 'Success' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" /> Success
                            </span>
                          )}
                          {task.status === 'Running' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
                              <Clock className="h-3 w-3 animate-spin" /> Running
                            </span>
                          )}
                          {task.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          )}
                          {task.status === 'Failed' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              <AlertTriangle className="h-3 w-3" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {task.result ? (
                            <span className="text-emerald-400 truncate max-w-xs block">
                              {task.result}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">Processing...</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(task.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                            >
                              Logs
                            </button>
                            <button
                              onClick={(e) => handleDeleteTask(task._id, e)}
                              className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Delete Task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          setToken(userData.token);
        }}
        apiUrl={API_URL}
      />

      <TaskModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onTaskCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
        }}
        apiUrl={API_URL}
        token={token}
      />

      <LogModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
