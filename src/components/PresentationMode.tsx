import React, { useState } from 'react';
import { 
  Tv, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Sparkles, 
  Compass, 
  ShieldAlert, 
  Cpu, 
  HeartPulse, 
  Send, 
  Hospital,
  Layers
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { SchoolLogo } from './SchoolLogo.tsx';

export const PresentationMode: React.FC = () => {
  const { 
    presentationMode, 
    setPresentationMode, 
    startDemo, 
    isDemoRunning,
    setActiveTab 
  } = useRescue();

  const [slide, setSlide] = useState(0);

  if (!presentationMode) return null;

  const slides = [
    {
      title: 'THE CRITICAL PROBLEM: EMERGENCY LATENCY',
      subtitle: 'Traffic congestion, mountainous topography, and delayed triage in metropolitan regions',
      badge: 'PROBLEM DEFINITION',
      icon: ShieldAlert,
      points: [
        'Urban traffic and rough geography delay conventional ambulances beyond the critical "Golden Hour" of trauma.',
        'Initial dispatchers often lack real-time visual and vital sign intelligence before units arrive.',
        'Accidents at night or in adverse weather compound victim search times under collapsed structures or highway embankments.',
      ],
      metric: 'AVERAGE RESPONSE: 18 - 25 MINUTES VIA GROUND AMBULANCE',
      metricSub: 'Survival probability decreases 10% for every minute of delayed cardiac or hemorrhage intervention.',
    },
    {
      title: 'THE RESCUE AI SOLUTION: AUTONOMOUS AERIAL ECOSYSTEM',
      subtitle: 'Artificial Intelligence, Satellites, Robotics, and Autonomous Drones saving lives faster',
      badge: 'ARCHITECTURAL INNOVATION',
      icon: Send,
      points: [
        'Orbital and smart-infrastructure sensors detect anomalies (impacts, thermal blooms, acoustic shockwaves) instantly.',
        'AI analyzes environmental severity, selects the nearest capable hexacopter, and plans an optimal flight corridor.',
        'Drone DR-07 deploys within 15 seconds, reaching the incident at up to 95 km/h, bypassing ground traffic.',
      ],
      metric: 'SIMULATED RESCUE AI RESPONSE: < 2.0 MINUTES',
      metricSub: 'Up to 90% reduction in initial reconnaissance and first-response payload delivery latency.',
    },
    {
      title: 'MULTI-MODAL PERCEPTION: 3D LIDAR & RADAR VITALS',
      subtitle: 'Seeing through smoke, darkness, and structural debris',
      badge: 'ADVANCED SENSING',
      icon: HeartPulse,
      points: [
        '360-degree 16-channel LiDAR constructs instantaneous 3D point clouds of crash debris and terrain.',
        'Ultra-Wideband (UWB) through-wall radar filters sub-millimeter chest wall movements to measure heart rate and breathing.',
        'Thermal FLIR cameras isolate victim body heat signatures even beneath vehicle wreckage or foliage.',
      ],
      metric: '3 POTENTIAL VICTIMS ACCURATELY LOCALIZED',
      metricSub: 'Vital signs stream directly to hospital trauma surgeons before ground ambulances reach the scene.',
    },
    {
      title: 'PHYSICAL INTERVENTION: MULTI-AXIS ROBOTIC MANIPULATOR',
      subtitle: 'Moving beyond observation to active autonomous assistance',
      badge: 'PAYLOAD & ROBOTICS',
      icon: Cpu,
      points: [
        'Precision servo-driven manipulator with soft-touch silicone gripper delivers medical payloads.',
        'Deploys smart hemostatic bandages, tourniquet concepts, and automated external defibrillator (AED) pods.',
        'Capable of opening vehicle latches, pushing emergency cutoff switches, and dropping thermal blankets.',
      ],
      metric: 'DIRECT AID DELIVERY ON-SITE',
      metricSub: 'Enables immediate stabilization while emergency rescue crews are still navigating en route.',
    },
    {
      title: 'CONNECTED EMERGENCY NETWORK: HOSPITAL HANDOFF',
      subtitle: 'Zero data friction between drone, cloud, ambulances, and emergency rooms',
      badge: 'CONNECTED ECOSYSTEM',
      icon: Hospital,
      points: [
        'Encrypted telemetry feeds live 3D crash models directly to Hospital General de Medellín and incoming ambulances.',
        'Trauma teams receive exact injury profiles and patient vital trends prior to physical arrival.',
        'Automated charging pad network ensures continuous perimeter coverage across urban and rural sectors.',
      ],
      metric: 'COMPLETE EMERGENCY LOOP CLOSED',
      metricSub: 'Validated through automated 8-stage simulated rescue sequence.',
    },
  ];

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 md:p-10 animate-in fade-in duration-200 text-left select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <SchoolLogo size="lg" />
          <div className="hidden sm:block h-10 w-px bg-slate-800"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                TEACHER & JURY PRESENTATION MODE
              </span>
              <span className="text-xs text-slate-400 font-mono">SLIDE {slide + 1} OF {slides.length}</span>
            </div>
            <h2 className="text-xl font-black text-white font-heading mt-1">
              RESCUE AI — Engineering Exhibition 2026
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPresentationMode(false);
              startDemo();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live Interactive Demo</span>
          </button>

          <button
            onClick={() => setPresentationMode(false)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Presentation Mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Slide Body */}
      <div className="my-auto py-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            {current.badge}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white font-heading tracking-tight">
          {current.title}
        </h1>
        <p className="text-base md:text-xl text-slate-400 font-sans mt-2 font-medium">
          {current.subtitle}
        </p>

        {/* Bullets */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {current.points.map((pt, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center mb-3 border border-cyan-800">
                  0{idx + 1}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">{pt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Big Metric Box */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              KEY DEMONSTRATION METRIC
            </span>
            <div className="text-xl md:text-2xl font-black text-white font-heading mt-1">
              {current.metric}
            </div>
            <p className="text-xs text-slate-400 mt-1">{current.metricSub}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setPresentationMode(false);
                setActiveTab(
                  slide === 1 ? 'drone-fleet' : slide === 2 ? 'victim-detection' : slide === 3 ? 'robotic-arm' : 'command-center'
                );
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Inspect Live Module
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Student credits */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Engineering Team:</span>
          <span>Santiago Cegarra</span>
          <span>•</span>
          <span>Samuel Velasco</span>
          <span>•</span>
          <span>Jeronimo Escobar</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-emerald-400 font-medium">Colegio Campestre La Colina</span>
        </div>

        {/* Slide navigation buttons */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  slide === i ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setSlide((prev) => Math.max(0, prev - 1))}
            disabled={slide === 0}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={slide === slides.length - 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
