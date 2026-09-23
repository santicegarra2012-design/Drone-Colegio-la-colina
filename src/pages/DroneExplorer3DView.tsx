import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  RotateCw, 
  Layers, 
  Cpu, 
  Eye, 
  Radio, 
  Battery, 
  Activity, 
  CheckCircle2, 
  Maximize2, 
  Sparkles,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';

interface ComponentInfo {
  id: string;
  name: string;
  subsystem: string;
  status: 'NOMINAL' | 'CALIBRATING' | 'STANDBY';
  telemetry: string;
  description: string;
  hardwareSpecs: string[];
}

export const DroneExplorer3DView: React.FC = () => {
  const { selectedDrone, showAiExplanation } = useRescue();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPart, setSelectedPart] = useState<string>('lidar');
  const [exploded, setExploded] = useState<boolean>(false);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const partsData: Record<string, ComponentInfo> = {
    lidar: {
      id: 'lidar',
      name: '360° Multi-Channel Solid-State LiDAR',
      subsystem: 'Perception & Collision Avoidance',
      status: 'NOMINAL',
      telemetry: 'Scan Rate: 200k pts/sec | Range: 120m | Beam Divergence: 0.18°',
      description: 'Creates a dense 3D point cloud of the emergency scene. Detects power lines, tree branches, rubble, and structural instability in zero-light or dense fog conditions.',
      hardwareSpecs: [
        'Wavelength: 905nm Eye-Safe Class 1',
        'Field of View: 360° Horizontal x 40° Vertical',
        'Accuracy: ±1.5 cm at 50 meters distance',
        'Direct interface to onboard NVIDIA Jetson Orin AI compute',
      ],
    },
    camera: {
      id: 'camera',
      name: '4K Tri-Spectral Optical & Thermal Gimbal',
      subsystem: 'Visual Recognition & Thermography',
      status: 'NOMINAL',
      telemetry: 'FOV: 84° | Sensor: 1/1.2" CMOS | Thermal Resolution: 640x512',
      description: 'Provides ultra-high resolution visible imagery combined with long-wavelength infrared (LWIR). Highlights victim body heat signatures and pinpoint vehicle engine hot spots.',
      hardwareSpecs: [
        'Visible Zoom: 30x Optical / 120x Hybrid',
        'Thermal Sensitivity (NETD): <30mK at f/1.0',
        'Mechanical 3-Axis Brushless Stabilization: ±0.005° precision',
        'Simulated AI Real-Time Object & Face Detection Pipeline',
      ],
    },
    arm: {
      id: 'arm',
      name: 'Carbon-Titanium Multi-Axis Robotic Arm',
      subsystem: 'Physical Manipulation & Aid Delivery',
      status: 'NOMINAL',
      telemetry: 'Payload Capacity: 4.8 kg | Degrees of Freedom: 4 | Torque: 18 N·m',
      description: 'Articulated robotic arm capable of precision manipulation on the ground or in hover. Grips emergency supplies, pushes breaker switches, unlatches vehicle door handles, or moves light obstacles.',
      hardwareSpecs: [
        'Joint Encoders: 14-bit magnetic absolute feedback',
        'End-Effector: Soft-silicone adaptive gripper with force sensing',
        'Arm Reach: 78 cm radial reach from center chassis',
        'Safety Fail-Safe: Dual-clutch mechanical overload disengagement',
      ],
    },
    gps: {
      id: 'gps',
      name: 'Triple-Band RTK-GPS / GNSS Receiver',
      subsystem: 'Global Positioning & Navigation',
      status: 'NOMINAL',
      telemetry: 'Satellites Locked: 28 | Fix Type: RTK Fixed | Accuracy: ±1.8 cm',
      description: 'Differential satellite receiver utilizing GPS, Galileo, GLONASS, and BeiDou networks. Allows rock-solid autonomous hover even in 45 km/h mountain gusts.',
      hardwareSpecs: [
        'Update Rate: 20 Hz high-frequency position polling',
        'Anti-Jamming: Active multi-band notch filtering and spoofing detection',
        'Dual helical patch antenna arrays for direct attitude determination',
        'Integrated with barometric pressure altimeter and IMU fusion',
      ],
    },
    payload: {
      id: 'payload',
      name: 'Quick-Release Medical Trauma Pod (MTP-4)',
      subsystem: 'First-Aid & Emergency Supplies',
      status: 'NOMINAL',
      telemetry: 'Weight: 2.4 kg | Pod Temperature: 4.2°C (Vaccine/Blood Ready)',
      description: 'Pressurized, insulated pod carrying automated external defibrillator (AED concept), smart tourniquets, hemostatic dressings, thermal survival wraps, and emergency hydration.',
      hardwareSpecs: [
        'Deployment Mechanism: Solenoid magnetic latch + tether parachute release',
        'Thermal Insulation: Aerogel vacuum core maintain 2-8°C for 6 hours',
        'Direct bio-telemetry link to dispatch medical control',
        'Refillable modular cartridges for specific emergency categories',
      ],
    },
    battery: {
      id: 'battery',
      name: 'Solid-State High-Discharge Li-Metal Pack',
      subsystem: 'Energy Storage & Power Distribution',
      status: 'NOMINAL',
      telemetry: `Capacity: 28,000 mAh | Voltage: 50.4V (12S) | Current: 64A peak`,
      description: 'Next-generation solid-state cell architecture. Eliminates thermal runaway fire hazard and provides superior energy density for extended 45-minute rescue flight radius.',
      hardwareSpecs: [
        'Specific Energy: 420 Wh/kg high density',
        'Cell Temperature Management: Graphene active heat spreader',
        'Cycle Life: 1,500 full charge cycles at 90% health retention',
        'Smart BMS with real-time cell impedance telemetry',
      ],
    },
    motors: {
      id: 'motors',
      name: '6x FOC Brushless Outrunner Motors & Carbon Props',
      subsystem: 'Aerodynamics & Propulsion',
      status: 'NOMINAL',
      telemetry: 'Max Thrust: 24.6 kg (Combined) | RPM: 4,800 | Prop Diameter: 18"',
      description: 'Field-Oriented Control (FOC) sinusoidal electronic speed controllers driving folding carbon-fiber propellers. Extremely quiet acoustic signature and high gust authority.',
      hardwareSpecs: [
        'Redundancy: Hexacopter config can maintain controlled flight on 5 motors',
        'Ingress Protection: IP66 sealed against driving torrential rain',
        'Dynamic motor braking for instant descent control',
        'Carbon-fiber folding blades with low-vibration balance',
      ],
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 4, 7);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const cyanSpot = new THREE.SpotLight(0x06b6d4, 5, 20, Math.PI / 4, 0.5);
    cyanSpot.position.set(6, 8, 4);
    scene.add(cyanSpot);

    const emeraldSpot = new THREE.SpotLight(0x10b981, 3, 20, Math.PI / 4, 0.5);
    emeraldSpot.position.set(-6, -4, -4);
    scene.add(emeraldSpot);

    const blueDir = new THREE.DirectionalLight(0x38bdf8, 2);
    blueDir.position.set(0, 10, 5);
    scene.add(blueDir);

    // Root Drone Group
    const droneGroup = new THREE.Group();
    scene.add(droneGroup);

    // Materials
    const darkCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.8,
      wireframe,
    });
    const cyanTechMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      roughness: 0.2,
      metalness: 0.9,
      wireframe,
    });
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.3,
      metalness: 0.5,
      wireframe,
    });
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      roughness: 0.1,
      metalness: 1.0,
    });
    const propMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.8,
    });

    // Sub-groups for exploded view animation
    const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.45, 8), darkCarbonMat);
    droneGroup.add(bodyMesh);

    // Top Cover with Colegio La Colina signature green accent
    const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.1, 8), emeraldMat);
    topPlate.position.y = 0.25;
    droneGroup.add(topPlate);

    // 1. LiDAR Puck on top
    const lidarGroup = new THREE.Group();
    const lidarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.22, 16), darkCarbonMat);
    const lidarDome = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16), cyanTechMat);
    lidarDome.position.y = 0.12;
    lidarGroup.add(lidarBase);
    lidarGroup.add(lidarDome);
    lidarGroup.position.set(0, 0.4, 0);
    droneGroup.add(lidarGroup);

    // Laser beam visualization cone
    const laserConeGeo = new THREE.ConeGeometry(1.4, 0.5, 16, 1, true);
    const laserConeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
    const laserCone = new THREE.Mesh(laserConeGeo, laserConeMat);
    laserCone.position.set(0, 0.45, 0);
    droneGroup.add(laserCone);

    // 2. Gimbal Camera at the front
    const cameraGroup = new THREE.Group();
    const cameraYoke = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), darkCarbonMat);
    const cameraLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 16), lensMat);
    cameraLens.rotation.x = Math.PI / 2;
    cameraLens.position.z = 0.18;
    cameraGroup.add(cameraYoke);
    cameraGroup.add(cameraLens);
    cameraGroup.position.set(0, -0.25, 0.85);
    droneGroup.add(cameraGroup);

    // 3. Robotic Arm underneath
    const armGroup = new THREE.Group();
    const armShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.35), darkCarbonMat);
    const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), cyanTechMat);
    armUpper.position.set(0, -0.3, 0);
    const armForearm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), darkCarbonMat);
    armForearm.position.set(0, -0.65, 0.15);
    const gripperL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.08), emeraldMat);
    gripperL.position.set(-0.08, -0.9, 0.2);
    const gripperR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.08), emeraldMat);
    gripperR.position.set(0.08, -0.9, 0.2);

    armGroup.add(armShoulder);
    armGroup.add(armUpper);
    armGroup.add(armForearm);
    armGroup.add(gripperL);
    armGroup.add(gripperR);
    armGroup.position.set(0, -0.3, 0.2);
    droneGroup.add(armGroup);

    // 4. Medical Trauma Payload Pod
    const payloadGroup = new THREE.Group();
    const podBody = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16), emeraldMat);
    podBody.rotation.z = Math.PI / 2;
    const podStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), cyanTechMat);
    podStripe.rotation.z = Math.PI / 2;
    payloadGroup.add(podBody);
    payloadGroup.add(podStripe);
    payloadGroup.position.set(0, -0.4, -0.3);
    droneGroup.add(payloadGroup);

    // 5. Battery Bay
    const batteryGroup = new THREE.Group();
    const batteryBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), darkCarbonMat);
    const batteryLed = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.3), cyanTechMat);
    batteryLed.position.set(0.36, 0, 0);
    batteryGroup.add(batteryBox);
    batteryGroup.add(batteryLed);
    batteryGroup.position.set(0, 0.05, -0.3);
    droneGroup.add(batteryGroup);

    // 6. 6x Hexacopter Arms and Propellers
    const armsGroup = new THREE.Group();
    const propMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const armLength = 2.0;
      const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, armLength, 8), darkCarbonMat);
      armMesh.rotation.z = Math.PI / 2;
      armMesh.rotation.y = angle;
      armMesh.position.set(Math.cos(angle) * (armLength / 2 + 0.3), 0, Math.sin(angle) * (armLength / 2 + 0.3));

      // Motor bell
      const motorBell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.2, 12), cyanTechMat);
      const motorX = Math.cos(angle) * (armLength + 0.3);
      const motorZ = Math.sin(angle) * (armLength + 0.3);
      motorBell.position.set(motorX, 0.12, motorZ);

      // Propeller
      const propBlade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.14), propMat);
      propBlade.position.set(motorX, 0.24, motorZ);
      propMeshes.push(propBlade);

      // Strobe Light on arm tips
      const strobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xef4444 : 0x22c55e })
      );
      strobe.position.set(motorX, -0.05, motorZ);

      armsGroup.add(armMesh);
      armsGroup.add(motorBell);
      armsGroup.add(propBlade);
      armsGroup.add(strobe);
    }
    droneGroup.add(armsGroup);

    // Ground Grid
    const grid = new THREE.GridHelper(16, 24, 0x06b6d4, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Mouse Interaction / Orbit Drag
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      droneGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(1, Math.min(10, camera.position.y + deltaY * 0.01));
      camera.lookAt(0, 0, 0);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(3, Math.min(14, camera.position.z + e.deltaY * 0.005));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Spin propellers
      propMeshes.forEach((prop, i) => {
        prop.rotation.y += (i % 2 === 0 ? 1 : -1) * 25 * delta;
      });

      // Rotate LiDAR beam cone
      laserCone.rotation.y += 4 * delta;

      // Auto rotation if enabled
      if (isRotating && !isDragging) {
        droneGroup.rotation.y += 0.4 * delta;
      }

      // Exploded View displacement interpolation
      const targetExplodeOffset = exploded ? 1.0 : 0.0;
      lidarGroup.position.y = THREE.MathUtils.lerp(lidarGroup.position.y, 0.4 + targetExplodeOffset * 0.8, 0.08);
      cameraGroup.position.z = THREE.MathUtils.lerp(cameraGroup.position.z, 0.85 + targetExplodeOffset * 0.7, 0.08);
      armGroup.position.y = THREE.MathUtils.lerp(armGroup.position.y, -0.3 - targetExplodeOffset * 0.9, 0.08);
      payloadGroup.position.y = THREE.MathUtils.lerp(payloadGroup.position.y, -0.4 - targetExplodeOffset * 0.7, 0.08);

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [exploded, wireframe, isRotating]);

  const currentInfo = partsData[selectedPart] || partsData.lidar;

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              3D CAD DIGITAL TWIN
            </span>
            <span className="text-xs text-slate-400 font-mono">MODEL: APEX HEXA-IV</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1">
            Interactive 3D Drone Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Examine the physical architecture of the rescue drone. Click components to inspect engineering telemetry.
          </p>
        </div>

        {/* 3D Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              sound.playBeep(1100, 0.08);
              setExploded(!exploded);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              exploded
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-950/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{exploded ? 'Collapse Assembly' : 'Explode Components'}</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              wireframe
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              isRotating
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={isRotating ? 'Pause rotation' : 'Resume rotation'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Canvas + Component Spec Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Canvas Area */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl h-[520px] flex flex-col">
          <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Canvas Floating Instructions */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Click & Drag to Orbit • Scroll to Zoom</span>
          </div>

          {/* Quick Component Selector Buttons on bottom of 3D Canvas */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 overflow-x-auto p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 scrollbar-none z-10">
            {[
              { id: 'lidar', label: 'LiDAR Puck' },
              { id: 'camera', label: '4K Gimbal' },
              { id: 'arm', label: 'Robotic Arm' },
              { id: 'payload', label: 'Trauma Pod' },
              { id: 'battery', label: 'Solid-State Battery' },
              { id: 'motors', label: '6x Motors' },
              { id: 'gps', label: 'RTK GPS' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  sound.playBeep(980, 0.05);
                  setSelectedPart(btn.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedPart === btn.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Component Information Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {currentInfo.subsystem}
                </span>
                <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                  {currentInfo.name}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                {currentInfo.status}
              </span>
            </div>

            {/* Live Telemetry readout */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 leading-relaxed">
              <span className="text-slate-500 block text-[10px] uppercase font-sans mb-1">
                Real-Time Bus Reading:
              </span>
              {currentInfo.telemetry}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentInfo.description}
            </p>

            {/* Hardware Engineering Specs */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 font-heading flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Technical Specifications:
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                {currentInfo.hardwareSpecs.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Why Button */}
            <button
              onClick={() =>
                showAiExplanation(
                  `${currentInfo.name} Design Rationality`,
                  `Engineered specifically for the Colegio Campestre La Colina emergency network prototype. Selected because high-altitude mountainous topography in the Aburrá Valley demands high-thrust hexacopter configurations and multi-sensor sensor fusion.`
                )
              }
              className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Why this component was chosen?</span>
            </button>
          </div>

          {/* School Badge Footer Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              CC
            </div>
            <div className="text-xs">
              <span className="text-slate-400 font-mono text-[10px] block">Colegio Campestre La Colina</span>
              <span className="text-slate-200 font-semibold">Autonomous Systems Prototype 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
