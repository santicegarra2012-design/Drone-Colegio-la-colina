import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  Compass, 
  Navigation, 
  Activity, 
  Battery, 
  Eye, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Crosshair, 
  Sliders, 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  Wind,
  Camera,
  MapPin,
  Flame,
  Radio,
  Send,
  HeartPulse,
  Sun,
  Moon,
  CloudRain,
  Layers,
  GraduationCap,
  Building2,
  Mountain,
  Trees,
  Home,
  Sunrise,
  CloudSun
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
  buildSantaElenaForestEnvironment,
} from '../utils/map3DGenerator.ts';

type CameraMode = 'CHASE' | 'FPV' | 'TOP_DOWN';


export const DroneSimulatorView: React.FC = () => {
  const {
    simulatorState,
    setSimulatorState,
    toggleLidarMode,
    toggleRescueMode,
    toggleAutopilot,
    resetSimulator,
    setScenario,
    selectedEmergency,
    deployDroneToEmergency,
  } = useRescue();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flight simulation state
  const [useR3FTerrain, setUseR3FTerrain] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('CHASE');
  const [selectedMapId, setSelectedMapId] = useState<MapPresetId>('LA_COLINA_CAMPUS');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY_SUNNY');
  const [payloadDropped, setPayloadDropped] = useState<boolean>(false);
  const [payloadLanded, setPayloadLanded] = useState<boolean>(false);
  const [missionCompleted, setMissionCompleted] = useState<boolean>(false);
  const [obstacleAlert, setObstacleAlert] = useState<{ active: boolean; dist: string; dir: string } | null>(null);

  // Physics & Animation refs for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const droneGroupRef = useRef<THREE.Group | null>(null);
  const propellersRef = useRef<THREE.Mesh[]>([]);
  const targetCarRef = useRef<THREE.Group | null>(null);
  const targetBeaconRef = useRef<THREE.Mesh | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const parachutePackageRef = useRef<THREE.Group | null>(null);
  const lidarConeRef = useRef<THREE.Mesh | null>(null);
  const rainSystemRef = useRef<THREE.Points | null>(null);

  // Initial preset
  const initialPreset = MAP_PRESETS['LA_COLINA_CAMPUS'];

  // Drone position & velocity tracking
  const dronePos = useRef({ 
    x: initialPreset.droneLaunchPos[0], 
    y: initialPreset.droneLaunchPos[1] + 16, 
    z: initialPreset.droneLaunchPos[2] 
  });
  const droneRot = useRef({ pitch: 0, roll: 0, yaw: 0 });
  const droneSpeed = useRef(0);
  const targetPos = useRef({ 
    x: initialPreset.incidentTargetPos[0], 
    y: initialPreset.incidentTargetPos[1], 
    z: initialPreset.incidentTargetPos[2] 
  });

  const handleSelectMap = (mapId: MapPresetId) => {
    setSelectedMapId(mapId);
    const p = MAP_PRESETS[mapId];
    dronePos.current = {
      x: p.droneLaunchPos[0],
      y: p.droneLaunchPos[1] + 16,
      z: p.droneLaunchPos[2],
    };
    droneRot.current = { pitch: 0, roll: 0, yaw: 0 };
    droneSpeed.current = 0;
    targetPos.current = {
      x: p.incidentTargetPos[0],
      y: p.incidentTargetPos[1],
      z: p.incidentTargetPos[2],
    };
    setPayloadDropped(false);
    setPayloadLanded(false);
    setMissionCompleted(false);
    if (parachutePackageRef.current) parachutePackageRef.current.visible = false;
    sound.playAlert();
  };


  // Scenarios list
  const scenarios = [
    { id: 'SCENARIO-1', name: 'Scenario 1: Vehicle Crash (Medellín Expressway)', desc: 'Highway debris, wet asphalt, 3 victims', diff: 'STANDARD' },
    { id: 'SCENARIO-2', name: 'Scenario 2: Person Trapped Under Debris', desc: 'Collapsed structural beam, tight landing apron', diff: 'HAZARDOUS' },
    { id: 'SCENARIO-3', name: 'Scenario 3: Remote Ecological Reserve Distress', desc: 'High altitude mountain ridge, dense tree canopy', diff: 'ADVERSE_WEATHER' },
    { id: 'SCENARIO-4', name: 'Scenario 4: Night Time Low-Visibility Rescue', desc: 'Zero ambient light, requires thermal & LiDAR fusion', diff: 'HAZARDOUS' },
    { id: 'SCENARIO-5', name: 'Scenario 5: Mountain Heavy Rain & Wind Gusts', desc: '38 km/h wind shear, active rotor compensation', diff: 'ADVERSE_WEATHER' },
    { id: 'SCENARIO-6', name: 'Scenario 6: Multi-Victim Mass Casualty Triage', desc: '4 scattered casualties requiring rapid priority sort', diff: 'HAZARDOUS' },
    { id: 'SCENARIO-7', name: 'Scenario 7: Dense High-Rise Obstacle Navigation', desc: 'Power lines, construction cranes, tight canyon', diff: 'HAZARDOUS' },
    { id: 'SCENARIO-8', name: 'Scenario 8: Satellite Communication Interruption', desc: 'Autonomous edge-compute fallback engagement', diff: 'STANDARD' },
  ];

  // Deploy Medical Payload Action
  const deployPayload = () => {
    if (payloadDropped) return;
    sound.playAlert();
    setPayloadDropped(true);

    // Three.js Parachute deployment
    if (parachutePackageRef.current && droneGroupRef.current) {
      parachutePackageRef.current.visible = true;
      parachutePackageRef.current.position.set(
        dronePos.current.x,
        dronePos.current.y - 2,
        dronePos.current.z
      );
    }

    // Land after 2.5 seconds
    setTimeout(() => {
      sound.playSuccess();
      setPayloadLanded(true);
      setMissionCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 2400);
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toLowerCase();

      if (key === 'w') {
        droneSpeed.current = Math.min(85, droneSpeed.current + 8);
        droneRot.current.pitch = -0.15;
      } else if (key === 's') {
        droneSpeed.current = Math.max(0, droneSpeed.current - 10);
        droneRot.current.pitch = 0.12;
      } else if (key === 'a') {
        droneRot.current.yaw += 0.04;
        droneRot.current.roll = 0.2;
      } else if (key === 'd') {
        droneRot.current.yaw -= 0.04;
        droneRot.current.roll = -0.2;
      } else if (key === 'q') {
        droneRot.current.yaw += 0.05;
      } else if (key === 'e') {
        droneRot.current.yaw -= 0.05;
      } else if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        dronePos.current.y = Math.min(95, dronePos.current.y + 4);
      } else if (key === 'shift') {
        dronePos.current.y = Math.max(6, dronePos.current.y - 4);
      } else if (key === 'c') {
        setCameraMode((prev) => (prev === 'CHASE' ? 'FPV' : prev === 'FPV' ? 'TOP_DOWN' : 'CHASE'));
      } else if (key === 'l') {
        toggleLidarMode();
      } else if (key === 'r') {
        deployPayload();
      }
    };

    const handleKeyUp = () => {
      droneRot.current.pitch = 0;
      droneRot.current.roll = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toggleLidarMode]);

  // Three.js 3D World Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.5, 2000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 1. Atmosphere, Sun & Sky based on timeOfDay
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

    // 3. Incident Target Beacon & Scene at targetPos.current
    const targetGroup = new THREE.Group();
    targetGroup.position.set(targetPos.current.x, targetPos.current.y, targetPos.current.z);

    if (selectedMapId === 'LA_COLINA_CAMPUS') {
      // Soccer Field Emergency: Injured student on turf with school triage flag & medical kit
      const studentTorso = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.7, 3),
        new THREE.MeshStandardMaterial({ color: 0x0f2b48, roughness: 0.6 }) // School navy uniform
      );
      studentTorso.position.y = 0.35;
      targetGroup.add(studentTorso);

      const studentHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
      );
      studentHead.position.set(0, 0.5, -2);
      targetGroup.add(studentHead);

      // School Emergency Response Flag & Stretcher
      const flagPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 6.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8 })
      );
      flagPole.position.set(2.5, 3.25, 0);
      targetGroup.add(flagPole);

      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1.5),
        new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
      );
      flag.position.set(3.7, 5.2, 0);
      targetGroup.add(flag);
    } else {
      // Vehicle Crash Incident
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 2.2, 9),
        new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.3 })
      );
      carBody.position.y = 1.8;
      carBody.rotation.set(0.15, 0.4, 0.35);
      carBody.castShadow = true;
      targetGroup.add(carBody);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.6, 5),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 })
      );
      cabin.position.set(0, 3.2, -0.6);
      cabin.rotation.set(0.15, 0.4, 0.35);
      targetGroup.add(cabin);
    }

    // Hazard Flashing Beacon
    const hazardLight = new THREE.PointLight(0xf97316, 4, 30);
    hazardLight.position.set(0, 3.5, 0);
    targetGroup.add(hazardLight);

    // 240m Sky Holographic Beacon Pillar for effortless visual acquisition
    const beaconGeo = new THREE.CylinderGeometry(0.8, 2.0, 240, 16, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 120;
    targetBeaconRef.current = beacon;
    targetGroup.add(beacon);

    // Ground Target Circle
    const targetRing = new THREE.Mesh(
      new THREE.RingGeometry(6, 7.8, 32),
      new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    targetRing.rotateX(-Math.PI / 2);
    targetRing.position.y = 0.35;
    targetGroup.add(targetRing);

    scene.add(targetGroup);
    targetCarRef.current = targetGroup;


    // 9. Billowing Smoke Particles from Engine
    const smokeCount = 45;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = targetPos.current.x + (Math.random() - 0.5) * 3;
      smokePositions[i * 3 + 1] = targetPos.current.y + 2 + Math.random() * 22;
      smokePositions[i * 3 + 2] = targetPos.current.z + (Math.random() - 0.5) * 3;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 4.5,
      transparent: true,
      opacity: 0.5,
    });
    const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokeParticles);
    smokeParticlesRef.current = smokeParticles;

    // 10. Autonomous HexaCopter Drone Model
    const droneGroup = new THREE.Group();

    // Central Hexagonal Fuselage
    const bodyGeo = new THREE.CylinderGeometry(2.4, 2.8, 1.2, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.2,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    droneGroup.add(bodyMesh);

    // Green / Cyan Top Sensor Dome
    const domeGeo = new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.y = 0.6;
    droneGroup.add(domeMesh);

    // 6 Carbon Booms & Motors with Spinning Propellers
    const armGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.5, 8);
    armGeo.rotateZ(Math.PI / 2);
    const motorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.6, 12);
    const propGeo = new THREE.BoxGeometry(4.2, 0.05, 0.4);

    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const propMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.85 });

    const props: THREE.Mesh[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const boom = new THREE.Group();
      boom.rotation.y = angle;

      // Arm tube
      const arm = new THREE.Mesh(armGeo, carbonMat);
      arm.position.x = 2.4;
      boom.add(arm);

      // Motor pod
      const motor = new THREE.Mesh(motorGeo, motorMat);
      motor.position.x = 4.6;
      boom.add(motor);

      // Propeller
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(4.6, 0.4, 0);
      boom.add(prop);
      props.push(prop);

      // Navigation Strobe LED on wingtip
      const ledColor = i === 0 || i === 1 ? 0xef4444 : i === 2 ? 0x10b981 : 0xffffff;
      const ledLight = new THREE.PointLight(ledColor, 1.5, 8);
      ledLight.position.set(4.8, 0.2, 0);
      boom.add(ledLight);

      droneGroup.add(boom);
    }
    propellersRef.current = props;

    // Underbelly Medical Trauma Pod
    const podGeo = new THREE.BoxGeometry(2.2, 1.4, 2.2);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.5,
    });
    const podMesh = new THREE.Mesh(podGeo, podMat);
    podMesh.position.y = -1.2;
    droneGroup.add(podMesh);

    // Scanning LiDAR Cone below drone
    const lidarConeGeo = new THREE.ConeGeometry(18, 45, 16, 1, true);
    lidarConeGeo.rotateX(Math.PI);
    const lidarMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const lidarCone = new THREE.Mesh(lidarConeGeo, lidarMat);
    lidarCone.position.y = -22.5;
    droneGroup.add(lidarCone);
    lidarConeRef.current = lidarCone;

    scene.add(droneGroup);
    droneGroupRef.current = droneGroup;

    // 11. Dropped Medical Parachute Package
    const parachuteGroup = new THREE.Group();
    parachuteGroup.visible = false;

    // Parachute Canopy
    const canopyGeo = new THREE.SphereGeometry(3.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // High-visibility Orange
      side: THREE.DoubleSide,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 5.5;
    parachuteGroup.add(canopy);

    // Supply box
    const crateGeo = new THREE.BoxGeometry(1.8, 1.4, 1.8);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const crate = new THREE.Mesh(crateGeo, crateMat);
    crate.position.y = 1;
    parachuteGroup.add(crate);

    scene.add(parachuteGroup);
    parachutePackageRef.current = parachuteGroup;

    // 12. Rain Particle System in RAIN_STORM mode
    if (timeOfDay === 'MOUNTAIN_RAIN') {
      const rainCount = 400;
      const rainGeo = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 300;
        rainPositions[i * 3 + 1] = Math.random() * 100;
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 1.2,
        transparent: true,
        opacity: 0.6,
      });
      const rainSystem = new THREE.Points(rainGeo, rainMat);
      scene.add(rainSystem);
      rainSystemRef.current = rainSystem;
    }

    // Main 60FPS Three.js Render & Physics Loop
    let animId: number;
    let hazardTimer = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Autopilot navigation logic
      if (simulatorState.autopilot) {
        // Automatically home in toward target crash site!
        const dx = targetPos.current.x - dronePos.current.x;
        const dz = targetPos.current.z - dronePos.current.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 8) {
          droneSpeed.current = Math.min(65, droneSpeed.current + 1.2);
          const targetYaw = Math.atan2(dx, -dz);
          droneRot.current.yaw += (targetYaw - droneRot.current.yaw) * 0.05;
          droneRot.current.pitch = -0.1;
        } else {
          droneSpeed.current = Math.max(0, droneSpeed.current - 1.5);
          droneRot.current.pitch = 0;
        }
      }

      // Update drone position based on heading & speed
      const dt = 0.016;
      const vx = -Math.sin(droneRot.current.yaw) * (droneSpeed.current * 0.35);
      const vz = -Math.cos(droneRot.current.yaw) * (droneSpeed.current * 0.35);

      dronePos.current.x += vx * dt;
      dronePos.current.z += vz * dt;

      // Update distance to target
      const distToTarget = Math.round(
        Math.hypot(
          dronePos.current.x - targetPos.current.x,
          dronePos.current.z - targetPos.current.z
        )
      );

      // Sync state back to React simulatorState for HUD
      setSimulatorState((prev: any) => ({
        ...prev,
        speed: Math.round(droneSpeed.current),
        altitude: Math.round(dronePos.current.y),
        heading: Math.round(((-droneRot.current.yaw * 180) / Math.PI + 360) % 360),
        pitch: Math.round((droneRot.current.pitch * 180) / Math.PI),
        roll: Math.round((droneRot.current.roll * 180) / Math.PI),
        distanceToTargetMeters: distToTarget,
      }));

      // Update drone 3D mesh
      if (droneGroupRef.current) {
        droneGroupRef.current.position.set(
          dronePos.current.x,
          dronePos.current.y,
          dronePos.current.z
        );
        droneGroupRef.current.rotation.set(
          droneRot.current.pitch,
          droneRot.current.yaw,
          droneRot.current.roll
        );

        // Spin propellers proportional to speed + base hover
        propellersRef.current.forEach((prop, idx) => {
          const spinDir = idx % 2 === 0 ? 1 : -1;
          prop.rotation.y += (0.4 + droneSpeed.current * 0.02) * spinDir;
        });

        // Rotate LiDAR cone
        if (lidarConeRef.current) {
          lidarConeRef.current.visible = simulatorState.lidarActive;
          lidarConeRef.current.rotation.y += 0.08;
        }
      }

      // Parachute physics descent
      if (parachutePackageRef.current && parachutePackageRef.current.visible && !payloadLanded) {
        parachutePackageRef.current.position.y = Math.max(
          targetPos.current.y + 1,
          parachutePackageRef.current.position.y - 0.25
        );
        parachutePackageRef.current.rotation.y += 0.01;
      }

      // Animate smoke particles rising
      if (smokeParticlesRef.current) {
        const positions = smokeParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          positions[i * 3 + 1] += 0.12; // rise up
          positions[i * 3] += (Math.random() - 0.5) * 0.08;
          if (positions[i * 3 + 1] > targetPos.current.y + 26) {
            positions[i * 3 + 1] = targetPos.current.y + 2;
            positions[i * 3] = targetPos.current.x + (Math.random() - 0.5) * 3;
            positions[i * 3 + 2] = targetPos.current.z + (Math.random() - 0.5) * 3;
          }
        }
        smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Beacon Light and Hazard Flash
      hazardTimer += 0.05;
      if (targetBeaconRef.current) {
        targetBeaconRef.current.rotation.y += 0.02;
      }

      // Rain animation
      if (rainSystemRef.current) {
        const positions = rainSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 400; i++) {
          positions[i * 3 + 1] -= 2.2;
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 100;
          }
        }
        rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Camera Positioning Modes
      if (cameraRef.current) {
        if (cameraMode === 'CHASE') {
          // 3rd Person Chase Cam behind the drone
          const offsetDist = 18;
          const offsetHeight = 6;
          const camX = dronePos.current.x + Math.sin(droneRot.current.yaw) * offsetDist;
          const camZ = dronePos.current.z + Math.cos(droneRot.current.yaw) * offsetDist;
          const camY = dronePos.current.y + offsetHeight;

          cameraRef.current.position.set(camX, camY, camZ);
          cameraRef.current.lookAt(
            dronePos.current.x,
            dronePos.current.y + 1,
            dronePos.current.z
          );
        } else if (cameraMode === 'FPV') {
          // Cockpit Nose Camera
          cameraRef.current.position.set(
            dronePos.current.x - Math.sin(droneRot.current.yaw) * 1.5,
            dronePos.current.y + 0.2,
            dronePos.current.z - Math.cos(droneRot.current.yaw) * 1.5
          );
          const lookX = dronePos.current.x - Math.sin(droneRot.current.yaw) * 60;
          const lookZ = dronePos.current.z - Math.cos(droneRot.current.yaw) * 60;
          cameraRef.current.lookAt(lookX, dronePos.current.y + droneRot.current.pitch * 30, lookZ);
        } else if (cameraMode === 'TOP_DOWN') {
          // Tactical Map / Satellite View straight down
          cameraRef.current.position.set(
            dronePos.current.x,
            dronePos.current.y + 140,
            dronePos.current.z
          );
          cameraRef.current.lookAt(
            dronePos.current.x,
            dronePos.current.y,
            dronePos.current.z - 1
          );
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize listener
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
  }, [cameraMode, selectedMapId, timeOfDay, simulatorState.autopilot, simulatorState.lidarActive, payloadLanded]);

  const currentPreset = MAP_PRESETS[selectedMapId];
  const distMeters = simulatorState.distanceToTargetMeters;
  const inDropZone = distMeters < 35;

  return (
    <div className="p-4 md:p-6 space-y-6 text-left animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              3D RESCUE FLIGHT SIMULATOR
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {currentPreset.name}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              REALISTIC 3D ROADS • DAYLIGHT ATMOSPHERE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-heading mt-1 flex items-center gap-2">
            <span>Rescue AI Drone Flight Deck</span>
            {selectedMapId === 'LA_COLINA_CAMPUS' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold">
                CAMPUS TWIN ACTIVE
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {currentPreset.tagline} — {currentPreset.location} ({currentPreset.elevationMeters}m)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Autopilot Toggle */}
          <button
            onClick={toggleAutopilot}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              simulatorState.autopilot
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/40 animate-pulse font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{simulatorState.autopilot ? 'AUTOPILOT ENGAGED' : 'ENGAGE AUTOPILOT'}</span>
          </button>

          {/* Camera View Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setCameraMode('CHASE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                cameraMode === 'CHASE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              3rd Person
            </button>
            <button
              onClick={() => setCameraMode('FPV')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                cameraMode === 'FPV' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cockpit FPV
            </button>
            <button
              onClick={() => setCameraMode('TOP_DOWN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                cameraMode === 'TOP_DOWN' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tactical Map
            </button>
          </div>

          {/* Time of Day Lighting Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => { setTimeOfDay('DAY_SUNNY'); sound.playBeep(900, 0.05); }}
              title="Daytime Sunny (Bright Daylight)"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                timeOfDay === 'DAY_SUNNY' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Daylight</span>
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


          {/* Reset Flight */}
          <button
            onClick={() => handleSelectMap(selectedMapId)}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Reset flight coordinates"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D MAP & CITY SELECTOR RIBBON */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              🗺️ Select 3D Map & Operational Theater:
            </span>
            <span className="text-[11px] text-cyan-400 font-mono hidden sm:inline">
              (All environments render flat 3D roads with curbs, double yellow stripes, and daytime skies)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {timeOfDay === 'DAY_SUNNY' ? '☀️ Full Daylight Sunny Noon' : 
             timeOfDay === 'MORNING_GOLDEN' ? '🌅 Golden Morning' :
             timeOfDay === 'AFTERNOON_CLEAR' ? '⛅ Clear Afternoon' :
             timeOfDay === 'MOUNTAIN_RAIN' ? '🌧️ Mountain Rain & Mist' : '🌙 Night Thermal FLIR'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* Map 1: Colegio Campestre La Colina */}
          <button
            onClick={() => handleSelectMap('LA_COLINA_CAMPUS')}
            className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              selectedMapId === 'LA_COLINA_CAMPUS'
                ? 'bg-blue-950/80 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                HOME & SCHOOL
              </span>
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs leading-tight">
                Colegio Campestre La Colina
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                Loma Los Balsos • Calle 12 Sur
              </div>
            </div>
          </button>

          {/* Map 2: Medellín Downtown */}
          <button
            onClick={() => handleSelectMap('MEDELLIN_DOWNTOWN')}
            className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              selectedMapId === 'MEDELLIN_DOWNTOWN'
                ? 'bg-blue-950/80 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400">
                URBAN TOWERS
              </span>
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs leading-tight">
                Medellín Downtown & Poblado
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                Av. El Poblado • Hospital Las Vegas
              </div>
            </div>
          </button>

          {/* Map 3: Vía Las Palmas */}
          <button
            onClick={() => handleSelectMap('LAS_PALMAS_HIGHWAY')}
            className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              selectedMapId === 'LAS_PALMAS_HIGHWAY'
                ? 'bg-blue-950/80 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Mountain className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400">
                HIGHWAY PASS
              </span>
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs leading-tight">
                Vía Las Palmas Highway
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                Mirador Hairpin Turn • Guardrails
              </div>
            </div>
          </button>

          {/* Map 4: Envigado Foothills */}
          <button
            onClick={() => handleSelectMap('ENVIGADO_FOOTHILLS')}
            className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              selectedMapId === 'ENVIGADO_FOOTHILLS'
                ? 'bg-blue-950/80 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                <Home className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-500/10 text-amber-400">
                RESIDENTIAL
              </span>
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs leading-tight">
                Envigado & Sabaneta Foothills
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                Town Plaza • Fire Station Pad
              </div>
            </div>
          </button>

          {/* Map 5: Santa Elena Forest */}
          <button
            onClick={() => handleSelectMap('SANTA_ELENA_FOREST')}
            className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between col-span-2 sm:col-span-1 ${
              selectedMapId === 'SANTA_ELENA_FOREST'
                ? 'bg-blue-950/80 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="p-1.5 rounded-lg bg-green-500/20 text-green-300">
                <Trees className="w-4 h-4" />
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-green-500/10 text-green-400">
                CLOUD FOREST
              </span>
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs leading-tight">
                Santa Elena & Arví Reserve
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                High Andean Canopy • Trail Run
              </div>
            </div>
          </button>
        </div>
      </div>


      {/* Main 3D Simulator Viewport + Overlays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
          <div className="absolute top-12 right-3 z-30 flex items-center gap-2">
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
              <span>{useR3FTerrain ? 'R3F + DREI PROCEDURAL' : 'TACTICAL HUD'}</span>
            </button>
          </div>

          {/* Top HUD Telemetry Ribbon */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs font-mono z-10">
            <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-cyan-300 flex items-center gap-3 shadow-lg">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>HDG: {simulatorState.heading}°</span>
              </div>
              <span className="text-slate-600">|</span>
              <span>ALT: {simulatorState.altitude}m</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">SPD: {simulatorState.speed} km/h</span>
            </div>

            {/* Target Distance HUD Badge */}
            <div
              className={`backdrop-blur-md px-3.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-lg transition-all ${
                inDropZone
                  ? 'bg-red-950/90 text-red-200 border-red-500 animate-pulse'
                  : 'bg-slate-900/90 text-cyan-300 border-slate-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>TARGET: <strong>{distMeters}m</strong></span>
              {inDropZone && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[10px] font-bold">
                  DROP ZONE READY
                </span>
              )}
            </div>
          </div>

          {/* Interactive Floating 3D Target Objective Crosshair Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-center">
            {cameraMode === 'FPV' && (
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* HUD Reticle */}
                <div className="w-16 h-16 rounded-full border-2 border-cyan-400/60 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                </div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/40"></div>
                <div className="absolute left-0 right-0 h-0.5 bg-cyan-400/40"></div>
              </div>
            )}
          </div>

          {/* Rescue Action Bar: Drop Medical Payload Button */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            {inDropZone && !payloadDropped && (
              <button
                onClick={deployPayload}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-black text-sm font-heading shadow-2xl border-2 border-white animate-bounce flex items-center gap-2.5 transition-transform hover:scale-105"
              >
                <Zap className="w-5 h-5 fill-current text-yellow-300" />
                <span>[SPACE / R] AIRDROP MEDICAL TRAUMA POD NOW!</span>
              </button>
            )}

            {payloadDropped && !payloadLanded && (
              <div className="px-5 py-2.5 rounded-xl bg-amber-950/90 border border-amber-500 text-amber-200 font-mono text-xs flex items-center gap-2 shadow-2xl animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>PARACHUTE DEPLOYED • DESCENDING TO CRASH VICTIM...</span>
              </div>
            )}

            {payloadLanded && (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 font-mono text-xs flex items-center gap-2 shadow-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PAYLOAD DELIVERED SAFELY! TOURNIQUET & BIO-MONITOR ACTIVE</span>
              </div>
            )}
          </div>

          {/* Autopilot Status Ribbon */}
          {simulatorState.autopilot && (
            <div className="absolute bottom-16 left-4 bg-emerald-950/90 border border-emerald-500/80 px-3 py-1.5 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-lg z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>AUTOPILOT: FOLLOWING ABURRÁ HIGHWAY FLIGHT CORRIDOR</span>
            </div>
          )}

          {/* On-Screen Virtual Controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
            {/* Directional Pad */}
            <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
              <button
                onClick={() => {
                  droneRot.current.yaw += 0.08;
                  droneRot.current.roll = 0.25;
                }}
                className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                title="Bank Left (A)"
              >
                A
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    droneSpeed.current = Math.min(85, droneSpeed.current + 12);
                    droneRot.current.pitch = -0.15;
                  }}
                  className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                  title="Pitch Down / Throttle (W)"
                >
                  W
                </button>
                <button
                  onClick={() => {
                    droneSpeed.current = Math.max(0, droneSpeed.current - 12);
                    droneRot.current.pitch = 0.12;
                  }}
                  className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                  title="Pitch Up / Brake (S)"
                >
                  S
                </button>
              </div>
              <button
                onClick={() => {
                  droneRot.current.yaw -= 0.08;
                  droneRot.current.roll = -0.25;
                }}
                className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                title="Bank Right (D)"
              >
                D
              </button>
            </div>

            {/* Altitude & Action Bar */}
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
              <button
                onClick={() => {
                  dronePos.current.y = Math.min(95, dronePos.current.y + 6);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
              >
                Climb (Space)
              </button>
              <button
                onClick={() => {
                  dronePos.current.y = Math.max(6, dronePos.current.y - 6);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Descend (Shift)
              </button>
              <button
                onClick={deployPayload}
                disabled={payloadDropped}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Drop Kit (R)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Scenarios & Real-Time Sensor Telemetry */}
        <div className="lg:col-span-4 space-y-4 text-left">
          {/* Mission Target Objective Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="font-bold text-white font-heading">
                  TARGET: VEHICLE COLLISION #42
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {distMeters}m AWAY
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-slate-300">
              <div>Visual: <strong className="text-white">Red sedan overturned on road</strong></div>
              <div>Casualties: <strong className="text-red-400">1 Critical victim detected</strong></div>
              <div>Vitals: <strong className="text-emerald-400">HR 132 BPM • Hemorrhage Risk</strong></div>
              <div>Objective: <strong className="text-cyan-300">Approach &lt; 35m & airdrop trauma kit</strong></div>
            </div>

            {missionCompleted && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/80 text-emerald-200 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold font-heading text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>MISSION DEBRIEF: SUCCESSFUL INTERVENTION!</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Autonomous payload delivery confirmed at crash coordinate. Smart tourniquet and vital sign beacon transferred. Predicted survival rate boosted to <strong>94%</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Controls Reference */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-xs space-y-2">
            <h3 className="font-bold text-white font-heading flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              Pilot 3D Controls Reference:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">W</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">S</kbd> Pitch & Throttle</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">A</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">D</kbd> Roll / Strafe</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">Space</kbd> Climb</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">Shift</kbd> Descend</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">C</kbd> Change Camera</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">R</kbd> Airdrop Trauma Kit</div>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white font-heading flex items-center gap-1.5 text-xs">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Select Simulation Scenario:
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">8 Scenarios</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {scenarios.map((sc) => {
                const isSelected = simulatorState.activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setScenario(sc.id);
                      if (sc.id === 'SCENARIO-4') setTimeOfDay('NIGHT_FLIR');
                      else if (sc.id === 'SCENARIO-5') setTimeOfDay('MOUNTAIN_RAIN');
                      else setTimeOfDay('DAY_SUNNY');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold font-heading">
                      <span className={isSelected ? 'text-cyan-300' : 'text-slate-200'}>{sc.name}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                        {sc.diff}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sc.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
