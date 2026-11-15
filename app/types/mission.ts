export type BusSubCategory =
  | 'batteries'
  | 'solar_panels'
  | 'comm_frequency'
  | 'comm_contact'
  | 'comm_transceiver'
  | 'propulsion'
  | 'adcs'
  | 'structure'
  | 'radiation'
  | 'thermal'
  | 'obc'
  | 'eol';

export interface Objective {
  id: string;
  name: string;
  target: string;
  description: string;
  maxBudget: number;
  minScience: number;
  requiredDeltaV?: number;
  lifespanYears?: number;
  orbitType?: 'LEO' | 'GEO' | 'DEEP_SPACE';
  requirements?: {
    maxPointingArcsec?: number;
    minDataGbitPerDay?: number;
    minStarsSimultaneous?: number;
    maxLatencyMinutes?: number;
    minLifetimeYears?: number;
  };
}

export interface BusComponent {
  id: string;
  name: string;
  category: 'power' | 'comm' | 'propulsion' | 'adcs' | 'systems';
  subCategory: BusSubCategory;
  mass: number;
  cost: number;
  powerDelta: number; // Positive = generated (W), Negative = drawn (W)
  rfTransmitWatts?: number; // Enforces 5x power draw rule (draw = 5 * rfTransmitWatts)
  batteryCapacityWh?: number;
  deltaVAdded?: number;
  degradationRate?: number;
  dataDownlink?: number;
  contactMultiplier?: number;
  frequencyBand?: 'UHF' | 'S-Band' | 'X-Band' | 'Ka-Band' | 'Optical';
  pointingAccuracyArcsec?: number;
  radiationShieldingMm?: number;
  coolingProvided?: 'ambient' | 'thermal_iso' | 'minus_40c' | 'minus_85c' | 'cryo_160k';
  groundSegmentType?: 'mid_latitude' | 'polar_station' | 'geo_relay';
  hasRedundancy?: boolean;
  trl?: number;
  riskPenaltyPercent?: number;
  riskNote?: string;
  description: string;
}

export interface Instrument {
  id: string;
  name: string;
  path?: 'star_obs' | 'telecom';
  type?: string;
  referenceMission?: string;
  mass: number;
  cost: number;
  power: number;
  dataRate: number;
  science: number;
  apertureCm?: number;
  simultaneousStars?: number;
  requiredPointingArcsec?: number;
  requiredCooling?: 'ambient' | 'thermal_iso' | 'minus_40c' | 'minus_85c' | 'cryo_160k';
  compatibleOrbits?: string[];
  isLaserLink?: boolean;
  isEstimated?: boolean;
  trl?: number;
  description: string;
}

export interface LaunchVehicleCapacities {
  leo28_5: number | null; // 400km 28.5 deg
  leo51_6: number | null; // 400km 51.6 deg
  leoPolar: number | null; // 400km Polar (90 deg)
  leoSSO: number | null; // 400km SSO (98 deg)
  gso: number | null; // 35,786km GTO/GSO
  l2: number | null; // L2 (C3 = 0)
}

export interface LaunchVehicleConfiguration {
  id: string;
  name: string;
  cost: number; // €M
  deltaV: number; // m/s
  capacities: LaunchVehicleCapacities;
}

export interface LaunchVehicle {
  id: string;
  company: string;
  name: string;
  selectedConfigId: string;
  configurations: LaunchVehicleConfiguration[];
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