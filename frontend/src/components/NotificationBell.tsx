import React, { useEffect, useState, useRef } from 'react';
import { Bell, RefreshCw, Landmark, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, type Transaction, formatINR, formatTimestamp, getUser } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const [lastTxId, setLastTxId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = getUser();

  useEffect(() => {
    // Hidden audio element for the beep
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.2;
  }, []);

  useEffect(() => {
    const poll = async () => {
      if (!user) return;
      setIsPolling(true);
      try {
        const res = await api.getTransactions();
        // Since API returns transactions sorted by desc (newest first)
        const latest = res.data[0];

        if (latest && lastTxId !== null && latest.txId > lastTxId) {
          // New transaction detected!
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-4'} max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10 border border-white/5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <RefreshCw size={18} className="text-indigo-400 animate-spin" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Ledger Entry</p>
                    <p className="mt-1 text-sm font-medium text-white/50 leading-relaxed">
                      Transfer of <span className="text-white font-bold">{formatINR(latest.amount)}</span> detected from <span className="text-white font-bold">{latest.sender}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/5">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-2xl px-6 py-4 flex items-center justify-center text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), { duration: 5000 });

          audioRef.current?.play().catch(() => { });
        }

        if (latest) {
          setLastTxId(latest.txId);
          setHistory(res.data.slice(0, 5)); // Keep last 5 for dropdown
        }
      } catch (e) {
        console.error('[NotificationBell] Polling error:', e);
      } finally {
        // Subtle delay before reset polling state
        setTimeout(() => setIsPolling(false), 800);
      }
    };

    const interval = setInterval(poll, 5000);
    poll(); // Initial check

    return () => clearInterval(interval);
  }, [lastTxId]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all relative group"
      >
        <Bell size={18} className={isPolling ? 'animate-pulse text-indigo-400' : ''} />
        {/* Active Notification Dot */}
        {history.some(tx => tx.flagResult.status === 'suspicious') && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
            >
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Recent Activity</h3>
                <RefreshCw size={12} className={isPolling ? 'animate-spin text-indigo-400' : 'text-white/20'} />
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                {history.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">No activity logged</p>
                  </div>
                ) : (
                  history.map((tx) => (
                    <div key={tx._id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            tx.flagResult.status === 'suspicious' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            <Landmark size={14} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-[10px] font-black text-white uppercase truncate pr-2">{tx.sender}</p>
                            <p className="text-[8px] font-black text-white/20 uppercase whitespace-nowrap">{formatTimestamp(tx.timestamp).split('·')[0]}</p>
                          </div>
                          <p className="text-sm font-black text-white tracking-tighter mb-2">{formatINR(tx.amount)}</p>
                          <Link 
                            to={`/transactions/${tx.txId}`}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1.5 text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Audit Details <ExternalLink size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/transactions"
                onClick={() => setIsOpen(false)}
                className="block p-4 bg-white/[0.02] border-t border-white/5 text-center text-[9px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all"
              >
                View Full Registry
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
