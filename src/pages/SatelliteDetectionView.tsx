import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Satellite, 
  Map as MapIcon, 
  Mountain, 
  Flame, 
  Moon, 
  Gamepad2, 
  Eye, 
  Layers, 
  RotateCcw, 
  Play, 
  Pause, 
  FastForward, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Compass, 
  Activity, 
  Zap, 
  HelpCircle, 
  Settings2, 
  Crosshair, 
  ShieldAlert, 
  Navigation, 
  Car, 
  Building2, 
  Trees, 
  CloudRain, 
  Sun, 
  HeartPulse, 
  Send,
  Info,
  GraduationCap,
  Sunrise,
  CloudSun,
  MapPin,
  Home
} from 'lucide-react';
import { useRescue } from '../context/RescueContext.tsx';
import { sound } from '../utils/audio.ts';
import ProceduralTerrainCanvas from '../components/ProceduralTerrainCanvas';
import { 
  MAP_PRESETS, 
  MapPresetId, 
  TimeOfDay, 
  setupDaylightSkyAndAtmosphere,
  buildLaColinaCampusEnvironment,
  buildMedellinDowntownEnvironment,
  buildLasPalmasHighwayEnvironment,
  buildEnvigadoFoothillsEnvironment,
  buildSantaElenaForestEnvironment
} from '../utils/map3DGenerator.ts';

type ViewMode = 'SATELLITE' | 'MAP' | 'TERRAIN' | 'THERMAL' | 'NIGHT' | 'DRONE';
type EnvironmentType = 'MOUNTAIN' | 'HIGHWAY' | 'CITY' | 'FOREST' | 'STORM' | 'NIGHT';

interface DetectedVictim {
  id: string;
  label: string;
  color: string;
  location: string;
  status: string;
  priority: 'CRITICAL' | 'MODERATE' | 'STABLE';
  heartRate: number;
}

export const SatelliteDetectionView: React.FC = () => {
  const { 
    createEmergencyFromSatellite, 
    setActiveTab, 
    showAiExplanation,
    deployDroneToEmergency,
    setSimulatorState,
    engineeringMode,
    setEngineeringMode
  } = useRescue();

  // Mode States
  const [useR3FTerrain, setUseR3FTerrain] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('SATELLITE');
  const [environment, setEnvironment] = useState<EnvironmentType>('MOUNTAIN');
  const [selectedMapId, setSelectedMapId] = useState<MapPresetId>('LA_COLINA_CAMPUS');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY_SUNNY');
  const [aiVisionMode, setAiVisionMode] = useState<boolean>(false);
  const [explainMode, setExplainMode] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; title: string; data: any } | null>(null);

  // Scanning & Detection States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [accidentDetected, setAccidentDetected] = useState<boolean>(true);
  const [droneDeployed, setDroneDeployed] = useState<boolean>(false);
  const [droneFlightStage, setDroneFlightStage] = useState<'BASE' | 'FLYING' | 'HOVERING'>('BASE');
  const [droneDistanceKm, setDroneDistanceKm] = useState<number>(0.8);
  const [lidarScanned, setLidarScanned] = useState<boolean>(false);
  const [isLidarScanning, setIsLidarScanning] = useState<boolean>(false);

  // Replay controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Active Layers
  const [layers, setLayers] = useState({
    terrain: true,
    roads: true,
    vehicles: true,
    accidents: true,
    drones: true,
    hospitals: true,
    ambulances: true,
    landingZones: true,
    traffic: true,
    aiBoundingBoxes: true,
  });

  // Simulated Victims
  const victims: DetectedVictim[] = [
    { id: 'V-01', label: 'Victim #01', color: 'red', location: 'Vehicle A (Driver)', status: 'Possible life signs detected • Trapped in driver cabin', priority: 'CRITICAL', heartRate: 132 },
    { id: 'V-02', label: 'Victim #02', color: 'orange', location: 'Vehicle A (Passenger)', status: 'Conscious • Arm fracture flagged', priority: 'MODERATE', heartRate: 98 },
    { id: 'V-03', label: 'Victim #03', color: 'yellow', location: 'Roadside Shoulder', status: 'Bystander standing clear of wreckage', priority: 'STABLE', heartRate: 84 },
  ];

  // Canvas / Three.js References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Animated Three.js Objects
  const vehiclesRef = useRef<THREE.Group[]>([]);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const lidarPointsRef = useRef<THREE.Points | null>(null);
  const scanLaserRef = useRef<THREE.Mesh | null>(null);
  const droneMeshRef = useRef<THREE.Group | null>(null);
  const flightRouteLineRef = useRef<THREE.Line | null>(null);
  const rainPointsRef = useRef<THREE.Points | null>(null);
  const accidentMarkerRef = useRef<THREE.Mesh | null>(null);

  // Coords & target refs
  const initialPreset = MAP_PRESETS['LA_COLINA_CAMPUS'];
  const cameraTargetPos = useRef(new THREE.Vector3(
    initialPreset.defaultCameraLookAt[0], 
    initialPreset.defaultCameraLookAt[1], 
    initialPreset.defaultCameraLookAt[2]
  ));
  const cameraCurrentPos = useRef(new THREE.Vector3(
    initialPreset.defaultCameraPos[0], 
    initialPreset.defaultCameraPos[1], 
    initialPreset.defaultCameraPos[2]
  ));

  // Accident & Drone locations in world from active preset
  const accidentPos = useRef(new THREE.Vector3(
    initialPreset.incidentTargetPos[0],
    initialPreset.incidentTargetPos[1],
    initialPreset.incidentTargetPos[2]
  ));
  const droneStationPos = useRef(new THREE.Vector3(
    initialPreset.droneLaunchPos[0],
    initialPreset.droneLaunchPos[1],
    initialPreset.droneLaunchPos[2]
  ));
  const droneCurrentPos = useRef(new THREE.Vector3(
    initialPreset.droneLaunchPos[0],
    initialPreset.droneLaunchPos[1] + 2,
    initialPreset.droneLaunchPos[2]
  ));

  const handleSelectMap = (mapId: MapPresetId) => {
    setSelectedMapId(mapId);
    const p = MAP_PRESETS[mapId];
    accidentPos.current.set(p.incidentTargetPos[0], p.incidentTargetPos[1], p.incidentTargetPos[2]);
    droneStationPos.current.set(p.droneLaunchPos[0], p.droneLaunchPos[1], p.droneLaunchPos[2]);
    droneCurrentPos.current.set(p.droneLaunchPos[0], p.droneLaunchPos[1] + 2, p.droneLaunchPos[2]);
    cameraTargetPos.current.set(p.defaultCameraLookAt[0], p.defaultCameraLookAt[1], p.defaultCameraLookAt[2]);
    cameraCurrentPos.current.set(p.defaultCameraPos[0], p.defaultCameraPos[1], p.defaultCameraPos[2]);
    setDroneDeployed(false);
    setDroneFlightStage('BASE');
    setLidarScanned(false);
    sound.playBeep(880, 0.06);
  };


  // Scan Action
  const handleStartScan = () => {
    sound.playScanSweep();
    setIsScanning(true);
    setScanProgress(0);
    setAccidentDetected(false);
    setSelectedEntity(null);

    // Reset camera to high satellite orbit
    cameraTargetPos.current.set(0, 180, 220);

    let current = 0;
    const interval = setInterval(() => {
      current += 8;
      setScanProgress(Math.min(100, current));
      sound.playRadarPing();

      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setAccidentDetected(true);
        sound.playAlert();

        // Smoothly zoom in on the detected accident
        cameraTargetPos.current.set(accidentPos.current.x + 25, 32, accidentPos.current.z + 45);
      }
    }, 150);
  };

  // Satellite -> Drone Transition Action
  const handleDeployDrone = () => {
    sound.playAlert();
    setDroneDeployed(true);
    setDroneFlightStage('FLYING');
    sound.startDroneHum();

    // Move camera to chase drone
    let flightProgress = 0;
    const flightInterval = setInterval(() => {
      flightProgress += 0.04;
      setDroneDistanceKm(Math.max(0.05, +(0.8 * (1 - flightProgress)).toFixed(2)));

      if (flightProgress >= 1) {
        clearInterval(flightInterval);
        setDroneFlightStage('HOVERING');
        sound.playSuccess();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    }, 200);
  };

  // LiDAR Scan Action
  const handleStartLidar = () => {
    sound.playArmServo();
    setIsLidarScanning(true);

    setTimeout(() => {
      sound.playSuccess();
      setIsLidarScanning(false);
      setLidarScanned(true);
      if (lidarPointsRef.current) {
        lidarPointsRef.current.visible = true;
      }
    }, 1800);
  };

  // Build Three.js 3D Simulation World
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 3000);
    const initialPresetConfig = MAP_PRESETS[selectedMapId];
    camera.position.set(initialPresetConfig.defaultCameraPos[0], initialPresetConfig.defaultCameraPos[1], initialPresetConfig.defaultCameraPos[2]);
    camera.lookAt(initialPresetConfig.defaultCameraLookAt[0], initialPresetConfig.defaultCameraLookAt[1], initialPresetConfig.defaultCameraLookAt[2]);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Atmosphere, Sun & Sky based on timeOfDay
    const atmosphere = setupDaylightSkyAndAtmosphere(scene, timeOfDay);

    // 2. 3D Environment Builders based on selectedMapId
    if (selectedMapId === 'LA_COLINA_CAMPUS') {
      buildLaColinaCampusEnvironment(scene);
    } else if (selectedMapId === 'MEDELLIN_DOWNTOWN') {
      buildMedellinDowntownEnvironment(scene);
    } else if (selectedMapId === 'LAS_PALMAS_HIGHWAY') {
      buildLasPalmasHighwayEnvironment(scene);
    } else if (selectedMapId === 'ENVIGADO_FOOTHILLS') {
      buildEnvigadoFoothillsEnvironment(scene);
    } else {
      buildSantaElenaForestEnvironment(scene);
    }

    // 3. Traffic Route curve for animated vehicles matching current map
    const roadCurve = selectedMapId === 'LA_COLINA_CAMPUS' 
      ? new THREE.CatmullRomCurve3([
          new THREE.Vector3(-150, 0.5, 25),
          new THREE.Vector3(-80, 0.5, 18),
          new THREE.Vector3(-20, 0.5, 15),
          new THREE.Vector3(30, 0.5, 12),
          new THREE.Vector3(90, 0.5, 16),
          new THREE.Vector3(160, 0.5, 28)
        ])
      : selectedMapId === 'MEDELLIN_DOWNTOWN'
      ? new THREE.CatmullRomCurve3([
          new THREE.Vector3(-45, 0.5, 260),
          new THREE.Vector3(-45, 0.5, 120),
          new THREE.Vector3(-45, 0.5, -20),
          new THREE.Vector3(-45, 0.5, -140),
          new THREE.Vector3(-45, 0.5, -280)
        ])
      : new THREE.CatmullRomCurve3([
          new THREE.Vector3(-140, 1.2, 300),
          new THREE.Vector3(-80, 1.2, 180),
          new THREE.Vector3(-20, 1.2, 80),
          new THREE.Vector3(15, 1.2, -45),
          new THREE.Vector3(60, 1.2, -160),
          new THREE.Vector3(120, 1.2, -300)
        ]);

    // 4. Moving Simulated Vehicles along the road
    vehiclesRef.current = [];
    const carGeos = [new THREE.BoxGeometry(3.6, 1.6, 6), new THREE.BoxGeometry(4.2, 2.4, 9)];
    const carColors = [0x3b82f6, 0x10b981, 0xf59e0b, 0x64748b, 0xffffff];

    for (let i = 0; i < 7; i++) {
      const vGroup = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: viewMode === 'THERMAL' ? 0xf97316 : carColors[i % carColors.length],
        metalness: 0.7,
        roughness: 0.3,
      });
      const body = new THREE.Mesh(carGeos[i % 2], bodyMat);
      body.castShadow = true;
      vGroup.add(body);

      // Headlights
      if (viewMode === 'NIGHT' || timeOfDay === 'NIGHT_FLIR') {
        const headL = new THREE.PointLight(0xfffbeb, 2, 25);
        headL.position.set(1.2, 0.6, -3.2);
        vGroup.add(headL);
        const headR = new THREE.PointLight(0xfffbeb, 2, 25);
        headR.position.set(-1.2, 0.6, -3.2);
        vGroup.add(headR);
      }

      // Progress along curve
      const t = 0.08 + i * 0.13;
      if (t < 0.95) {
        const pt = roadCurve.getPoint(t);
        const tangent = roadCurve.getTangent(t);
        vGroup.position.copy(pt);
        vGroup.position.y += 1;
        vGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
        (vGroup as any).progress = t;
        (vGroup as any).speed = 0.0006 + Math.random() * 0.0004;

        scene.add(vGroup);
        vehiclesRef.current.push(vGroup);
      }
    }


    // 8. THE ACCIDENT SCENE AT SECTOR A-17 (Two vehicles, smoke, hazard flashers)
    const accidentGroup = new THREE.Group();
    accidentGroup.position.copy(accidentPos.current);

    // Vehicle A: Crashed damaged red car
    const carAMat = new THREE.MeshStandardMaterial({
      color: viewMode === 'THERMAL' ? 0xffffff : 0xef4444,
      metalness: 0.8,
      roughness: 0.3,
    });
    const carA = new THREE.Mesh(new THREE.BoxGeometry(4, 1.8, 7.5), carAMat);
    carA.position.set(0, 1.2, 0);
    carA.rotation.set(0.3, 0.4, 0.25);
    carA.castShadow = true;
    accidentGroup.add(carA);

    // Vehicle B: Second vehicle rear-ended
    const carBMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
    const carB = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.8, 7.8), carBMat);
    carB.position.set(-3.5, 1, 6.5);
    carB.rotation.set(0, -0.2, 0);
    carB.castShadow = true;
    accidentGroup.add(carB);

    // Flashing Amber Emergency Strobe Light
    const amberLight = new THREE.PointLight(0xf97316, 4, 35);
    amberLight.position.set(0, 3.5, 0);
    accidentGroup.add(amberLight);

    // Pulsing Red Detection Ring around accident
    const ringGeo = new THREE.RingGeometry(8, 9.6, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const accidentRing = new THREE.Mesh(ringGeo, ringMat);
    accidentRing.position.y = 0.2;
    accidentMarkerRef.current = accidentRing;
    accidentGroup.add(accidentRing);

    // Floating Holographic Anomaly Column
    const columnGeo = new THREE.CylinderGeometry(1.2, 1.8, 160, 16, 1, true);
    const columnMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const columnMesh = new THREE.Mesh(columnGeo, columnMat);
    columnMesh.position.y = 80;
    accidentGroup.add(columnMesh);

    scene.add(accidentGroup);

    // 9. Billowing Smoke Particles from Engine
    const smokeCount = 35;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3] = accidentPos.current.x + (Math.random() - 0.5) * 3;
      smokePos[i * 3 + 1] = accidentPos.current.y + 1.5 + Math.random() * 18;
      smokePos[i * 3 + 2] = accidentPos.current.z + (Math.random() - 0.5) * 3;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 4, transparent: true, opacity: 0.6 });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokePoints);
    smokeParticlesRef.current = smokePoints;

    // 10. DRONE STATION BASE & DRONE MODEL
    const droneStation = new THREE.Group();
    droneStation.position.copy(droneStationPos.current);

    // Landing pad
    const padMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 8, 1, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    padMesh.position.y = 0.5;
    droneStation.add(padMesh);

    const padH = new THREE.Mesh(
      new THREE.RingGeometry(4, 5.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
    );
    padH.rotateX(-Math.PI / 2);
    padH.position.y = 1.05;
    droneStation.add(padH);
    scene.add(droneStation);

    // Hexacopter Drone
    const drone = new THREE.Group();
    drone.position.copy(droneCurrentPos.current);

    const droneBody = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.4, 1, 6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
    );
    drone.add(droneBody);

    // Drone Navigation Strobe
    const droneLight = new THREE.PointLight(0x06b6d4, 2.5, 20);
    droneLight.position.y = 0.8;
    drone.add(droneLight);

    droneMeshRef.current = drone;
    scene.add(drone);

    // Glowing 3D Route Line from Drone Base to Accident
    const routePoints = [
      droneStationPos.current.clone().add(new THREE.Vector3(0, 10, 0)),
      new THREE.Vector3(-60, 28, 60),
      new THREE.Vector3(-10, 24, 10),
      accidentPos.current.clone().add(new THREE.Vector3(0, 18, 0)),
    ];
    const routeCurve = new THREE.CatmullRomCurve3(routePoints);
    const routeGeo = new THREE.BufferGeometry().setFromPoints(routeCurve.getPoints(50));
    const routeMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 3 });
    const flightRouteLine = new THREE.Line(routeGeo, routeMat);
    flightRouteLineRef.current = flightRouteLine;
    scene.add(flightRouteLine);

    // 11. LiDAR 3D Point Cloud Mesh around Accident (initially invisible until LiDAR is run)
    const lidarCount = 450;
    const lidarGeo = new THREE.BufferGeometry();
    const lidarPos = new Float32Array(lidarCount * 3);
    for (let i = 0; i < lidarCount; i++) {
      const r = Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      lidarPos[i * 3] = accidentPos.current.x + r * Math.cos(theta);
      lidarPos[i * 3 + 1] = accidentPos.current.y + Math.random() * 6;
      lidarPos[i * 3 + 2] = accidentPos.current.z + r * Math.sin(theta);
    }
    lidarGeo.setAttribute('position', new THREE.BufferAttribute(lidarPos, 3));
    const lidarMat = new THREE.PointsMaterial({ color: 0x10b981, size: 2.2, transparent: true, opacity: 0.85 });
    const lidarPoints = new THREE.Points(lidarGeo, lidarMat);
    lidarPoints.visible = lidarScanned;
    scene.add(lidarPoints);
    lidarPointsRef.current = lidarPoints;

    // 12. Scanning Laser Plane Mesh
    const scanLaserGeo = new THREE.PlaneGeometry(350, 4);
    scanLaserGeo.rotateX(-Math.PI / 2);
    const scanLaserMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const scanLaser = new THREE.Mesh(scanLaserGeo, scanLaserMat);
    scanLaser.position.y = 8;
    scanLaser.visible = isScanning;
    scene.add(scanLaser);
    scanLaserRef.current = scanLaser;

    // 13. Rain Storm Particles
    if (timeOfDay === 'MOUNTAIN_RAIN') {
      const rainCount = 600;
      const rainGeo = new THREE.BufferGeometry();
      const rainPos = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount; i++) {
        rainPos[i * 3] = (Math.random() - 0.5) * 400;
        rainPos[i * 3 + 1] = Math.random() * 120;
        rainPos[i * 3 + 2] = (Math.random() - 0.5) * 400;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
      const rainMat = new THREE.PointsMaterial({ color: 0xa5b4fc, size: 1.5, transparent: true, opacity: 0.7 });
      const rainPoints = new THREE.Points(rainGeo, rainMat);
      scene.add(rainPoints);
      rainPointsRef.current = rainPoints;
    }

    // Main 60 FPS Animation & Interaction Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.016 * playbackSpeed;

      // 1. Moving traffic along highway
      if (layers.vehicles && isPlaying) {
        vehiclesRef.current.forEach((v) => {
          let p = ((v as any).progress || 0) + (v as any).speed * playbackSpeed;
          if (p > 0.95) p = 0.05;
          (v as any).progress = p;

          const pt = roadCurve.getPoint(p);
          const tangent = roadCurve.getTangent(p);
          v.position.copy(pt);
          v.position.y += 1;
          v.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
        });
      }

      // 2. Rising smoke particles
      if (smokeParticlesRef.current && isPlaying) {
        const positions = smokeParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          positions[i * 3 + 1] += 0.12 * playbackSpeed;
          positions[i * 3] += (Math.random() - 0.5) * 0.06;
          if (positions[i * 3 + 1] > accidentPos.current.y + 22) {
            positions[i * 3 + 1] = accidentPos.current.y + 1.5;
            positions[i * 3] = accidentPos.current.x + (Math.random() - 0.5) * 3;
            positions[i * 3 + 2] = accidentPos.current.z + (Math.random() - 0.5) * 3;
          }
        }
        smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 3. Accident Detection Ring pulse
      if (accidentMarkerRef.current) {
        const scale = 1 + Math.sin(clock * 4) * 0.08;
        accidentMarkerRef.current.scale.set(scale, scale, 1);
      }

      // 4. Drone Flight Motion
      if (droneDeployed && droneMeshRef.current) {
        if (droneFlightStage === 'FLYING') {
          // Move from drone station toward accident along route
          const target = accidentPos.current.clone().add(new THREE.Vector3(0, 18, 0));
          droneCurrentPos.current.lerp(target, 0.02 * playbackSpeed);
          droneMeshRef.current.position.copy(droneCurrentPos.current);
          droneMeshRef.current.rotation.y += 0.04;
        } else if (droneFlightStage === 'HOVERING') {
          // Hover bobbing
          droneMeshRef.current.position.y = accidentPos.current.y + 18 + Math.sin(clock * 2) * 0.5;
        }
      }

      // 5. Scan laser pass animation
      if (scanLaserRef.current) {
        scanLaserRef.current.visible = isScanning;
        if (isScanning) {
          scanLaserRef.current.position.z = 250 - (scanProgress / 100) * 500;
        }
      }

      // 6. Camera Position & Mode Handling
      if (cameraRef.current) {
        if (viewMode === 'DRONE' && droneMeshRef.current) {
          // First-person nose cam view from drone
          cameraRef.current.position.copy(droneMeshRef.current.position);
          cameraRef.current.position.y -= 0.5;
          cameraRef.current.lookAt(accidentPos.current.x, accidentPos.current.y + 1, accidentPos.current.z);
        } else if (viewMode === 'MAP') {
          // Top-down perpendicular map view
          cameraTargetPos.current.set(0, 240, 0);
          cameraRef.current.position.lerp(cameraTargetPos.current, 0.05);
          cameraRef.current.lookAt(0, 0, 0);
        } else if (viewMode === 'TERRAIN') {
          // Low angle dramatic mountain elevation perspective
          cameraTargetPos.current.set(0, 25, 160);
          cameraRef.current.position.lerp(cameraTargetPos.current, 0.05);
          cameraRef.current.lookAt(0, 20, -40);
        } else {
          // SATELLITE / THERMAL / NIGHT
          if (accidentDetected && !isScanning) {
            // Target focused on accident
            cameraTargetPos.current.set(accidentPos.current.x + 35, 45, accidentPos.current.z + 55);
            cameraRef.current.position.lerp(cameraTargetPos.current, 0.03);
            cameraRef.current.lookAt(accidentPos.current.x, accidentPos.current.y + 2, accidentPos.current.z);
          } else {
            // Orbital high altitude satellite pass
            cameraTargetPos.current.set(0, 170, 230);
            cameraRef.current.position.lerp(cameraTargetPos.current, 0.03);
            cameraRef.current.lookAt(0, 0, 0);
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
  }, [viewMode, selectedMapId, timeOfDay, isScanning, accidentDetected, droneDeployed, droneFlightStage, lidarScanned, isPlaying, playbackSpeed, layers]);

  const currentPreset = MAP_PRESETS[selectedMapId];

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ORBITAL SATELLITE RECONNAISSANCE
            </span>
            {selectedMapId === 'LA_COLINA_CAMPUS' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                LA COLINA CAMPUS ACTIVE
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">CONSTELLATION: SENTINEL-EO-4B • SSO 520 KM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1 flex items-center gap-2">
            <span>Satellite Anomaly & Mountain Highway Detection</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {currentPreset.tagline} — {currentPreset.location} ({currentPreset.elevationMeters}m)
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SCAN AREA Button */}
          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs font-heading shadow-xl transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Satellite className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SATELLITE SCANNING...' : 'SCAN AREA'}</span>
          </button>

          {/* Time of Day Lighting Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => { setTimeOfDay('DAY_SUNNY'); sound.playBeep(900, 0.05); }}
              title="Daytime Sunny (Crisp Sunlight)"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                timeOfDay === 'DAY_SUNNY' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Daylight</span>
            </button>
            <button
              onClick={() => { setTimeOfDay('MORNING_GOLDEN'); sound.playBeep(900, 0.05); }}
              title="Golden Morning Sunrise"
              className={`p-1.5 rounded-lg text-xs ${
                timeOfDay === 'MORNING_GOLDEN' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sunrise className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setTimeOfDay('AFTERNOON_CLEAR'); sound.playBeep(900, 0.05); }}
              title="Clear Afternoon"
              className={`p-1.5 rounded-lg text-xs ${
                timeOfDay === 'AFTERNOON_CLEAR' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setTimeOfDay('MOUNTAIN_RAIN'); sound.playBeep(900, 0.05); }}
              title="Mountain Rain & Fog"
              className={`p-1.5 rounded-lg text-xs ${
                timeOfDay === 'MOUNTAIN_RAIN' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setTimeOfDay('NIGHT_FLIR'); sound.playBeep(900, 0.05); }}
              title="Tactical Night FLIR Infrared"
              className={`p-1.5 rounded-lg text-xs ${
                timeOfDay === 'NIGHT_FLIR' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI VISION MODE */}
          <button
            onClick={() => setAiVisionMode(!aiVisionMode)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              aiVisionMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{aiVisionMode ? '👁 AI VIEW' : '👁 AI VIEW'}</span>
          </button>

          {/* EXPLAIN MODE */}
          <button
            onClick={() => setExplainMode(!explainMode)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              explainMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>EXPLAIN</span>
          </button>

          {/* ENGINEERING MODE */}
          <button
            onClick={() => setEngineeringMode(!engineeringMode)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              engineeringMode ? 'bg-slate-800 text-cyan-400 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Engineering Telemetry Mode"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. SATELLITE 3D MAPS & CITIES SELECTOR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active High-Fidelity 3D Map & City Twin:</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400">5 Distinct Terrains Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {(Object.keys(MAP_PRESETS) as MapPresetId[]).map((mapId) => {
            const preset = MAP_PRESETS[mapId];
            const isSelected = selectedMapId === mapId;
            return (
              <button
                key={mapId}
                onClick={() => handleSelectMap(mapId)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {mapId === 'LA_COLINA_CAMPUS' && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-blue-500 text-[9px] font-bold text-white tracking-wider">
                    HOME & SCHOOL
                  </span>
                )}
                <div className="font-heading font-bold text-xs truncate text-white flex items-center gap-1.5">
                  {mapId === 'LA_COLINA_CAMPUS' && <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  {mapId === 'MEDELLIN_DOWNTOWN' && <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {mapId === 'LAS_PALMAS_HIGHWAY' && <Car className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  {mapId === 'ENVIGADO_FOOTHILLS' && <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {mapId === 'SANTA_ELENA_FOREST' && <Trees className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                  <span className="truncate">{preset.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.location}</div>
                <div className="text-[9px] font-mono text-cyan-400/80 mt-1 flex items-center justify-between">
                  <span>{preset.elevationMeters}m elev.</span>
                  <span>{preset.targetType}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SATELLITE VIEW MODES SELECTOR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-lg flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-slate-400 whitespace-nowrap pl-1">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>OPTICAL / SENSOR LAYERS:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'SATELLITE', label: '🛰️ NATURAL SATELLITE', desc: 'True color daylight' },
            { id: 'MAP', label: '🗺️ TACTICAL MAP', desc: 'Technical vector' },
            { id: 'TERRAIN', label: '⛰️ 3D ELEVATION', desc: 'Terrain elevation mesh' },
            { id: 'THERMAL', label: '🌡️ FLIR THERMAL', desc: 'Heat-signature vision' },
            { id: 'NIGHT', label: '🌙 NIGHT VISION', desc: 'Night surveillance' },
            { id: 'DRONE', label: '🚁 DRONE CAMERA', desc: 'First-person drone camera' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                sound.playBeep(880, 0.04);
                setViewMode(mode.id as ViewMode);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap ${
                viewMode === mode.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN 3D WORLD VIEWPORT + REAL-TIME OVERLAYS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Canvas Viewport */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl h-[560px] flex flex-col">
          {/* R3F High-Performance Procedural Terrain */}
          {useR3FTerrain && (
            <ProceduralTerrainCanvas
              initialPreset={selectedMapId as any}
              initialDaylight={timeOfDay as any}
              showHudControls={true}
            />
          )}

          {/* Fallback Standard Three.js Canvas Container */}
          <div 
            ref={containerRef} 
            className={`w-full h-full cursor-grab active:cursor-grabbing ${useR3FTerrain ? 'hidden' : 'block'}`} 
          />

          {/* Engine Mode Toggle Badge */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <button
              onClick={() => {
                setUseR3FTerrain(!useR3FTerrain);
                sound.playBeep(980, 0.05);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all ${
                useR3FTerrain
                  ? 'bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 border border-emerald-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${useR3FTerrain ? 'bg-slate-950 animate-pulse' : 'bg-slate-400'}`} />
              <span>{useR3FTerrain ? 'R3F + DREI 3D TOPOGRAPHY' : 'TACTICAL VIEW'}</span>
            </button>
          </div>

          {/* SATELLITE SCANNING STATUS OVERLAY */}
          {isScanning && (
            <div className="absolute top-4 left-4 bg-slate-950/95 border border-cyan-500/80 rounded-xl p-3 font-mono text-xs text-cyan-300 space-y-1 shadow-2xl z-20 backdrop-blur-md animate-in fade-in">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                SATELLITE CONNECTION: ONLINE
              </div>
              <div>AREA SCAN: ACTIVE [{scanProgress}%]</div>
              <div className="text-slate-300">OBJECTS DETECTED: 27</div>
              <div className="text-slate-300">VEHICLES: 14</div>
              <div className="text-slate-300">ROAD: 1</div>
              <div className="text-amber-400">HEAT ANOMALIES: 1</div>
              <div className="text-slate-300">SMOKE SIGNATURES: 1</div>
              <div className="text-cyan-400 font-bold animate-pulse">AI ANALYSIS: RUNNING...</div>
            </div>
          )}

          {/* COMPUTER VISION AI BOUNDING BOX OVERLAY ("WHAT DOES THE AI SEE?") */}
          {aiVisionMode && (
            <div className="absolute inset-0 pointer-events-none z-10 font-mono text-[10px]">
              {/* Box 1: Crashed Vehicle A */}
              <div className="absolute top-[48%] left-[46%] border-2 border-red-500 bg-red-500/10 px-2 py-0.5 text-red-300 font-bold rounded">
                VEHICLE #A [IMPACT DAMAGED: 98%]
              </div>

              {/* Box 2: Heat Anomaly */}
              <div className="absolute top-[42%] left-[48%] border border-amber-500 bg-amber-500/15 px-2 py-0.5 text-amber-300 font-bold rounded animate-pulse">
                HEAT ANOMALY [+142°C THERMAL SPIKE]
              </div>

              {/* Box 3: Smoke Plume */}
              <div className="absolute top-[34%] left-[44%] border border-slate-400 bg-slate-400/15 px-2 py-0.5 text-slate-200 font-bold rounded">
                SMOKE SIGNATURE [PETROLEUM RESIDUE]
              </div>

              {/* Box 4: Trapped Victim */}
              <div className="absolute top-[56%] left-[49%] border-2 border-cyan-400 bg-cyan-400/10 px-2 py-0.5 text-cyan-300 font-bold rounded animate-bounce">
                POSSIBLE VICTIM [BIO-SIGN DETECTED]
              </div>

              {/* Box 5: Safe Landing Zone */}
              <div className="absolute top-[64%] left-[38%] border-2 border-emerald-400 bg-emerald-400/15 px-2 py-0.5 text-emerald-300 font-bold rounded">
                SAFE LANDING ZONE [12m CLEAR APRON]
              </div>

              {/* Box 6: Road Stoppage */}
              <div className="absolute top-[72%] left-[48%] border border-yellow-400 text-yellow-300 px-2 py-0.5 rounded">
                ROAD CONGESTION [TRAFFIC 0 KM/H]
              </div>
            </div>
          )}

          {/* DRONE FIRST-PERSON CAMERA HUD (When in DRONE ViewMode or when Drone is Flying) */}
          {(viewMode === 'DRONE' || droneFlightStage === 'FLYING' || droneFlightStage === 'HOVERING') && (
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/60 rounded-xl p-3 font-mono text-xs text-cyan-300 space-y-1 shadow-2xl z-20">
              <div className="font-heading font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                DR-07 AUTONOMOUS MODE
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <div>ALTITUDE: <strong>42m</strong></div>
                <div>SPEED: <strong>18 m/s</strong></div>
                <div className="text-emerald-400">GPS CONNECTED (RTK LOCK)</div>
                <div className="text-cyan-400">LIDAR: ACTIVE</div>
                <div className="text-cyan-400">CAMERA: ACTIVE (4K FLIR)</div>
                <div className="text-red-400 font-bold">
                  DISTANCE TO INCIDENT: {droneDistanceKm} km
                </div>
              </div>
            </div>
          )}

          {/* Bottom Replay & Timeline Control Bar */}
          <div className="mt-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2.5 flex items-center justify-between text-xs z-20 font-mono">
            {/* Play/Pause & Speed */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300"
                title={isPlaying ? 'Pause simulation' : 'Play simulation'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 4 : 1)}
                className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
                title="Playback Speed"
              >
                {playbackSpeed}x SPEED
              </button>

              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">
                SECTOR: <strong>A-17 (MEDELLÍN EXPRESSWAY)</strong>
              </span>
            </div>

            {/* Quick Actions in Viewport */}
            <div className="flex items-center gap-2">
              {!droneDeployed ? (
                <button
                  onClick={handleDeployDrone}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-heading shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>LAUNCH RESCUE DRONE</span>
                </button>
              ) : !lidarScanned ? (
                <button
                  onClick={handleStartLidar}
                  disabled={isLidarScanning}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-heading shadow-md flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isLidarScanning ? 'SCANNING LIDAR...' : 'START LIDAR SCAN'}</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold text-[10px]">
                  ✓ 3D SCENE RECONSTRUCTED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Detection Intelligence & Interactive Inspector */}
        <div className="lg:col-span-4 space-y-4 text-left">
          {/* AI EMERGENCY DETECTION REPORT CARD */}
          {accidentDetected && (
            <div className="bg-slate-900/90 border border-red-500/50 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <h3 className="text-xs font-bold text-white font-heading tracking-wide">
                    AI EMERGENCY DETECTION
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-800">
                  94% CONFIDENCE
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div className="text-red-400 font-bold font-heading text-sm">
                  Possible vehicle collision
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 text-slate-300">
                  <div>Location: <strong className="text-white">Sector A-17</strong></div>
                  <div>Vehicles: <strong className="text-amber-400">2</strong></div>
                  <div>Possible victims: <strong className="text-red-400">3</strong></div>
                  <div>Smoke: <strong className="text-emerald-400">Detected</strong></div>
                  <div>Traffic disruption: <strong className="text-red-400">Detected</strong></div>
                  <div>Weather: <strong className="text-cyan-300">{environment}</strong></div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Earth observation thermal sensors detected a +142°C engine bloom followed by sudden traffic deceleration to 0 km/h. Drone DR-07 pre-cleared for dispatch.
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    sound.playSuccess();
                    const newId = createEmergencyFromSatellite('Sector A-17 Highway', 6.2150, -75.5520);
                    deployDroneToEmergency('DR-07', newId);
                    setActiveTab('drone-simulator');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs font-heading shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4 fill-current" />
                  <span>ENTER 3D DRONE FLIGHT SIMULATOR</span>
                </button>

                <button
                  onClick={() => {
                    createEmergencyFromSatellite('Sector A-17 Highway', 6.2150, -75.5520);
                    setActiveTab('emergencies');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  View in Emergency Dispatch Queue
                </button>
              </div>
            </div>
          )}

          {/* SIMULATED VICTIMS DETECTED LIST */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-red-400" />
                Victim Localization (Simulation)
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">3 Flagged</span>
            </div>

            <div className="space-y-2">
              {victims.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    sound.playBeep(920, 0.05);
                    setSelectedEntity({ type: 'VICTIM', title: v.label, data: v });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold font-heading text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${v.priority === 'CRITICAL' ? 'bg-red-500' : v.priority === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      <span>{v.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">({v.location})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{v.status}</div>
                  </div>
                  <div className="text-right font-mono text-xs text-emerald-400 shrink-0">
                    {v.heartRate} BPM
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* EMERGENCY LANDING ZONES */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
            <h3 className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              Autonomous Landing Zone Feasibility
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 flex items-center justify-between">
                <div>
                  <strong>🟢 SAFE LZ ALPHA</strong>
                  <div className="text-[10px] text-slate-400">Road Shoulder 12m clear • 1.2° Slope</div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-900 font-bold">FEASIBLE</span>
              </div>

              <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 flex items-center justify-between">
                <div>
                  <strong>🔴 UNSAFE LZ BETA</strong>
                  <div className="text-[10px] text-slate-400">Rocky ravine embankment • Power lines</div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 font-bold">ABORT</span>
              </div>
            </div>
          </div>

          {/* EDUCATIONAL EXPLAIN MODE MODAL / CARD */}
          {explainMode && (
            <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500 text-xs space-y-2 text-cyan-200 animate-in fade-in">
              <div className="font-bold font-heading text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>🎓 Educational Project Breakdown</span>
              </div>
              <p className="leading-relaxed">
                <strong>Why Satellite & Drone Co-Design?</strong> In mountainous terrain like the Medellín Valley, traditional 911 calls can take 5 to 10 minutes while victims or witnesses are in shock. Orbital multispectral thermal satellites detect the collision instantly, dispatching an autonomous drone with first-aid trauma pods minutes before road ambulances can navigate traffic.
              </p>
              <div className="font-mono text-[10px] text-cyan-400">
                Created by Santiago Cegarra, Samuel Velasco & Jeronimo Escobar (Colegio Campestre La Colina).
              </div>
            </div>
          )}

          {/* ENGINEERING TELEMETRY CARD */}
          {engineeringMode && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 font-mono text-[11px] text-slate-400 space-y-1">
              <div className="text-cyan-400 font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                SYSTEM TELEMETRY BUS (CAN 2.0B)
              </div>
              <div>RTK POSITION: LAT 6.2150° N | LNG -75.5520° W</div>
              <div>ORBIT ALTITUDE: 520.4 km (Sun-Synchronous)</div>
              <div>POINT CLOUD SAMPLES: 450 pts (LiDAR Velodyne)</div>
              <div>FRAME LATENCY: 14.2 ms | CRC32: PASS</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
