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
  extraUnitMass?: number; // Additional stacked unit mass (kg), if different from first unit
  cost: number; // First unit cost (€M)
  extraUnitCost?: number; // Additional stacked unit cost (€M), if different from first unit
  priceEur?: number; // Exact EUR unit price for display
  extraUnitPriceEur?: number; // Exact EUR extra pack price for display
  maxUnits?: number;
  powerDelta: number; // Positive = generated (W), Negative = drawn (W DC)
  rfTransmitWatts?: number;
  batteryCapacityWh?: number;
  deltaVAdded?: number;
  degradationRate?: number;
  dataDownlink?: number; // Default Gbit/day
  downlinkByRegime?: {
    leoHighIncl: number | null; // 400km LEO high inclination (90° Polar / 98° SSO)
    leoLowIncl: number | null; // 400km LEO low inclination (28.5° / 51.6°)
    l2: number | null; // Sun-Earth L2
    gso?: number | null; // 35,786km GSO
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
  priceEur?: number; // Exact EUR price for sub-€1M display
  power: number; // W
  dataRate: number; // Gbit/day
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
  batteryWh: number;
  dataGenerated: number;
  dataDownlinkCapacity: number;
  scienceScore: number;
  minScience: number;
  isLaunchViable: boolean;
}