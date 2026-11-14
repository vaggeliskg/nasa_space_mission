export interface Objective {
  id: string;
  name: string;
  target: string;
  desc: string;
  maxBudget: number; // Millions USD
  minScience: number;
  nominalLifeYears: number;
}

export interface ComponentSpec {
  id: string;
  name: string;
  category: 'power' | 'comm' | 'adcs';
  mass: number; // kg
  cost: number; // $M
  powerDelta: number; // Positive = generates, Negative = consumes
  dataDownlink?: number; // MB/day
  desc: string;
}

export interface Instrument {
  id: string;
  name: string;
  mass: number;
  cost: number;
  power: number;
  dataRate: number; // MB/day generated
  science: number; // Science points
  desc: string;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  maxPayloadLEO: number;
  maxPayloadDeepSpace: number;
  cost: number;
  reliability: string;
  desc: string;
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