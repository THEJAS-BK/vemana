import React, { useEffect, useState } from 'react';
import {
  Search,
  ChevronRight,
  MoreVertical,
  Filter,
  ArrowDownToLine,
  ChevronDown,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import TransactionQR from '../components/TransactionQR';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, type Transaction, formatINR, formatTimestamp } from '../lib/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTxForQR, setSelectedTxForQR] = useState<Transaction | null>(null);

  useEffect(() => {
    api.getTransactions().then((res) => {
      setTransactions(res.data);
      setFiltered(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Filter whenever search or status changes
  useEffect(() => {
    let result = transactions;
    if (statusFilter === 'flagged') result = result.filter(t => t.flagResult.status === 'suspicious');
    if (statusFilter === 'clean') result = result.filter(t => t.flagResult.status === 'clean');
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.sender.toLowerCase().includes(q) ||
        t.receiver.toLowerCase().includes(q) ||
        String(t.txId).includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, transactions]);

  const handleExport = () => {
    if (filtered.length === 0) return;

    // CSV Header
    const headers = ["TX ID", "Sender", "Receiver", "Amount (INR)", "Status", "Reason", "Timestamp", "Blockchain Hash", "Block Number"];

    // CSV Content
    const rows = filtered.map(tx => [
      `#${String(tx.txId).padStart(5, '0')}`,
      tx.sender,
      tx.receiver,
      tx.amount,
      tx.flagResult.status.toUpperCase(),
      tx.flagResult.reason || "N/A",
      formatTimestamp(tx.timestamp),
      tx.blockchainHash,
      tx.blockNumber
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `aethera_registry_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">
            <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Neural Hub</Link>
            <ChevronRight size={10} strokeWidth={3} />
            <span className="text-white">Registry</span>
          </nav>
          <h2 className="text-5xl font-black text-white tracking-tighter italic glow-text mb-2">Transaction Ledger</h2>
          <p className="text-sm font-medium text-white/40 tracking-wider">High-fidelity verification of national fiscal movements.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-3 px-8 py-3.5 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-full backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowDownToLine size={16} />
          <span>Export Registry</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 glass-card p-6 border-white/10">
          <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Search</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 size-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sender, receiver, TX ID..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:ring-0 transition-all"
            />
          </div>
        </div>
        <div className="glass-card p-6">
          <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Integrity State</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-white focus:border-indigo-500/50 focus:ring-0 transition-all appearance-none"
          >
            <option className="bg-[#020204]" value="all">All Transactions</option>
            <option className="bg-[#020204]" value="clean">Verified Clean</option>
            <option className="bg-[#020204]" value="flagged">Flagged Only</option>
          </select>
        </div>
        <div className="glass-card p-6 col-span-2 flex items-end gap-6">
          <div className="flex-1">
            <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Showing</label>
            <p className="text-2xl font-black text-white">{filtered.length} <span className="text-sm text-white/30">of {transactions.length}</span></p>
          </div>
          <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex items-center justify-center gap-3 text-white/30 text-xs font-bold uppercase tracking-widest">
              <RefreshCw size={16} className="animate-spin" /> Loading blockchain data…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No matching transactions found</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">TX ID</th>
                  <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Sender</th>
                  <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Receiver</th>
                  <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Amount</th>
                  <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-10 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-right">...</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] font-data">
                {filtered.map((tx, i) => {
                  const isFlagged = tx.flagResult.status === 'suspicious';
                  const initials = tx.sender.split(' ').map(w => w[0]).slice(0, 2).join('');
                  return (
                    <motion.tr
                      key={tx._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 * Math.min(i, 10) }}
                      className={cn('hover:bg-white/[0.04] transition-all cursor-pointer group', isFlagged && 'bg-red-500/[0.02]')}
                    >
                      <td className="px-10 py-6">
                        <Link to={`/transactions/${tx.txId}`} className="text-xs font-mono font-bold text-white/30 group-hover:text-fuchsia-400 transition-colors uppercase tracking-widest">
                          #{String(tx.txId).padStart(5, '0')}
                        </Link>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-black border border-indigo-500/20 group-hover:scale-110 transition-transform shrink-0">
                            {initials}
                          </span>
                          <span className="text-sm font-bold text-white truncate max-w-[160px]">{tx.sender}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-sm font-medium text-white/60 truncate max-w-[160px]">{tx.receiver}</td>
                      <td className="px-10 py-6 text-sm font-bold text-white/90 text-right tabular-nums">{formatINR(tx.amount)}</td>
                      <td className="px-10 py-6 text-center">
                        <span className={cn(
                          'inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border',
                          isFlagged ? 'bg-red-500/5 text-red-400 border-red-500/10' :
                            tx.flagResult.status === 'clean' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' :
                              'bg-amber-500/5 text-amber-400 border-amber-500/10'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full mr-2 shadow-[0_0_8px_currentColor]',
                            isFlagged ? 'bg-red-400' : tx.flagResult.status === 'clean' ? 'bg-emerald-400' : 'bg-amber-400'
                          )} />
                          {isFlagged ? 'Flagged' : tx.flagResult.status === 'clean' ? 'Clean' : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedTxForQR(tx); }}
                            className="p-2.5 hover:bg-white/10 rounded-xl text-white/20 hover:text-indigo-400 transition-all inline-block"
                            title="Generate QR Token"
                          >
                            <QrCode size={16} />
                          </button>
                          <Link to={`/transactions/${tx.txId}`} className="p-2.5 hover:bg-white/10 rounded-xl text-white/20 hover:text-white transition-all inline-block">
                            <MoreVertical size={16} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-10 py-6 bg-white/[0.01] flex items-center justify-between border-t border-white/5">
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
            Showing <span className="text-white/60">{filtered.length}</span> of <span className="text-white">{transactions.length}</span> on-chain artifacts
          </div>
        </div>
      </div>

      {selectedTxForQR && (
        <TransactionQR 
          tx={selectedTxForQR} 
          onClose={() => setSelectedTxForQR(null)} 
        />
      )}
    </div>
  );
}
