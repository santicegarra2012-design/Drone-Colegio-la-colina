import React from 'react';
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Zap, 
  Radio, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

export const SettingsView: React.FC = () => {
  const { 
    simSpeed, 
    setSimSpeed, 
    soundMuted, 
    toggleSoundMute, 
    resetSimulator 
  } = useRescue();

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SIMULATION CONFIGURATION
            </span>
            <span className="text-xs text-slate-400 font-mono">CALIBRATION & DIAGNOSTICS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            System & Simulator Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure telemetry polling frequencies, audio effects, physics step multipliers, and state resets.
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Execution Speed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Simulation Clock Speed Multiplier
          </h3>
          <p className="text-xs text-slate-400">
            Speed up flight telemetry ticks, drone movement, battery drain, and emergency arrival times during presentations.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1, label: '1x (Real-Time)' },
              { val: 2, label: '2x (Accelerated)' },
              { val: 5, label: '5x (Fast Demo)' },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => {
                  sound.playBeep(980, 0.05);
                  setSimSpeed(spd.val);
                }}
                className={`py-3 rounded-xl border font-bold text-xs font-heading transition-all ${
                  simSpeed === spd.val
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Sound FX Engine */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Cockpit Audio Synthesizer
          </h3>
          <p className="text-xs text-slate-400">
            Real-time procedural web-audio beeps, radar pings, and emergency sirens synthesized without external MP3 files.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSoundMute}
              className={`flex-1 py-3 rounded-xl border font-bold text-xs font-heading flex items-center justify-center gap-2 transition-all ${
                soundMuted
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{soundMuted ? 'Cockpit Sound MUTED' : 'Cockpit Sound ACTIVE'}</span>
            </button>

            <button
              onClick={() => sound.playAlert()}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Test Siren
            </button>
          </div>
        </div>

        {/* State Reset */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Reset Prototype State
          </h3>
          <p className="text-xs text-slate-400">
            Restore drone locations back to rooftop pads, reset emergency incident list, and re-prime all demo sequences.
          </p>

          <button
            onClick={() => {
              sound.playSuccess();
              resetSimulator();
            }}
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs font-heading transition-colors"
          >
            Reset Simulator Telemetry Coordinates
          </button>
        </div>

        {/* School Exhibition Project Info */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Colegio Campestre La Colina — Build 2026.09</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Engineering Team: Santiago Cegarra, Samuel Velasco, and Jeronimo Escobar.
            Autonomous drone emergency response prototype designed to drastically reduce arrival latency for highway crashes and mountain distress in the Aburrá Valley.
          </p>
        </div>
      </div>
    </div>
  );
};
