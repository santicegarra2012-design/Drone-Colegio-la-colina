import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Gauge, 
  Layers, 
  Tv, 
  RotateCcw, 
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  GraduationCap,
  Sliders
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { SchoolLogo } from './SchoolLogo.tsx';
import { StudentBadge } from './StudentBadge.tsx';
import { SimulationDisclaimer } from './SimulationDisclaimer.tsx';

export const Header: React.FC = () => {
  const {
    isDemoRunning,
    startDemo,
    stopDemo,
    currentDemoStep,
    demoProgressPercent,
    presentationMode,
    setPresentationMode,
    engineeringMode,
    setEngineeringMode,
    soundEnabled,
    setSoundEnabled,
    simSpeed,
    setSimSpeed,
    resetEntireSimulation,
    selectedEmergency,
    activeTab,
    setActiveTab,
  } = useRescue();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: School Logo + Brand */}
        <div className="flex items-center gap-3">
          <SchoolLogo size="md" />
          <div className="hidden lg:block h-6 w-px bg-slate-800"></div>
          <div className="hidden lg:flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm tracking-wide text-white">
                RESCUE <span className="text-cyan-400">AI</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                NETWORK v3.4
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Autonomous Aerial Emergency Response Platform
            </span>
          </div>
        </div>

        {/* Center: Student Badge + Campus Twin Link + Simulation Studio */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('la-colina-twin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'la-colina-twin'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400'
                : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
            }`}
            title="Open Colegio Campestre La Colina 3D Digital Twin"
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>LA COLINA TWIN</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-900 text-emerald-300 font-mono">3D</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation-studio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'simulation-studio'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400'
                : 'bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
            }`}
            title="Configure Time, Weather, Place, and Launch Custom Simulation"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>SIMULATION STUDIO</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-900 text-cyan-300 font-mono">SANDBOX</span>
          </button>

          <StudentBadge variant="compact" />
        </div>

        {/* Right: Demo Controls, Presentation Mode, Audio, Simulation Speed */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Mission Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">ACTIVE:</span>
            <span className="text-cyan-300 font-semibold">{selectedEmergency.code}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {currentTime}
            </span>
          </div>

          {/* START DEMO BUTTON (Big, Highlighted for School Exhibition) */}
          {isDemoRunning ? (
            <button
              onClick={stopDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-md shadow-red-900/30 font-heading tracking-wider animate-pulse"
              title="Stop automated demo"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={startDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 font-heading tracking-wider hover:scale-[1.02] active:scale-[0.98]"
              title="Launch full end-to-end simulated emergency demonstration"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START DEMO</span>
            </button>
          )}

          {/* Presentation Mode Toggle */}
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              presentationMode
                ? 'bg-purple-950 text-purple-200 border-purple-500 shadow-md shadow-purple-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
            title="Toggle Teacher Presentation Mode"
          >
            <Tv className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Presentation</span>
          </button>

          {/* Engineering Mode Toggle */}
          <button
            onClick={() => setEngineeringMode(!engineeringMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              engineeringMode
                ? 'bg-cyan-950 text-cyan-200 border-cyan-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
            title="Toggle Telemetry Engineering Mode"
          >
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">Engineering</span>
          </button>

          {/* Sim Speed Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  simSpeed === spd ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Simulation speed: ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-900 text-cyan-400 border-slate-800 hover:border-cyan-800'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Simulation */}
          <button
            onClick={resetEntireSimulation}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 transition-colors"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Progress Bar when running */}
      {isDemoRunning && (
        <div className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg p-2 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-heading font-bold text-emerald-400">
              DEMO STEP {currentDemoStep + 1} OF 8:
            </span>
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-[280px] sm:max-w-md">
              {currentDemoStep === 0 && 'Satellite detection & anomaly trigger'}
              {currentDemoStep === 1 && 'AI analysis & incident triage'}
              {currentDemoStep === 2 && 'Mission planning & drone selection'}
              {currentDemoStep === 3 && 'Autonomous navigation & obstacle avoidance'}
              {currentDemoStep === 4 && '3D digital twin & telemetry inspection'}
              {currentDemoStep === 5 && 'Radar life-sign scanning & victim vitals'}
              {currentDemoStep === 6 && 'Robotic arm supply delivery'}
              {currentDemoStep === 7 && 'Emergency network notification & completion'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-24 sm:w-40 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-500"
                style={{ width: `${demoProgressPercent}%` }}
              ></div>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-bold">{demoProgressPercent}%</span>
          </div>
        </div>
      )}
    </header>
  );
};
