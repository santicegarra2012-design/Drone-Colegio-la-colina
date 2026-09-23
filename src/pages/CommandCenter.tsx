import React from 'react';
import { 
  ShieldAlert, 
  Send, 
  Activity, 
  Clock, 
  HeartPulse, 
  Radio, 
  Battery, 
  Navigation, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  Zap,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { InteractiveTacticalMap } from '../components/InteractiveTacticalMap.tsx';
import { StudentBadge } from '../components/StudentBadge.tsx';
import { SchoolLogo } from '../components/SchoolLogo.tsx';

export const CommandCenter: React.FC = () => {
  const {
    emergencies,
    drones,
    selectedEmergency,
    selectedDrone,
    setSelectedEmergencyId,
    setSelectedDroneId,
    deployDroneToEmergency,
    setActiveTab,
    startDemo,
    setPresentationMode,
  } = useRescue();

  const activeEmergencies = emergencies.filter((e) => e.status !== 'COMPLETED');
  const availableDrones = drones.filter((d) => d.status === 'AVAILABLE');
  const missionDrones = drones.filter((d) => d.status === 'MISSION');

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Hero Welcome Banner for School Exhibition */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-5 md:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <SchoolLogo size="sm" />
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Colegio Campestre La Colina Engineering Project
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white font-heading tracking-wide">
            RESCUE AI COMMAND CENTER
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Using Artificial Intelligence, Satellites, Robotics, and Autonomous Drones to Save Lives Faster.
            Engineered by <strong>Santiago Cegarra</strong>, <strong>Samuel Velasco</strong>, and <strong>Jeronimo Escobar</strong>.
          </p>
        </div>

        {/* Big Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={startDemo}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs font-heading shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>START DEMO (AUTOMATED)</span>
          </button>

          <button
            onClick={() => setPresentationMode(true)}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Tv className="w-4 h-4 text-purple-400" />
            <span>Presentation Mode</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">ACTIVE INCIDENTS</span>
          <span className="text-xl font-bold font-heading text-red-400">{activeEmergencies.length}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">AVAILABLE DRONES</span>
          <span className="text-xl font-bold font-heading text-emerald-400">{availableDrones.length}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">IN FLIGHT MISSION</span>
          <span className="text-xl font-bold font-heading text-cyan-400">{missionDrones.length}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">AVG RESPONSE</span>
          <span className="text-xl font-bold font-heading text-white">01:48</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">VICTIMS SCANNED</span>
          <span className="text-xl font-bold font-heading text-purple-400">3 Detected</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">RTK ACCURACY</span>
          <span className="text-xl font-bold font-heading text-emerald-400">±1.8 cm</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">GROUND LINK</span>
          <span className="text-xl font-bold font-heading text-cyan-400">99.8%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">SYSTEM MODE</span>
          <span className="text-xl font-bold font-heading text-amber-400">SIMULATION</span>
        </div>
      </div>

      {/* Main Interactive Tactical Radar Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            Live Metropolitan Emergency Map
          </h2>
          <span className="text-xs font-mono text-slate-400">Medellín Valley Grid • Aburrá Corridor</span>
        </div>
        <InteractiveTacticalMap heightClass="h-[520px]" />
      </div>

      {/* Bottom Grid: Active Emergency Spotlight + Drone Fleet Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Emergency Spotlight Card */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <h3 className="text-sm font-bold text-white font-heading">
                ACTIVE INCIDENT {selectedEmergency.code}
              </h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedEmergency.severity === 'HIGH' || selectedEmergency.severity === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {selectedEmergency.severity} SEVERITY
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-base font-bold text-white font-heading">{selectedEmergency.title}</div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedEmergency.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400">
            <div>Location: <strong className="text-slate-200">{selectedEmergency.locationName}</strong></div>
            <div>Weather: <strong className="text-cyan-300">{selectedEmergency.weather}</strong></div>
            <div>Potential Victims: <strong className="text-red-400">{selectedEmergency.potentialVictimsCount}</strong></div>
            <div>Estimated Response: <strong className="text-emerald-400">01:48</strong></div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => deployDroneToEmergency('DR-07', selectedEmergency.id)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs font-heading shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>DEPLOY DRONE DR-07</span>
            </button>

            <button
              onClick={() => setActiveTab('emergencies')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>View Incident Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Drone Fleet Spotlight Card */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                LEAD PLATFORM: {selectedDrone.id} ({selectedDrone.callsign})
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {selectedDrone.status}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold text-white font-heading">{selectedDrone.model}</div>
            <p className="text-xs text-slate-400 font-mono">Payload: {selectedDrone.payload}</p>
          </div>

          {/* Telemetry Readouts */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">BATTERY</span>
              <span className="text-cyan-300 font-bold text-sm">{selectedDrone.batteryPercent}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ALTITUDE</span>
              <span className="text-slate-200 font-bold text-sm">{selectedDrone.altitudeMeters}m</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">SPEED</span>
              <span className="text-emerald-400 font-bold text-sm">{selectedDrone.speedKmh} km/h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">MOTOR HP</span>
              <span className="text-purple-300 font-bold text-sm">{selectedDrone.motorHealthPercent}%</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('drone-explorer')}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore 3D Drone Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('drone-simulator')}
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-heading shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Enter Flight Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
