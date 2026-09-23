import React from 'react';
import { 
  Hospital, 
  Truck, 
  BatteryCharging, 
  MapPin, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';

export const EmergencyNetworkView: React.FC = () => {
  const { hospitals, ambulances, chargingStations } = useRescue();

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              METROPOLITAN INFRASTRUCTURE
            </span>
            <span className="text-xs text-slate-400 font-mono">VALLEY HOSPITAL & DISPATCH GRID</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Emergency Network & Ground Coordination
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Trauma centers, ICU bed availability, paramedic mobile units, and autonomous drone charging perches.
          </p>
        </div>
      </div>

      {/* 1. Hospitals Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <Hospital className="w-4 h-4 text-emerald-400" />
          Receiving Trauma Centers & Hospitals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">{hosp.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                    {hosp.traumaLevel}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  RECEIVING
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Available ICU Beds:</span>
                  <span className="text-emerald-400 font-bold">{hosp.availableBeds} / {hosp.totalBeds}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Rooftop Drone Helipad:</span>
                  <span className="text-cyan-300">{hosp.helipadAvailable ? 'ACTIVE' : 'OCCUPIED'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Direct Telemetry Link:</span>
                  <span className="text-emerald-400">ENCRYPTED RTK</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Ambulances & Mobile EMS Units */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-400" />
          Field Paramedic & Mobile EMS Units
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ambulances.map((amb) => (
            <div
              key={amb.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    {amb.callsign} — {amb.type}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Unit ID: {amb.id}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {amb.status}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Assigned Incident:</span>
                  <span className="text-white font-bold">{amb.assignedEmergencyId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Arrival ETA to Scene:</span>
                  <span className="text-amber-400 font-bold">{amb.etaMinutes} Minutes</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Drone Data Handoff:</span>
                  <span className="text-emerald-400 font-bold">READY (Vitals Streamed)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Drone Charging Perches & Hot-Swap Hubs */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-cyan-400" />
          Autonomous Drone Perches & Charging Pods
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chargingStations.map((pad) => (
            <div
              key={pad.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">{pad.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400">Type: Fast Magnetic Induction</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  OPERATIONAL
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Free Landing Pads:</span>
                  <span className="text-cyan-300 font-bold">{pad.availablePads} of {pad.totalPads} Available</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Charge Rate:</span>
                  <span className="text-emerald-400">12 kW Ultra-Fast (0 to 80% in 12 min)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Weather Shelter:</span>
                  <span className="text-slate-200">Motorized Clamshell Dome (IP67)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
