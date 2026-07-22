import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
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
  Server,
  Terminal,
  LogOut
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);

  // Load saved token & user profile
  useEffect(() => {
    const savedToken = localStorage.getItem('task_platform_token');
    const savedUser = localStorage.getItem('task_platform_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsDashboardVisible(true);
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

  // Initial fetch and auto-polling every 3s
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

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setToken(userData.token);
    setIsDashboardVisible(true);
  };

  const handleLogout = () => {
    setIsDashboardVisible(false);
    setTimeout(() => {
      localStorage.removeItem('task_platform_token');
      localStorage.removeItem('task_platform_user');
      setToken('');
      setUser(null);
      setTasks([]);
    }, 300);
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

  // If user is not authenticated, show the Dedicated Auth Portal Page
  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} apiUrl={API_URL} />;
  }

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white transition-all duration-500 ${isDashboardVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Banner Hero */}
        <div className="relative rounded-3xl glass-panel p-6 sm:p-10 overflow-hidden border border-slate-800/80 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span>Asynchronous Redis & Python Worker Engine</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                AI Task Processing Pipeline
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Welcome back, <span className="text-indigo-400 font-bold">{user.name || user.email}</span>! Submit computational tasks asynchronously. Tasks are queued in Redis, executed by Python background workers, and synced via GitOps Argo CD.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsTaskOpen(true)}
                className="glow-btn flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-extrabold text-white shadow-xl transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Tasks</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{totalTasks}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-amber-400 tracking-tight">{pendingCount}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Running</span>
              <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-3xl font-extrabold text-cyan-400 tracking-tight">{runningCount}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Success</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">{successCount}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-3xl font-extrabold text-red-400 tracking-tight">{failedCount}</p>
          </div>
        </div>

        {/* Task Management Table / Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Task Queue Monitor</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-indigo-400 border border-slate-800">
                {filteredTasks.length} items
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search task title/op..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {['ALL', 'Pending', 'Running', 'Success', 'Failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchTasks}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                title="Refresh Queue"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Task List Table */}
          {filteredTasks.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800/80 space-y-3">
              <FileText className="h-12 w-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No tasks found in the queue matching your filter.</p>
              <button
                onClick={() => setIsTaskOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
              >
                Create a new AI task now →
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-4 px-5">Task Details</th>
                      <th className="py-4 px-5">Operation</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5">Result Preview</th>
                      <th className="py-4 px-5">Created At</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTasks.map((task) => (
                      <tr
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <td className="py-4 px-5 font-medium text-white">
                          <div className="font-bold text-slate-100 text-xs sm:text-sm">{task.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs mt-0.5">
                            Payload: {task.inputText}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-3 py-1 rounded-xl bg-slate-900 text-indigo-300 font-mono text-[11px] font-bold border border-slate-800">
                            {task.operationType}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {task.status === 'Success' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Success
                            </span>
                          )}
                          {task.status === 'Running' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
                              <Clock className="h-3.5 w-3.5 animate-spin" /> Running
                            </span>
                          )}
                          {task.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Clock className="h-3.5 w-3.5" /> Pending
                            </span>
                          )}
                          {task.status === 'Failed' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              <AlertTriangle className="h-3.5 w-3.5" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-300">
                          {task.result ? (
                            <span className="text-emerald-400 font-semibold truncate max-w-xs block">
                              {task.result}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic text-[11px]">Processing...</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                          {new Date(task.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                            >
                              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Logs</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteTask(task._id, e)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* Task Creation & Log Viewer Modals */}
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
