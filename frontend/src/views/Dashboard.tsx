import React, { useEffect, useState } from 'react';
import {
  Plus,
  Wallet,
  Banknote,
  AlertTriangle,
  Landmark,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, type Transaction, type HealthStatus, formatINR, formatTimestamp } from '../lib/api';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [txRes, analyticsRes, healthRes] = await Promise.all([
          api.getTransactions(),
          api.getAnalytics(),
          api.health(),
        ]);
        setTransactions(txRes.data); // Store all for calculation
        setFlaggedCount(analyticsRes.data.flaggedCount);
        setTotalVolume(analyticsRes.data.totalVolume);
        setTotalCount(analyticsRes.data.totalTransactions);
        setHealth(healthRes.data);
      } catch (e) {
        console.error('[Dashboard] Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Department Aggregation Logic
  const departmentStats = Object.values(
    transactions.reduce((acc, tx) => {
      const dept = tx.sender;
      if (!acc[dept]) {
        acc[dept] = { name: dept, total: 0, count: 0, flagged: 0 };
      }
      acc[dept].total += tx.amount;
      acc[dept].count += 1;
      if (tx.flagResult.status === 'suspicious') {
        acc[dept].flagged += 1;
      }
      return acc;
    }, {} as Record<string, { name: string; total: number; count: number; flagged: number }>)
  ).map(d => {
    const flagRate = (d.flagged / d.count) * 100;
    const avgSpend = d.total / d.count;
    let status: 'Healthy' | 'Watch' | 'Critical' = 'Healthy';
    let color = 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';
    if (flagRate > 30) {
      status = 'Critical';
      color = 'border-red-500/20 text-red-400 bg-red-500/5';
    } else if (flagRate > 10) {
      status = 'Watch';
      color = 'border-amber-500/20 text-amber-400 bg-amber-500/5';
    }
    return { ...d, flagRate, avgSpend, status, color };
  });

  const nodeStatus = health
    ? health.blockchain === 'ok' && health.mongodb === 'ok'
      ? 'Nominal'
      : 'Degraded'
    : 'Checking…';

  const stats = [
    {
      label: 'Total Volume',
      value: loading ? '…' : formatINR(totalVolume),
      trend: `${totalCount} transactions`,
      icon: Wallet,
      color: 'text-indigo-400',
    },
    {
      label: 'Blockchain Status',
      value: health ? (health.blockchain === 'ok' ? 'Online' : 'Offline') : '…',
      trend: health?.mongodb === 'ok' ? 'MongoDB synced' : 'DB offline',
      icon: Banknote,
      color: 'text-fuchsia-400',
    },
    {
      label: 'Flagged Alerts',
      value: loading ? '…' : String(flaggedCount),
      trend: 'Suspicious',
      icon: AlertTriangle,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero */}
      <section className="relative flex-1 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm group min-h-[360px] flex items-center p-12">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200&h=800"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition-transform duration-1000"
          alt="Neural Network"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="relative z-10 space-y-6">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4 inline-block shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            System Status: {nodeStatus}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-black leading-tight tracking-tighter italic glow-text"
          >
            Institutional<br />Transparency v.4
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 max-w-md text-lg leading-relaxed font-medium"
          >
            Real-time fiscal monitoring of decentralized public resources. Experience the convergence of institutional trust and ledger-based verification.
          </motion.p>
        </div>
        <div className="absolute top-12 right-12 flex flex-col items-end">
          <div className="text-right">
            <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Live Transactions</div>
            <div className="text-5xl font-mono font-bold text-white shadow-sm">{loading ? '…' : totalCount}</div>
            <div className="text-[10px] text-indigo-400 font-bold mt-1 uppercase">▲ On-chain</div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="glass-card p-8 glass-interactive group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</span>
              <div className={cn('p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform', stat.color)}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight tabular-nums mb-1">{stat.value}</h3>
              <p className={cn('text-[10px] font-bold uppercase tracking-widest', stat.color)}>{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Department Health Dashboard */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Departmental Health Triage</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Integrity analysis by spending branch</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-black text-white/40 uppercase">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[9px] font-black text-white/40 uppercase">Watch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[9px] font-black text-white/40 uppercase">Critical</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departmentStats.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className={cn(
                "p-6 rounded-3xl border transition-all hover:scale-[1.02] cursor-default shadow-lg",
                dept.color
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-white/10 rounded-lg border border-white/10">
                  <Landmark size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{dept.status}</span>
              </div>
              
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 truncate">{dept.name}</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="opacity-40 font-bold uppercase tracking-widest">Total Spent</span>
                  <span className="text-white font-bold">{formatINR(dept.total)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="opacity-40 font-bold uppercase tracking-widest">Flag Rate</span>
                  <span className={cn("font-bold", dept.flagRate > 20 ? "text-red-400" : "text-white")}>
                    {dept.flagRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="opacity-40 font-bold uppercase tracking-widest">Avg Artifact</span>
                  <span className="text-white font-bold">{formatINR(dept.avgSpend)}</span>
                </div>
              </div>

              {/* Mini Health Bar */}
              <div className="mt-6 w-full h-1 bg-black/20 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", 
                    dept.status === 'Healthy' ? 'bg-emerald-400' : dept.status === 'Watch' ? 'bg-amber-400' : 'bg-red-400'
                  )}
                  style={{ width: `${100 - dept.flagRate}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transaction Table */}
      <section className="glass-card overflow-hidden">
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Transaction Registry</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn('w-1.5 h-1.5 rounded-full', health?.blockchain === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500')} />
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                {health?.blockchain === 'ok' ? 'Node Sync: Live' : 'Node Offline'}
              </p>
            </div>
          </div>
          <Link to="/transactions" className="px-6 py-2.5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
            Full Audit Log
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-white/30 text-xs font-bold uppercase tracking-widest">Loading blockchain data…</div>
          ) : transactions.length === 0 ? (
            <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No transactions found</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5">
                  <th className="px-10 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.1em]">TX ID</th>
                  <th className="px-10 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.1em]">Origin</th>
                  <th className="px-10 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.1em] text-right">Amount</th>
                  <th className="px-10 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.1em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {transactions.slice(0, 5).map((tx, i) => {
                  const isFlagged = tx.flagResult.status === 'suspicious';
                  return (
                    <motion.tr
                      key={tx._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="px-10 py-6">
                        <Link to={`/transactions/${tx.txId}`} className="text-xs font-mono font-bold text-white/80 group-hover:text-indigo-400 transition-colors uppercase">
                          #{String(tx.txId).padStart(5, '0')}
                        </Link>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:border-indigo-500/50 transition-colors">
                            <Landmark size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white truncate max-w-[180px]">{tx.sender}</p>
                            <p className="text-[10px] text-white/30 font-medium tracking-tight">{formatTimestamp(tx.timestamp)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className={cn('text-sm font-bold font-data tabular-nums', isFlagged ? 'text-red-400' : 'text-white')}>
                          {formatINR(tx.amount)}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={cn(
                          'inline-flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.1em]',
                          isFlagged ? 'text-red-400' : tx.flagResult.status === 'clean' ? 'text-emerald-400' : 'text-amber-400'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]',
                            isFlagged ? 'bg-red-400' : tx.flagResult.status === 'clean' ? 'bg-emerald-400' : 'bg-amber-400'
                          )} />
                          <span>{isFlagged ? 'Flagged' : tx.flagResult.status === 'clean' ? 'Clean' : 'Unknown'}</span>
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
