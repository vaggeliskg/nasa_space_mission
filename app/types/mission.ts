export type MissionPathId = 'star_obs' | 'telecom';

export type CoolingGrade = 'ambient' | 'thermal_iso' | 'minus_40c' | 'minus_85c' | 'cryo_160k';

export type OrbitCompatibility = 'LEO' | 'LEO_POLAR' | 'GEO' | 'SOLAR_ORBIT' | 'L2';

export interface RiskFactor {
  id: string;
  label: string;
  probabilityPercent: number; // Chance of triggering on-orbit during /simulation
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  triggerCondition: string;
  inOrbitEventDescription: string;
}

export interface Objective {
  id: MissionPathId;
  name: string;
  target: string;
  description: string;
  maxBudget: number; // Retained for telemetry display; difficulty tiers excluded
  minScience: number;
  requiredDeltaV: number;
  lifespanYears: number;
  orbitType: 'LEO' | 'GEO' | 'DEEP_SPACE';
  // Hard Pass/Fail Requirements from Mission Spec
  requirements: {
    maxPointingArcsec?: number;     // Star Obs: < 60 arcsec
    minDataGbitPerDay: number;      // Star Obs: > 1 Gbit/day | Telecom: > 100 Gbit/day
    minStarsSimultaneous?: number;  // Star Obs: >= 10 stars
    maxLatencyMinutes?: number;     // Telecom: < 90 minutes
    minLifetimeYears: number;       // Star Obs: >= 1 yr | Telecom: > 2 yrs
  };
}

export interface BusComponent {
  id: string;
  name: string;
  category: 'power' | 'comm' | 'adcs';
  mass: number;
  cost: number;
  powerDelta: number;
  dataDownlink?: number;          // Base Gbit/day downlink capacity
  pointingAccuracyArcsec?: number; // Lower is better (e.g., 0.5 arcsec vs 90 arcsec)
  coolingProvided?: CoolingGrade;  // Thermal capability bundled with bus/avionics
  radiationShieldingMm?: number;   // e.g., 2mm thin-skin vs 10mm Al (CoRoT)
  hasRedundancy?: boolean;         // Dual-redundant DPU / RF backup
  groundSegmentType?: 'mid_latitude' | 'polar_station' | 'geo_relay';
  degradationRate?: number;
  trl?: number;
  riskPenaltyPercent?: number;     // Adds to cumulative on-orbit risk %
  riskNote?: string;
  description: string;
}

export interface Instrument {
  id: string;
  name: string;
  path: MissionPathId;
  type: string;
  referenceMission: string;
  mass: number;
  cost: number;
  power: number;
  dataRate: number;               // Gbit/day generated
  science: number;
  apertureCm?: number;
  simultaneousStars?: number;     // Star Obs: ASTERIA=1, BRITE=15, CoRoT=6000, Kepler=100000, Gaia=2B
  requiredPointingArcsec: number; // Maximum tolerable jitter
  requiredCooling: CoolingGrade;  // Detector thermal requirement
  compatibleOrbits: OrbitCompatibility[];
  isLaserLink?: boolean;          // True for TBIRD, LCRD, Tesat LCT (cloud-sensitive)
  isEstimated?: boolean;          // Flags labelled estimates from spec
  trl?: number;
  description: string;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  cost: number;
  maxPayloadLEO: number;
  maxPayloadDeepSpace: number;
  deltaV: number;
  trl?: number;
  description: string;
}

export interface TelemetryData {
  mass: number;
  maxCapacity: number;
  massMargin: number;
  cost: number;
  budgetMargin: number;
  maxBudget: number;
  powerGen: number;
  powerDraw: number;
  netPower: number;
  dataGenerated: number;
  dataDownlinkCapacity: number;
  scienceScore: number;
  minScience: number;
  isLaunchViable: boolean;
}