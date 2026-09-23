import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  Drone, 
  Emergency, 
  Hospital, 
  Ambulance, 
  ChargingStation, 
  RoboticArmState, 
  DiagnosticTest, 
  ActiveTab,
  SimulationScenario,
  Victim,
  TimelineEvent 
} from '../types/index.ts';
import { sound } from '../utils/audio.ts';
import confetti from 'canvas-confetti';

interface DemoStep {
  id: number;
  timeSec: number;
  title: string;
  tab: ActiveTab;
  description: string;
}

interface RescueContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Presentation & Engineering Mode
  presentationMode: boolean;
  setPresentationMode: (enabled: boolean) => void;
  engineeringMode: boolean;
  setEngineeringMode: (enabled: boolean) => void;

  // Drones
  drones: Drone[];
  selectedDroneId: string;
  setSelectedDroneId: (id: string) => void;
  selectedDrone: Drone;
  updateDrone: (id: string, updates: Partial<Drone>) => void;

  // Emergencies
  emergencies: Emergency[];
  selectedEmergencyId: string;
  setSelectedEmergencyId: (id: string) => void;
  selectedEmergency: Emergency;
  createEmergencyFromSatellite: (locationName: string, lat: number, lng: number) => string;
  updateEmergencyStatus: (id: string, status: Emergency['status'], newTimelineEvent?: TimelineEvent) => void;

  // Hospitals & Ground network
  hospitals: Hospital[];
  ambulances: Ambulance[];
  chargingStations: ChargingStation[];

  // Drone Simulator
  simulatorState: {
    x: number;
    y: number;
    altitude: number;
    speed: number;
    heading: number;
    pitch: number;
    roll: number;
    lidarActive: boolean;
    rescueMode: boolean;
    autopilot: boolean;
    targetX: number;
    targetY: number;
    distanceToTargetMeters: number;
    activeScenario: string;
  };
  setSimulatorState: React.Dispatch<React.SetStateAction<any>>;
  toggleLidarMode: () => void;
  toggleRescueMode: () => void;
  toggleAutopilot: () => void;
  resetSimulator: () => void;
  setScenario: (scenarioId: string) => void;

  // Robotic Arm
  armState: RoboticArmState;
  setArmAngle: (joint: 'shoulder' | 'elbow' | 'wrist', angle: number) => void;
  toggleGripper: () => void;
  executeArmTask: (taskName: string) => void;
  resetArm: () => void;

  // Testing Lab
  diagnosticTests: DiagnosticTest[];
  runSingleTest: (testId: string) => void;
  runAllTests: () => void;

  // Demo Runner
  isDemoRunning: boolean;
  demoProgressPercent: number;
  currentDemoStep: number;
  startDemo: () => void;
  stopDemo: () => void;

  // Mission Actions
  deployDroneToEmergency: (droneId: string, emergencyId: string) => void;
  deliverMedicalSuppliesToVictim: (victimId: string) => void;
  notifyEmergencyServices: (emergencyId: string) => void;

  // Audio & Settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  soundMuted: boolean;
  toggleSoundMute: () => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  resetEntireSimulation: () => void;

  // Explainability
  aiExplainModal: { open: boolean; title: string; content: string } | null;
  showAiExplanation: (title: string, content: string) => void;
  closeAiExplanation: () => void;
}

const RescueContext = createContext<RescueContextType | undefined>(undefined);

// Initial Simulated Drones
const INITIAL_DRONES: Drone[] = [
  {
    id: 'DR-07',
    callsign: 'Falcon-Rescue-07',
    model: 'Apex HexaCopter Mk-IV',
    status: 'AVAILABLE',
    batteryPercent: 88,
    lat: 6.2442,
    lng: -75.5812,
    altitudeMeters: 45,
    speedKmh: 0,
    headingDeg: 34,
    temperatureC: 24.2,
    motorHealthPercent: 99,
    cameraStatus: 'OK',
    lidarStatus: 'OK',
    gpsStatus: 'RTK_FIX',
    commStatus: 'EXCELLENT',
    aiStatus: 'ONLINE',
    payload: 'Dual Robotic Arm + Trauma Kit IV + AED Pod',
    flightTimeMinutes: 14.5,
    maxSpeedKmh: 95,
    maxRangeKm: 28,
  },
  {
    id: 'DR-01',
    callsign: 'Sentinel-Alpha',
    model: 'AeroScout LongRange',
    status: 'AVAILABLE',
    batteryPercent: 95,
    lat: 6.2518,
    lng: -75.5636,
    altitudeMeters: 120,
    speedKmh: 0,
    headingDeg: 180,
    temperatureC: 22.8,
    motorHealthPercent: 98,
    cameraStatus: 'OK',
    lidarStatus: 'OK',
    gpsStatus: 'RTK_FIX',
    commStatus: 'EXCELLENT',
    aiStatus: 'ONLINE',
    payload: 'Multi-spectral LiDAR + 4K Optical Pod',
    flightTimeMinutes: 4.2,
    maxSpeedKmh: 110,
    maxRangeKm: 35,
  },
  {
    id: 'DR-02',
    callsign: 'AeroLifter-Beta',
    model: 'Titan HeavyCargo X-8',
    status: 'AVAILABLE',
    batteryPercent: 74,
    lat: 6.2301,
    lng: -75.5902,
    altitudeMeters: 0,
    speedKmh: 0,
    headingDeg: 90,
    temperatureC: 26.1,
    motorHealthPercent: 96,
    cameraStatus: 'OK',
    lidarStatus: 'OK',
    gpsStatus: 'RTK_FIX',
    commStatus: 'GOOD',
    aiStatus: 'ONLINE',
    payload: 'Heavy Debris Winch & Field Blood Refrigerator',
    flightTimeMinutes: 42.1,
    maxSpeedKmh: 80,
    maxRangeKm: 22,
  },
  {
    id: 'DR-03',
    callsign: 'MediFalcon-03',
    model: 'Apex HexaCopter Mk-IV',
    status: 'CHARGING',
    batteryPercent: 42,
    lat: 6.2085,
    lng: -75.5678,
    altitudeMeters: 0,
    speedKmh: 0,
    headingDeg: 0,
    temperatureC: 29.5,
    motorHealthPercent: 95,
    cameraStatus: 'OK',
    lidarStatus: 'OK',
    gpsStatus: 'RTK_FIX',
    commStatus: 'EXCELLENT',
    aiStatus: 'STANDBY',
    payload: 'Emergency Oxygen & Thermal Wraps',
    flightTimeMinutes: 112.0,
    maxSpeedKmh: 95,
    maxRangeKm: 28,
  },
  {
    id: 'DR-04',
    callsign: 'SkySurveyor-04',
    model: 'ScanWing Tri-VTOL',
    status: 'MAINTENANCE',
    batteryPercent: 100,
    lat: 6.2621,
    lng: -75.5744,
    altitudeMeters: 0,
    speedKmh: 0,
    headingDeg: 270,
    temperatureC: 21.0,
    motorHealthPercent: 88,
    cameraStatus: 'CALIBRATING',
    lidarStatus: 'OK',
    gpsStatus: 'GPS_3D',
    commStatus: 'GOOD',
    aiStatus: 'STANDBY',
    payload: 'Radar Ground Penetrating Scanner',
    flightTimeMinutes: 340.5,
    maxSpeedKmh: 125,
    maxRangeKm: 45,
  },
  {
    id: 'DR-05',
    callsign: 'RapidResponder-05',
    model: 'Apex HexaCopter Mk-IV',
    status: 'AVAILABLE',
    batteryPercent: 86,
    lat: 6.2195,
    lng: -75.6012,
    altitudeMeters: 15,
    speedKmh: 0,
    headingDeg: 45,
    temperatureC: 23.4,
    motorHealthPercent: 99,
    cameraStatus: 'OK',
    lidarStatus: 'OK',
    gpsStatus: 'RTK_FIX',
    commStatus: 'EXCELLENT',
    aiStatus: 'ONLINE',
    payload: 'Pediatric & Adult Trauma First-Response Pod',
    flightTimeMinutes: 28.0,
    maxSpeedKmh: 95,
    maxRangeKm: 28,
  },
];

// Initial Simulated Emergencies
const INITIAL_EMERGENCIES: Emergency[] = [
  {
    id: 'EM-0042',
    code: '#0042',
    title: 'Vehicle Collision (2 Vehicles, Debris)',
    description: 'Two-car high impact collision on expressway connector. Satellite thermal camera flagged instant deceleration & vehicle heat bloom. Possible trapped passenger.',
    locationName: 'Autopista Sur Km 4.2 (Simulated)',
    city: 'Medellín Metro Corridor',
    lat: 6.2289,
    lng: -75.5785,
    severity: 'HIGH',
    potentialVictimsCount: 3,
    weather: 'Intermittent Light Rain',
    visibility: 'Moderate',
    windSpeedKmh: 16,
    temperatureC: 21,
    nearestDroneId: 'DR-07',
    assignedDroneId: undefined,
    status: 'DETECTED',
    timestamp: 'Just now',
    estimatedResponseMin: 1.8,
    aiReasoning: 'Satellite telemetry detected rapid deceleration (<0.4s) followed by localized smoke thermal signature. Nighttime rain increases hypothermia and visibility risk. DR-07 selected for RTK-GPS precision, high-wind stability, and dual robotic manipulator arm.',
    suggestedEquipment: ['Thermal Blanket Pod', 'AED Concept Pod', 'Smart Hemostatic Bandage', 'Robotic Gripper Clearance'],
    suggestedLandingZone: 'Highway shoulder median (Coordinates: 6.2291, -75.5782)',
    nearbyHospital: 'Hospital General de Medellín (3.4 km)',
    timeline: [
      { time: '19:42:01', phase: 'DETECTION', message: 'Earth observation satellite flagged thermal & traffic velocity anomaly.', type: 'alert' },
      { time: '19:42:06', phase: 'AI ANALYSIS', message: 'Gemini Emergency Vision Model confirmed vehicle collision signature.', type: 'info' },
      { time: '19:42:10', phase: 'DISPATCH', message: 'Incident #0042 created. Nearest capable unit: DR-07 (1.4 km).', type: 'info' },
    ],
    victims: [
      {
        id: 'VIC-01',
        label: 'Victim Alpha (Driver Front)',
        location: 'Inside driver cabin, Vehicle 1',
        lifeSigns: 'DETECTED',
        heartRateBpm: 98,
        respirationRpm: 19,
        bodyTempC: 36.4,
        status: 'TRAPPED',
        distanceMeters: 4.2,
        assisted: false,
        medicalPackageDelivered: false,
      },
      {
        id: 'VIC-02',
        label: 'Victim Beta (Passenger)',
        location: 'Adjacent to guardrail / debris',
        lifeSigns: 'DETECTED',
        heartRateBpm: 112,
        respirationRpm: 24,
        bodyTempC: 35.8,
        status: 'INJURED',
        distanceMeters: 7.8,
        assisted: false,
        medicalPackageDelivered: false,
      },
      {
        id: 'VIC-03',
        label: 'Victim Gamma (Rear Seat)',
        location: 'Rear cabin Vehicle 2',
        lifeSigns: 'FAINT',
        heartRateBpm: 54,
        respirationRpm: 11,
        bodyTempC: 34.9,
        status: 'CRITICAL',
        distanceMeters: 9.1,
        assisted: false,
        medicalPackageDelivered: false,
      },
    ],
  },
  {
    id: 'EM-0043',
    code: '#0043',
    title: 'Debris Entrapment / Structural Collapse',
    description: 'Minor excavation wall collapse near commercial construction site. Acoustic ground sensor detected low frequency impact.',
    locationName: 'Calle 33 Sector Industrial (Simulated)',
    city: 'Medellín East',
    lat: 6.2415,
    lng: -75.5612,
    severity: 'CRITICAL',
    potentialVictimsCount: 2,
    weather: 'Overcast, Calm',
    visibility: 'Good',
    windSpeedKmh: 8,
    temperatureC: 23,
    nearestDroneId: 'DR-01',
    assignedDroneId: undefined,
    status: 'DETECTED',
    timestamp: '12 min ago',
    estimatedResponseMin: 2.1,
    aiReasoning: 'Deep rubble penetration requires ultra-wideband radar vital sign detection and micro-acoustic listening array.',
    suggestedEquipment: ['Through-Wall Life Sign Radar', 'Emergency Oxygen Pack', 'High-Lumen Illumination Strobe'],
    suggestedLandingZone: 'Clear asphalt apron north of site gate',
    nearbyHospital: 'Clínica Las Vegas (2.8 km)',
    timeline: [
      { time: '19:30:15', phase: 'DETECTION', message: 'Acoustic trigger received from municipal smart-infrastructure sensor.', type: 'alert' },
    ],
    victims: [
      {
        id: 'VIC-04',
        label: 'Worker Alpha',
        location: 'Under timber beam shelter',
        lifeSigns: 'DETECTED',
        heartRateBpm: 88,
        respirationRpm: 17,
        bodyTempC: 36.6,
        status: 'TRAPPED',
        distanceMeters: 6.1,
        assisted: false,
        medicalPackageDelivered: false,
      },
    ],
  },
  {
    id: 'EM-0044',
    code: '#0044',
    title: 'Disoriented Hiker in Ecological Reserve',
    description: 'Hiker with low phone battery reported disorientation off trail in mountainous terrain near school perimeter.',
    locationName: 'Colegio La Colina Nature Ridge (Simulated)',
    city: 'Envigado / La Colina Hills',
    lat: 6.1952,
    lng: -75.5895,
    severity: 'MEDIUM',
    potentialVictimsCount: 1,
    weather: 'Cool Mountain Mist',
    visibility: 'Moderate',
    windSpeedKmh: 12,
    temperatureC: 18,
    nearestDroneId: 'DR-05',
    assignedDroneId: undefined,
    status: 'DETECTED',
    timestamp: '25 min ago',
    estimatedResponseMin: 3.4,
    aiReasoning: 'Dense canopy coverage. Requires long-wavelength infrared thermal imaging to penetrate tree cover.',
    suggestedEquipment: ['FLIR Thermal Camera', 'Emergency Thermal Blanket', 'GPS Beacon Transponder'],
    suggestedLandingZone: 'Forest clearing ridge point 4',
    nearbyHospital: 'Hospital Manuel Uribe Ángel (4.2 km)',
    timeline: [
      { time: '19:18:00', phase: 'DETECTION', message: 'Simulated 123 distress ping matched with cellular tower triangulation.', type: 'alert' },
    ],
    victims: [
      {
        id: 'VIC-05',
        label: 'Hiker (Reported hypothermic symptoms)',
        location: 'Ravine edge under eucalyptus canopy',
        lifeSigns: 'DETECTED',
        heartRateBpm: 76,
        respirationRpm: 15,
        bodyTempC: 35.1,
        status: 'STABLE',
        distanceMeters: 3.5,
        assisted: false,
        medicalPackageDelivered: false,
      },
    ],
  },
];

// Initial Hospitals
const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'Hospital General de Medellín',
    distanceKm: 3.4,
    emergencyCapacity: 'OPTIMAL',
    availableBeds: 18,
    specialties: ['Level 1 Trauma', 'Burn Unit', 'Neurosurgery'],
    lat: 6.2325,
    lng: -75.5714,
    phone: '+57 (4) 384-7300 (Simulated)',
    incomingPatients: 1,
  },
  {
    id: 'HOSP-02',
    name: 'Hospital Pablo Tobón Uribe',
    distanceKm: 6.2,
    emergencyCapacity: 'OPTIMAL',
    availableBeds: 24,
    specialties: ['Complex Trauma', 'Intensive Care', 'Pediatric Emergency'],
    lat: 6.2731,
    lng: -75.5823,
    phone: '+57 (4) 445-9000 (Simulated)',
    incomingPatients: 0,
  },
  {
    id: 'HOSP-03',
    name: 'Clínica Las Vegas',
    distanceKm: 4.8,
    emergencyCapacity: 'NEAR_CAPACITY',
    availableBeds: 6,
    specialties: ['Cardiovascular', 'Emergency Triage', 'Orthopedics'],
    lat: 6.2012,
    lng: -75.5742,
    phone: '+57 (4) 315-9000 (Simulated)',
    incomingPatients: 2,
  },
];

// Initial Ambulances
const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 'AMB-101',
    callsign: 'Rescue Alpha-1',
    unitType: 'Advanced Life Support',
    status: 'DISPATCHED',
    etaMinutes: 4.2,
    lat: 6.2351,
    lng: -75.5842,
  },
  {
    id: 'AMB-102',
    callsign: 'Rescue Bravo-2',
    unitType: 'Rescue Truck',
    status: 'EN_ROUTE',
    etaMinutes: 7.0,
    lat: 6.2201,
    lng: -75.5721,
  },
  {
    id: 'AMB-103',
    callsign: 'Rescue Charlie-3',
    unitType: 'Basic Life Support',
    status: 'STATION',
    etaMinutes: 0,
    lat: 6.2482,
    lng: -75.5684,
  },
];

// Initial Charging Stations
const INITIAL_CHARGERS: ChargingStation[] = [
  {
    id: 'PAD-01',
    name: 'Central Command Helipad Station',
    location: 'La Alpujarra Roof Hub',
    lat: 6.2440,
    lng: -75.5740,
    availablePads: 3,
    totalPads: 4,
    solarGenerationKw: 18.4,
  },
  {
    id: 'PAD-02',
    name: 'Southern Valley Drone Perch',
    location: 'El Poblado High Point',
    lat: 6.2085,
    lng: -75.5678,
    availablePads: 1,
    totalPads: 2,
    solarGenerationKw: 12.1,
  },
  {
    id: 'PAD-03',
    name: 'Northern Corridor Fast-Pad',
    location: 'Bello Metro Tower',
    lat: 6.2890,
    lng: -75.5580,
    availablePads: 2,
    totalPads: 2,
    solarGenerationKw: 15.0,
  },
];

// Initial Diagnostic Tests
const INITIAL_TESTS: DiagnosticTest[] = [
  {
    id: 'TEST-01',
    name: 'LiDAR 3D Point-Cloud Density & Range',
    subsystem: 'SENSORS',
    status: 'IDLE',
    durationMs: 1400,
    description: 'Sweeps 360-deg 16-channel LiDAR at 200,000 pts/sec. Checks signal-to-noise ratio.',
    lastRunLogs: [],
  },
  {
    id: 'TEST-02',
    name: 'Autonomous Obstacle Avoidance Recalibration',
    subsystem: 'NAVIGATION',
    status: 'IDLE',
    durationMs: 1800,
    description: 'Simulates sudden virtual obstacles at 15m. Verifies dynamic path re-planning latency <25ms.',
    lastRunLogs: [],
  },
  {
    id: 'TEST-03',
    name: 'Through-Debris Radar Life-Sign Scanner',
    subsystem: 'SENSORS',
    status: 'IDLE',
    durationMs: 2000,
    description: 'Pulsed UWB radar micro-motion filter. Validates detection of chest wall displacements down to 0.4mm.',
    lastRunLogs: [],
  },
  {
    id: 'TEST-04',
    name: 'Robotic Manipulator Servo Kinematics & Torque',
    subsystem: 'PAYLOAD',
    status: 'IDLE',
    durationMs: 1600,
    description: 'Exercises shoulder, elbow, wrist and soft-silicone gripper across 180-deg range with load cell.',
    lastRunLogs: [],
  },
  {
    id: 'TEST-05',
    name: 'Triple-Redundant RTK-GPS Satellite Lock',
    subsystem: 'NAVIGATION',
    status: 'IDLE',
    durationMs: 1200,
    description: 'Queries GPS, Galileo, and GLONASS constellations. Confirms positional deviation under 2.5 cm.',
    lastRunLogs: [],
  },
  {
    id: 'TEST-06',
    name: 'Emergency Motor Kill & Parachute Pyrotechnic Fail-Safe',
    subsystem: 'SAFETY',
    status: 'IDLE',
    durationMs: 1300,
    description: 'Verifies ballistic emergency parachute capacitor voltage and automated rotor disengagement logic.',
    lastRunLogs: [],
  },
  {
    id: 'TEST-07',
    name: 'Mesh Relay & Satellite Bandwidth Latency Check',
    subsystem: 'COMMUNICATION',
    status: 'IDLE',
    durationMs: 1500,
    description: 'Pings AI Cloud, Satellite link, and ground ambulance mobile terminals. Confirms jitter <8ms.',
    lastRunLogs: [],
  },
  {
    id: 'TEST-08',
    name: 'Battery Cell Impedance & Discharge Under Max Thrust',
    subsystem: 'SAFETY',
    status: 'IDLE',
    durationMs: 1700,
    description: 'Simulates 6-rotor full emergency throttle (450W per arm). Verifies voltage sag stays within safety threshold.',
    lastRunLogs: [],
  },
];

export const RescueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Modes
  const [activeTab, setActiveTabState] = useState<ActiveTab>('command-center');
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [engineeringMode, setEngineeringMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  const soundMuted = !soundEnabled;
  const toggleSoundMute = () => {
    sound.toggleMute();
    setSoundEnabledState(!soundEnabled);
  };

  // Entities
  const [drones, setDrones] = useState<Drone[]>(INITIAL_DRONES);
  const [selectedDroneId, setSelectedDroneId] = useState<string>('DR-07');
  const [emergencies, setEmergencies] = useState<Emergency[]>(INITIAL_EMERGENCIES);
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>('EM-0042');
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(INITIAL_CHARGERS);
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>(INITIAL_TESTS);

  // Robotic Arm State
  const [armState, setArmState] = useState<RoboticArmState>({
    shoulderAngle: 45,
    elbowAngle: 75,
    wristAngle: 30,
    gripperState: 'OPEN',
    gripperPinchPercent: 20,
    currentTask: 'Standby / Ready',
    carriedItem: null,
    torqueLoadPercent: 12,
  });

  // Simulator State
  const [simulatorState, setSimulatorState] = useState({
    x: 0,
    y: 0,
    altitude: 45,
    speed: 0,
    heading: 34,
    pitch: 0,
    roll: 0,
    lidarActive: true,
    rescueMode: false,
    autopilot: false,
    targetX: 85,
    targetY: -65,
    distanceToTargetMeters: 420,
    activeScenario: 'SCENARIO-1',
  });

  // Explainability Modal
  const [aiExplainModal, setAiExplainModal] = useState<{ open: boolean; title: string; content: string } | null>(null);

  // Demo Choreography
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoProgressPercent, setDemoProgressPercent] = useState<number>(0);
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(0);
  const demoIntervalRef = useRef<number | null>(null);
  const demoStepIndexRef = useRef<number>(0);

  // Audio sync
  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    sound.enabled = val;
  };

  const setActiveTab = (tab: ActiveTab) => {
    sound.playBeep(980, 0.05);
    setActiveTabState(tab);
  };

  // Selected Entities
  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];
  const selectedEmergency = emergencies.find((e) => e.id === selectedEmergencyId) || emergencies[0];

  const updateDrone = useCallback((id: string, updates: Partial<Drone>) => {
    setDrones((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const updateEmergencyStatus = useCallback((
    id: string, 
    status: Emergency['status'], 
    newTimelineEvent?: TimelineEvent
  ) => {
    setEmergencies((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const autoEvent: TimelineEvent = newTimelineEvent || {
          time: timeStr,
          phase: status.replace('_', ' '),
          message: `Mission phase transitioned to ${status.replace('_', ' ')}`,
          type: status === 'COMPLETED' ? 'success' : 'info',
        };

        return {
          ...e,
          status,
          timeline: [autoEvent, ...e.timeline],
        };
      })
    );
  }, []);

  // Deploy Drone Action
  const deployDroneToEmergency = useCallback((droneId: string, emergencyId: string) => {
    sound.playAlert();
    const drone = drones.find((d) => d.id === droneId);
    const em = emergencies.find((e) => e.id === emergencyId);
    if (!drone || !em) return;

    updateDrone(droneId, {
      status: 'MISSION',
      currentMissionId: emergencyId,
      altitudeMeters: 55,
      speedKmh: 82,
    });

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    updateEmergencyStatus(emergencyId, 'DRONE_DEPLOYED', {
      time: timeStr,
      phase: 'DEPARTURE',
      message: `Autonomous launch initiated. Drone ${drone.callsign} en route at 82 km/h. ETA ~${em.estimatedResponseMin} min.`,
      type: 'action',
    });

    // Also update simulator target
    setSimulatorState((prev) => ({
      ...prev,
      autopilot: true,
      rescueMode: true,
      distanceToTargetMeters: Math.round(em.estimatedResponseMin * 900),
    }));
  }, [drones, emergencies, updateDrone, updateEmergencyStatus]);

  // Deliver Medical Supplies
  const deliverMedicalSuppliesToVictim = useCallback((victimId: string) => {
    sound.playSuccess();
    setEmergencies((prev) =>
      prev.map((em) => ({
        ...em,
        victims: em.victims.map((v) =>
          v.id === victimId ? { ...v, assisted: true, medicalPackageDelivered: true, status: 'STABLE' } : v
        ),
      }))
    );
    executeArmTask('Delivered Smart Bandage & Thermal Blanket');
  }, []);

  // Notify Emergency Services
  const notifyEmergencyServices = useCallback((emergencyId: string) => {
    sound.playSuccess();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    updateEmergencyStatus(emergencyId, 'GROUND_RESPONSE_ARRIVING', {
      time: timeStr,
      phase: 'TELEMETRY DISPATCH',
      message: 'LiDAR point-cloud, 3D crash model, and radar life signs transmitted to Hospital General & Ambulance Alpha-1.',
      type: 'success',
    });

    setAmbulances((prev) =>
      prev.map((amb, i) =>
        i === 0 ? { ...amb, status: 'ON_SCENE', etaMinutes: 0.8 } : amb
      )
    );
  }, [updateEmergencyStatus]);

  // Explainability
  const showAiExplanation = (title: string, content: string) => {
    sound.playBeep(1100, 0.08);
    setAiExplainModal({ open: true, title, content });
  };

  const closeAiExplanation = () => setAiExplainModal(null);

  // Simulator controls
  const toggleLidarMode = () => {
    sound.playRadarPing();
    setSimulatorState((prev) => ({ ...prev, lidarActive: !prev.lidarActive }));
  };

  const toggleRescueMode = () => {
    sound.playBeep(880, 0.1);
    setSimulatorState((prev) => ({ ...prev, rescueMode: !prev.rescueMode }));
  };

  const toggleAutopilot = () => {
    sound.playBeep(1400, 0.1);
    setSimulatorState((prev) => ({ ...prev, autopilot: !prev.autopilot }));
  };

  const resetSimulator = () => {
    sound.playBeep(600, 0.08);
    setSimulatorState({
      x: 0,
      y: 0,
      altitude: 45,
      speed: 0,
      heading: 34,
      pitch: 0,
      roll: 0,
      lidarActive: true,
      rescueMode: false,
      autopilot: false,
      targetX: 85,
      targetY: -65,
      distanceToTargetMeters: 420,
      activeScenario: 'SCENARIO-1',
    });
  };

  const setScenario = (scenarioId: string) => {
    sound.playBeep(920, 0.08);
    setSimulatorState((prev) => ({
      ...prev,
      activeScenario: scenarioId,
      distanceToTargetMeters: scenarioId === 'SCENARIO-2' ? 620 : 380,
    }));
  };

  // Robotic Arm Controls
  const setArmAngle = (joint: 'shoulder' | 'elbow' | 'wrist', angle: number) => {
    sound.playArmServo();
    setArmState((prev) => ({
      ...prev,
      [`${joint}Angle`]: angle,
    }));
  };

  const toggleGripper = () => {
    sound.playArmServo();
    setArmState((prev) => ({
      ...prev,
      gripperState: prev.gripperState === 'OPEN' ? 'CLOSED' : 'OPEN',
      gripperPinchPercent: prev.gripperState === 'OPEN' ? 95 : 10,
    }));
  };

  const executeArmTask = (taskName: string) => {
    sound.playSuccess();
    setArmState((prev) => ({
      ...prev,
      currentTask: `Executing: ${taskName}`,
      torqueLoadPercent: Math.min(95, prev.torqueLoadPercent + 25),
    }));

    setTimeout(() => {
      setArmState((prev) => ({
        ...prev,
        currentTask: `Completed: ${taskName}`,
        carriedItem: taskName.includes('Deliver') ? null : 'Medical Trauma Pod',
        torqueLoadPercent: 18,
      }));
    }, 1800);
  };

  const resetArm = () => {
    sound.playBeep(700, 0.06);
    setArmState({
      shoulderAngle: 45,
      elbowAngle: 75,
      wristAngle: 30,
      gripperState: 'OPEN',
      gripperPinchPercent: 20,
      currentTask: 'Reset to calibrated park pose',
      carriedItem: null,
      torqueLoadPercent: 10,
    });
  };

  // Diagnostic Test Runner
  const runSingleTest = (testId: string) => {
    sound.playBeep(1200, 0.08);
    setDiagnosticTests((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: 'RUNNING', lastRunLogs: ['Initializing subsystem diagnostic loop...', 'Probing hardware bus...'] } : t))
    );

    setTimeout(() => {
      sound.playSuccess();
      setDiagnosticTests((prev) =>
        prev.map((t) => {
          if (t.id !== testId) return t;
          return {
            ...t,
            status: 'PASS',
            lastRunLogs: [
              'Hardware handshake verified [CRC32 OK]',
              'Step response latency: 14.2ms [THRESHOLD < 25ms]',
              'Dual telemetry channels aligned without packet loss.',
              'RESULT: PASS (100% Nominal)',
            ],
          };
        })
      );
    }, 1200);
  };

  const runAllTests = () => {
    sound.playAlert();
    setDiagnosticTests((prev) =>
      prev.map((t) => ({ ...t, status: 'RUNNING', lastRunLogs: ['Batch verification queued...'] }))
    );

    diagnosticTests.forEach((t, idx) => {
      setTimeout(() => {
        runSingleTest(t.id);
      }, (idx + 1) * 350);
    });
  };

  // Satellite Anomaly Creation
  const createEmergencyFromSatellite = (locationName: string, lat: number, lng: number) => {
    sound.playAlert();
    const newId = `EM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmergency: Emergency = {
      id: newId,
      code: `#${newId.replace('EM-', '')}`,
      title: 'Satellite Thermal & Optical Anomaly',
      description: `Surface anomaly flagged by Earth Observation constellation near ${locationName}. Abrupt vehicle temperature spike and smoke plume.`,
      locationName: `${locationName} (Simulated)`,
      city: 'Medellín Metropolitan Valley',
      lat,
      lng,
      severity: 'HIGH',
      potentialVictimsCount: 2,
      weather: 'Light Evening Mist',
      visibility: 'Moderate',
      windSpeedKmh: 14,
      temperatureC: 22,
      nearestDroneId: 'DR-07',
      status: 'DETECTED',
      timestamp: 'Just detected',
      estimatedResponseMin: 2.2,
      aiReasoning: 'Satellite multi-band thermal imagery showed instantaneous 140°C localized delta T consistent with a vehicular engine rupture. Rapid deployment of DR-07 recommended.',
      suggestedEquipment: ['Thermal Imaging Pod', 'First-Response AED Pod', 'Bio-Telemetry Radar'],
      suggestedLandingZone: 'Adjacent roadway median shoulder',
      nearbyHospital: 'Hospital Pablo Tobón Uribe (5.1 km)',
      timeline: [
        { time: 'Just now', phase: 'SATELLITE DETECTION', message: 'Orbital multispectral sensor flagged heat & smoke signature.', type: 'alert' },
        { time: 'Just now', phase: 'INCIDENT LOGGED', message: 'Assigned to active queue. DR-07 auto-staged.', type: 'info' },
      ],
      victims: [
        {
          id: `VIC-${Date.now()}-1`,
          label: 'Vehicle Occupant Alpha',
          location: 'Front seating row',
          lifeSigns: 'DETECTED',
          heartRateBpm: 92,
          respirationRpm: 18,
          bodyTempC: 36.2,
          status: 'TRAPPED',
          distanceMeters: 5.4,
          assisted: false,
          medicalPackageDelivered: false,
        },
      ],
    };

    setEmergencies((prev) => [newEmergency, ...prev]);
    setSelectedEmergencyId(newId);
    return newId;
  };

  // Reset Entire Simulation
  const resetEntireSimulation = () => {
    sound.playBeep(440, 0.2);
    setDrones(INITIAL_DRONES);
    setSelectedDroneId('DR-07');
    setEmergencies(INITIAL_EMERGENCIES);
    setSelectedEmergencyId('EM-0042');
    setHospitals(INITIAL_HOSPITALS);
    setAmbulances(INITIAL_AMBULANCES);
    setChargingStations(INITIAL_CHARGERS);
    setDiagnosticTests(INITIAL_TESTS);
    resetSimulator();
    resetArm();
    setIsDemoRunning(false);
    setDemoProgressPercent(0);
  };

  // Automated 15-Step Presentation Demo Sequence Choreography
  const DEMO_STEPS: DemoStep[] = [
    {
      id: 1,
      timeSec: 0,
      title: 'Stage 1: Satellite Scans Mountain Highway',
      tab: 'satellite',
      description: 'Orbital multispectral satellite initiates wide-area scan over the Medellín mountain highway.',
    },
    {
      id: 2,
      timeSec: 8,
      title: 'Stage 2: Possible Accident Detected',
      tab: 'satellite',
      description: 'Thermal bloom (+142°C) and sudden velocity drop detected in Sector A-17.',
    },
    {
      id: 3,
      timeSec: 16,
      title: 'Stage 3: AI Zooms into Accident',
      tab: 'satellite',
      description: 'Computer vision identifies 2 vehicles involved with smoke plume and traffic blockage.',
    },
    {
      id: 4,
      timeSec: 24,
      title: 'Stage 4: Emergency Incident Created',
      tab: 'emergencies',
      description: 'Incident #EM-0042 registered in triage system with 94% AI classification confidence.',
    },
    {
      id: 5,
      timeSec: 32,
      title: 'Stage 5: Nearest Drone Selected',
      tab: 'mission-planner',
      description: 'DR-07 (Apex HexaCopter Mk-IV) selected based on battery (92%) and proximity.',
    },
    {
      id: 6,
      timeSec: 40,
      title: 'Stage 6: Drone Takes Off',
      tab: 'drone-simulator',
      description: 'DR-07 launches from Base Alpha. Motors spool up and climb to 42m cruise altitude.',
    },
    {
      id: 7,
      timeSec: 48,
      title: 'Stage 7: Drone Follows 3D Route',
      tab: 'drone-simulator',
      description: 'Autonomous autopilot tracks 3D GPS corridor along the Aburrá mountain pass.',
    },
    {
      id: 8,
      timeSec: 56,
      title: 'Stage 8: Obstacle Detected',
      tab: 'drone-simulator',
      description: '360° LiDAR detects high-voltage overhead power cables 15 meters ahead.',
    },
    {
      id: 9,
      timeSec: 64,
      title: 'Stage 9: AI Recalculates Route',
      tab: 'drone-simulator',
      description: 'Dynamic vector recalculation avoids cables by ascending +8m safely.',
    },
    {
      id: 10,
      timeSec: 72,
      title: 'Stage 10: Drone Reaches Accident',
      tab: 'drone-simulator',
      description: 'Drone arrives above crash site #42, engages hover mode, and prepares sensor suite.',
    },
    {
      id: 11,
      timeSec: 80,
      title: 'Stage 11: LiDAR Scans Scene',
      tab: 'victim-detection',
      description: '3D point cloud reconstruction maps wreckage, terrain slope, and safe landing zones.',
    },
    {
      id: 12,
      timeSec: 88,
      title: 'Stage 12: Victims Detected',
      tab: 'victim-detection',
      description: 'Through-debris UWB radar localizes 3 casualties and reads vital signs (HR: 132 BPM).',
    },
    {
      id: 13,
      timeSec: 96,
      title: 'Stage 13: AI Analyzes Situation',
      tab: 'digital-twin',
      description: 'Telemetry and digital twin confirm power reserves nominal; trauma kit drop authorized.',
    },
    {
      id: 14,
      timeSec: 104,
      title: 'Stage 14: Emergency Network Notified',
      tab: 'emergency-network',
      description: 'Hospital General de Medellín and incoming ground ambulance receive real-time vitals packet.',
    },
    {
      id: 15,
      timeSec: 112,
      title: 'Stage 15: Mission Completed',
      tab: 'command-center',
      description: 'Trauma pod delivered. Ground crew guided to target. Life stabilization achieved!',
    },
  ];

  const startDemo = () => {
    sound.playAlert();
    setIsDemoRunning(true);
    setCurrentDemoStep(0);
    setDemoProgressPercent(0);
    demoStepIndexRef.current = 0;

    // Reset to start of demo
    setActiveTabState(DEMO_STEPS[0].tab);

    const stepInterval = 8000; // 8 seconds per stage for fluid pace

    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

    demoIntervalRef.current = window.setInterval(() => {
      demoStepIndexRef.current += 1;
      const nextIdx = demoStepIndexRef.current;

      if (nextIdx < DEMO_STEPS.length) {
        setCurrentDemoStep(nextIdx);
        const nextStep = DEMO_STEPS[nextIdx];
        setActiveTabState(nextStep.tab);
        setDemoProgressPercent(Math.round((nextIdx / DEMO_STEPS.length) * 100));

        // Perform in-step action
        if (nextStep.tab === 'emergencies') {
          sound.playAlert();
          updateEmergencyStatus('EM-0042', 'ANALYZING');
        } else if (nextStep.tab === 'mission-planner') {
          deployDroneToEmergency('DR-07', 'EM-0042');
        } else if (nextStep.tab === 'drone-simulator') {
          sound.playRadarPing();
          setSimulatorState((prev) => ({ ...prev, autopilot: true, speed: 78, distanceToTargetMeters: 180 }));
        } else if (nextStep.tab === 'victim-detection') {
          sound.playSuccess();
          updateEmergencyStatus('EM-0042', 'SEARCHING');
        } else if (nextStep.tab === 'robotic-arm') {
          executeArmTask('Deliver Smart Hemostatic Bandage to Victim Alpha');
        } else if (nextStep.tab === 'command-center') {
          notifyEmergencyServices('EM-0042');
          updateEmergencyStatus('EM-0042', 'COMPLETED');
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      } else {
        // Complete
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
        setIsDemoRunning(false);
        setDemoProgressPercent(100);
        sound.playSuccess();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
        });
      }
    }, stepInterval);
  };

  const stopDemo = () => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    setIsDemoRunning(false);
  };

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  // Main Background Simulation Tick Loop (Every 1s)
  useEffect(() => {
    const tickInterval = window.setInterval(() => {
      // 1. Telemetry and battery adjustments for active drone
      setDrones((prevDrones) =>
        prevDrones.map((d) => {
          if (d.status === 'MISSION') {
            const nextBat = Math.max(10, +(d.batteryPercent - 0.05 * simSpeed).toFixed(2));
            const nextAlt = Math.max(30, +(d.altitudeMeters + (Math.random() * 2 - 1)).toFixed(1));
            const nextSpd = Math.max(40, Math.min(95, +(d.speedKmh + (Math.random() * 4 - 2)).toFixed(1)));
            return {
              ...d,
              batteryPercent: nextBat,
              altitudeMeters: nextAlt,
              speedKmh: nextSpd,
              flightTimeMinutes: +(d.flightTimeMinutes + 0.016 * simSpeed).toFixed(1),
            };
          }
          if (d.status === 'CHARGING') {
            const nextBat = Math.min(100, +(d.batteryPercent + 0.2 * simSpeed).toFixed(1));
            return { ...d, batteryPercent: nextBat };
          }
          return d;
        })
      );

      // 2. Simulator distance countdown if autopilot is on
      setSimulatorState((prev) => {
        if (!prev.autopilot || prev.distanceToTargetMeters <= 0) return prev;
        const speedFactor = 15 * simSpeed;
        const newDist = Math.max(0, prev.distanceToTargetMeters - speedFactor);
        const reached = newDist === 0;

        if (reached && prev.distanceToTargetMeters > 0) {
          sound.playSuccess();
          updateEmergencyStatus('EM-0042', 'ARRIVED');
        }

        return {
          ...prev,
          speed: reached ? 0 : 75,
          distanceToTargetMeters: newDist,
          x: prev.x + (prev.targetX - prev.x) * 0.05,
          y: prev.y + (prev.targetY - prev.y) * 0.05,
        };
      });

      // 3. Ambulance ETA countdown
      setAmbulances((prev) =>
        prev.map((a) => {
          if (a.status === 'EN_ROUTE' || a.status === 'DISPATCHED') {
            const nextEta = Math.max(0.1, +(a.etaMinutes - 0.03 * simSpeed).toFixed(1));
            return { ...a, etaMinutes: nextEta };
          }
          return a;
        })
      );
    }, 1000 / simSpeed);

    return () => clearInterval(tickInterval);
  }, [simSpeed, updateEmergencyStatus]);

  return (
    <RescueContext.Provider
      value={{
        activeTab,
        setActiveTab,
        presentationMode,
        setPresentationMode,
        engineeringMode,
        setEngineeringMode,
        drones,
        selectedDroneId,
        setSelectedDroneId,
        selectedDrone,
        updateDrone,
        emergencies,
        selectedEmergencyId,
        setSelectedEmergencyId,
        selectedEmergency,
        createEmergencyFromSatellite,
        updateEmergencyStatus,
        hospitals,
        ambulances,
        chargingStations,
        simulatorState,
        setSimulatorState,
        toggleLidarMode,
        toggleRescueMode,
        toggleAutopilot,
        resetSimulator,
        setScenario,
        armState,
        setArmAngle,
        toggleGripper,
        executeArmTask,
        resetArm,
        diagnosticTests,
        runSingleTest,
        runAllTests,
        isDemoRunning,
        demoProgressPercent,
        currentDemoStep,
        startDemo,
        stopDemo,
        deployDroneToEmergency,
        deliverMedicalSuppliesToVictim,
        notifyEmergencyServices,
        soundEnabled,
        setSoundEnabled,
        soundMuted,
        toggleSoundMute,
        simSpeed,
        setSimSpeed,
        resetEntireSimulation,
        aiExplainModal,
        showAiExplanation,
        closeAiExplanation,
      }}
    >
      {children}
    </RescueContext.Provider>
  );
};

export const useRescue = () => {
  const context = useContext(RescueContext);
  if (!context) {
    throw new Error('useRescue must be used within a RescueProvider');
  }
  return context;
};
