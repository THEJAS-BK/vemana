import React from 'react';
import QRCode from 'react-qr-code';
import { Download, X, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatINR, formatTimestamp, type Transaction } from '../lib/api';

interface TransactionQRProps {
  tx: Transaction;
  onClose: () => void;
}

export default function TransactionQR({ tx, onClose }: TransactionQRProps) {
  const verifyUrl = `${window.location.origin}/verify/${tx.txId}`;

  const downloadQR = () => {
    const svg = document.getElementById("transaction-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `tx-${tx.txId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const isFlagged = tx.flagResult.status === 'suspicious';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-slate-900 font-black text-lg">Transaction Passport</h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Public Verification Token</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl border-4 border-slate-100 mb-8 shadow-inner">
            <QRCode
              id="transaction-qr"
              value={verifyUrl}
              size={200}
              level="H"
            />
          </div>

          {/* Details */}
          <div className="w-full space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</span>
              <span className="text-sm font-black text-slate-900">{formatINR(tx.amount)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                isFlagged ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {isFlagged ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                {isFlagged ? "Flagged" : "Verified"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Blockchain Hash</span>
              <p className="text-[10px] font-mono text-slate-500 break-all leading-relaxed bg-slate-50 p-2 rounded-lg">
                {tx.blockchainHash}
              </p>
            </div>
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg"
            >
              <Download size={16} />
              Download
            </button>
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              <ExternalLink size={16} />
              Verify Link
            </a>
          </div>
        </div>

        <div className="bg-slate-50 p-4 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Scan to verify fund authenticity against the Aethera blockchain node
          </p>
        </div>
      </div>
    </div>
  );
}
