import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ShieldCheck, 
  Database, 
  Lock, 
  RefreshCw,
  Building2,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { api, type Transaction, formatINR, formatTimestamp } from '../lib/api';
import { cn } from '../lib/utils';

export default function VerifyTransaction() {
  const { txId } = useParams();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!txId) return;
    api.verifyTransaction(txId)
      .then((res) => setTx(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [txId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <RefreshCw size={40} className="text-slate-200 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating with Blockchain Node...</p>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">Verification Failed</h2>
        <p className="text-slate-500 mb-8 max-w-xs">{error || "The requested transaction record could not be found on the Aethera network."}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest border-b-2 border-slate-900 pb-1">
          <ArrowLeft size={16} /> Return to Portal
        </Link>
      </div>
    );
  }

  const isFlagged = tx.flagResult.status === 'suspicious';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Institutional Header */}
      <div className="bg-slate-900 text-white p-8 mb-8 shadow-xl">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-tight">Aethera Verify</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Blockchain Integrity Network</p>
          </div>
          <ShieldCheck size={32} className="text-emerald-400" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 space-y-6">
        {/* Verification Status Badge */}
        <div className={cn(
          "p-8 rounded-[2rem] flex flex-col items-center text-center shadow-sm border-2 transition-all",
          isFlagged ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
        )}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg",
            isFlagged ? "bg-red-500 text-white shadow-red-200" : "bg-emerald-500 text-white shadow-emerald-200"
          )}>
            {isFlagged ? <AlertTriangle size={40} /> : <CheckCircle size={40} />}
          </div>
          <h2 className="text-2xl font-black uppercase mb-1 tracking-tight">
            {isFlagged ? "Flagged for Review" : "Blockchain Verified"}
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isFlagged ? "Potential irregularity detected" : "Authentic fund transfer confirmed"}
          </p>
        </div>

        {/* Transaction Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Transaction ID</label>
              <p className="text-lg font-black text-slate-900 font-mono tracking-tight">#TX-{tx.txId}</p>
            </div>
            <div className="text-right">
              <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Amount (INR)</label>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatINR(tx.amount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex-1 text-center">
              <div className="flex justify-center mb-2">
                <Building2 size={20} className="text-slate-400" />
              </div>
              <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{tx.sender}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Originator</p>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
            <div className="flex-1 text-center">
              <div className="flex justify-center mb-2">
                <Wallet size={20} className="text-slate-400" />
              </div>
              <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{tx.receiver}</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Beneficiary</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database size={14} className="text-slate-400" />
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blockchain Ledger Record</label>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[10px] break-all leading-relaxed text-slate-600">
                {tx.blockchainHash}
              </div>
              <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Block: #{tx.blockNumber}</span>
                <span>Date: {formatTimestamp(tx.timestamp)}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-slate-400" />
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Compliance Analysis</label>
              </div>
              <div className="p-4 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
                  {tx.flagResult.reason || "No compliance irregularities detected during initial neural scan."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            This verification is cryptographically anchored to the <br />
            Aethera Institutional Ledger Node.
          </p>
        </div>
      </div>
    </div>
  );
}
