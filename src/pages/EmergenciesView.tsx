import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Send, 
  Clock, 
  MapPin, 
  CloudRain, 
  HeartPulse, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  PlusCircle, 
  Navigation,
  Eye,
  Activity,
  Layers
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { Emergency } from '../types/index.ts';
import { sound } from '../utils/audio.ts';

export const EmergenciesView: React.FC = () => {
  const { 
    emergencies, 
    selectedEmergencyId, 
    setSelectedEmergencyId, 
    deployDroneToEmergency, 
    showAiExplanation,
    createEmergencyFromSatellite 
  } = useRescue();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filtered = emergencies.filter((em) => {
    if (filterSeverity !== 'ALL' && em.severity !== filterSeverity) return false;
    return true;
  });

  const selected = emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              TACTICAL INCIDENT MANAGEMENT
            </span>
            <span className="text-xs text-slate-400 font-mono">ACTIVE DISPATCH QUEUE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Emergency Incidents & Response Triage
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time feed of multi-vehicle collisions, structural debris collapses, and medical distress signals.
          </p>
        </div>

        {/* Severity Filters & New Simulation Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                filterSeverity === sev
                  ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-950/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}

          <button
            onClick={() => {
              createEmergencyFromSatellite('Envigado Mountain Trail Sector B', 6.168, -75.578);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate New Incident</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Incident List + Selected Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Incident Cards Column */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((em) => {
            const isSelected = em.id === selected.id;
            return (
              <div
                key={em.id}
                onClick={() => {
                  sound.playBeep(1100, 0.05);
                  setSelectedEmergencyId(em.id);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-red-500 shadow-xl shadow-red-950/20'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{em.code}</span>
                    <span className="text-white font-bold font-heading text-sm">{em.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      em.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {em.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {em.description}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500">{em.locationName}</span>
                  <span className="text-emerald-400 font-bold">{em.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Incident In-Depth Details */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400">{selected.code}</span>
                <span className="text-xs text-slate-500 font-mono">ID: {selected.id}</span>
              </div>
              <h2 className="text-xl font-black text-white font-heading mt-0.5">
                {selected.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-red-950 border border-red-500/50 text-red-300 text-xs font-mono font-bold">
                {selected.severity} PRIORITY
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                STATUS: {selected.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              SCENE REPORT & CONTEXT
            </span>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {selected.description}
            </p>
          </div>

          {/* Incident Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LOCATION</span>
              <span className="text-slate-200 font-bold text-[11px] block mt-0.5">{selected.locationName}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">COORDINATES</span>
              <span className="text-cyan-300 font-bold text-[11px] block mt-0.5">{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">WEATHER</span>
              <span className="text-amber-300 font-bold text-[11px] block mt-0.5">{selected.weather}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ASSIGNED ASSET</span>
              <span className="text-emerald-400 font-bold text-[11px] block mt-0.5">{selected.assignedDroneId || 'Pending'}</span>
            </div>
          </div>

          {/* Casualties / Victims Detected */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-red-400" />
                Detected Victims ({selected.victims.length})
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Bio-Radar Live</span>
            </div>

            <div className="space-y-2">
              {selected.victims.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{v.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          v.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] block">{v.location}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-red-400 font-bold">{v.heartRateBpm} BPM</span>
                      <span className="text-slate-500 text-[10px] block">Heart Rate</span>
                    </div>
                    {v.medicalPackageDelivered ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400">Kit Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action & Explainability Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => deployDroneToEmergency('DR-07', selected.id)}
              className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs font-heading shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>DEPLOY RESCUE DRONE DR-07</span>
            </button>

            <button
              onClick={() =>
                showAiExplanation(
                  `Priority Ranking for ${selected.code}`,
                  `The automated dispatch algorithm calculated a composite criticality score of 94/100 based on: 1) Multiple casualties with one in critical hypovolemic distress (HR 138), 2) Expressway blockage hindering ground vehicle access, 3) Inclement rain necessitating rapid thermal stabilization before hypothermia onset.`
                )
              }
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Why this priority?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
