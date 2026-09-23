import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Activity, 
  Cpu, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  Sparkles,
  Compass,
  Battery,
  Radio,
  Eye,
  Camera,
  Layers,
  Crosshair
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

export const DigitalTwinView: React.FC = () => {
  const { simulatorState, armState, showAiExplanation } = useRescue();
  const [motor3Warning, setMotor3Warning] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Anomaly Injection
  const toggleMotorAnomaly = () => {
    sound.playAlert();
    setMotor3Warning(!motor3Warning);
  };

  // Three.js Interactive 3D Drone Model
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060f1c);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 12, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x475569, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2);
    keyLight.position.set(15, 25, 20);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x10b981, 1);
    fillLight.position.set(-15, -10, -15);
    scene.add(fillLight);

    // Grid Floor
    const grid = new THREE.GridHelper(30, 20, 0x06b6d4, 0x1e293b);
    grid.position.y = -3;
    scene.add(grid);

    // Hexacopter Drone Group
    const drone = new THREE.Group();

    // Central Hex Body
    const bodyGeo = new THREE.CylinderGeometry(2.4, 2.8, 1.4, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    drone.add(body);

    // Top Sensor Dome
    const domeGeo = new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.7;
    drone.add(dome);

    // 6 Booms and Rotors
    const armGeo = new THREE.CylinderGeometry(0.16, 0.16, 4.5, 8);
    armGeo.rotateZ(Math.PI / 2);
    const motorGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.6, 12);
    const propGeo = new THREE.BoxGeometry(4.2, 0.05, 0.35);

    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const propMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.85 });

    const props: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const boom = new THREE.Group();
      boom.rotation.y = angle;

      const arm = new THREE.Mesh(armGeo, carbonMat);
      arm.position.x = 2.4;
      boom.add(arm);

      const motor = new THREE.Mesh(motorGeo, motorMat);
      motor.position.x = 4.6;
      boom.add(motor);

      // Warning color on Motor 3 if active
      if (i === 2 && motor3Warning) {
        (motor.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
      }

      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(4.6, 0.4, 0);
      boom.add(prop);
      props.push(prop);

      // Navigation LEDs
      const ledColor = i === 0 || i === 1 ? 0xef4444 : i === 2 ? 0x10b981 : 0xffffff;
      const led = new THREE.PointLight(ledColor, 1.2, 8);
      led.position.set(4.8, 0.2, 0);
      boom.add(led);

      drone.add(boom);
    }

    // Robotic Arm underneath
    const armBaseGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 8);
    const armBase = new THREE.Mesh(armBaseGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    armBase.position.y = -1.2;
    drone.add(armBase);

    scene.add(drone);

    // Animation Loop
    let animId: number;
    let angle = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      angle += 0.008;

      // Slow orbital spin
      drone.rotation.y += 0.005;

      // Spin propellers
      props.forEach((p, idx) => {
        const spin = idx % 2 === 0 ? 0.35 : -0.35;
        p.rotation.y += spin;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [motor3Warning]);

  const motors = [
    { id: 1, temp: 48, rpm: 4820, current: 8.2, status: 'NOMINAL' },
    { id: 2, temp: 49, rpm: 4810, current: 8.1, status: 'NOMINAL' },
    { 
      id: 3, 
      temp: motor3Warning ? 89 : 51, 
      rpm: motor3Warning ? 3200 : 4840, 
      current: motor3Warning ? 14.8 : 8.3, 
      status: motor3Warning ? 'THERMAL_THROTTLING' : 'NOMINAL' 
    },
    { id: 4, temp: 47, rpm: 4800, current: 8.0, status: 'NOMINAL' },
    { id: 5, temp: 50, rpm: 4830, current: 8.2, status: 'NOMINAL' },
    { id: 6, temp: 48, rpm: 4815, current: 8.1, status: 'NOMINAL' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PHYSICAL TO CLOUD MIRROR
            </span>
            <span className="text-xs text-slate-400 font-mono">DIGITAL TWIN: DR-07 MK-IV</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Drone Digital Twin & Live Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time synchronization between the simulated physical hexacopter, motor controller ESCs, and AI predictive health diagnostics.
          </p>
        </div>

        {/* Anomaly Test Injection */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMotorAnomaly}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              motor3Warning
                ? 'bg-amber-600 text-slate-950 border-amber-400 shadow-md shadow-amber-950/40 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{motor3Warning ? 'RESOLVE MOTOR 3 ANOMALY' : 'SIMULATE MOTOR 3 OVERHEAT'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: LEFT 3D Drone + RIGHT Live Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Interactive 3D Drone */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl h-[440px] flex flex-col">
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>HEXACOPTER CAD MODEL • ACTIVE RUNTIME MIRROR</span>
          </div>

          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          <div className="mt-auto bg-slate-900/90 border-t border-slate-800 p-2.5 flex items-center justify-between text-xs font-mono z-10">
            <span className="text-slate-400">FRAME: TORAY T700 CARBON FIBER</span>
            <span className="text-emerald-400">STATE: LIVE SYNCHRONIZED</span>
          </div>
        </div>

        {/* RIGHT: Live Simulated Telemetry Display */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Flight Telemetry Feed
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              REAL-TIME SYNC
            </span>
          </div>

          {/* Telemetry Stat Cards */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" /> POSITION Altitude
              </span>
              <strong className="text-white text-sm">{simulatorState.altitude} m</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" /> BATTERY
              </span>
              <strong className="text-emerald-400 text-sm">78% (Nominal)</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> SPEED
              </span>
              <strong className="text-white text-sm">{simulatorState.speed > 0 ? (simulatorState.speed / 3.6).toFixed(1) : '18.4'} m/s</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" /> GPS
              </span>
              <strong className="text-cyan-400 text-xs">CONNECTED (RTK LOCK)</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" /> LIDAR
              </span>
              <strong className="text-emerald-400 text-xs">ACTIVE (360° LASER)</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" /> CAMERA
              </span>
              <strong className="text-cyan-400 text-xs">ACTIVE (4K FLIR SENSOR)</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-yellow-400" /> ROBOTIC ARM
              </span>
              <strong className="text-yellow-400 text-xs">READY ({armState.gripperState})</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Hexacopter Redundancy Notice if Active */}
      {motor3Warning && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500 text-amber-200 text-xs font-mono flex items-center gap-3 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="block font-bold">HEXACOPTER REDUNDANCY LAW ENGAGED</strong>
            Motor #3 ESC exceeded 85°C. AI flight controller has throttled Motor #3 and redistributed 20% torque to opposing Motors #1 and #5. Level flight maintained with zero altitude loss.
          </div>
        </div>
      )}

      {/* 6 Motor Telemetry Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          FOC Brushless Motor & ESC Health Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {motors.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition-all ${
                m.status === 'NOMINAL'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-amber-950/40 border-amber-500/80 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                <span className="font-bold text-white">MOTOR #{m.id} ESC</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    m.status === 'NOMINAL'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">TEMP</div>
                  <div className={`font-bold ${m.temp > 70 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {m.temp}°C
                  </div>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">RPM</div>
                  <div className="font-bold text-slate-200">{m.rpm}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400">CURRENT</div>
                  <div className="font-bold text-slate-200">{m.current}A</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
