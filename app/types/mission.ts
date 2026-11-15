export type BusSubCategory =
  | 'batteries'
  | 'solar_panels'
  | 'comm'
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
  path?: 'star_obs' | 'telecom' | 'both';
  fits?: string;
  category: 'power' | 'comm' | 'propulsion' | 'adcs' | 'systems';
  subCategory: BusSubCategory;
  mass: number; // First unit mass (kg)
  extraUnitMass?: number; // Additional stacked unit mass (kg)
  maxSpacecraftMassKg?: number; // Structure max allowed spacecraft mass (kg)
  sizeClass?: string; // e.g., '3U CubeSat', 'Micro', 'Large'
  cost: number; // First unit cost (€M)
  extraUnitCost?: number; // Additional stacked unit cost (€M)
  priceEur?: number; // Exact EUR unit price for display
  extraUnitPriceEur?: number; // Exact EUR extra pack price for display
  maxUnits?: number;
  powerDelta: number; // Positive = generated (W), Negative = drawn (W DC)
  rfTransmitWatts?: number;
  batteryCapacityWh?: number;
  ispSeconds?: number;
  deltaVAdded?: number;
  degradationRate?: number; // Annual panel degradation rate (e.g., 0.04 = 4%/yr)
  doseMultiplier?: number; // Radiation dose multiplier (x5, x2.5, x1, x0.7)
  thermalMassMultiplier?: number; // Thermal mass multiplier (x1, x1.05, x2, x3)
  thermalPercentOfTotal?: number; // Alternative thermal mass % (2, 3, 5, 8)
  thermalPriceMultiplier?: number; // Price multiplier relative to H1 (1, 1.5, 3, 6)
  radiationRatingKrad?: number; // OBC radiation tolerance (krad)
  storageGb?: number; // OBC onboard storage (GB)
  eolRule?: 'low_leo' | 'leo_800' | 'attitude_drag' | 'propulsive' | 'external_leo';
  dataDownlink?: number; // Default Gbit/day
  downlinkByRegime?: {
    leoHighIncl: number | null;
    leoLowIncl: number | null;
    l2: number | null;
    gso?: number | null;
  };
  linkType?: string;
  groundNetwork?: string;
  maxDataRateLabel?: string;
  contactMultiplier?: number;
  frequencyBand?: 'UHF' | 'S-Band' | 'X-Band' | 'Ka-Band' | 'Optical';
  pointingAccuracyArcsec?: number;
  pointingKnowledgeArcsec?: number;
  wheelUnloading?: string;
  compatibleOrbitIds?: ('LEO' | 'GSO' | 'L2')[];
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
  cost: number; // €M
  priceEur?: number;
  power: number; // W
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
  leo28_5: number | null;
  leo51_6: number | null;
  leoPolar: number | null;
  leoSSO: number | null;
  gso: number | null;
  l2: number | null;
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
  batteryWh: number;
  dataGenerated: number;
  dataDownlinkCapacity: number;
  scienceScore: number;
  minScience: number;
  isLaunchViable: boolean;
}