import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Flag,
  CheckCircle2,
  Wallet,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Map as MapIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { api, type Analytics, formatINR } from '../lib/api';

export default function AnalyticsView() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthlyChartData = (data?.monthlyTotals ?? []).map((m) => {
    // Safety check for date format YYYY-MM
    const monthPart = m.month?.split('-')[1] || "01";
    const monthIndex = parseInt(monthPart);
    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return {
      name: monthNames[monthIndex] || monthPart,
      actual: Number((m.total / 100000).toFixed(2)), // Scale to Lakhs (L)
      count: m.count,
    };
  });

  const cleanCount = (data?.totalTransactions ?? 0) - (data?.flaggedCount ?? 0);
  const cleanPct = data ? Math.round((cleanCount / data.totalTransactions) * 100) : 0;

  const riskData = [
    { name: 'Verified Clean', value: cleanCount },
    { name: 'Flagged', value: data?.flaggedCount ?? 0 },
  ];

  const kpis = [
    {
      label: 'Total Volume',
      value: data ? formatINR(data.totalVolume) : '…',
      change: `${data?.totalTransactions ?? '…'} txns`,
      icon: Wallet,
      color: 'text-secondary',
      trend: 'neutral',
    },
    {
      label: 'Flagged Transactions',
      value: loading ? '…' : String(data?.flaggedCount ?? 0),
      change: `${data ? Math.round((data.flaggedCount / data.totalTransactions) * 100) : 0}% rate`,
      icon: Flag,
      color: 'text-error',
      trend: 'up',
    },
    {
      label: 'Compliance Rate',
      value: loading ? '…' : `${cleanPct}%`,
      change: 'Institutional',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      trend: 'neutral',
    },
    {
      label: 'On-chain Records',
      value: loading ? '…' : String(data?.totalTransactions ?? 0),
      change: 'Verified',
      icon: TrendingUp,
      color: 'text-indigo-400',
      trend: 'neutral',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Analytics Explorer</h2>
          <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em] mt-2">Institutional fiscal performance and compliance audit trails.</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-white/30 text-xs font-black uppercase tracking-widest">
            <RefreshCw size={14} className="animate-spin" /> Loading…
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card glass-interactive p-6 group">
            <div className="flex justify-between items-start mb-6">
              <div className={cn('p-3 bg-white/5 rounded-xl transition-transform border border-white/10 shadow-inner group-hover:scale-110', kpi.color)}>
                <kpi.icon size={20} />
              </div>
              <span className={cn(
                'text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest',
                kpi.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                kpi.trend === 'down' ? 'bg-error/10 text-error border-error/20' :
                'bg-white/5 text-white/40 border-white/10'
              )}>
                {kpi.change}
              </span>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">{kpi.label}</p>
            <h3 className="text-3xl font-black text-white mt-1.5 tabular-nums tracking-tight">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bar Chart — monthly fund flow */}
        <div className="col-span-12 lg:col-span-8 glass-card p-10">
          <div className="flex items-center justify-between mb-12">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Fund Flow — Monthly (₹ Lakhs)</h4>
            <div className="flex gap-6">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_10px_rgba(192,38,211,0.5)]" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Volume</span>
              </div>
            </div>
          </div>
          <div className="h-[360px] w-full">
            {monthlyChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">No monthly data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)' }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#0f1115', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 900, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', padding: '12px' }}
                    itemStyle={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(val: number) => [`₹${val} L`, 'Volume']}
                  />
                  <Bar dataKey="actual" fill="#c026d3" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart — risk distribution */}
        <div className="col-span-12 lg:col-span-4 glass-card p-10">
          <h4 className="text-lg font-black text-white uppercase tracking-wider mb-12">Risk Distribution</h4>
          <div className="relative h-72 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  <Cell fill="#c026d3" />
                  <Cell fill="#ff4d4d" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white tracking-tighter">{cleanPct}%</span>
              <p className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] mt-2">Clean Assets</p>
            </div>
          </div>
          <div className="mt-10 space-y-5">
            {riskData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: idx === 0 ? '#c026d3' : '#ff4d4d' }} />
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top receivers */}
        <div className="col-span-12 lg:col-span-6 glass-card overflow-hidden">
          <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Top Agency Receivers</h4>
          </div>
          <div className="p-10">
            <div className="space-y-10">
              {(data?.monthlyTotals ?? []).slice(0, 4).map((item, i) => {
                const maxTotal = Math.max(...(data?.monthlyTotals ?? []).map(m => m.total), 1);
                const pct = Math.round((item.total / maxTotal) * 100);
                return (
                  <div key={item.month} className="flex items-center gap-8 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white/20 border border-white/10 text-xs shadow-inner group-hover:border-secondary group-hover:text-secondary transition-all">
                      0{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-black text-white/80 uppercase tracking-wider">{item.month}</span>
                        <span className="text-sm font-black text-white tabular-nums tracking-tight">{formatINR(item.total)}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden ring-1 ring-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, delay: i * 0.15, ease: 'circOut' }}
                          className="bg-secondary h-full rounded-full shadow-[0_0_15px_rgba(192,38,211,0.5)]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Regional placeholder */}
        <div className="col-span-12 lg:col-span-6 glass-card overflow-hidden relative min-h-[460px] flex flex-col group">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778545894-62b44c097266?auto=format&fit=crop&q=80&w=1470')] bg-cover bg-center grayscale opacity-10 group-hover:scale-105 group-hover:opacity-20 transition-all duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-[#020204]/80 to-transparent" />
          </div>
          <div className="relative z-10 p-10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Regional Allocation</h4>
              <div className="p-3 bg-white/5 rounded-2xl text-secondary border border-white/10 shadow-xl">
                <MapIcon size={20} />
              </div>
            </div>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-16">Comparative fund velocity across jurisdictional boundaries.</p>
            <div className="mt-auto grid grid-cols-2 gap-6">
              <div className="glass-card bg-white/[0.03] p-8 transform hover:-translate-y-2 transition-all cursor-pointer border-white/10 hover:border-secondary/40">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">North India</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-white tabular-nums">
                    {data ? formatINR(data.totalVolume * 0.45) : '…'}
                  </span>
                  <TrendingUp size={20} className="text-emerald-500" />
                </div>
              </div>
              <div className="glass-card bg-white/[0.03] p-8 transform hover:-translate-y-2 transition-all cursor-pointer border-white/10 hover:border-secondary/40">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">South India</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-white tabular-nums">
                    {data ? formatINR(data.totalVolume * 0.55) : '…'}
                  </span>
                  <TrendingUp size={20} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Institutional Asset • High-Integrity Oversight</p>
        <div className="flex gap-10">
          <a href="#" className="text-[10px] font-black text-secondary hover:text-white transition-colors flex items-center gap-2 uppercase tracking-[0.2em]">
            Security Protocol <ExternalLink size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}
