import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Satellite, 
  AlertTriangle, 
  Brain, 
  Send, 
  Compass, 
  Eye, 
  HeartPulse, 
  Radio, 
  Hospital, 
  CheckCircle2, 
  GraduationCap, 
  Building2, 
  Trees, 
  ShieldAlert, 
  Crosshair, 
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  MapPin,
  ChevronRight,
  Tv
} from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo.tsx';
import { sound } from '../utils/audio.ts';

interface SimulationStep {
  step: number;
  title: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  cameraPos: [number, number, number];
  cameraLookAt: [number, number, number];
}

export const LaColinaDigitalTwinView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [aiVisionActive, setAiVisionActive] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'CAMPUS' | 'DRONE' | 'INCIDENT' | 'SATELLITE'>('CAMPUS');
  const [selectedCampusObject, setSelectedCampusObject] = useState<string | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const dronePropsRef = useRef<THREE.Mesh[]>([]);
  const flightRouteLineRef = useRef<THREE.Line | null>(null);
  const scanLaserRef = useRef<THREE.Mesh | null>(null);
  const emergencyMarkerRef = useRef<THREE.Group | null>(null);
  const lidarPointsRef = useRef<THREE.Points | null>(null);

  // Coordinates on campus
  // The GLB is Y-up; the source school's northing maps to negative Z. These points
  // align the staging pad with the administration roof and the target with midfield.
  const droneBasePos = useRef(new THREE.Vector3(-5, 8, 25));
  const emergencyPos = useRef(new THREE.Vector3(41, 8, -61));
  const droneCurrentPos = useRef(new THREE.Vector3(-5, 8, 25));

  const cameraTarget = useRef(new THREE.Vector3(22, 3, 20));
  const cameraTargetPos = useRef(new THREE.Vector3(25, 105, 170));
  const currentStepRef = useRef(currentStep);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // The 10 Simulation Steps requested by the user
  const STEPS: SimulationStep[] = [
    {
      step: 1,
      title: '1. 🛰️ Satellite',
      status: 'Scanning campus...',
      icon: Satellite,
      description: 'Multispectral orbital sensor sweeps Colegio Campestre La Colina campus grounds for heat anomalies or distress calls.',
      cameraPos: [25, 155, 40],
      cameraLookAt: [22, 3, 20],
    },
    {
      step: 2,
      title: '2. 🔴 Detection',
      status: 'Possible emergency detected.',
      icon: AlertTriangle,
      description: 'Kinetic impact and thermal anomaly flagged at the synthetic grass soccer field. Severity: High.',
      cameraPos: [82, 38, -32],
      cameraLookAt: [41, 8, -61],
    },
    {
      step: 3,
      title: '3. 🧠 AI',
      status: 'Analyzing location, access, obstacles and simulated victims...',
      icon: Brain,
      description: 'AI model evaluates the real campus buildings, sloped terrain, tree cover, and wind, then plans an obstacle-aware route.',
      cameraPos: [15, 65, 32],
      cameraLookAt: [20, 5, 12],
    },
    {
      step: 4,
      title: '4. 🚁 Drone',
      status: 'Drone 01 dispatched.',
      icon: Send,
      description: 'Drone 01 launches from the school-side staging pad and climbs above the campus before crossing the sloped grounds.',
      cameraPos: [4, 25, 48],
      cameraLookAt: [-5, 9, 25],
    },
    {
      step: 5,
      title: '5. 🗺️ Navigation',
      status: 'Route calculated across campus.',
      icon: Compass,
      description: 'Flight corridor follows the campus layout from the administration area to the soccer field, accounting for terrain and buildings.',
      cameraPos: [15, 85, 45],
      cameraLookAt: [24, 6, -18],
    },
    {
      step: 6,
      title: '6. 👁️ Vision',
      status: 'Area scanned.',
      icon: Eye,
      description: 'Computer-vision gimbal camera classifies target sector, sports equipment, access paths, and bystanders.',
      cameraPos: [65, 24, -30],
      cameraLookAt: [41, 8, -61],
    },
    {
      step: 7,
      title: '7. 🫀 Victim Detection',
      status: 'Simulated person detected.',
      icon: HeartPulse,
      description: 'Through-obstruction biometric radar localizes simulated student: Heart Rate: 124 BPM, conscious, ankle immobilizer needed.',
      cameraPos: [49, 17, -47],
      cameraLookAt: [41, 8, -61],
    },
    {
      step: 8,
      title: '8. 📡 Communication',
      status: 'Emergency information transmitted to simulated command center.',
      icon: Radio,
      description: 'Real-time telemetry packet transmitted to campus infirmary and central emergency medical dispatch.',
      cameraPos: [25, 80, 75],
      cameraLookAt: [22, 3, 20],
    },
    {
      step: 9,
      title: '9. 🏥 Response',
      status: 'Recommended medical response location identified.',
      icon: Hospital,
      description: 'The Calle 12 Sur entrance is selected as the simulated ambulance access point, with a ground route to the soccer field.',
      cameraPos: [40, 42, 65],
      cameraLookAt: [20, 4, 28],
    },
    {
      step: 10,
      title: '10. ✅ Mission',
      status: 'Rescue simulation completed.',
      icon: CheckCircle2,
      description: 'Medical trauma pod delivered directly to simulated victim. Campus response time: 48 seconds!',
      cameraPos: [53, 21, -36],
      cameraLookAt: [41, 8, -61],
    },
  ];

  // Start the 10-step simulation
  const startSimulation = () => {
    sound.playAlert();
    setIsSimRunning(true);
    setCurrentStep(1);
    executeStepAction(1);
  };

  const stopSimulation = () => {
    setIsSimRunning(false);
    sound.stopDroneHum();
  };

  const resetSimulation = () => {
    setIsSimRunning(false);
    setCurrentStep(0);
    sound.stopDroneHum();
    droneCurrentPos.current.copy(droneBasePos.current);
    if (droneGroupRef.current) {
      droneGroupRef.current.position.copy(droneBasePos.current);
    }
    cameraTargetPos.current.set(25, 105, 170);
    cameraTarget.current.set(22, 3, 20);
  };

  const executeStepAction = (stepNumber: number) => {
    const stepData = STEPS[stepNumber - 1];
    if (!stepData) return;

    // Camera move
    cameraTargetPos.current.set(...stepData.cameraPos);
    cameraTarget.current.set(...stepData.cameraLookAt);

    // Specific step behaviors
    if (stepNumber === 1) {
      sound.playScanSweep();
    } else if (stepNumber === 2) {
      sound.playAlert();
    } else if (stepNumber === 4) {
      sound.startDroneHum();
    } else if (stepNumber === 7) {
      sound.playRadarPing();
      if (lidarPointsRef.current) lidarPointsRef.current.visible = true;
    } else if (stepNumber === 8) {
      sound.playBeep(1400, 0.12);
    } else if (stepNumber === 10) {
      sound.playSuccess();
      sound.stopDroneHum();
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
      });
    }
  };

  // Timer loop for auto advancing through the 10 steps
  useEffect(() => {
    if (!isSimRunning || currentStep === 0) return;

    if (currentStep >= 10) {
      setIsSimRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      const next = currentStep + 1;
      setCurrentStep(next);
      executeStepAction(next);
    }, 4800); // 4.8 seconds per step for comfortable demonstration

    return () => clearTimeout(timer);
  }, [isSimRunning, currentStep]);

  // Build Three.js scene once; keep the detailed school mesh mounted while the mission advances.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xa9d9ff);
    scene.fog = new THREE.FogExp2(0xa9d9ff, 0.00045);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.set(25, 105, 170);
    camera.lookAt(22, 3, 20);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.HemisphereLight(0xe8f4ff, 0x71864a, 3.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff2d8, 4.2);
    sunLight.position.set(45, 120, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Load the real, slope-following architectural campus model used by the standalone school viewer.
    // Its GLB uses +Y as up and campus ground coordinates are encoded as (x, -northing).
    let isMounted = true;
    const campusLoader = new GLTFLoader();
    campusLoader.load(
      '/models/la-colina-campus.glb',
      (gltf) => {
        if (!isMounted) return;
        const campus = gltf.scene;
        campus.name = 'La Colina surveyed campus model';
        campus.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
              if (material instanceof THREE.MeshStandardMaterial) {
                const baseColor = material.color;
                if (baseColor.g > baseColor.r * 1.2 && baseColor.g > baseColor.b * 1.2) {
                  baseColor.multiplyScalar(1.25);
                  material.emissive.set(0x30551c);
                  material.emissiveIntensity = 0.85;
                }
              }
            });
          }
        });
        scene.add(campus);
      },
      undefined,
      (error) => console.error('Could not load the La Colina campus model:', error),
    );

    // 11. EMERGENCY INCIDENT SITE (On Soccer Field)
    const emergencySite = new THREE.Group();
    emergencySite.position.copy(emergencyPos.current);

    // Pulsing Red Warning Ring
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(4, 5.2, 32),
      new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
    );
    ringMesh.rotateX(-Math.PI / 2);
    ringMesh.position.y = 0.3;
    emergencySite.add(ringMesh);

    // Simulated Victim Marker
    const victimFigure = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4 })
    );
    victimFigure.position.y = 0.9;
    emergencySite.add(victimFigure);

    const victimHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffedd5 })
    );
    victimHead.position.y = 2.1;
    emergencySite.add(victimHead);

    // Vertical Light Beacon
    const beaconGeo = new THREE.CylinderGeometry(0.6, 0.8, 80, 16, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 40;
    emergencySite.add(beacon);

    emergencyMarkerRef.current = emergencySite;
    scene.add(emergencySite);

    // 12. DRONE 01 (DR-01 MK-IV)
    const drone = new THREE.Group();
    drone.position.copy(droneCurrentPos.current);

    const dBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 0.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x0f2b48, metalness: 0.8 })
    );
    drone.add(dBody);

    // Medical pod underneath
    const pod = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.9, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    pod.position.y = -0.8;
    drone.add(pod);

    // 4 Booms and Rotors
    dronePropsRef.current = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      arm.rotateZ(Math.PI / 2);
      arm.rotation.y = angle;
      arm.position.set(Math.cos(angle) * 1.6, 0.2, Math.sin(angle) * 1.6);
      drone.add(arm);

      const prop = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.04, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      prop.position.set(Math.cos(angle) * 3.2, 0.5, Math.sin(angle) * 3.2);
      drone.add(prop);
      dronePropsRef.current.push(prop);
    }

    // Drone Strobe Light
    const dLight = new THREE.PointLight(0x38b438, 3, 20);
    dLight.position.y = 0.6;
    drone.add(dLight);

    droneGroupRef.current = drone;
    scene.add(drone);

    // 13. Glowing 3D Flight Corridor Ribbon Across Campus
    const routePts = [
      droneBasePos.current.clone(),
      new THREE.Vector3(4, 20, 2),
      new THREE.Vector3(28, 24, -22),
      new THREE.Vector3(42, 19, -42),
      emergencyPos.current.clone().add(new THREE.Vector3(0, 10, 0)),
    ];
    const routeCurve = new THREE.CatmullRomCurve3(routePts);
    const routeLineGeo = new THREE.BufferGeometry().setFromPoints(routeCurve.getPoints(50));
    const routeLineMat = new THREE.LineBasicMaterial({ color: 0x38b438, linewidth: 2.5 });
    const routeLine = new THREE.Line(routeLineGeo, routeLineMat);
    flightRouteLineRef.current = routeLine;
    scene.add(routeLine);

    // Visible rooftop launch pad placed on the model's administration wing.
    const launchPad = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.2, 0.22, 32),
      new THREE.MeshStandardMaterial({ color: 0x132536, roughness: 0.7 })
    );
    launchPad.position.set(-5, 6.2, 25);
    launchPad.receiveShadow = true;
    scene.add(launchPad);
    const launchRing = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.7, 32),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide })
    );
    launchRing.rotation.x = -Math.PI / 2;
    launchRing.position.set(-5, 6.34, 25);
    scene.add(launchRing);

    // 14. LiDAR Point Cloud at Incident
    const lCount = 200;
    const lGeo = new THREE.BufferGeometry();
    const lPos = new Float32Array(lCount * 3);
    for (let i = 0; i < lCount; i++) {
      const r = Math.random() * 8;
      const th = Math.random() * Math.PI * 2;
      lPos[i * 3] = emergencyPos.current.x + r * Math.cos(th);
      lPos[i * 3 + 1] = emergencyPos.current.y + Math.random() * 4;
      lPos[i * 3 + 2] = emergencyPos.current.z + r * Math.sin(th);
    }
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    const lMat = new THREE.PointsMaterial({ color: 0x10b981, size: 2.2, transparent: true, opacity: 0.8 });
    const lPoints = new THREE.Points(lGeo, lMat);
    lPoints.visible = false;
    lidarPointsRef.current = lPoints;
    scene.add(lPoints);

    // 15. Satellite Scan Laser Plane
    const scanLaserMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 4),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    scanLaserMesh.rotateX(-Math.PI / 2);
    scanLaserMesh.position.y = 20;
    scanLaserMesh.visible = false;
    scanLaserRef.current = scanLaserMesh;
    scene.add(scanLaserMesh);

    // Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.016;
      const activeStep = currentStepRef.current;

      // Spin Drone Propellers when dispatched (Step >= 4)
      if (activeStep >= 4) {
        dronePropsRef.current.forEach((p, idx) => {
          p.rotation.y += idx % 2 === 0 ? 0.4 : -0.4;
        });
      }

      // Move Drone 01 along flight corridor
      if (droneGroupRef.current) {
        if (activeStep >= 4 && activeStep <= 6) {
          // Flying across campus
          const t = Math.min(1, (activeStep - 4 + 0.3) / 2.3);
          const targetPt = routeCurve.getPoint(t);
          droneCurrentPos.current.lerp(targetPt, 0.04);
          droneGroupRef.current.position.copy(droneCurrentPos.current);
          droneGroupRef.current.position.y += Math.sin(clock * 3) * 0.2;
        } else if (activeStep >= 7) {
          // Hovering above emergency on sports field
          droneGroupRef.current.position.set(
            emergencyPos.current.x,
            emergencyPos.current.y + 12 + Math.sin(clock * 2) * 0.4,
            emergencyPos.current.z
          );
        } else {
          // Stationary above the administration rooftop launch pad
          droneGroupRef.current.position.copy(droneBasePos.current);
        }
      }

      // Satellite sweep laser in Step 1
      if (scanLaserRef.current) {
        scanLaserRef.current.visible = currentStep === 1;
        if (currentStep === 1) {
          scanLaserRef.current.position.z = Math.sin(clock * 2) * 80;
        }
      }

      // Smooth Camera Interpolation
      if (cameraRef.current) {
        cameraRef.current.position.lerp(cameraTargetPos.current, 0.04);
        cameraRef.current.lookAt(cameraTarget.current);
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
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Hero Campus Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center gap-4">
          <SchoolLogo size="lg" className="shrink-0" />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>COLEGIO CAMPESTRE LA COLINA • DIGITAL EMERGENCY TWIN</span>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-white font-heading tracking-wide">
              Rescue AI — Campus Digital Emergency Twin
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time 3D twin of the school grounds demonstrating how orbital satellites, autonomous drones, and through-debris radar protect students and staff.
            </p>
          </div>
        </div>

        {/* Master Simulation Activation Button */}
        <div className="flex items-center gap-2">
          {!isSimRunning ? (
            <button
              onClick={startSimulation}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm font-heading shadow-xl shadow-emerald-950/60 transition-transform hover:scale-105 flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START EMERGENCY SIMULATION</span>
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-heading shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE SIMULATION</span>
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Reset Campus Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 10-Step Interactive Mission Timeline Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 shadow-xl overflow-x-auto">
        <div className="flex items-center gap-2 min-w-[850px]">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <button
                key={s.step}
                onClick={() => {
                  setCurrentStep(s.step);
                  executeStepAction(s.step);
                }}
                className={`flex-1 p-2 rounded-xl text-left transition-all border ${
                  isCurrent
                    ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                    : isDone
                    ? 'bg-slate-900/60 border-slate-800 text-emerald-400'
                    : 'bg-slate-900/30 border-slate-800/60 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span>#{s.step}</span>
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ) : null}
                </div>
                <div className="text-xs font-bold font-heading truncate mt-0.5 text-white">
                  {s.title.replace(/^\d+\.\s*/, '')}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{s.status}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Campus Viewport & Live Mission Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Campus Viewport */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl h-[560px] flex flex-col">
          {/* Top Campus HUD */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none flex-wrap gap-2">
            <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-xl text-xs font-mono text-cyan-300">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">CAMPUS TWIN: LA COLINA</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400">LAT 6.18572° N, LNG -75.55944° W</span>
            </div>

            {/* AI Vision Overlay Toggle */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setAiVisionActive(!aiVisionActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 transition-all ${
                  aiVisionActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{aiVisionActive ? '👁 AI LABELS ON' : 'AI LABELS OFF'}</span>
              </button>
            </div>
          </div>

          {/* Three.js 3D World Canvas */}
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* AI Computer Vision In-World Bounding Boxes */}
          {aiVisionActive && (
            <div className="absolute inset-0 pointer-events-none z-10 font-mono text-[10px]">
              {/* Administration roof and drone staging pad */}
              <div className="absolute top-[52%] left-[16%] border border-cyan-400 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 font-bold rounded">
                ADMINISTRATION ROOF [DRONE STAGING PAD]
              </div>

              {/* Box 2: Main Academic Pavilion */}
              <div className="absolute top-[32%] left-[34%] border border-slate-400 bg-slate-500/10 px-2 py-0.5 text-slate-200 font-bold rounded">
                TWO-STORY CLASSROOMS
              </div>

              {/* Box 3: Soccer Field Incident */}
              <div className="absolute top-[48%] right-[22%] border-2 border-red-500 bg-red-500/15 px-2.5 py-1 text-red-300 font-bold rounded animate-pulse">
                INCIDENT ZONE: SOCCER FIELD [TARGET]
              </div>

              {/* Calle 12 Sur entrance */}
              <div className="absolute top-[72%] right-[12%] border border-emerald-400 bg-emerald-500/10 px-2 py-0.5 text-emerald-300 font-bold rounded">
                CALLE 12 SUR ENTRANCE [AMBULANCE ACCESS]
              </div>
            </div>
          )}

          {/* Bottom Viewport Active Stage Banner */}
          <div className="mt-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex items-center justify-between text-xs z-20">
            <div className="flex items-center gap-3">
              {currentStep > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-heading font-bold text-white text-sm">
                    {STEPS[currentStep - 1]?.title}
                  </span>
                  <span className="text-slate-400 font-mono hidden sm:inline">
                    — {STEPS[currentStep - 1]?.status}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">
                  Ready for demonstration. Click <strong>"START EMERGENCY SIMULATION"</strong> to begin.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span>DRONE: <strong>DR-01 MK-IV</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">STATUS: {currentStep >= 4 ? 'DISPATCHED' : 'STANDBY'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Control & Step Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Step Real-Time Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white font-heading flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Mission Intelligence Feed
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                CAMPUS GRID
              </span>
            </div>

            {currentStep > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="text-base font-black text-white font-heading">
                    {STEPS[currentStep - 1]?.title}
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                    {STEPS[currentStep - 1]?.status}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  {STEPS[currentStep - 1]?.description}
                </p>

                {/* Simulated Telemetry Cards */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">CAMPUS SECTOR</span>
                    <strong className="text-white">Sports Field #1</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">VICTIM STATUS</span>
                    <strong className="text-cyan-300">{currentStep >= 7 ? '124 BPM (Alive)' : 'Scanning...'}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">DRONE ETA</span>
                    <strong className="text-emerald-400">{currentStep >= 7 ? 'Arrived (0s)' : '18 seconds'}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">AMBULANCE GATE</span>
                    <strong className="text-yellow-400">Calle 12 Sur</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-300 font-heading">
                  System Standing By
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Click <strong>START EMERGENCY SIMULATION</strong> to demonstrate the 10-stage rescue sequence for teachers and judges.
                </p>
              </div>
            )}

            {/* Quick Navigation Buttons for Steps */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                disabled={currentStep <= 1}
                onClick={() => {
                  const prev = Math.max(1, currentStep - 1);
                  setCurrentStep(prev);
                  executeStepAction(prev);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 transition-colors"
              >
                Previous Stage
              </button>
              <button
                disabled={currentStep >= 10}
                onClick={() => {
                  const next = Math.min(10, currentStep + 1);
                  setCurrentStep(next);
                  executeStepAction(next);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white transition-colors"
              >
                Next Stage
              </button>
            </div>
          </div>

          {/* Educational Team Breakdown Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2">
              <SchoolLogo size="sm" showText={false} />
              <div>
                <h4 className="text-xs font-bold text-white font-heading">
                  Colegio Campestre La Colina Prototype
                </h4>
                <div className="text-[10px] text-slate-400">
                  Engineering & Robotics Science Project 2026
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Designed and programmed by <strong>Santiago Cegarra</strong> (Flight Systems & AI), <strong>Samuel Velasco</strong> (Robotics & Payload), and <strong>Jeronimo Escobar</strong> (Bio-Telemetry & Sensors).
            </p>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 font-mono">
              ✓ Tested on simulated 3D campus terrain with 48s simulated rapid response.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
