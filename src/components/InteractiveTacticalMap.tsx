import React, { useState } from 'react';
import { 
  Navigation, 
  AlertTriangle, 
  Hospital, 
  Truck, 
  BatteryCharging, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  MapPin, 
  Crosshair,
  Compass,
  Wind,
  X,
  ShieldAlert,
  Activity,
  Flame
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { Drone, Emergency } from '../types/index.ts';

interface InteractiveTacticalMapProps {
  heightClass?: string;
  onSelectEmergency?: (id: string) => void;
  onSelectDrone?: (id: string) => void;
}

export const InteractiveTacticalMap: React.FC<InteractiveTacticalMapProps> = ({
  heightClass = 'h-[520px]',
  onSelectEmergency,
  onSelectDrone,
}) => {
  const {
    drones,
    emergencies,
    hospitals,
    ambulances,
    chargingStations,
    selectedDroneId,
    setSelectedDroneId,
    selectedEmergencyId,
    setSelectedEmergencyId,
    deployDroneToEmergency,
  } = useRescue();

  // Map view layers
  const [layers, setLayers] = useState({
    terrain: true,
    roads: true,
    drones: true,
    emergencies: true,
    hospitals: true,
    ambulances: true,
    chargers: true,
    corridors: true,
    traffic: true,
    riskHeatmap: false,
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState<any>(null);
  const [activeModalEntity, setActiveModalEntity] = useState<{ type: string; data: any } | null>(null);

  // Coordinate projection mapping for Medellín sector
  const projectCoords = (lat: number, lng: number) => {
    const minLat = 6.185;
    const maxLat = 6.295;
    const minLng = -75.615;
    const maxLng = -75.550;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const activeDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];
  const activeEmergency = emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  return (
    <div className={`relative w-full ${heightClass} bg-[#071322] rounded-2xl border border-slate-800 overflow-hidden flex flex-col select-none shadow-2xl`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-heading font-bold text-white tracking-wide">METRO CORRIDOR MAP</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-mono text-[11px]">MEDELLÍN VALLEY GEOGRAPHY</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            RTK ACTIVE
          </span>
        </div>

        {/* Layer Filters */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs flex-wrap">
          <button
            onClick={() => setLayers((p) => ({ ...p, terrain: !p.terrain }))}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              layers.terrain ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'
            }`}
          >
            Terrain
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, roads: !p.roads }))}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              layers.roads ? 'bg-slate-700 text-white' : 'text-slate-500'
            }`}
          >
            Roads
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, drones: !p.drones }))}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
              layers.drones ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>Drones</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, emergencies: !p.emergencies }))}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
              layers.emergencies ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-500'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Accidents</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, hospitals: !p.hospitals }))}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold hidden sm:flex items-center gap-1 transition-colors ${
              layers.hospitals ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'
            }`}
          >
            <Hospital className="w-3 h-3" />
            <span>Hospitals</span>
          </button>

          <button
            onClick={() => setLayers((p) => ({ ...p, riskHeatmap: !p.riskHeatmap }))}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold hidden md:flex items-center gap-1 transition-colors ${
              layers.riskHeatmap ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Risk Model</span>
          </button>
        </div>
      </div>

      {/* Map Canvas with Mountains, River, Roads, and Vector Entities */}
      <div
        className="relative w-full h-full cursor-crosshair overflow-hidden"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="mountainWestGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0e2417" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#071322" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mountainEastGrad" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0e2417" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#071322" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* West & East Mountain Elevation Slopes */}
          {layers.terrain && (
            <>
              <path d="M 0 0 L 180 0 L 140 200 L 190 400 L 120 600 L 0 600 Z" fill="url(#mountainWestGrad)" />
              <path d="M 1000 0 L 820 0 L 860 220 L 800 420 L 880 600 L 1000 600 Z" fill="url(#mountainEastGrad)" />

              {/* Contour Elevation Lines */}
              <path d="M 30 50 C 90 90, 110 220, 80 340 C 50 450, 110 520, 60 600" fill="none" stroke="#1b4d32" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.6" />
              <path d="M 970 40 C 890 100, 860 240, 910 380 C 950 470, 880 540, 920 600" fill="none" stroke="#1b4d32" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.6" />
            </>
          )}

          {/* Río Medellín Valley River Ribbon */}
          {layers.roads && (
            <path
              d="M 520 0 C 490 120, 540 240, 510 360 C 480 460, 530 540, 500 600"
              fill="none"
              stroke="#0369a1"
              strokeWidth="10"
              opacity="0.45"
            />
          )}

          {/* Main Expressway Corridors (Autopista Sur & Las Palmas) */}
          {layers.roads && (
            <>
              {/* Autopista Norte-Sur */}
              <path
                d="M 480 0 C 460 140, 510 280, 480 400 C 450 500, 490 560, 470 600"
                fill="none"
                stroke="#334155"
                strokeWidth="12"
              />
              <path
                d="M 480 0 C 460 140, 510 280, 480 400 C 450 500, 490 560, 470 600"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                opacity="0.7"
              />

              {/* Mountain Expressway: Las Palmas Pass */}
              <path
                d="M 480 280 C 600 290, 720 250, 880 180"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
              />
              <path
                d="M 480 280 C 600 290, 720 250, 880 180"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                strokeDasharray="5 5"
                opacity="0.8"
              />
            </>
          )}

          {/* Simulated AI Risk Heatmap Layer */}
          {layers.riskHeatmap && (
            <>
              {/* High Risk Red zone in mountain curve */}
              <ellipse cx="65%" cy="38%" rx="70" ry="40" fill="#ef4444" opacity="0.35" />
              {/* Moderate Risk Orange zone */}
              <ellipse cx="48%" cy="50%" rx="90" ry="50" fill="#f59e0b" opacity="0.25" />
              {/* Low Risk Green zone */}
              <ellipse cx="30%" cy="30%" rx="110" ry="70" fill="#10b981" opacity="0.2" />
            </>
          )}

          {/* Active Flight Vectors / Corridors */}
          {layers.corridors && (
            <>
              {(() => {
                const dronePos = projectCoords(activeDrone.lat, activeDrone.lng);
                const emPos = projectCoords(activeEmergency.lat, activeEmergency.lng);
                return (
                  <g>
                    <line
                      x1={`${dronePos.x}%`}
                      y1={`${dronePos.y}%`}
                      x2={`${emPos.x}%`}
                      y2={`${emPos.y}%`}
                      stroke="url(#corridorGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="8 6"
                      className="animate-pulse"
                    />
                    <circle
                      cx={`${(dronePos.x + emPos.x) / 2}%`}
                      cy={`${(dronePos.y + emPos.y) / 2}%`}
                      r="4"
                      fill="#06b6d4"
                      opacity="0.8"
                    />
                  </g>
                );
              })()}
            </>
          )}
        </svg>

        {/* 1. Charging Stations / Drone Base */}
        {layers.chargers &&
          chargingStations.map((pad) => {
            const pos = projectCoords(pad.lat, pad.lng);
            return (
              <div
                key={pad.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                onClick={() => setActiveModalEntity({ type: 'DRONE_STATION', data: pad })}
                onMouseEnter={() => setHoveredEntity({ type: 'Drone Base', data: pad })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <div className="w-6 h-6 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-125 transition-transform shadow-md">
                  <BatteryCharging className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}

        {/* 2. Hospitals */}
        {layers.hospitals &&
          hospitals.map((hosp) => {
            const pos = projectCoords(hosp.lat, hosp.lng);
            return (
              <div
                key={hosp.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                onClick={() => setActiveModalEntity({ type: 'HOSPITAL', data: hosp })}
                onMouseEnter={() => setHoveredEntity({ type: 'Hospital', data: hosp })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 group-hover:scale-125 transition-transform shadow-lg shadow-emerald-950/50">
                  <Hospital className="w-4 h-4" />
                </div>
              </div>
            );
          })}

        {/* 3. Ambulances */}
        {layers.ambulances &&
          ambulances.map((amb) => {
            const pos = projectCoords(amb.lat, amb.lng);
            return (
              <div
                key={amb.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
                onClick={() => setActiveModalEntity({ type: 'AMBULANCE', data: amb })}
                onMouseEnter={() => setHoveredEntity({ type: 'Ambulance', data: amb })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <div className="w-6 h-6 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 group-hover:scale-125 transition-transform shadow-md">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}

        {/* 4. Accidents / Emergencies */}
        {layers.emergencies &&
          emergencies.map((em) => {
            const pos = projectCoords(em.lat, em.lng);
            const isSelected = em.id === selectedEmergencyId;
            return (
              <div
                key={em.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => {
                  setSelectedEmergencyId(em.id);
                  onSelectEmergency?.(em.id);
                  setActiveModalEntity({ type: 'ACCIDENT', data: em });
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                onMouseEnter={() => setHoveredEntity({ type: 'Emergency Incident', data: em })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-red-500 opacity-60"></span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform shadow-xl ${
                      isSelected
                        ? 'bg-red-600 border-white text-white scale-125'
                        : 'bg-red-950/90 border-red-500 text-red-400 hover:scale-110'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}

        {/* 5. Drones */}
        {layers.drones &&
          drones.map((drone) => {
            const pos = projectCoords(drone.lat, drone.lng);
            const isSelected = drone.id === selectedDroneId;
            const isMission = drone.status === 'MISSION';

            return (
              <div
                key={drone.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => {
                  setSelectedDroneId(drone.id);
                  onSelectDrone?.(drone.id);
                  setActiveModalEntity({ type: 'DRONE', data: drone });
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-25 cursor-pointer group"
                onMouseEnter={() => setHoveredEntity({ type: 'Rescue Drone', data: drone })}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <div className="relative flex items-center justify-center">
                  {isMission && (
                    <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-cyan-400 opacity-50"></span>
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-xl ${
                      isSelected
                        ? 'bg-cyan-500 border-white text-slate-950 scale-125'
                        : isMission
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 hover:scale-110'
                        : 'bg-slate-900/90 border-slate-600 text-slate-400 hover:scale-110'
                    }`}
                    style={{ transform: `rotate(${drone.headingDeg}deg)` }}
                  >
                    <Navigation className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Floating Interactive Inspector Modal for Clicked Entity */}
      {activeModalEntity && (
        <div className="absolute top-16 right-4 z-30 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/60 shadow-2xl text-xs text-left max-w-sm w-full animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              {activeModalEntity.type} INSPECTOR
            </span>
            <button
              onClick={() => setActiveModalEntity(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeModalEntity.type === 'DRONE' && (
            <div className="space-y-2 pt-2 font-mono">
              <div className="text-white font-bold font-heading text-sm">
                {activeModalEntity.data.callsign} ({activeModalEntity.data.id})
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                <div>Battery: <strong className="text-cyan-400">{activeModalEntity.data.batteryPercent}%</strong></div>
                <div>Status: <strong className="text-emerald-400">{activeModalEntity.data.status}</strong></div>
                <div>Altitude: <strong>{activeModalEntity.data.altitudeMeters}m</strong></div>
                <div>Speed: <strong>{activeModalEntity.data.speedKmh} km/h</strong></div>
              </div>
              <div className="text-[10px] text-slate-400">
                Active Mission: <strong>{activeModalEntity.data.assignedEmergencyId || 'Standby Ready'}</strong>
              </div>
            </div>
          )}

          {activeModalEntity.type === 'ACCIDENT' && (
            <div className="space-y-2 pt-2">
              <div className="text-red-400 font-bold font-heading text-sm">
                {activeModalEntity.data.title}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300">
                <div>Severity: <strong className="text-red-400">{activeModalEntity.data.severity}</strong></div>
                <div>Status: <strong className="text-amber-400">{activeModalEntity.data.status}</strong></div>
                <div>Victims: <strong className="text-white">{activeModalEntity.data.potentialVictimsCount}</strong></div>
                <div>Location: <strong className="text-white">{activeModalEntity.data.locationName}</strong></div>
              </div>
            </div>
          )}

          {activeModalEntity.type === 'HOSPITAL' && (
            <div className="space-y-2 pt-2">
              <div className="text-emerald-400 font-bold font-heading text-sm">
                {activeModalEntity.data.name}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300">
                <div>Available ICU: <strong className="text-emerald-400">{activeModalEntity.data.availableBeds} beds</strong></div>
                <div>Status: <strong className="text-cyan-400">{activeModalEntity.data.traumaCenterLevel}</strong></div>
              </div>
            </div>
          )}

          {activeModalEntity.type === 'DRONE_STATION' && (
            <div className="space-y-2 pt-2">
              <div className="text-white font-bold font-heading text-sm">
                {activeModalEntity.data.name}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300">
                <div>Available Pads: <strong className="text-cyan-400">{activeModalEntity.data.availablePads}/{activeModalEntity.data.totalPads}</strong></div>
                <div>Charger: <strong className="text-emerald-400">Fast RTK Induction</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Map Status Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="font-mono text-[11px] text-slate-500">PROJECTION: WGS-84 / RTK DIFFERENTIAL</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:flex items-center gap-1 text-[11px]">
            <Wind className="w-3 h-3 text-cyan-400" />
            <span>WIND: 14 km/h NW</span>
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Map Coordinates"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
