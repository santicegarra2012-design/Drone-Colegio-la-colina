export type DroneStatus = 'AVAILABLE' | 'MISSION' | 'CHARGING' | 'MAINTENANCE';

export type EmergencySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EmergencyStatus = 
  | 'DETECTED' 
  | 'ANALYZING' 
  | 'DRONE_DEPLOYED' 
  | 'EN_ROUTE' 
  | 'ARRIVED' 
  | 'SEARCHING' 
  | 'ASSISTING' 
  | 'GROUND_RESPONSE_ARRIVING' 
  | 'COMPLETED';

export interface Victim {
  id: string;
  label: string;
  location: string;
  lifeSigns: 'DETECTED' | 'FAINT' | 'UNCERTAIN';
  heartRateBpm: number;
  respirationRpm: number;
  bodyTempC: number;
  status: 'TRAPPED' | 'INJURED' | 'STABLE' | 'CRITICAL';
  distanceMeters: number;
  assisted: boolean;
  medicalPackageDelivered: boolean;
}

export interface Drone {
  id: string;
  callsign: string;
  model: string;
  status: DroneStatus;
  batteryPercent: number;
  lat: number;
  lng: number;
  altitudeMeters: number;
  speedKmh: number;
  headingDeg: number;
  temperatureC: number;
  motorHealthPercent: number;
  cameraStatus: 'OK' | 'CALIBRATING' | 'OFFLINE';
  lidarStatus: 'OK' | 'CALIBRATING' | 'OFFLINE';
  gpsStatus: 'RTK_FIX' | 'GPS_3D' | 'DEGRADED';
  commStatus: 'EXCELLENT' | 'GOOD' | 'MARGINAL' | 'OFFLINE';
  aiStatus: 'ONLINE' | 'STANDBY' | 'ENGAGED';
  payload: string;
  flightTimeMinutes: number;
  flightHours?: number;
  currentMissionId?: string;
  maxSpeedKmh: number;
  maxRangeKm: number;
}

export interface TimelineEvent {
  time: string;
  phase: string;
  message: string;
  type?: 'info' | 'alert' | 'success' | 'action';
}

export interface Emergency {
  id: string;
  code: string;
  title: string;
  description: string;
  locationName: string;
  city: string;
  lat: number;
  lng: number;
  severity: EmergencySeverity;
  potentialVictimsCount: number;
  weather: string;
  visibility: 'Good' | 'Moderate' | 'Poor' | 'Zero';
  windSpeedKmh: number;
  temperatureC: number;
  nearestDroneId: string;
  assignedDroneId?: string;
  status: EmergencyStatus;
  timestamp: string;
  estimatedResponseMin: number;
  aiReasoning: string;
  suggestedEquipment: string[];
  suggestedLandingZone: string;
  nearbyHospital: string;
  timeline: TimelineEvent[];
  victims: Victim[];
}

export interface Hospital {
  id: string;
  name: string;
  distanceKm: number;
  emergencyCapacity: 'OPTIMAL' | 'NEAR_CAPACITY' | 'CRITICAL';
  availableBeds: number;
  totalBeds?: number;
  specialties: string[];
  lat: number;
  lng: number;
  phone: string;
  incomingPatients: number;
  traumaLevel?: string;
  helipadAvailable?: boolean;
}

export interface Ambulance {
  id: string;
  callsign: string;
  unitType: 'Advanced Life Support' | 'Basic Life Support' | 'Rescue Truck';
  type?: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'STATION';
  etaMinutes: number;
  lat: number;
  lng: number;
  assignedEmergencyId?: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  availablePads: number;
  totalPads: number;
  solarGenerationKw: number;
}

export interface RoboticArmState {
  shoulderAngle: number;
  elbowAngle: number;
  wristAngle: number;
  gripperState: 'OPEN' | 'CLOSED' | 'GRABBING';
  gripperPinchPercent: number;
  currentTask: string;
  carriedItem: string | null;
  torqueLoadPercent: number;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  subsystem: 'NAVIGATION' | 'SENSORS' | 'SAFETY' | 'PAYLOAD' | 'COMMUNICATION';
  status: 'IDLE' | 'RUNNING' | 'PASS' | 'FAIL';
  durationMs: number;
  description: string;
  lastRunLogs: string[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'STANDARD' | 'ADVERSE_WEATHER' | 'HAZARDOUS';
  emergencyId: string;
  recommendedDroneId: string;
  environment: {
    weather: string;
    wind: number;
    rainMm: number;
    obstaclesCount: number;
    lightLevel: 'Day' | 'Dusk' | 'Night';
  };
}

export type ActiveTab = 
  | 'la-colina-twin'
  | 'simulation-studio'
  | 'command-center'
  | 'emergencies'
  | 'drone-fleet'
  | 'drone-simulator'
  | 'drone-explorer'
  | 'robotic-arm'
  | 'victim-detection'
  | 'ai-assistant'
  | 'mission-planner'
  | 'satellite'
  | 'satellite-detection'
  | 'testing-lab'
  | 'analytics'
  | 'communications'
  | 'emergency-network'
  | 'digital-twin'
  | 'settings'
  | 'about-project';
