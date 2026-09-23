import React from 'react';
import {
  Home,
  AlertTriangle,
  Send,
  Gamepad2,
  Box,
  Cpu,
  HeartPulse,
  Brain,
  Compass,
  Satellite,
  FlaskConical,
  BarChart3,
  Radio,
  Hospital,
  Binary,
  Settings,
  Info,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  Sliders,
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { ActiveTab } from '../types/index.ts';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, emergencies, drones, isDemoRunning } = useRescue();

  const activeEmergenciesCount = emergencies.filter(
    (e) => e.status !== 'COMPLETED'
  ).length;
  const activeMissionDrone = drones.find((d) => d.status === 'MISSION');

  const navItems: NavItem[] = [
    {
      id: 'la-colina-twin',
      label: 'La Colina Campus Twin',
      icon: GraduationCap,
      badge: '★ School 3D',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
    },
    {
      id: 'simulation-studio',
      label: 'Simulation Studio',
      icon: Sliders,
      badge: '✨ Custom',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold',
    },
    { id: 'command-center', label: 'Command Center', icon: Home },
    {
      id: 'emergencies',
      label: 'Emergencies',
      icon: AlertTriangle,
      badge: `${activeEmergenciesCount}`,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'drone-fleet',
      label: 'Drone Fleet',
      icon: Send,
      badge: activeMissionDrone ? '1 Active' : 'Ready',
      badgeColor: activeMissionDrone ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400',
    },
    { id: 'drone-simulator', label: 'Drone Simulator', icon: Gamepad2 },
    { id: 'drone-explorer', label: '3D Drone Explorer', icon: Box },
    { id: 'robotic-arm', label: 'Robotic Arm', icon: Cpu },
    { id: 'victim-detection', label: 'Victim Detection', icon: HeartPulse, badge: 'Radar', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'ai-assistant', label: 'AI Rescue Assistant', icon: Brain, badge: 'Gemini', badgeColor: 'bg-purple-500/20 text-purple-300' },
    { id: 'mission-planner', label: 'Mission Planner', icon: Compass },
    { id: 'satellite', label: 'Satellite Detection', icon: Satellite },
    { id: 'testing-lab', label: 'Testing Laboratory', icon: FlaskConical },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'communications', label: 'Communications', icon: Radio },
    { id: 'emergency-network', label: 'Emergency Network', icon: Hospital },
    { id: 'digital-twin', label: 'Digital Twin', icon: Binary },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'about-project', label: 'About Project & Team', icon: Info },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col shrink-0 overflow-y-auto select-none">
      {/* Navigation Header */}
      <div className="p-3 border-b border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          Mission Systems
        </span>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
          SYS NOMINAL
        </span>
      </div>

      {/* Nav List */}
      <nav className="p-2 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/70 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border border-transparent ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Hardware / Software Bridge Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="rounded-lg p-2.5 bg-slate-900/90 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">TELEMETRY BRIDGE:</span>
            <span className="text-emerald-400 font-bold">CONNECTED</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
            <span>Uplink: Starlink Mesh</span>
            <span className="text-cyan-400 font-mono">8.4 ms</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[94%] animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
