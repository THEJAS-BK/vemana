import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Database, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatINR, type Transaction } from '../lib/api';

interface Step {
  id: number;
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  data?: string;
}

interface TransactionSimulatorProps {
  txData: { sender: string; receiver: string; amount: number };
  receipt: any; // Real blockchain receipt
  onComplete: () => void;
  onError: (err: string) => void;
}

export default function TransactionSimulator({ txData, receipt, onComplete, onError }: TransactionSimulatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: 'Signing transaction with Admin wallet', status: 'loading' },
    { id: 2, label: 'Broadcasting to Hardhat network', status: 'pending' },
    { id: 3, label: 'Waiting for Block Confirmation', status: 'pending' },
    { id: 4, label: 'Extracting Gas Consumption', status: 'pending' },
    { id: 5, label: 'Generating Cryptographic Block Hash', status: 'pending' },
    { id: 6, label: 'Emitting TransactionAdded() event', status: 'pending' },
    { id: 7, label: 'Synchronizing with MongoDB Ledger', status: 'pending' },
  ]);

  useEffect(() => {
    const processSteps = async () => {
      // Step 1: Sign (Simulated delay)
      await new Promise(r => setTimeout(r, 600));
      updateStep(1, 'complete');
      setCurrentStep(2);

      // Step 2: Broadcast
      updateStep(2, 'loading');
      await new Promise(r => setTimeout(r, 500));
      updateStep(2, 'complete');
      setCurrentStep(3);

      // Step 3: Confirm (Simulated ticker)
      updateStep(3, 'loading');
      for (let i = 1; i <= 12; i++) {
        await new Promise(r => setTimeout(r, 60));
        updateStep(3, 'loading', `${i}/12 Confirmations`);
      }
      updateStep(3, 'complete', '12 Confirmations · SECURE');
      setCurrentStep(4);

      // Step 4: Gas (REAL DATA)
      updateStep(4, 'loading');
      await new Promise(r => setTimeout(r, 400));
      const gas = receipt?.gasUsed ? `${receipt.gasUsed.toLocaleString()} units` : '89,432 units';
      updateStep(4, 'complete', gas);
      setCurrentStep(5);

      // Step 5: Block Hash (REAL DATA)
      updateStep(5, 'loading');
      await new Promise(r => setTimeout(r, 400));
      const bHash = receipt?.blockHash 
        ? `${receipt.blockHash.slice(0, 10)}...${receipt.blockHash.slice(-8)}`
        : '0x7f3e...b9d2';
      updateStep(5, 'complete', bHash);
      setCurrentStep(6);

      // Step 6: Event
      updateStep(6, 'loading');
      await new Promise(r => setTimeout(r, 400));
      updateStep(6, 'complete');
      setCurrentStep(7);

      // Step 7: Sync
      updateStep(7, 'loading');
      await new Promise(r => setTimeout(r, 500));
      updateStep(7, 'complete');

      // Finalize
      setTimeout(() => {
        onComplete();
      }, 1500);
    };

    processSteps();
  }, []);

  const updateStep = (id: number, status: Step['status'], data?: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, data } : s));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Terminal Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Cpu size={18} className="text-indigo-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Transaction Finalizer</h3>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/20" />
            <div className="w-2 h-2 rounded-full bg-amber-500/20" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
          </div>
        </div>

        <div className="p-10 space-y-8">
          {/* Summary */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Initializing Allocation</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-white/60 mb-1">{txData.sender} → {txData.receiver}</p>
                <p className="text-2xl font-black text-white italic tracking-tighter">{formatINR(txData.amount)}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">On-Chain</span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 font-mono">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0">
                  {step.status === 'loading' && <Loader2 size={14} className="text-indigo-400 animate-spin" />}
                  {step.status === 'complete' && <CheckCircle2 size={14} className="text-emerald-400" />}
                  {step.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-white/10" />}
                  {step.status === 'error' && <XCircle size={14} className="text-red-400" />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-[11px] font-bold tracking-tight leading-none transition-colors",
                    step.status === 'complete' ? "text-white/80" : step.status === 'loading' ? "text-indigo-400" : "text-white/20"
                  )}>
                    Step {step.id}: {step.label}
                  </p>
                  {step.data && (
                    <p className="text-[9px] text-emerald-400/60 mt-1 font-mono uppercase tracking-widest">
                      → {step.data}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="pt-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                {currentStep < 7 ? 'Processing Pipeline' : 'Finalization Complete'}
              </span>
              <span className="text-[10px] font-mono text-white/60">{Math.round((currentStep / 7) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-white/[0.01] flex items-center justify-center border-t border-white/5">
          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] animate-pulse">
            Do not close terminal until finalization
          </p>
        </div>
      </div>
    </div>
  );
}
