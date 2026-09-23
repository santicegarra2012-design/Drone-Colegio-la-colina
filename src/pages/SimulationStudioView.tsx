import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  MapPin, 
  Sun, 
  Sunrise, 
  CloudSun, 
  CloudRain, 
  Moon, 
  CloudLightning, 
  Wind, 
  CloudFog, 
  ShieldAlert, 
  Send, 
  HeartPulse, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Camera, 
  Gauge, 
  Battery, 
  Radio, 
  GraduationCap, 
  Building2, 
  Car, 
  Home, 
  Trees,
  Sparkles
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';
import { 
  MAP_PRESETS, 
  MapPresetId, 
  TimeOfDay, 
  setupDaylightSkyAndAtmosphere,
  buildLaColinaCampusEnvironment,
  buildMedellinDowntownEnvironment,
  buildLasPalmasHighwayEnvironment,
  buildEnvigadoFoothillsEnvironment,
  buildSantaElenaForestEnvironment,
  create3DRealisticRoad
} from '../utils/map3DGenerator.ts';

type WeatherType = 'CLEAR' | 'FOG' | 'RAIN' | 'THUNDERSTORM' | 'HIGH_WIND';
type IncidentType = 'CAMPUS_SPORTS' | 'HIGHWAY_CRASH' | 'HIKER_FALL' | 'URBAN_FIRE' | 'LANDSLIDE';
type CameraViewMode = 'CHASE' | 'FPV' | 'TOP_DOWN';

export const SimulationStudioView: React.FC = () => {
  const { setActiveTab } = useRescue();

  // Configurable Simulation Settings
  const [selectedPlace, setSelectedPlace] = useState<MapPresetId>('LA_COLINA_CAMPUS');
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('DAY_SUNNY');
  const [selectedWeather, setSelectedWeather] = useState<WeatherType>('CLEAR');
  const [selectedIncident, setSelectedIncident] = useState<IncidentType>('CAMPUS_SPORTS');
  const [selectedDrone, setSelectedDrone] = useState<'HEXA_01' | 'LIFTER_04' | 'SCOUT_02'>('HEXA_01');
  const [selectedPayload, setSelectedPayload] = useState<'AED' | 'TRAUMA_KIT' | 'THERMAL_POD' | 'EPI_BOX'>('AED');

  // Simulation Runtime State
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simPhase, setSimPhase] = useState<'IDLE' | 'TAKEOFF' | 'CRUISING' | 'SEARCHING' | 'AIRDROP' | 'RESCUE_COMPLETE'>('IDLE');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('CHASE');
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    altitudeMeters: 0,
    distanceRemainingMeters: 850,
    batteryPercent: 100,
    heartRateBpm: 0,
    windSpeedKmh: 6,
  });

  // Three.js References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const droneRef = useRef<THREE.Group | null>(null);
  const parachuteRef = useRef<THREE.Group | null>(null);
  const targetMarkerRef = useRef<THREE.Mesh | null>(null);
  const rainRef = useRef<THREE.Points | null>(null);
  const flashLightRef = useRef<THREE.PointLight | null>(null);

  // Trajectory Curves
  const flightCurveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  // Active Map Info
  const activePreset = MAP_PRESETS[selectedPlace];

  // Incident Descriptions
  const incidentOptions: { id: IncidentType; name: string; target: string; desc: string; icon: string }[] = [
    {
      id: 'CAMPUS_SPORTS',
      name: 'Campus Sports Injury & Sudden Cardiac Event',
      target: 'La Colina Soccer Field',
      desc: 'Simulated 8th grade student collapse during athletics practice. Immediate automated external defibrillator (AED) delivery required.',
      icon: '🏃',
    },
    {
      id: 'HIGHWAY_CRASH',
      name: 'High-Speed Mountain Highway Collision',
      target: 'Sector A-17 Highway Curve',
      desc: 'Severe vehicle collision with passenger cabin intrusion and arterial hemorrhage. Rapid hemostatic trauma pod needed.',
      icon: '🚗',
    },
    {
      id: 'HIKER_FALL',
      name: 'High-Altitude Hiker Fall & Hypothermia',
      target: 'Santa Elena Cloud Forest Trail',
      desc: 'Unresponsive hiker fallen into ravine at 2,500m elevation. Thermal foil shelter pod and locator beacon dispatch.',
      icon: '🧗',
    },
    {
      id: 'URBAN_FIRE',
      name: 'Urban High-Rise Structural Smoke Distress',
      target: 'El Poblado Glass Towers',
      desc: 'Smoke inhalation emergency on 18th-floor balcony above street ladder reach. Oxygen hood and burn dressing delivery.',
      icon: '🏢',
    },
    {
      id: 'LANDSLIDE',
      name: 'Andean Foothill Mudflow & Road Blockage',
      target: 'Envigado Foothills Pass',
      desc: 'Rural supply road blocked by heavy rains. Trapped family requires emergency rations and communication relay unit.',
      icon: '🚜',
    },
  ];

  // 1. Initialize and Rebuild Three.js Scene whenever settings change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // A. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // B. Camera Setup
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 3000);
    const p = MAP_PRESETS[selectedPlace];
    camera.position.set(p.defaultCameraPos[0], p.defaultCameraPos[1], p.defaultCameraPos[2]);
    camera.lookAt(p.defaultCameraLookAt[0], p.defaultCameraLookAt[1], p.defaultCameraLookAt[2]);
    cameraRef.current = camera;

    // C. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // D. Daylight & Atmosphere System
    const atmosphere = setupDaylightSkyAndAtmosphere(scene, selectedTime);

    // Dynamic Weather adjustments to Fog/Light
    if (selectedWeather === 'FOG') {
      scene.fog = new THREE.FogExp2(0x94a3b8, 0.007);
    } else if (selectedWeather === 'RAIN' || selectedWeather === 'THUNDERSTORM') {
      scene.fog = new THREE.FogExp2(0x64748b, 0.0045);
    }

    // E. 3D Environment Builders
    if (selectedPlace === 'LA_COLINA_CAMPUS') {
      buildLaColinaCampusEnvironment(scene);
    } else if (selectedPlace === 'MEDELLIN_DOWNTOWN') {
      buildMedellinDowntownEnvironment(scene);
    } else if (selectedPlace === 'LAS_PALMAS_HIGHWAY') {
      buildLasPalmasHighwayEnvironment(scene);
    } else if (selectedPlace === 'ENVIGADO_FOOTHILLS') {
      buildEnvigadoFoothillsEnvironment(scene);
    } else {
      buildSantaElenaForestEnvironment(scene);
    }

    // F. Weather Rain & Lightning Systems
    if (selectedWeather === 'RAIN' || selectedWeather === 'THUNDERSTORM') {
      const rainCount = selectedWeather === 'THUNDERSTORM' ? 900 : 500;
      const rainGeo = new THREE.BufferGeometry();
      const rainPos = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount; i++) {
        rainPos[i * 3] = (Math.random() - 0.5) * 350;
        rainPos[i * 3 + 1] = Math.random() * 120;
        rainPos[i * 3 + 2] = (Math.random() - 0.5) * 350;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
      const rainMat = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: selectedWeather === 'THUNDERSTORM' ? 2 : 1.4,
        transparent: true,
        opacity: 0.75,
      });
      const rainParticles = new THREE.Points(rainGeo, rainMat);
      scene.add(rainParticles);
      rainRef.current = rainParticles;

      // Thunderstorm Lightning flash light
      if (selectedWeather === 'THUNDERSTORM') {
        const lightning = new THREE.PointLight(0xe0f2fe, 0, 400);
        lightning.position.set(0, 100, 0);
        scene.add(lightning);
        flashLightRef.current = lightning;
      }
    }

    // G. Incident Target Marker & Pulse Beacon
    const targetGroup = new THREE.Group();
    const tPos = p.incidentTargetPos;
    targetGroup.position.set(tPos[0], tPos[1], tPos[2]);

    // Red Pulsing Ring
    const ringGeo = new THREE.RingGeometry(6, 7.5, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.2;
    targetGroup.add(ringMesh);
    targetMarkerRef.current = ringMesh;

    // Glowing Sky Beacon Beam (140m)
    const beamGeo = new THREE.CylinderGeometry(0.8, 1.6, 140, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 70;
    targetGroup.add(beam);

    // Floating Holographic Cross
    const crossGeo = new THREE.BoxGeometry(3, 0.6, 0.6);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const c1 = new THREE.Mesh(crossGeo, crossMat);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3, 0.6), crossMat);
    c1.position.y = 4;
    c2.position.y = 4;
    targetGroup.add(c1);
    targetGroup.add(c2);

    scene.add(targetGroup);

    // H. High-Precision Drone Model
    const droneGroup = new THREE.Group();
    const launchPos = p.droneLaunchPos;
    droneGroup.position.set(launchPos[0], launchPos[1] + 1, launchPos[2]);

    // Carbon Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: selectedDrone === 'HEXA_01' ? 0x0f172a : selectedDrone === 'LIFTER_04' ? 0x1e293b : 0x0284c7,
      metalness: 0.8,
      roughness: 0.25,
    });
    const droneBody = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 0.8, 8), bodyMat);
    droneBody.castShadow = true;
    droneGroup.add(droneBody);

    // Medical Cross on Drone Top
    const crossDecal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.4), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    crossDecal.position.y = 0.45;
    const crossDecal2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 1.6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    crossDecal2.position.y = 0.45;
    droneGroup.add(crossDecal);
    droneGroup.add(crossDecal2);

    // Rotors
    const rotorArmGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.2);
    rotorArmGeo.rotateZ(Math.PI / 2);
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const arm = new THREE.Mesh(rotorArmGeo, rotorMat);
      arm.position.set(Math.cos(angle) * 2.8, 0, Math.sin(angle) * 2.8);
      arm.rotation.y = angle;
      droneGroup.add(arm);

      // Motor hub
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
      motor.position.set(Math.cos(angle) * 4.2, 0.2, Math.sin(angle) * 4.2);
      droneGroup.add(motor);

      // Propeller blades
      const prop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.25), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      prop.position.set(Math.cos(angle) * 4.2, 0.45, Math.sin(angle) * 4.2);
      (prop as any).isRotor = true;
      droneGroup.add(prop);
    }

    // Drone Navigation Strobe
    const strobe = new THREE.PointLight(0x06b6d4, 3, 25);
    strobe.position.y = 1;
    droneGroup.add(strobe);

    scene.add(droneGroup);
    droneRef.current = droneGroup;

    // I. Parachute Delivery Package (starts hidden attached to drone)
    const packageGroup = new THREE.Group();
    const parachuteDome = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xef4444, side: THREE.DoubleSide })
    );
    parachuteDome.position.y = 5;
    packageGroup.add(parachuteDome);

    const medBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    medBox.position.y = 1;
    packageGroup.add(medBox);
    packageGroup.visible = false;
    scene.add(packageGroup);
    parachuteRef.current = packageGroup;

    // J. Calculate 3D Spline Flight Trajectory Curve
    const midX = (launchPos[0] + tPos[0]) / 2;
    const midZ = (launchPos[2] + tPos[2]) / 2;
    const peakAlt = Math.max(launchPos[1], tPos[1]) + 35;

    const flightPoints = [
      new THREE.Vector3(launchPos[0], launchPos[1] + 1, launchPos[2]),
      new THREE.Vector3(launchPos[0], launchPos[1] + 16, launchPos[2]),
      new THREE.Vector3(midX, peakAlt, midZ),
      new THREE.Vector3(tPos[0], tPos[1] + 20, tPos[2]),
      new THREE.Vector3(tPos[0], tPos[1] + 3, tPos[2]),
    ];
    flightCurveRef.current = new THREE.CatmullRomCurve3(flightPoints);

    // Visual route line
    const routeLineGeo = new THREE.BufferGeometry().setFromPoints(flightCurveRef.current.getPoints(50));
    const routeLineMat = new THREE.LineDashedMaterial({
      color: 0x06b6d4,
      dashSize: 3,
      gapSize: 2,
    });
    const routeLine = new THREE.Line(routeLineGeo, routeLineMat);
    routeLine.computeLineDistances();
    scene.add(routeLine);

    // K. Animation Loop
    let animId: number;
    let clock = 0;
    let progress = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.016;

      // 1. Spin propellers
      if (droneRef.current) {
        droneRef.current.children.forEach((c) => {
          if ((c as any).isRotor) {
            c.rotation.y += 0.45;
          }
        });
      }

      // 2. Pulse target marker ring
      if (targetMarkerRef.current) {
        const s = 1 + Math.sin(clock * 4) * 0.12;
        targetMarkerRef.current.scale.set(s, s, 1);
      }

      // 3. Rain particle animation
      if (rainRef.current) {
        const posArray = rainRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < posArray.length; i += 3) {
          posArray[i + 1] -= 2.2;
          if (posArray[i + 1] < 0) {
            posArray[i + 1] = 110;
          }
        }
        rainRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 4. Thunderstorm lightning flashes
      if (flashLightRef.current) {
        if (Math.random() < 0.012) {
          flashLightRef.current.intensity = 8;
        } else {
          flashLightRef.current.intensity *= 0.85;
        }
      }

      // 5. Active Flight Progress during Simulation
      if (isSimRunning && flightCurveRef.current && droneRef.current) {
        progress += 0.0018;
        if (progress > 1) {
          progress = 1;
          setIsSimRunning(false);
          setSimPhase('RESCUE_COMPLETE');
          sound.playSuccess();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }

        setSimProgress(Math.round(progress * 100));

        // Update Position on Curve
        const currentPt = flightCurveRef.current.getPoint(Math.min(0.999, progress));
        const tangent = flightCurveRef.current.getTangent(Math.min(0.999, progress));
        droneRef.current.position.copy(currentPt);

        // Bank drone into turn
        droneRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
        droneRef.current.rotation.z += Math.sin(clock * 6) * 0.06; // turbulence wobble

        // Update Phase
        if (progress < 0.15) {
          setSimPhase('TAKEOFF');
        } else if (progress < 0.75) {
          setSimPhase('CRUISING');
        } else if (progress < 0.92) {
          setSimPhase('SEARCHING');
        } else {
          setSimPhase('AIRDROP');
          if (parachuteRef.current) {
            parachuteRef.current.visible = true;
            parachuteRef.current.position.set(currentPt.x, Math.max(tPos[1] + 1, currentPt.y - 4), currentPt.z);
          }
        }

        // Live Telemetry Math
        const dist = Math.round((1 - progress) * 850);
        const alt = Math.round(currentPt.y);
        const speed = progress < 0.15 ? Math.round(progress * 400) : progress > 0.85 ? Math.round((1 - progress) * 350) : 84;
        const hr = progress > 0.8 ? 118 - Math.round(progress * 15) : 0;

        setTelemetry({
          speedKmh: speed,
          altitudeMeters: alt,
          distanceRemainingMeters: dist,
          batteryPercent: Math.max(76, Math.round(100 - progress * 14)),
          heartRateBpm: hr,
          windSpeedKmh: selectedWeather === 'HIGH_WIND' ? 34 : selectedWeather === 'THUNDERSTORM' ? 28 : 6,
        });

        // Dynamic Camera Tracking
        if (cameraRef.current) {
          if (cameraMode === 'CHASE') {
            const offset = tangent.clone().multiplyScalar(-18).add(new THREE.Vector3(0, 9, 0));
            cameraRef.current.position.copy(currentPt).add(offset);
            cameraRef.current.lookAt(currentPt.clone().add(new THREE.Vector3(0, 2, 0)));
          } else if (cameraMode === 'FPV') {
            cameraRef.current.position.copy(currentPt).add(new THREE.Vector3(0, 0.4, 0));
            cameraRef.current.lookAt(currentPt.clone().add(tangent.clone().multiplyScalar(20)));
          } else {
            cameraRef.current.position.set(currentPt.x, currentPt.y + 70, currentPt.z + 10);
            cameraRef.current.lookAt(currentPt);
          }
        }
      }

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
      sound.stopDroneHum();
      renderer.dispose();
    };
  }, [selectedPlace, selectedTime, selectedWeather, selectedIncident, selectedDrone, selectedPayload, isSimRunning, cameraMode]);

  // Start Simulation Handler
  const handleLaunchSimulation = () => {
    sound.playArmServo();
    sound.startDroneHum();
    setIsSimRunning(true);
    setSimProgress(0);
    setSimPhase('TAKEOFF');
    sound.playBeep(920, 0.08);
  };

  const handleResetSimulation = () => {
    sound.stopDroneHum();
    setIsSimRunning(false);
    setSimProgress(0);
    setSimPhase('IDLE');
    if (parachuteRef.current) {
      parachuteRef.current.visible = false;
    }
    sound.playBeep(440, 0.05);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              SIMULATION STUDIO & MISSION SANDBOX
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              8TH GRADE PROTOCOL LAB
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1 flex items-center gap-2">
            <span>Custom Emergency Simulation Generator</span>
          </h1>

          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Configure custom environmental variables (place, time of day, weather intensity, incident type, and payload). The 3D engine synthesizes an autonomous rescue mission with real-time physics and telemetry.
          </p>
        </div>

        {/* Quick Launch Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetSimulation}
            className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold font-heading flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>

          <button
            onClick={handleLaunchSimulation}
            disabled={isSimRunning}
            className={`px-5 py-2.5 rounded-xl text-slate-950 font-bold font-heading text-xs shadow-xl flex items-center gap-2 transition-all ${
              isSimRunning
                ? 'bg-amber-400 animate-pulse'
                : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 hover:scale-105'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${isSimRunning ? 'animate-spin' : ''}`} />
            <span>{isSimRunning ? 'SIMULATION IN FLIGHT...' : 'LAUNCH SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Settings Controls on Left, 3D Canvas Viewport on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Simulation Control Deck (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Setting 1: PLACE & TERRAIN */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                1. Place & Location Twin
              </span>
              <span className="text-[10px] font-mono text-cyan-400">{activePreset.elevationMeters}m elev.</span>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'LA_COLINA_CAMPUS', name: 'Colegio Campestre La Colina', sub: 'Calle 12 Sur, Loma Los Balsos (Home & School)', icon: GraduationCap, badge: '★ School' },
                { id: 'MEDELLIN_DOWNTOWN', name: 'Medellín Downtown & El Poblado', sub: 'Urban Canyons & Skybridges', icon: Building2 },
                { id: 'LAS_PALMAS_HIGHWAY', name: 'Vía Las Palmas Mountain Pass', sub: 'Expressway Curves & Guardrails', icon: Car },
                { id: 'ENVIGADO_FOOTHILLS', name: 'Envigado & Sabaneta Foothills', sub: 'Valley Ridges & Residential', icon: Home },
                { id: 'SANTA_ELENA_FOREST', name: 'Santa Elena & Arví Cloud Forest', sub: 'High-Elevation Andean Pines', icon: Trees },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPlace === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlace(p.id as MapPresetId);
                      handleResetSimulation();
                      sound.playBeep(750, 0.04);
                    }}
                    className={`w-full text-left p-2 rounded-xl border text-xs transition-all relative ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold font-heading flex items-center gap-1.5 truncate">
                        <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </div>
                      {p.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setting 2: TIME OF DAY & ATMOSPHERIC LIGHTING */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-xl">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              2. Time of Day & Lighting
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'DAY_SUNNY', label: 'Daylight Sun', desc: 'Noon sunlight', icon: Sun },
                { id: 'MORNING_GOLDEN', label: 'Golden Hour', desc: 'Warm sunrise', icon: Sunrise },
                { id: 'AFTERNOON_CLEAR', label: 'Afternoon', desc: 'Crisp visibility', icon: CloudSun },
                { id: 'MOUNTAIN_RAIN', label: 'Rain / Mist', desc: 'Adverse weather', icon: CloudRain },
                { id: 'NIGHT_FLIR', label: 'FLIR Night', desc: 'Tactical infrared', icon: Moon },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTime === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTime(t.id as TimeOfDay);
                      sound.playBeep(880, 0.04);
                    }}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold ring-1 ring-amber-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold truncate">{t.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setting 3: WEATHER & ATMOSPHERIC CONDITIONS */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-xl">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <CloudLightning className="w-3.5 h-3.5 text-blue-400" />
              3. Weather Intensity
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'CLEAR', label: 'Clear & Calm', desc: '0 km/h wind', icon: Sun },
                { id: 'FOG', label: 'Mountain Fog', desc: 'Low ceiling mist', icon: CloudFog },
                { id: 'RAIN', label: 'Rainstorm', desc: 'Wet downpour', icon: CloudRain },
                { id: 'THUNDERSTORM', label: 'Thunderstorm', desc: 'Lightning flashes', icon: CloudLightning },
                { id: 'HIGH_WIND', label: 'High Winds', desc: '35 km/h gusts', icon: Wind },
              ].map((w) => {
                const Icon = w.icon;
                const isSelected = selectedWeather === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWeather(w.id as WeatherType);
                      sound.playBeep(720, 0.04);
                    }}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-400 text-white font-bold ring-1 ring-blue-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="font-bold truncate">{w.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{w.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setting 4: INCIDENT SCENARIO */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-xl">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              4. Emergency Incident & Target
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {incidentOptions.map((inc) => {
                const isSelected = selectedIncident === inc.id;
                return (
                  <button
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc.id);
                      handleResetSimulation();
                      sound.playBeep(640, 0.04);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-red-950/60 border-red-500 text-white shadow-md ring-1 ring-red-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold font-heading">
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{inc.icon}</span>
                        <span className="truncate">{inc.name}</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{inc.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setting 5: DRONE MODEL & PAYLOAD */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                5. Drone & Payload Pod
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'HEXA_01', name: 'Hexa DR-01', spec: '85 km/h' },
                { id: 'LIFTER_04', name: 'Lifter Q-04', spec: '8kg Load' },
                { id: 'SCOUT_02', name: 'Scout MS-02', spec: 'Agile' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDrone(d.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedDrone === d.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold truncate">{d.name}</div>
                  <div className="text-[10px] text-cyan-400/80 font-mono">{d.spec}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs pt-1 border-t border-slate-800">
              {[
                { id: 'AED', name: '⚡ AED Defibrillator', sub: 'Cardiac shock pod' },
                { id: 'TRAUMA_KIT', name: '🩸 Hemostatic Pod', sub: 'Tourniquet & seal' },
                { id: 'THERMAL_POD', name: '🔥 Thermal Blanket', sub: 'Warm IV fluids' },
                { id: 'EPI_BOX', name: '💉 EpiPen Injector', sub: 'Allergy & antidote' },
              ].map((pay) => (
                <button
                  key={pay.id}
                  onClick={() => setSelectedPayload(pay.id as any)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedPayload === pay.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold truncate">{pay.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{pay.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 3D Simulation Canvas & Real-Time Telemetry (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main 3D Canvas Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl h-[560px] flex flex-col">
            {/* Three.js Canvas Container */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Overlay: Camera Mode & Scenario Tag */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-auto shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white uppercase">{activePreset.name}</span>
                <span className="text-slate-400 hidden sm:inline">| {selectedTime} | {selectedWeather}</span>
              </div>

              {/* Camera Mode Toggles */}
              <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 pointer-events-auto shadow-xl">
                <button
                  onClick={() => setCameraMode('CHASE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    cameraMode === 'CHASE' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3rd Person
                </button>
                <button
                  onClick={() => setCameraMode('FPV')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    cameraMode === 'FPV' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FPV Cockpit
                </button>
                <button
                  onClick={() => setCameraMode('TOP_DOWN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    cameraMode === 'TOP_DOWN' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tactical Orbit
                </button>
              </div>
            </div>

            {/* Mission Status Overlay (When Simulation is Active) */}
            {isSimRunning && (
              <div className="absolute bottom-4 left-4 bg-slate-950/95 border border-cyan-500/80 rounded-xl p-3 font-mono text-xs text-cyan-300 space-y-1.5 shadow-2xl z-20 backdrop-blur-md animate-in fade-in">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 animate-spin" />
                  <span>AUTONOMOUS FLIGHT PHASE: {simPhase}</span>
                </div>
                <div className="w-56 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-150"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>PROGRESS: {simProgress}%</span>
                  <span>TARGET: {telemetry.distanceRemainingMeters}m</span>
                </div>
              </div>
            )}

            {/* Completion Banner */}
            {simPhase === 'RESCUE_COMPLETE' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white font-heading">
                  Custom Rescue Simulation Succeeded!
                </h3>
                <p className="text-sm text-slate-300 max-w-md mt-1 leading-relaxed">
                  Medical payload delivered successfully at <strong>{activePreset.name}</strong>. Victim stabilized with live telemetry streamed to the emergency command center.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleLaunchSimulation}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs font-heading shadow-xl hover:scale-105 transition-all"
                  >
                    RUN AGAIN
                  </button>
                  <button
                    onClick={handleResetSimulation}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold font-heading hover:text-white"
                  >
                    MODIFY SETTINGS
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Live Telemetry HUD Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Airspeed
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {telemetry.speedKmh} <span className="text-xs text-slate-400 font-normal">km/h</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                Altitude AGL
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {telemetry.altitudeMeters} <span className="text-xs text-slate-400 font-normal">m</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Distance to Target
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {telemetry.distanceRemainingMeters} <span className="text-xs text-slate-400 font-normal">m</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                <Battery className="w-3.5 h-3.5 text-teal-400" />
                Battery Level
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {telemetry.batteryPercent}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                Wind Velocity
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {telemetry.windSpeedKmh} <span className="text-xs text-slate-400 font-normal">km/h</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                Bio-Radar HR
              </div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {telemetry.heartRateBpm > 0 ? `${telemetry.heartRateBpm} bpm` : 'SCANNING...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
