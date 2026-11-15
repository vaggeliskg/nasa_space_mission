import { Objective, LaunchVehicle } from '../types/mission';
import { BUS_COMPONENTS, INSTRUMENTS } from '../data/missionData';

export interface SpacecraftBuildInput {
  selectedBus: string[];
  selectedInstruments: string[];
  selectedLV: LaunchVehicle | null;
}

export interface MissionEvaluationResult {
  passed: boolean;
  status: 'MISSION PASSED' | 'MISSION FAILED';
  score: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'F';
  binaryErrors: string[];
  feedbackLog: string[];
  metrics: {
    totalMass: number;
    rocketCapacity: number;
    massMarginRatio: number;
    totalDeltaV: number;
    missionDeltaV: number;
    remainingDeltaV: number;
    bolPower: number;
    eolPower: number;
    powerDraw: number;
    avgTrl: number;
  };
}

export function evaluateMission(
  spacecraft: SpacecraftBuildInput,
  mission: Objective
): MissionEvaluationResult {
  const { selectedBus, selectedInstruments, selectedLV } = spacecraft;

  // 1. Aggregate spacecraft mass, power, Delta-V, and TRL stats
  let totalMass = 250; // Dry chassis base mass (kg)
  let totalCost = 0;
  let bolPower = 0;
  let powerDraw = 80; // Baseline housekeeping draw (W)
  let degradationRate = 0.025; // Default 2.5% annual solar degradation
  const trlValues: number[] = [];

selectedBus.forEach((bId) => {
    const comp = BUS_COMPONENTS.find((c) => c.id === bId) as
      | (typeof BUS_COMPONENTS[number] & { trl?: number; degradationRate?: number })
      | undefined;
    if (comp) {
      totalMass += comp.mass;
      totalCost += comp.cost;
      if (comp.powerDelta > 0) {
        bolPower += comp.powerDelta;
        if (typeof comp.degradationRate === 'number') {
          degradationRate = comp.degradationRate;
        }
      } else {
        powerDraw += Math.abs(comp.powerDelta);
      }
      trlValues.push(comp.trl ?? 8.5);
    }
  });

  selectedInstruments.forEach((iId) => {
      const inst = INSTRUMENTS.find((i) => i.id === iId) as
        | (typeof INSTRUMENTS[number] & { trl?: number })
        | undefined;
      if (inst) {
        totalMass += inst.mass;
        totalCost += inst.cost;
        powerDraw += inst.power;
        trlValues.push(inst.trl ?? 8.0);
      }
    });
    

  const missionExt = mission as Objective & {
      requiredDeltaV?: number;
      lifespanYears?: number;
      orbitType?: 'LEO' | 'GEO' | 'DEEP_SPACE';
    };

    const lvExt = selectedLV as
      | (LaunchVehicle & {
          deltaV?: number;
          trl?: number;
        })
      | null;

    if (lvExt) {
      totalCost += lvExt.cost;
      trlValues.push(lvExt.trl ?? 9.0);
    }

const orbitType = missionExt.orbitType ?? 'LEO';

  const rocketCapacity = lvExt
    ? orbitType === 'LEO'
      ? lvExt.maxPayloadLEO
      : lvExt.maxPayloadDeepSpace
    : 0;

  // Default Delta-V budgets (m/s) if not explicitly defined on mission/LV objects yet
  const missionDeltaV =
    missionExt.requiredDeltaV ?? (orbitType === 'LEO' ? 9400 : 12800);
  const totalDeltaV = lvExt
    ? lvExt.deltaV ?? (orbitType === 'LEO' ? 9600 : 13100)
    : 0;

  const lifespanYears = missionExt.lifespanYears ?? 5;

  const avgTrl =
    trlValues.length > 0
      ? trlValues.reduce((sum, v) => sum + v, 0) / trlValues.length
      : 9.0;

  const massMarginRatio =
    rocketCapacity > 0 ? (rocketCapacity - totalMass) / rocketCapacity : -1;
  const remainingDeltaV = totalDeltaV - missionDeltaV;
  const eolPower = bolPower * Math.pow(1 - degradationRate, lifespanYears);

  const baseMetrics = {
    totalMass,
    rocketCapacity,
    massMarginRatio,
    totalDeltaV,
    missionDeltaV,
    remainingDeltaV,
    bolPower,
    eolPower,
    powerDraw,
    avgTrl,
  };

  // =========================================================================
  // STEP 1: BINARY GATES
  // =========================================================================
  const binaryErrors: string[] = [];

  if (!lvExt) {
    binaryErrors.push('LAUNCH GATE FAILED: NO LAUNCH VEHICLE ASSIGNED TO HP-05.');
  } else if (totalMass > rocketCapacity) {
    binaryErrors.push(
      `LAUNCH GATE FAILED: TOTAL MASS (${totalMass} KG) EXCEEDS BOOSTER CAPACITY (${rocketCapacity} KG).`
    );
  }

  if (totalDeltaV < missionDeltaV) {
    binaryErrors.push(
      `DELTA-V GATE FAILED: TOTAL DELTA-V (${totalDeltaV} M/S) < MISSION REQUIREMENT (${missionDeltaV} M/S).`
    );
  }

  if (bolPower < powerDraw) {
    binaryErrors.push(
      `POWER GATE (BOL) FAILED: GENERATED POWER (${bolPower} W) < SYSTEM DRAW (${powerDraw} W).`
    );
  }
  
  if (totalCost > mission.maxBudget) {
    const overBy = totalCost - mission.maxBudget;
    binaryErrors.push(
      `BUDGET GATE FAILED: TOTAL COST (€${totalCost}M) EXCEEDS ALLOCATED ${mission.name.toUpperCase()} BUDGET (€${mission.maxBudget}M) BY €${overBy}M.`
    );
  }

  if (binaryErrors.length > 0) {
    return {
      passed: false,
      status: 'MISSION FAILED',
      score: 0,
      rank: 'F',
      binaryErrors,
      feedbackLog: binaryErrors,
      metrics: baseMetrics,
    };
  }

  // =========================================================================
  // STEP 2: NASA EFFICIENCY SCORING (START AT 100 POINTS)
  // =========================================================================
  let score = 100;
  const feedbackLog: string[] = [];

  // Rule 1 - Mass Growth Allowance (MGA)
  if (massMarginRatio < 0.2) {
    score -= 15;
    feedbackLog.push(
      `[-15 PTS] WARNING: Mass Growth Allowance (${(massMarginRatio * 100).toFixed(
        1
      )}%) is under the 20.0% NASA safety margin.`
    );
  } else {
    feedbackLog.push(
      `[OK] Mass Growth Allowance nominal at ${(massMarginRatio * 100).toFixed(1)}% (>= 20%).`
    );
  }

  // Rule 2 - TRL Risk Assessment
  if (avgTrl < 7.5) {
    const criticalAnomaly = Math.random() < 0.2;
    if (criticalAnomaly) {
      const anomalyMsg = `CRITICAL ANOMALY: Low average TRL (${avgTrl.toFixed(
        2
      )} < 7.5) triggered an experimental subsystem failure during flight readiness simulation.`;
      return {
        passed: false,
        status: 'MISSION FAILED',
        score: 0,
        rank: 'F',
        binaryErrors: [anomalyMsg],
        feedbackLog: [...feedbackLog, anomalyMsg],
        metrics: baseMetrics,
      };
    } else {
      score += 10;
      feedbackLog.push(
        `[+10 PTS] INNOVATION BONUS: Experimental architecture (Avg TRL ${avgTrl.toFixed(
          2
        )}) passed stress qualification.`
      );
    }
  } else {
    feedbackLog.push(
      `[OK] Flight-proven hardware reliability verified (Avg TRL ${avgTrl.toFixed(2)}).`
    );
  }

  // Rule 3 - End-of-Life (EOL) Power
  if (eolPower < powerDraw) {
    score -= 20;
    feedbackLog.push(
      `[-20 PTS] WARNING: EOL Power after ${lifespanYears} yrs (${Math.round(
        eolPower
      )} W) drops below system draw (${powerDraw} W) — late-mission brownout risk.`
    );
  } else {
    feedbackLog.push(
      `[OK] End-of-Life power margin positive (${Math.round(eolPower)} W >= ${powerDraw} W).`
    );
  }

  // Rule 4 - ODMSP (Space Debris Mitigation)
  if (orbitType === 'LEO' && remainingDeltaV < 50) {
    score -= 15;
    feedbackLog.push(
      `[-15 PTS] ODMSP VIOLATION: Remaining Delta-V (${remainingDeltaV} m/s) is below the 50 m/s LEO de-orbit reserve.`
    );
  } else if (orbitType === 'GEO' && remainingDeltaV < 15) {
    score -= 15;
    feedbackLog.push(
      `[-15 PTS] ODMSP VIOLATION: Remaining Delta-V (${remainingDeltaV} m/s) is below the 15 m/s GEO graveyard orbit reserve.`
    );
  } else {
    feedbackLog.push(
      `[OK] Orbital Debris Mitigation (ODMSP) disposal reserve verified (+${remainingDeltaV} m/s).`
    );
  }

  // =========================================================================
  // STEP 3: RANK CALCULATION
  // =========================================================================
  const finalScore = Math.max(0, score);
  let rank: 'S' | 'A' | 'B' | 'C' = 'C';
  if (finalScore > 90) rank = 'S';
  else if (finalScore >= 75) rank = 'A';
  else if (finalScore >= 50) rank = 'B';

  return {
    passed: true,
    status: 'MISSION PASSED',
    score: finalScore,
    rank,
    binaryErrors: [],
    feedbackLog,
    metrics: baseMetrics,
  };
}