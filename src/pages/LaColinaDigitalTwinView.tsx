import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
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
  // Science Lab Rooftop (Drone Base): x: -45, y: 14, z: 20
  // Sports Field (Emergency Site): x: 50, y: 1.2, z: -35
  const droneBasePos = useRef(new THREE.Vector3(-45, 14, 20));
  const emergencyPos = useRef(new THREE.Vector3(50, 1.2, -35));
  const droneCurrentPos = useRef(new THREE.Vector3(-45, 14, 20));

  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTargetPos = useRef(new THREE.Vector3(0, 75, 125));

  // The 10 Simulation Steps requested by the user
  const STEPS: SimulationStep[] = [
    {
      step: 1,
      title: '1. 🛰️ Satellite',
      status: 'Scanning campus...',
      icon: Satellite,
      description: 'Multispectral orbital sensor sweeps Colegio Campestre La Colina campus grounds for heat anomalies or distress calls.',
      cameraPos: [0, 130, 80],
      cameraLookAt: [0, 0, 0],
    },
    {
      step: 2,
      title: '2. 🔴 Detection',
      status: 'Possible emergency detected.',
      icon: AlertTriangle,
      description: 'Kinetic impact and thermal anomaly flagged at the synthetic grass soccer field. Severity: High.',
      cameraPos: [65, 30, -10],
      cameraLookAt: [50, 1.5, -35],
    },
    {
      step: 3,
      title: '3. 🧠 AI',
      status: 'Analyzing location, access, obstacles and simulated victims...',
      icon: Brain,
      description: 'AI model evaluates campus building heights, eucalyptus trees, wind currents, and calculates obstacle-free vectors.',
      cameraPos: [10, 45, 10],
      cameraLookAt: [15, 5, -15],
    },
    {
      step: 4,
      title: '4. 🚁 Drone',
      status: 'Drone 01 dispatched.',
      icon: Send,
      description: 'Drone 01 spools up brushless motors on the Science & Robotics Wing rooftop pad and ascends to 25m cruise altitude.',
      cameraPos: [-35, 24, 40],
      cameraLookAt: [-45, 14, 20],
    },
    {
      step: 5,
      title: '5. 🗺️ Navigation',
      status: 'Route calculated across campus.',
      icon: Compass,
      description: 'Flight corridor mapped: climbs above academic pavilion, curves over central quad, avoiding stadium light poles.',
      cameraPos: [0, 60, 40],
      cameraLookAt: [10, 10, -10],
    },
    {
      step: 6,
      title: '6. 👁️ Vision',
      status: 'Area scanned.',
      icon: Eye,
      description: 'Computer-vision gimbal camera classifies target sector, sports equipment, access paths, and bystanders.',
      cameraPos: [40, 20, -20],
      cameraLookAt: [50, 1.5, -35],
    },
    {
      step: 7,
      title: '7. 🫀 Victim Detection',
      status: 'Simulated person detected.',
      icon: HeartPulse,
      description: 'Through-obstruction biometric radar localizes simulated student: Heart Rate: 124 BPM, conscious, ankle immobilizer needed.',
      cameraPos: [56, 10, -28],
      cameraLookAt: [50, 1.5, -35],
    },
    {
      step: 8,
      title: '8. 📡 Communication',
      status: 'Emergency information transmitted to simulated command center.',
      icon: Radio,
      description: 'Real-time telemetry packet transmitted to campus infirmary and central emergency medical dispatch.',
      cameraPos: [0, 45, 60],
      cameraLookAt: [0, 0, 0],
    },
    {
      step: 9,
      title: '9. 🏥 Response',
      status: 'Recommended medical response location identified.',
      icon: Hospital,
      description: 'Campus Emergency Gate 2 designated as optimal ground ambulance entry point (110m flat stretcher route).',
      cameraPos: [70, 35, 25],
      cameraLookAt: [60, 2, -10],
    },
    {
      step: 10,
      title: '10. ✅ Mission',
      status: 'Rescue simulation completed.',
      icon: CheckCircle2,
      description: 'Medical trauma pod delivered directly to simulated victim. Campus response time: 48 seconds!',
      cameraPos: [45, 15, -15],
      cameraLookAt: [50, 1.5, -35],
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
    cameraTargetPos.current.set(0, 75, 125);
    cameraTarget.current.set(0, 0, 0);
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

  // Build Three.js 3D Model of Colegio Campestre La Colina Campus
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1626);
    scene.fog = new THREE.FogExp2(0x0a1626, 0.0035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.set(0, 75, 125);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x64748b, 1.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(90, 150, 70);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 5. Campus Ground / Topography
    const campusGroundGeo = new THREE.PlaneGeometry(350, 260, 32, 32);
    campusGroundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x143c22, // Lush Colombian campus green
      roughness: 0.8,
      metalness: 0.1,
    });
    const campusGround = new THREE.Mesh(campusGroundGeo, groundMat);
    campusGround.receiveShadow = true;
    scene.add(campusGround);

    // Campus Perimeter Fence / Border
    const fenceGeo = new THREE.BoxGeometry(350, 2, 2);
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const fenceN = new THREE.Mesh(fenceGeo, fenceMat);
    fenceN.position.set(0, 1, -130);
    scene.add(fenceN);
    const fenceS = new THREE.Mesh(fenceGeo, fenceMat);
    fenceS.position.set(0, 1, 130);
    scene.add(fenceS);

    // 6. SOCCER / SPORTS FIELD (The Simulation Target Area)
    const fieldGroup = new THREE.Group();
    fieldGroup.position.set(50, 0.1, -35);

    // Green synthetic turf
    const turfMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 50),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 })
    );
    turfMesh.rotateX(-Math.PI / 2);
    turfMesh.receiveShadow = true;
    fieldGroup.add(turfMesh);

    // Field Boundary White Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const linePts = [
      new THREE.Vector3(-38, 0.2, -23),
      new THREE.Vector3(38, 0.2, -23),
      new THREE.Vector3(38, 0.2, 23),
      new THREE.Vector3(-38, 0.2, 23),
      new THREE.Vector3(-38, 0.2, -23),
    ];
    const boundaryLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts), lineMat);
    fieldGroup.add(boundaryLine);

    // Midfield circle
    const centerCircle = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 0, 8, 0, Math.PI * 2, true).getPoints(32).map((p) => new THREE.Vector3(p.x, 0.2, p.y))
      ),
      lineMat
    );
    fieldGroup.add(centerCircle);

    // Goalposts
    const goalGeo = new THREE.BoxGeometry(1.2, 5, 12);
    const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const goalWest = new THREE.Mesh(goalGeo, goalMat);
    goalWest.position.set(-39, 2.5, 0);
    fieldGroup.add(goalWest);
    const goalEast = new THREE.Mesh(goalGeo, goalMat);
    goalEast.position.set(39, 2.5, 0);
    fieldGroup.add(goalEast);

    scene.add(fieldGroup);

    // 7. BUILDINGS OF COLEGIO CAMPESTRE LA COLINA

    // Building A: Main Academic Pavilion (Multistory, Navy/White accents)
    const mainBuilding = new THREE.Group();
    mainBuilding.position.set(-20, 0, -40);

    const b1 = new THREE.Mesh(
      new THREE.BoxGeometry(60, 14, 26),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
    );
    b1.position.y = 7;
    b1.castShadow = true;
    mainBuilding.add(b1);

    // Windows band
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 });
    const win = new THREE.Mesh(new THREE.BoxGeometry(56, 4, 26.4), glassMat);
    win.position.y = 8;
    mainBuilding.add(win);

    // Roof Solar Panels
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const solar = new THREE.Mesh(new THREE.BoxGeometry(50, 0.8, 20), solarMat);
    solar.position.y = 14.5;
    mainBuilding.add(solar);

    scene.add(mainBuilding);

    // Building B: Science & Robotics Laboratory Wing (The Home of Rescue AI)
    const roboticsWing = new THREE.Group();
    roboticsWing.position.set(-45, 0, 20);

    const b2 = new THREE.Mesh(
      new THREE.BoxGeometry(40, 12, 35),
      new THREE.MeshStandardMaterial({ color: 0x0f2b48, roughness: 0.4 }) // La Colina Navy
    );
    b2.position.y = 6;
    b2.castShadow = true;
    roboticsWing.add(b2);

    // Rooftop Drone Vertiport Landing Pad
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 7, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    pad.position.y = 12.4;
    roboticsWing.add(pad);

    const padRing = new THREE.Mesh(
      new THREE.RingGeometry(3.5, 5, 16),
      new THREE.MeshBasicMaterial({ color: 0x38b438, side: THREE.DoubleSide }) // La Colina Green
    );
    padRing.rotateX(-Math.PI / 2);
    padRing.position.y = 12.85;
    roboticsWing.add(padRing);

    scene.add(roboticsWing);

    // Building C: Administration & Medical Infirmary Hub
    const adminHub = new THREE.Group();
    adminHub.position.set(15, 0, 30);
    const b3 = new THREE.Mesh(
      new THREE.BoxGeometry(32, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    b3.position.y = 5;
    b3.castShadow = true;
    adminHub.add(b3);

    // Medical Red Cross on Infirmary roof
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 2), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    cross1.position.y = 10.3;
    adminHub.add(cross1);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    cross2.position.y = 10.3;
    adminHub.add(cross2);

    scene.add(adminHub);

    // 8. CAMPUS PATHWAYS & STUDENT COURTYARD
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const mainWalkway = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 140), pathMat);
    mainWalkway.position.set(-10, 0.1, 0);
    scene.add(mainWalkway);

    const crossWalkway = new THREE.Mesh(new THREE.BoxGeometry(120, 0.15, 12), pathMat);
    crossWalkway.position.set(0, 0.1, 0);
    scene.add(crossWalkway);

    // 9. CAMPUS GATES
    // Gate 1: Main Campus Entrance
    const gate1 = new THREE.Group();
    gate1.position.set(-140, 0, 0);
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 3), new THREE.MeshStandardMaterial({ color: 0x0e2b4d }));
    p1.position.set(0, 4, -8);
    gate1.add(p1);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 3), new THREE.MeshStandardMaterial({ color: 0x0e2b4d }));
    p2.position.set(0, 4, 8);
    gate1.add(p2);
    scene.add(gate1);

    // Gate 2: Sports Field Emergency Access (for Ambulances)
    const gate2 = new THREE.Group();
    gate2.position.set(120, 0, -35);
    const p3 = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 3), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    p3.position.set(0, 4, -8);
    gate2.add(p3);
    const p4 = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 3), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    p4.position.set(0, 4, 8);
    gate2.add(p4);
    scene.add(gate2);

    // 10. TREES AROUND CAMPUS (Colombian Pine & Eucalyptus)
    const treeTrunkGeo = new THREE.CylinderGeometry(0.6, 0.8, 5, 6);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const treeFoliageGeo = new THREE.ConeGeometry(3.5, 9, 6);
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, flatShading: true });

    for (let i = 0; i < 45; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 2.5;
      tree.add(trunk);
      const foliage = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliage.position.y = 8;
      tree.add(foliage);

      // Scatter outside sports field and buildings
      const tx = (Math.random() - 0.5) * 300;
      const tz = (Math.random() - 0.5) * 220;
      // Avoid center field and buildings
      if (Math.abs(tx - 50) > 45 || Math.abs(tz + 35) > 30) {
        tree.position.set(tx, 0, tz);
        scene.add(tree);
      }
    }

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
      new THREE.Vector3(-30, 24, 10),
      new THREE.Vector3(0, 22, -10),
      new THREE.Vector3(25, 18, -25),
      emergencyPos.current.clone().add(new THREE.Vector3(0, 10, 0)),
    ];
    const routeCurve = new THREE.CatmullRomCurve3(routePts);
    const routeLineGeo = new THREE.BufferGeometry().setFromPoints(routeCurve.getPoints(50));
    const routeLineMat = new THREE.LineBasicMaterial({ color: 0x38b438, linewidth: 2.5 });
    const routeLine = new THREE.Line(routeLineGeo, routeLineMat);
    flightRouteLineRef.current = routeLine;
    scene.add(routeLine);

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
      new THREE.PlaneGeometry(280, 4),
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

      // Spin Drone Propellers when dispatched (Step >= 4)
      if (currentStep >= 4) {
        dronePropsRef.current.forEach((p, idx) => {
          p.rotation.y += idx % 2 === 0 ? 0.4 : -0.4;
        });
      }

      // Move Drone 01 along flight corridor
      if (droneGroupRef.current) {
        if (currentStep >= 4 && currentStep <= 6) {
          // Flying across campus
          const t = Math.min(1, (currentStep - 4 + 0.3) / 2.3);
          const targetPt = routeCurve.getPoint(t);
          droneCurrentPos.current.lerp(targetPt, 0.04);
          droneGroupRef.current.position.copy(droneCurrentPos.current);
          droneGroupRef.current.position.y += Math.sin(clock * 3) * 0.2;
        } else if (currentStep >= 7) {
          // Hovering above emergency on sports field
          droneGroupRef.current.position.set(
            emergencyPos.current.x,
            emergencyPos.current.y + 12 + Math.sin(clock * 2) * 0.4,
            emergencyPos.current.z
          );
        } else {
          // Stationary on rooftop pad
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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [currentStep]);

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
              <span className="text-emerald-400">LAT 6.2150° N, LNG -75.5520° W</span>
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
              {/* Box 1: Science & Robotics Lab */}
              <div className="absolute top-[52%] left-[16%] border border-cyan-400 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 font-bold rounded">
                SCIENCE & ROBOTICS WING [DRONE PAD]
              </div>

              {/* Box 2: Main Academic Pavilion */}
              <div className="absolute top-[32%] left-[34%] border border-slate-400 bg-slate-500/10 px-2 py-0.5 text-slate-200 font-bold rounded">
                MAIN ACADEMIC PAVILION [CLASSROOMS]
              </div>

              {/* Box 3: Soccer Field Incident */}
              <div className="absolute top-[48%] right-[22%] border-2 border-red-500 bg-red-500/15 px-2.5 py-1 text-red-300 font-bold rounded animate-pulse">
                INCIDENT ZONE: SOCCER FIELD [TARGET]
              </div>

              {/* Box 4: Emergency Gate 2 */}
              <div className="absolute top-[72%] right-[12%] border border-emerald-400 bg-emerald-500/10 px-2 py-0.5 text-emerald-300 font-bold rounded">
                GATE 2 [RECOMMENDED AMBULANCE ACCESS]
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
                    <strong className="text-yellow-400">Emergency Gate 2</strong>
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
