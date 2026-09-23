import React from 'react';
import { Target, Radio, Shield, Battery, Crosshair, AlertTriangle } from 'lucide-react';

interface FpvCockpitHudProps {
  speedKmh: number;
  altitudeMeters: number;
  headingDegrees: number;
  pitchDegrees?: number;
  rollDegrees?: number;
  batteryPercent: number;
  distanceToTargetMeters: number;
  targetName?: string;
  isAutopilot?: boolean;
}

export const FpvCockpitHud: React.FC<FpvCockpitHudProps> = ({
  speedKmh,
  altitudeMeters,
  headingDegrees,
  pitchDegrees = 0,
  rollDegrees = 0,
  batteryPercent,
  distanceToTargetMeters,
  targetName = 'RESCUE TARGET',
  isAutopilot = true,
}) => {
  // Normalize heading
  const hdg = ((Math.round(headingDegrees) % 360) + 360) % 360;
  const compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const compassLabel = compassPoints[Math.floor(((hdg + 22.5) % 360) / 45)];

  // Horizon tilt based on roll
  const horizonTilt = Math.max(-30, Math.min(30, rollDegrees));
  // Horizon pitch offset in pixels
  const pitchOffsetPx = Math.max(-50, Math.min(50, pitchDegrees * 2.5));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden font-mono select-none text-emerald-400">
      {/* Outer Cockpit Vignette & Scanlines */}
      <div className="absolute inset-0 bg-radial-vignette opacity-30" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />

      {/* Top Banner: OSD Telemetry & Compass Ribbon */}
      <div className="absolute top-2 left-0 right-0 flex flex-col items-center">
        {/* Top Status Line */}
        <div className="w-full px-4 flex items-center justify-between text-[11px] text-emerald-400/90 font-bold tracking-widest drop-shadow-md">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white">REC 4K60</span>
            <span className="text-emerald-500/80">|</span>
            <span className="text-cyan-300">RTK-GPS FIXED</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
              HDG: {hdg.toString().padStart(3, '0')}° ({compassLabel})
            </span>
            {isAutopilot && (
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-spin" /> NAV AP-L4
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              <span>RSSI -42dBm</span>
            </span>
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5" />
              <span className={batteryPercent < 30 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}>
                {batteryPercent}%
              </span>
            </span>
          </div>
        </div>

        {/* Compass Tape */}
        <div className="mt-1 w-64 sm:w-80 h-6 border-b border-emerald-500/40 relative overflow-hidden flex items-end justify-center">
          <div
            className="flex items-center gap-8 text-[10px] text-emerald-400/80 transition-transform duration-75"
            style={{ transform: `translateX(${-((hdg % 45) - 22.5) * 2}px)` }}
          >
            <span>{((hdg - 45 + 360) % 360).toString().padStart(3, '0')}</span>
            <span>{((hdg - 20 + 360) % 360).toString().padStart(3, '0')}</span>
            <span className="text-white font-bold text-xs border-b-2 border-emerald-400 pb-0.5">
              ▼ {hdg.toString().padStart(3, '0')}°
            </span>
            <span>{((hdg + 20) % 360).toString().padStart(3, '0')}</span>
            <span>{((hdg + 45) % 360).toString().padStart(3, '0')}</span>
          </div>
        </div>
      </div>

      {/* Left HUD: Airspeed Ladder Tape */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="flex flex-col items-end text-[11px] text-emerald-400/80 space-y-3 border-r-2 border-emerald-500/60 pr-2">
          <span>{Math.max(0, speedKmh + 20)} —</span>
          <span>{Math.max(0, speedKmh + 10)} —</span>
          <div className="bg-emerald-950/90 border border-emerald-400 text-white font-bold px-2 py-0.5 rounded text-xs shadow-lg">
            ▶ {speedKmh} <span className="text-[9px] text-emerald-300">KM/H</span>
          </div>
          <span>{Math.max(0, speedKmh - 10)} —</span>
          <span>{Math.max(0, speedKmh - 20)} —</span>
        </div>
        <div className="text-[10px] text-emerald-500 -rotate-90 origin-left uppercase tracking-wider font-bold">
          AIRSPEED
        </div>
      </div>

      {/* Right HUD: Altitude Ladder Tape */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="text-[10px] text-emerald-500 rotate-90 origin-right uppercase tracking-wider font-bold">
          ALTITUDE
        </div>
        <div className="flex flex-col items-start text-[11px] text-emerald-400/80 space-y-3 border-l-2 border-emerald-500/60 pl-2">
          <span>— {altitudeMeters + 20}</span>
          <span>— {altitudeMeters + 10}</span>
          <div className="bg-emerald-950/90 border border-emerald-400 text-white font-bold px-2 py-0.5 rounded text-xs shadow-lg">
            ◀ {altitudeMeters} <span className="text-[9px] text-emerald-300">M</span>
          </div>
          <span>— {Math.max(0, altitudeMeters - 10)}</span>
          <span>— {Math.max(0, altitudeMeters - 20)}</span>
        </div>
      </div>

      {/* Center Flight Reticle & Artificial Horizon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Tilting Horizon & Pitch Ladder */}
        <div
          className="relative w-64 h-64 flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `rotate(${-horizonTilt}deg) translateY(${pitchOffsetPx}px)`,
          }}
        >
          {/* Horizon Line */}
          <div className="absolute w-56 h-[1.5px] bg-emerald-400/60 flex items-center justify-between">
            <span className="w-4 h-2 border-l border-b border-emerald-400 -mt-2" />
            <span className="w-4 h-2 border-r border-b border-emerald-400 -mt-2" />
          </div>

          {/* +10 Pitch Ladder */}
          <div className="absolute -top-12 flex items-center justify-between w-32 text-[10px] text-emerald-400/60">
            <span className="w-3 border-t border-r border-emerald-400/80 h-1">+10</span>
            <span className="w-3 border-t border-l border-emerald-400/80 h-1">+10</span>
          </div>

          {/* -10 Pitch Ladder */}
          <div className="absolute -bottom-12 flex items-center justify-between w-32 text-[10px] text-emerald-400/60">
            <span className="w-3 border-b border-r border-emerald-400/80 h-1">-10</span>
            <span className="w-3 border-b border-l border-emerald-400/80 h-1">-10</span>
          </div>
        </div>

        {/* Central Crosshair & Target Pip */}
        <div className="absolute flex items-center justify-center pointer-events-none">
          {/* Target Reticle Outer Ring */}
          <div className="w-20 h-20 rounded-full border border-emerald-500/40 border-dashed flex items-center justify-center animate-[spin_12s_linear_infinite]" />
          {/* Center Pip */}
          <div className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          <div className="absolute w-8 h-[1px] bg-emerald-400/80" />
          <div className="absolute h-8 w-[1px] bg-emerald-400/80" />
        </div>
      </div>

      {/* Target Lock Box in View */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-emerald-500/60 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-2xl">
        <div className="w-7 h-7 rounded-lg border border-emerald-400 flex items-center justify-center text-emerald-300">
          <Target className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LOCK: {targetName}</span>
          </div>
          <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-2 mt-0.5">
            <span>RANGE: {distanceToTargetMeters}m</span>
            <span>•</span>
            <span>ETA: {Math.max(1, Math.round(distanceToTargetMeters / Math.max(1, speedKmh / 3.6)))}s</span>
          </div>
        </div>
      </div>

      {/* Corner Aeronautical Crop Brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400/80" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400/80" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400/80" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400/80" />

      {/* Bottom Telemetry Ticker */}
      <div className="absolute bottom-2 left-6 right-6 hidden sm:flex items-center justify-between text-[10px] text-emerald-400/70">
        <div>COCKPIT GIMBAL STABILIZER: 3-AXIS ACTIVE</div>
        <div>RESCUE AI AVIONICS FIRMWARE v4.9.2 • 8TH GRADE ROBOTICS LAB</div>
      </div>
    </div>
  );
};
