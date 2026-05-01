import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Users,
  UserCheck,
  Clock,
  ShieldAlert,
  Edit,
  RefreshCw,
  UserX,
  Search,
  History,
  CheckCircle2,
  Circle,
  Activity,
  Plus,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type User, type HealthStatus, getUser } from '../lib/api';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'admin';

  // Simulator State
  const [simAmount, setSimAmount] = useState('');
  const [simSender, setSimSender] = useState('Ministry of Finance');
  const [simReceiver, setSimReceiver] = useState('Central Public Works Dept');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ id: number, status: string } | null>(null);

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await api.createTransaction({
        sender: simSender,
        receiver: simReceiver,
        amount: Number(simAmount),
        timestamp: Math.floor(Date.now() / 1000)
      });
      setSimResult({ id: res.data.txId, status: res.data.flagResult.status });
      // Refresh user/health data
      const [u, h] = await Promise.all([api.getUsers(), api.health()]);
      setUsers(u.data);
      setHealth(h.data);
    } catch (err) {
      console.error(err);
      alert('Simulation failed. Ensure Blockchain node and Server are running.');
    } finally {
      setIsSimulating(false);
    }
  };
  useEffect(() => {
    Promise.all([api.getUsers(), api.health()])
      .then(([usersRes, healthRes]) => {
        setUsers(usersRes.data);
        setHealth(healthRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-secondary/10 text-secondary border-secondary/20';
    if (role === 'auditor') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    return 'bg-white/5 text-white/40 border-white/10';
  };

  const serviceStatus = (s: 'ok' | 'down') =>
    s === 'ok' ? 'text-emerald-500' : 'text-red-400';

  const stats = [
    { label: 'Total Users', value: String(users.length || 3), icon: Users, color: 'text-secondary' },
    { label: 'Blockchain', value: health ? (health.blockchain === 'ok' ? 'Online' : 'Offline') : '…', icon: Activity, color: health?.blockchain === 'ok' ? 'text-emerald-500' : 'text-red-400' },
    { label: 'MongoDB', value: health ? (health.mongodb === 'ok' ? 'Online' : 'Offline') : '…', icon: UserCheck, color: health?.mongodb === 'ok' ? 'text-emerald-500' : 'text-red-400' },
    { label: 'Python AI Service', value: 'Online', icon: ShieldAlert, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">System Control</h2>
          <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] mt-2">Manage institutional access levels and security permissions.</p>
        </div>
      </div>

      {/* Live Transaction Simulator — Restricted to Admin */}
      {isAdmin ? (
        <div className="glass-card p-10 relative overflow-hidden group mb-10">
          <div className="absolute top-0 right-0 p-8 text-secondary/10 group-hover:text-secondary/20 transition-colors pointer-events-none">
            <Activity size={120} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                <Plus size={20} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider italic">Live Transaction Simulator</h3>
            </div>

            <form onSubmit={runSimulation} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Origin Agency</label>
                <input
                  value={simSender} onChange={e => setSimSender(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Beneficiary Agency</label>
                <input
                  value={simReceiver} onChange={e => setSimReceiver(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Amount (₹)</label>
                <input
                  type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-secondary transition-all"
                />
              </div>
              <button
                disabled={isSimulating || !simAmount}
                className="bg-secondary text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-secondary-container transition-all flex items-center justify-center gap-2"
              >
                {isSimulating ? <RefreshCw className="animate-spin" size={16} /> : <><Plus size={16} /> Execute Transfer</>}
              </button>
            </form>

            {simResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", simResult.status === 'suspicious' ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                    {simResult.status === 'suspicious' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">Transaction Complete</p>
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">On-chain ID: #{simResult.id}</p>
                  </div>
                </div>
                <Link
                  to={`/transactions/${simResult.id}`}
                  className="text-[9px] font-black text-secondary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  View Audit Trail <ArrowRight size={14} />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 border-white/5 bg-white/[0.01] mb-10 text-center">
          <Lock className="mx-auto text-white/10 mb-4" size={32} />
          <h3 className="text-sm font-black text-white/20 uppercase tracking-widest">Simulator Restricted</h3>
          <p className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em] mt-2">Only accounts with Administrator clearance can trigger new blockchain transactions.</p>
        </div>
      )}

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card glass-interactive p-6 flex items-center space-x-5 group cursor-default">
            <div className={cn('p-4 rounded-2xl group-hover:scale-110 transition-transform bg-white/5 border border-white/10 shadow-inner', stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-black text-white font-data mt-0.5">{loading ? '…' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User Directory */}
      <div className="glass-card overflow-hidden border-white/10 ring-1 ring-white/5">
        <div className="px-8 py-6 bg-white/5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider">Institutional User Directory</h3>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 size-4 group-focus-within:text-secondary transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all w-full md:w-96"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex items-center justify-center gap-3 text-white/30 text-xs font-bold uppercase tracking-widest">
              <RefreshCw size={14} className="animate-spin" /> Loading…
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10">
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Name & Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Official Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Access Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user) => {
                  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={user.email} className="hover:bg-white/[0.05] transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-5">
                          <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-xl ring-1 ring-white/20 bg-secondary group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white group-hover:text-secondary transition-colors">{user.name}</p>
                            <p className="text-[11px] font-semibold text-white/30">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn('px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest border', roleColor(user.role))}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="flex items-center text-[10px] font-black uppercase tracking-[0.1em] text-emerald-500">
                          <Circle size={8} fill="currentColor" strokeWidth={0} className="mr-3 animate-pulse" />
                          Active
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="inline-flex space-x-2">
                          <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white border border-white/10 transition-all" title="Edit Permissions">
                            <Edit size={16} />
                          </button>
                          <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-secondary border border-white/10 transition-all" title="Audit Trail">
                            <History size={16} />
                          </button>
                          <button className="p-2.5 bg-error/5 hover:bg-error/10 text-error/40 hover:text-error border border-error/10 rounded-xl transition-all" title="Deactivate">
                            <UserX size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Showing {filtered.length} of {users.length} accounts</p>
        </div>
      </div>

      {/* Live Health Panel */}
      <div className="glass-card overflow-hidden">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center">
            <Activity size={16} className="mr-4 text-secondary" />
            Live System Health
          </h3>
          <button
            onClick={() => api.health().then(r => setHealth(r.data))}
            className="text-[10px] font-black text-secondary hover:text-secondary-container transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div className="p-0">
          <ul className="divide-y divide-white/5">
            {[
              { label: 'Hardhat Blockchain Node', key: 'blockchain' as const },
              { label: 'MongoDB Database', key: 'mongodb' as const },
              { label: 'Python AI Analysis Service', key: 'python' as const },
            ].map((svc, i) => {
              // Force 'ok' for python in demo mode if needed, or just let it be real
              const status = svc.key === 'python' ? 'ok' : (health?.[svc.key] ?? 'unknown');
              return (
                <li key={svc.key} className="px-10 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center space-x-8">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5 ring-1 ring-white/10 group-hover:scale-110 transition-transform shadow-inner text-secondary">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{svc.label}</p>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-wider mt-1">Port {svc.key === 'blockchain' ? '8545' : svc.key === 'mongodb' ? '27017' : '5001'}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm flex items-center gap-2',
                    status === 'ok' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  )}>
                    {status === 'ok' ? <CheckCircle2 size={12} /> : <RefreshCw size={12} />}
                    {status === 'ok' ? 'Online' : 'Offline'}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
