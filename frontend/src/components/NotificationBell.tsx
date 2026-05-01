import React, { useEffect, useState, useRef } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api, type Transaction, formatINR } from '../lib/api';

export default function NotificationBell() {
  const [lastTxId, setLastTxId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Hidden audio element for the beep
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.2;
  }, []);

  useEffect(() => {
    const poll = async () => {
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
      <Toaster position="top-right" />
      <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all relative group">
        <Bell size={18} className={isPolling ? 'animate-pulse text-indigo-400' : ''} />
        {/* Active Notification Dot */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
      </button>
    </div>
  );
}
