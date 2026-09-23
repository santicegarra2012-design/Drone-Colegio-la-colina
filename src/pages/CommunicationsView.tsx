import React, { useState } from 'react';
import { 
  Radio, 
  Satellite, 
  Server, 
  Hospital, 
  Truck, 
  Send, 
  Wifi, 
  WifiOff, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

export const CommunicationsView: React.FC = () => {
  const { showAiExplanation } = useRescue();
  const [jammingActive, setJammingActive] = useState<boolean>(false);

  const toggleJamming = () => {
    sound.playAlert();
    setJammingActive(!jammingActive);
  };

  const nodes = [
    {
      id: 'drone',
      title: 'Autonomous Drone DR-07',
      type: 'AERIAL_NODE',
      ip: '10.240.1.7',
      latency: jammingActive ? 'TIMEOUT' : '18 ms',
      status: jammingActive ? 'MESH_EDGE_AUTONOMOUS' : 'ONLINE',
      bandwidth: jammingActive ? '0.0 Mbps (Jamming Detected)' : '142 Mbps (5G / COFDM)',
      icon: Send,
      color: 'text-cyan-400',
    },
    {
      id: 'satellite',
      title: 'Low Earth Orbit (LEO) Satellite Relay',
      type: 'ORBITAL_NODE',
      ip: '10.240.0.1',
      latency: jammingActive ? 'DEGRADED (240ms)' : '32 ms',
      status: jammingActive ? 'DEGRADED' : 'ONLINE',
      bandwidth: jammingActive ? '2.4 Mbps' : '85 Mbps Ku-Band',
      icon: Satellite,
      color: 'text-purple-400',
    },
    {
      id: 'cloud',
      title: 'AI Studio Cloud & Ground Server',
      type: 'CORE_COMPUTE',
      ip: '10.240.2.10',
      latency: '8 ms',
      status: 'ONLINE',
      bandwidth: '10 Gbps Fiber',
      icon: Server,
      color: 'text-emerald-400',
    },
    {
      id: 'dispatch',
      title: 'Medellín Central Emergency Dispatch',
      type: 'COMMAND_CENTER',
      ip: '10.240.3.1',
      latency: '12 ms',
      status: 'ONLINE',
      bandwidth: '1 Gbps Dedicated EOC',
      icon: Radio,
      color: 'text-amber-400',
    },
    {
      id: 'hospital',
      title: 'Hospital General Trauma Center',
      type: 'MEDICAL_RECEIVER',
      ip: '10.240.4.15',
      latency: '14 ms',
      status: 'ONLINE',
      bandwidth: '500 Mbps Live Bio-Telemetry',
      icon: Hospital,
      color: 'text-rose-400',
    },
    {
      id: 'ambulance',
      title: 'Field Ambulance Unit AMB-01',
      type: 'MOBILE_RESPONDER',
      ip: '10.240.5.21',
      latency: jammingActive ? 'LOCAL MESH ONLY' : '22 ms',
      status: jammingActive ? 'LOCAL_PEER' : 'ONLINE',
      bandwidth: '25 Mbps Mobile Cellular',
      icon: Truck,
      color: 'text-sky-400',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              TACTICAL COMMS MESH
            </span>
            <span className="text-xs text-slate-400 font-mono">PROTOCOL: COFDM / 5G / SATELLITE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Resilient Communications & Data Links
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Redundant mesh networking connecting drones, satellites, emergency operators, trauma hospitals, and ambulances.
          </p>
        </div>

        {/* Satellite Jamming / Comms Failure Simulation Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleJamming}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              jammingActive
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/50 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            {jammingActive ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span>{jammingActive ? 'SIMULATED LINK FAILURE ACTIVE' : 'SIMULATE LINK INTERRUPTION'}</span>
          </button>
        </div>
      </div>

      {/* Comms Interruption Notice if Active */}
      {jammingActive && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-3 shadow-xl">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <strong className="block font-bold">AUTONOMOUS EDGE FAIL-SAFE ACTIVATED</strong>
            Ground command link severed. Drone DR-07 has transitioned from cloud guidance to onboard NVIDIA Jetson Orin autonomous flight logic. Mission continues safely without human pilot in loop.
          </div>
        </div>
      )}

      {/* Network Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <Icon className={`w-5 h-5 ${node.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">{node.title}</h3>
                    <span className="text-[10px] font-mono text-slate-500 block">{node.type}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    node.status === 'ONLINE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {node.status}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Virtual IP:</span>
                  <span className="text-slate-200">{node.ip}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Packet Latency:</span>
                  <span className={jammingActive && node.id === 'drone' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {node.latency}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bandwidth Link:</span>
                  <span className="text-cyan-300">{node.bandwidth}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Architecture Concept Explanation */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Triple-Redundant Network Architecture Explained
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Designed by Santiago Cegarra, Samuel Velasco, and Jeronimo Escobar for Colegio Campestre La Colina. In major disasters, cellular cell towers often lose power or collapse. The Rescue AI architecture utilizes a tri-band physical layer: 1) Local 5.8 GHz COFDM mesh between drones and ambulances, 2) Low-Earth Orbit satellite telemetry, and 3) Decentralized onboard edge compute so the drone never crashes if connection is lost.
        </p>

        <button
          onClick={() =>
            showAiExplanation(
              'Communications Redundancy & Edge Fallback',
              'If hostile weather, deep mountain canyons, or cell tower outages sever connectivity, the hexacopter switches within 80 milliseconds into Autonomous Edge Mode. The onboard Jetson Orin computes flight vectors, avoids power lines via LiDAR, scans victims via radar, and stores victim telemetry in local memory until ground teams arrive.'
            )
          }
          className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why is edge fail-safe critical for emergency certification?</span>
        </button>
      </div>
    </div>
  );
};
