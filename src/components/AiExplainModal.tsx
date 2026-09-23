import React from 'react';
import { HelpCircle, Brain, X, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';

export const AiExplainModal: React.FC = () => {
  const { aiExplainModal, closeAiExplanation } = useRescue();

  if (!aiExplainModal || !aiExplainModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-left">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        {/* Close Button */}
        <button
          onClick={closeAiExplanation}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                AI EXPLAINABILITY ENGINE
              </span>
              <span className="text-[11px] text-slate-400 font-mono">SIMULATION TRANSPARENCY</span>
            </div>
            <h3 className="text-base font-bold text-white font-heading mt-0.5">{aiExplainModal.title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <p className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-200">
            {aiExplainModal.content}
          </p>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 font-heading">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Decision Scoring & Weighted Factors:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Proximity / Flight Distance:</span>
                <span className="text-emerald-400 font-mono font-bold">Score: 98/100 (Weight: 35%)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Battery Safety Margin:</span>
                <span className="text-emerald-400 font-mono font-bold">Score: 94/100 (Weight: 25%)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Payload Compatibility:</span>
                <span className="text-cyan-400 font-mono font-bold">Score: 100/100 (Weight: 25%)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Weather / Wind Tolerance:</span>
                <span className="text-cyan-400 font-mono font-bold">Score: 92/100 (Weight: 15%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Prototype Model: Designed by Santiago Cegarra, Samuel Velasco, Jeronimo Escobar for Colegio Campestre La Colina.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={closeAiExplanation}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
