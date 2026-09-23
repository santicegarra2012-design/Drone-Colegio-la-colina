import React, { useState } from 'react';
import { 
  Compass, 
  Send, 
  AlertTriangle, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Navigation,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

export const MissionPlannerView: React.FC = () => {
  const { 
    emergencies, 
    drones, 
    deployDroneToEmergency, 
    setActiveTab,
    selectedEmergencyId,
    setSelectedEmergencyId,
    selectedDroneId,
    setSelectedDroneId 
  } = useRescue();

  const [step, setStep] = useState<number>(1);
  const [selectedRoute, setSelectedRoute] = useState<string>('Corridor-Alpha-Direct');
  const [selectedPayloads, setSelectedPayloads] = useState<string[]>([
    'Trauma Kit IV',
    'Robotic Manipulator Arm',
    'AED Concept Pod',
  ]);

  const targetEmergency = emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];
  const targetDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  const routes = [
    {
      id: 'Corridor-Alpha-Direct',
      name: 'Corridor Alpha (Direct High-Speed Vector)',
      distance: '3.8 km',
      eta: '1.8 min',
      risk: 'LOW',
      desc: 'Flies at 55m AGL along expressway airspace. Zero building obstacles.',
    },
    {
      id: 'Corridor-Beta-Ridge',
      name: 'Corridor Beta (Terrain-Hugging Mountain Bypass)',
      distance: '4.9 km',
      eta: '2.5 min',
      risk: 'MODERATE',
      desc: 'Follows valley contour to avoid 35 km/h high altitude wind shears.',
    },
    {
      id: 'Corridor-Gamma-Quiet',
      name: 'Corridor Gamma (Acoustically Sensitive Urban Route)',
      distance: '4.2 km',
      eta: '2.2 min',
      risk: 'LOW',
      desc: 'Low-RPM descent profile reducing ground decibel impact over residential zones.',
    },
  ];

  const payloadOptions = [
    { id: 'Trauma Kit IV', name: 'Trauma Kit IV (Hemostatic Dressings, Tourniquets)', weight: '1.2 kg' },
    { id: 'Robotic Manipulator Arm', name: 'Carbon-Titanium 4-Axis Robotic Manipulator', weight: '2.1 kg' },
    { id: 'AED Concept Pod', name: 'Automated External Defibrillator Concept', weight: '1.5 kg' },
    { id: 'Bio-Radar', name: 'Through-Debris UWB Vital Sign Radar Array', weight: '0.9 kg' },
    { id: 'Thermal Pod', name: 'FLIR Long-Wave Thermal Infrared Camera', weight: '0.6 kg' },
    { id: 'Thermal Blankets', name: '2x Space Aerogel Thermal Survival Wraps', weight: '0.4 kg' },
  ];

  const togglePayload = (id: string) => {
    sound.playBeep(1100, 0.05);
    if (selectedPayloads.includes(id)) {
      setSelectedPayloads(selectedPayloads.filter((p) => p !== id));
    } else {
      setSelectedPayloads([...selectedPayloads, id]);
    }
  };

  const handleLaunch = () => {
    sound.playAlert();
    deployDroneToEmergency(targetDrone.id, targetEmergency.id);
    setActiveTab('drone-simulator');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              TACTICAL FLIGHT OPS
            </span>
            <span className="text-xs text-slate-400 font-mono">MISSION DISPATCH WIZARD</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Autonomous Mission Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure incident routing, payload compatibility, and safety envelopes before launching autonomous flight.
          </p>
        </div>

        {/* Wizard Step Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.playBeep(980, 0.05);
                setStep(s);
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                step === s
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Step {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step Content */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl min-h-[460px] flex flex-col justify-between">
          <div>
            {/* STEP 1: Select Emergency */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">1</span>
                    Select Emergency Incident
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{emergencies.length} Incidents Available</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {emergencies.map((em) => {
                    const isSelected = selectedEmergencyId === em.id;
                    return (
                      <div
                        key={em.id}
                        onClick={() => {
                          sound.playBeep(1100, 0.05);
                          setSelectedEmergencyId(em.id);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-bold">{em.code}</span>
                            <span className="text-white font-bold font-heading text-sm">{em.title}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              em.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {em.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">{em.description}</p>
                        <div className="mt-2.5 flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                          <span>Location: {em.locationName}</span>
                          <span>•</span>
                          <span>Victims: {em.potentialVictimsCount}</span>
                          <span>•</span>
                          <span>Weather: {em.weather}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Select Drone */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">2</span>
                    Assign Rescue Hexacopter
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">FLEET READINESS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {drones.map((d) => {
                    const isSelected = selectedDroneId === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          sound.playBeep(1100, 0.05);
                          setSelectedDroneId(d.id);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-white text-sm">{d.id} ({d.callsign})</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono">{d.model}</p>
                        <div className="mt-3 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">Battery: <strong className="text-cyan-300">{d.batteryPercent}%</strong></span>
                          <span className="text-slate-400">Max Spd: <strong className="text-slate-200">{d.maxSpeedKmh} km/h</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Select Flight Route */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">3</span>
                    Choose Airspace Corridor & Flight Path
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">DYNAMIC PATH PLANNING</span>
                </div>

                <div className="space-y-3">
                  {routes.map((r) => {
                    const isSelected = selectedRoute === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          sound.playBeep(1100, 0.05);
                          setSelectedRoute(r.id);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-white text-sm">{r.name}</span>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-cyan-300">{r.distance}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-emerald-400 font-bold">ETA: {r.eta}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Equipment & Payloads */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-mono">4</span>
                    Equip Emergency Payload Modules
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">MAX PAYLOAD: 5.0 KG</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {payloadOptions.map((opt) => {
                    const isSelected = selectedPayloads.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => togglePayload(opt.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs text-white font-heading block">{opt.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Weight: {opt.weight}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Review & Launch */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center font-mono">5</span>
                    Pre-Flight Mission Authorization
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono font-bold">ALL CHECKS NOMINAL</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Target Incident:</span>
                    <span className="text-white font-bold">{targetEmergency.code} ({targetEmergency.title})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Assigned Platform:</span>
                    <span className="text-cyan-300 font-bold">{targetDrone.id} — {targetDrone.callsign} ({targetDrone.batteryPercent}% Bat)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Airspace Corridor:</span>
                    <span className="text-slate-200">{selectedRoute}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Estimated Transit Time:</span>
                    <span className="text-emerald-400 font-bold">~1.8 Minutes</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Configured Payloads:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPayloads.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Step Buttons */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold transition-colors"
            >
              Previous Step
            </button>

            {step < 5 ? (
              <button
                onClick={() => {
                  sound.playBeep(980, 0.05);
                  setStep((s) => s + 1);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-heading shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs font-heading shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Autonomous Flight Mission</span>
              </button>
            )}
          </div>
        </div>

        {/* Mission Summary Card (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              MISSION MANIFEST CARD
            </span>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
              <div className="text-base font-black text-white font-heading">
                MISSION {targetEmergency.code}
              </div>
              <div className="text-slate-400 text-[11px]">
                Drone: <strong className="text-cyan-300">{targetDrone.id}</strong>
              </div>
              <div className="text-slate-400 text-[11px]">
                Destination: <strong className="text-slate-200">{targetEmergency.locationName}</strong>
              </div>
              <div className="text-slate-400 text-[11px]">
                Distance: <strong className="text-emerald-400">3.8 km</strong>
              </div>
              <div className="text-slate-400 text-[11px]">
                Mode: <strong className="text-purple-400">Full Autonomous RTK</strong>
              </div>
            </div>

            <button
              onClick={handleLaunch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs font-heading shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>START SIMULATION</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-semibold block mb-1">Colegio Campestre La Colina Safety Protocol:</span>
            Autonomous mission paths compute a minimum 25-meter obstacle envelope around overhead utility lines, highway signs, and high-rise facades.
          </div>
        </div>
      </div>
    </div>
  );
};
