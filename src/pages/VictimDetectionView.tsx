import React, { useEffect, useRef, useState } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Thermometer, 
  Wind, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle, 
  ShieldAlert, 
  Send,
  PackageCheck
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

export const VictimDetectionView: React.FC = () => {
  const { 
    selectedEmergency, 
    deliverMedicalSuppliesToVictim, 
    showAiExplanation 
  } = useRescue();

  const [scanProgress, setScanProgress] = useState<number>(78);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulated animated radar / ECG graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      // Draw Background Grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Simulated UWB Radar Micro-Motion Life Sign Waveform (ECG + Respiration)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = (x + step) * 0.05;
        // Heartbeat spike at specific intervals
        const cycle = (x + step) % 120;
        let spike = 0;
        if (cycle > 50 && cycle < 58) {
          spike = -35 * Math.sin(((cycle - 50) / 8) * Math.PI);
        } else if (cycle >= 58 && cycle < 66) {
          spike = 15 * Math.sin(((cycle - 58) / 8) * Math.PI);
        }
        const respirationWave = Math.sin(t * 0.3) * 12;
        const y = cy + spike + respirationWave;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Scan Sweep Bar
      const sweepX = (step * 2) % w;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, h);
      ctx.stroke();

      step += 1.5;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              BIO-RADAR TELEMETRY
            </span>
            <span className="text-xs text-slate-400 font-mono">INCIDENT: {selectedEmergency.code}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Through-Debris Victim & Vital Detection
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ultra-Wideband (UWB) micro-motion radar and thermal sensing to localize trapped casualties without line-of-sight.
          </p>
        </div>

        {/* Disclaimer Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>SIMULATION — NOT A MEDICAL DEVICE</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Waveform & Scan Progress */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Pulsed UWB Radar Micro-Motion Scanner
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 font-bold">
              FREQUENCY: 3.8 GHz
            </span>
          </div>

          {/* Oscilloscope Canvas */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative h-48">
            <canvas ref={canvasRef} width={640} height={192} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400/80">
              CHEST-WALL DISPLACEMENT: 0.82 mm | SNR: 28.4 dB
            </div>
          </div>

          {/* Area Scan Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Accident Debris Grid Scanned:</span>
              <span className="text-cyan-300 font-bold">{scanProgress}% COMPLETE</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-700"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Radar Concept Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
            <div className="font-semibold text-slate-200 font-heading flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              How the Student Bio-Radar System Functions:
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              High-frequency radio pulses pass through vehicle glass, light aluminum panels, and dry drywall. The reflected RF signal shifts phase with the victim's micro-vibrations (heart contractions and diaphragm inhalation). AI algorithms filter noise to confirm life signs in seconds.
            </p>
          </div>
        </div>

        {/* Victim Triage Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-red-400" />
              Detected Casualties ({selectedEmergency.victims.length})
            </h3>
            <span className="text-xs font-mono text-slate-400">INCIDENT #0042</span>
          </div>

          {selectedEmergency.victims.map((vic, idx) => (
            <div
              key={vic.id}
              className={`p-4 rounded-xl border transition-all ${
                vic.status === 'CRITICAL'
                  ? 'bg-red-950/20 border-red-500/40'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-heading">{vic.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        vic.status === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {vic.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{vic.location}</p>
                </div>

                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {vic.distanceMeters}m Away
                </span>
              </div>

              {/* Vitals Grid */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">HEART RATE</span>
                  <span className="text-red-400 font-bold text-sm">{vic.heartRateBpm}</span>
                  <span className="text-[9px] text-slate-500 block">BPM</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">RESPIRATION</span>
                  <span className="text-cyan-400 font-bold text-sm">{vic.respirationRpm}</span>
                  <span className="text-[9px] text-slate-500 block">RPM</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">CORE TEMP</span>
                  <span className="text-amber-400 font-bold text-sm">{vic.bodyTempC}°</span>
                  <span className="text-[9px] text-slate-500 block">CELSIUS</span>
                </div>
              </div>

              {/* Action Button: Deliver Package */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                {vic.medicalPackageDelivered ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Trauma Kit & Thermal Blanket Deployed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => deliverMedicalSuppliesToVictim(vic.id)}
                    className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-heading shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 fill-current" />
                    <span>Deliver Drone First-Aid Trauma Pod</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Why Explain Button */}
          <button
            onClick={() =>
              showAiExplanation(
                'Through-Debris Radar Vital Sensing',
                'Devised by Jeronimo Escobar and the engineering team at Colegio Campestre La Colina. Optical cameras cannot see victims inside crushed cabins or collapsed rubble. Non-contact UWB radar enables instant triage classification (Critical vs Stable) so trauma surgeons at Hospital General can prepare specialized operating rooms before patient arrival.'
              )
            }
            className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Why radar life-sign scanning?</span>
          </button>
        </div>
      </div>
    </div>
  );
};
