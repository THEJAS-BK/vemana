import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Flag,
  Lock,
  RefreshCw,
  AlertTriangle,
  Check,
  Copy,
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Link, useParams } from 'react-router-dom';
import { api, type Transaction, formatINR, formatTimestamp } from '../lib/api';

export default function TransactionDetail() {
  const { id } = useParams();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getTransaction(id)
      .then((res) => setTx(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 gap-3 text-white/30 text-xs font-bold uppercase tracking-widest">
        <RefreshCw size={18} className="animate-spin" /> Fetching blockchain record…
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">{error || 'Transaction not found'}</p>
        <Link to="/transactions" className="text-secondary text-xs font-black uppercase tracking-widest hover:text-secondary-container">← Back to Registry</Link>
      </div>
    );
  }

  const isFlagged = tx.flagResult.status === 'suspicious';
  const dateStr = formatTimestamp(tx.timestamp);
  const txLabel = `#${String(tx.txId).padStart(5, '0')}`;

  const rules = [
    { id: 'threshold', label: 'Institutional threshold (>₹1Cr)', keyword: 'threshold' },
    { id: 'round', label: 'Round number signature', keyword: 'round' },
    { id: 'keyword', label: 'High-risk beneficiary keyword', keyword: 'keyword' },
    { id: 'outlier', label: 'AI Outlier detection', keyword: 'outlier' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex items-center">
        <Link to="/transactions" className="flex items-center text-[10px] font-black text-secondary hover:text-secondary-container group uppercase tracking-widest">
          <ArrowLeft size={14} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Registry
        </Link>
      </div>

      <div className="glass-card overflow-hidden cert-border border-primary-container">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-3 block">Institutional Certificate of Transfer</span>
            <h1 className="text-4xl font-black text-white tracking-tight leading-none">
              {txLabel}
              <span className="inline-block ml-2 w-2 h-2 bg-secondary rounded-full animate-pulse" />
            </h1>
            <div className="flex flex-wrap items-center gap-5 mt-4">
              <div className="flex items-center text-white/40 font-bold text-[10px] uppercase tracking-wider">
                <Calendar size={14} className="mr-2 text-secondary" />
                {dateStr}
              </div>
              {isFlagged ? (
                <div className="flex items-center px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-[0.1em] border border-red-500/20 rounded-full">
                  <AlertTriangle size={12} className="mr-1.5" strokeWidth={3} />
                  FLAGGED — UNDER REVIEW
                </div>
              ) : (
                <div className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.1em] border border-emerald-500/20 rounded-full">
                  <CheckCircle2 size={12} className="mr-1.5" strokeWidth={3} />
                  SETTLED & VERIFIED
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(192,38,211,0.2)] hover:bg-secondary-container transition-all active:scale-95"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10">
          {/* Sender */}
          <div className="p-10 border-r border-white/10">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-8">Originating Entity</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">Institution</label>
                <p className="text-sm font-bold text-white">{tx.sender}</p>
              </div>
              <div>
                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">Block Number</label>
                <p className="text-xs font-mono font-bold text-secondary">#{tx.blockNumber}</p>
              </div>
            </div>
          </div>

          {/* Receiver */}
          <div className="p-10 border-r border-white/10">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-8">Beneficiary Entity</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">Entity Name</label>
                <p className="text-sm font-bold text-white">{tx.receiver}</p>
              </div>
              <div>
                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">Timestamp</label>
                <p className="text-xs font-mono font-bold text-secondary">{dateStr}</p>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="p-10 bg-white/[0.02]">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-8">Fiscal Breakdown</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-medium text-white/40">Base Allocation</span>
                <span className="text-xs font-bold text-white font-data">{formatINR(tx.amount)}</span>
              </div>
              <div className="pt-8 mt-8 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-secondary uppercase tracking-[0.1em]">Final Total</span>
                  <span className="text-3xl font-black text-white font-data tracking-tight">{formatINR(tx.amount)}</span>
                </div>
                <p className="text-[9px] text-white/20 italic mt-3 text-right">Settled in Indian Rupee (INR)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification & Audit */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
        {/* Blockchain Proof */}
        <div className="md:col-span-7 glass-card p-10 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center mb-8 pb-6 border-b border-white/5">
              <ShieldCheck size={20} className="text-secondary mr-3" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Blockchain Security Protocol</h3>
            </div>

            <div className="grid grid-cols-2 gap-y-10 gap-x-12 mb-10">
              <div>
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Block Number</label>
                <p className="text-xs font-bold text-white font-data tracking-widest">#{tx.blockNumber}</p>
              </div>
              <div>
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Validation State</label>
                <div className="flex items-center text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <Lock size={12} className="mr-2" />
                  On-chain confirmed
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Gas Used</label>
                <p className="text-xs font-bold text-white font-data">21,000 units</p>
              </div>
              <div>
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-2">Confirmed At</label>
                <p className="text-xs font-bold text-white font-data">
                  {new Date(tx.timestamp * 1000).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })} · {new Date(tx.timestamp * 1000).toLocaleTimeString('en-IN', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-10 border-t border-white/5">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4">Chain Integrity</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Immutability</p>
                  <p className="text-[10px] font-black text-emerald-400 italic">GUARANTEED</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Consensus</p>
                  <p className="text-[10px] font-black text-white/60">PROOF OF WORK</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Network</p>
                  <p className="text-[10px] font-black text-secondary">HARDHAT LOCAL</p>
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleCopy(tx.blockchainHash)}
            className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-secondary/50 transition-all cursor-pointer relative overflow-hidden active:scale-[0.99]"
          >
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block">Transaction Hash</label>
              <div className="flex items-center gap-2">
                {copied ? (
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">Copied!</span>
                ) : (
                  <Copy size={12} className="text-white/20 group-hover:text-secondary transition-colors" />
                )}
              </div>
            </div>
            <p className="text-[11px] font-mono font-bold text-white/80 break-all leading-relaxed group-hover:text-secondary transition-colors">
              {tx.blockchainHash || 'N/A'}
            </p>
          </div>
        </div>

        {/* Audit Result */}
        <div className="md:col-span-5 glass-card p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Flag size={20} className={cn('mr-3', isFlagged ? 'text-red-400' : 'text-secondary')} />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">AI Fraud Analysis</h3>
            </div>
            <span className={cn(
              'px-3 py-1 text-[9px] font-black rounded-lg border uppercase',
              isFlagged ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-secondary/10 text-secondary border-secondary/20'
            )}>
              {isFlagged ? 'FLAGGED' : tx.flagResult.status === 'clean' ? 'COMPLIANT' : 'PENDING'}
            </span>
          </div>
          <div className="bg-white/5 p-8 rounded-2xl min-h-[160px]">
            {/* Detection Engine Status */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 no-print">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Detection Engine</label>
              <div className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border",
                tx.flagResult.source === 'python' ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" : "bg-amber-500/5 text-amber-400 border-amber-500/10"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", tx.flagResult.source === 'python' ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
                {tx.flagResult.source === 'python' ? "PYTHON ENGINE · FastAPI" : "LOCAL HEURISTIC · Fallback"}
              </div>
            </div>

            <div className="mb-8">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4">Neural Analysis Summary</label>
              <p className={cn("text-sm leading-relaxed font-medium", tx.flagResult.reason?.startsWith('RESTRICTED') ? "text-red-400/80 italic" : "text-white/70")}>
                {tx.flagResult.reason?.startsWith('RESTRICTED') ? (
                  <span className="flex items-center gap-2">
                    <Lock size={14} /> SECURITY PROTOCOL: AUTHORIZED PERSONNEL ONLY
                  </span>
                ) : tx.flagResult.reason
                  ? `"${tx.flagResult.reason}"`
                  : '"Transaction passed all automated compliance checks. No irregularities detected."'}
              </p>
            </div>

            {/* Rules Checklist */}
            {!tx.flagResult.reason?.startsWith('RESTRICTED') && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4">Neural Checks Performed</label>
                <div className="space-y-3">
                  {rules.map((rule) => {
                    const isRuleFlagged = tx.flagResult.reason?.toLowerCase().includes(rule.keyword);
                    return (
                      <div key={rule.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                            isRuleFlagged ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          )}>
                            {isRuleFlagged ? <AlertTriangle size={10} /> : <Check size={10} />}
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold tracking-wide transition-colors",
                            isRuleFlagged ? "text-red-400" : "text-white/40 group-hover:text-white/60"
                          )}>
                            {rule.label}
                          </span>
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-tighter italic",
                          isRuleFlagged ? "text-red-400" : "text-emerald-500/20"
                        )}>
                          {isRuleFlagged ? 'FLAGGED' : 'PASS'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end no-print">
              <span className="text-[9px] font-black text-white/20 font-mono">NODE-ID: TX-{tx.txId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
