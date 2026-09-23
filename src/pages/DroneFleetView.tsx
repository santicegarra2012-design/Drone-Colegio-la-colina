import React, { useState } from 'react';
import { 
  Navigation, 
  Battery, 
  Compass, 
  Activity, 
  Send, 
  RotateCcw, 
  ShieldCheck, 
  Wrench, 
  Layers, 
  CheckCircle2, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { Drone } from '../types/index.ts';
import { sound } from '../utils/audio.ts';

export const DroneFleetView: React.FC = () => {
  const { 
    drones, 
    selectedDroneId, 
    setSelectedDroneId, 
    deployDroneToEmergency, 
    selectedEmergency,
    showAiExplanation,
    setActiveTab 
  } = useRescue();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredDrones = drones.filter((d) => {
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    return true;
  });

  const selected = drones.find((d) => d.id === selectedDroneId) || drones[0];

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              FLEET TELEMETRY
            </span>
            <span className="text-xs text-slate-400 font-mono">TOTAL ASSETS: {drones.length}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Autonomous Drone Fleet Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry, battery health, motor diagnostics, and rapid emergency dispatch for all airframes.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'AVAILABLE', 'MISSION', 'CHARGING'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Fleet Cards Grid + Selected Drone Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Drone Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDrones.map((drone) => {
            const isSelected = drone.id === selected.id;
            const isMission = drone.status === 'MISSION';

            return (
              <div
                key={drone.id}
                onClick={() => {
                  sound.playBeep(1100, 0.05);
                  setSelectedDroneId(drone.id);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/20'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-white text-base">{drone.id}</span>
                    <span className="text-xs text-slate-400 font-mono">({drone.callsign})</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isMission
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                        : drone.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {drone.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-mono mt-1.5">{drone.model}</div>

                {/* Telemetry Bar */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono pt-3 border-t border-slate-800">
                  <div className="p-1.5 rounded-lg bg-slate-950">
                    <span className="text-[9px] text-slate-500 block">BATTERY</span>
                    <span className="text-cyan-300 font-bold">{drone.batteryPercent}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950">
                    <span className="text-[9px] text-slate-500 block">ALTITUDE</span>
                    <span className="text-slate-200 font-bold">{drone.altitudeMeters}m</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950">
                    <span className="text-[9px] text-slate-500 block">HEALTH</span>
                    <span className="text-emerald-400 font-bold">{drone.motorHealthPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Drone Telemetry Deep Inspector */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold">PLATFORM INSPECTOR</span>
              <h2 className="text-xl font-black text-white font-heading mt-0.5">
                {selected.id} — {selected.callsign}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold">
              {selected.status}
            </span>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <span className="text-slate-500 block text-[10px] uppercase">EQUIPPED PAYLOAD SYSTEM:</span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
              {selected.payload}
            </div>
          </div>

          {/* Deep Telemetry Readouts */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">COORDINATES</span>
              <span className="text-cyan-300 font-bold mt-1 block">
                {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">HEADING</span>
              <span className="text-slate-200 font-bold mt-1 block">{selected.headingDeg}° (Bearing)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">AIRSPEED</span>
              <span className="text-emerald-400 font-bold mt-1 block">{selected.speedKmh} km/h</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">FLIGHT TIME LOGGED</span>
              <span className="text-amber-300 font-bold mt-1 block">{selected.flightHours} Hours</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => {
                deployDroneToEmergency(selected.id, selectedEmergency.id);
                setActiveTab('drone-simulator');
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-heading shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>DISPATCH {selected.id} TO {selectedEmergency.code}</span>
            </button>

            <button
              onClick={() => setActiveTab('drone-explorer')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Open in 3D CAD Component Explorer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
