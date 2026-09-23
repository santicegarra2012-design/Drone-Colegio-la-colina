import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  HeartPulse, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';

interface HistoricalMission {
  id: string;
  code: string;
  date: string;
  droneId: string;
  type: string;
  durationMin: number;
  victimsDetected: number;
  status: 'SUCCESS' | 'RESOLVED' | 'ASSISTED';
  responseTimeMin: number;
  batteryUsedPercent: number;
  distanceKm: number;
  weather: string;
}

export const AnalyticsView: React.FC = () => {
  const { showAiExplanation } = useRescue();

  const [compareA, setCompareA] = useState<string>('MS-108');
  const [compareB, setCompareB] = useState<string>('MS-104');
  const [selectedHistoryMission, setSelectedHistoryMission] = useState<HistoricalMission | null>(null);

  const historyData: HistoricalMission[] = [
    {
      id: 'MS-108',
      code: '#0042',
      date: '2026-09-22 19:42',
      droneId: 'DR-07',
      type: 'Vehicle Crash (Expressway)',
      durationMin: 14.2,
      victimsDetected: 3,
      status: 'SUCCESS',
      responseTimeMin: 1.8,
      batteryUsedPercent: 12.5,
      distanceKm: 3.8,
      weather: 'Light Rain',
    },
    {
      id: 'MS-107',
      code: '#0041',
      date: '2026-09-21 14:15',
      droneId: 'DR-01',
      type: 'Mountain Hiker Distress',
      durationMin: 22.0,
      victimsDetected: 1,
      status: 'RESOLVED',
      responseTimeMin: 2.9,
      batteryUsedPercent: 18.0,
      distanceKm: 6.4,
      weather: 'Windy / Fog',
    },
    {
      id: 'MS-106',
      code: '#0040',
      date: '2026-09-20 22:30',
      droneId: 'DR-05',
      type: 'Urban Rubble Collapse',
      durationMin: 18.5,
      victimsDetected: 2,
      status: 'ASSISTED',
      responseTimeMin: 2.1,
      batteryUsedPercent: 15.2,
      distanceKm: 4.1,
      weather: 'Clear Night',
    },
    {
      id: 'MS-105',
      code: '#0039',
      date: '2026-09-19 08:45',
      droneId: 'DR-02',
      type: 'Heavy Industrial Flood Rescue',
      durationMin: 34.0,
      victimsDetected: 4,
      status: 'SUCCESS',
      responseTimeMin: 3.2,
      batteryUsedPercent: 28.5,
      distanceKm: 8.2,
      weather: 'Torrential Rain',
    },
    {
      id: 'MS-104',
      code: '#0038',
      date: '2026-09-18 17:10',
      droneId: 'DR-07',
      type: 'Expressway Multi-Car Collision',
      durationMin: 16.0,
      victimsDetected: 3,
      status: 'SUCCESS',
      responseTimeMin: 1.7,
      batteryUsedPercent: 13.0,
      distanceKm: 3.5,
      weather: 'Overcast',
    },
  ];

  const missionA = historyData.find((m) => m.id === compareA) || historyData[0];
  const missionB = historyData.find((m) => m.id === compareB) || historyData[4];

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SIMULATED HISTORICAL DATA
            </span>
            <span className="text-xs text-slate-400 font-mono">NETWORK ANALYTICS ENGINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Performance Analytics & Mission Records
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Evaluate simulated response latency, casualty localization rates, and comparative mission telemetry.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
          <span>SIMULATED DATA • PROTOTYPE PERFORMANCE</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Avg Simulated Response Time</span>
          <div className="text-2xl font-black text-emerald-400 font-heading">1.94 min</div>
          <span className="text-[10px] text-slate-500 font-mono">vs 18.5 min conventional ground units</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Simulated Missions Completed</span>
          <div className="text-2xl font-black text-cyan-400 font-heading">148 Missions</div>
          <span className="text-[10px] text-slate-500 font-mono">99.3% Mission success rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Casualties Localized via Radar</span>
          <div className="text-2xl font-black text-purple-400 font-heading">326 Victims</div>
          <span className="text-[10px] text-slate-500 font-mono">Through wreckage & zero-visibility</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Medical Kits Deployed On-Site</span>
          <div className="text-2xl font-black text-amber-400 font-heading">218 Deliveries</div>
          <span className="text-[10px] text-slate-500 font-mono">AED pods & smart hemostatic bandages</span>
        </div>
      </div>

      {/* Side-by-Side Mission Comparison Tool */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Comparative Mission Analysis Tool
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Select two simulated missions to benchmark telemetry metrics side by side.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono"
            >
              {historyData.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} ({m.droneId})
                </option>
              ))}
            </select>
            <span className="text-slate-500 font-bold">vs</span>
            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-purple-300 font-mono"
            >
              {historyData.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} ({m.droneId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 text-slate-400 space-y-2">
            <div>Metric</div>
            <div className="pt-2 border-t border-slate-800 text-slate-300">Response Latency:</div>
            <div className="pt-2 border-t border-slate-800 text-slate-300">Flight Distance:</div>
            <div className="pt-2 border-t border-slate-800 text-slate-300">Battery Consumption:</div>
            <div className="pt-2 border-t border-slate-800 text-slate-300">Victims Detected:</div>
            <div className="pt-2 border-t border-slate-800 text-slate-300">Weather Condition:</div>
          </div>

          {/* Mission A */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-200 space-y-2">
            <div className="font-bold text-white font-heading">{missionA.id} ({missionA.type})</div>
            <div className="pt-2 border-t border-cyan-800/40 font-bold text-emerald-400">{missionA.responseTimeMin} min</div>
            <div className="pt-2 border-t border-cyan-800/40">{missionA.distanceKm} km</div>
            <div className="pt-2 border-t border-cyan-800/40">{missionA.batteryUsedPercent}%</div>
            <div className="pt-2 border-t border-cyan-800/40">{missionA.victimsDetected} Victims</div>
            <div className="pt-2 border-t border-cyan-800/40 text-slate-300">{missionA.weather}</div>
          </div>

          {/* Mission B */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 space-y-2">
            <div className="font-bold text-white font-heading">{missionB.id} ({missionB.type})</div>
            <div className="pt-2 border-t border-purple-800/40 font-bold text-emerald-400">{missionB.responseTimeMin} min</div>
            <div className="pt-2 border-t border-purple-800/40">{missionB.distanceKm} km</div>
            <div className="pt-2 border-t border-purple-800/40">{missionB.batteryUsedPercent}%</div>
            <div className="pt-2 border-t border-purple-800/40">{missionB.victimsDetected} Victims</div>
            <div className="pt-2 border-t border-purple-800/40 text-slate-300">{missionB.weather}</div>
          </div>
        </div>
      </div>

      {/* Mission History Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
        <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Simulated Historical Mission Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Mission ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Hexacopter</th>
                <th className="py-2.5 px-3">Incident Classification</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Victims</th>
                <th className="py-2.5 px-3">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => setSelectedHistoryMission(m)}
                  className="border-b border-slate-800/60 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-cyan-300">{m.id}</td>
                  <td className="py-3 px-3 text-slate-400">{m.date}</td>
                  <td className="py-3 px-3 text-white font-bold">{m.droneId}</td>
                  <td className="py-3 px-3 text-slate-200">{m.type}</td>
                  <td className="py-3 px-3 text-slate-400">{m.durationMin}m</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{m.victimsDetected}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
