import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface SimulationDisclaimerProps {
  compact?: boolean;
}

export const SimulationDisclaimer: React.FC<SimulationDisclaimerProps> = ({ compact = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && !compact) return null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 select-none">
        <AlertTriangle className="w-3 h-3" />
        <span>SIMULATION • DEMO DATA ONLY</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 text-amber-200 px-4 py-1.5 text-xs flex items-center justify-between gap-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="shrink-0 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 uppercase">
          Prototype Notice
        </span>
        <p className="truncate text-amber-200/90 text-[11px]">
          <strong>EDUCATIONAL SIMULATION:</strong> This is a school engineering prototype for Colegio Campestre La Colina. Sensor telemetry, GPS coordinates, life signs, and AI decisions are simulated. Not connected to real 911 or civil defense services.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-400/80 hover:text-amber-200 p-1 transition-colors"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
