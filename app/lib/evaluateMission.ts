import { Objective, LaunchVehicle } from '../types/mission';
import { OrbitRegime } from '../data/orbitData';
import {
  INSTRUMENTS,
  calculateBusSelectionTotals,
  getActiveLVConfig,
  getLauncherMaxPayload,
  getOrbitTargetLabel,
} from '../data/missionData';

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
    totalCost: number;
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
  mission: Objective,
  selectedOrbit: OrbitRegime | null = null
): MissionEvaluationResult {
  const { selectedBus, selectedInstruments, selectedLV } = spacecraft;

  const busTotals = calculateBusSelectionTotals(selectedBus);

  let totalMass = 250 + busTotals.mass; // Dry chassis base mass (kg) + bus
  let totalCost = 35 + busTotals.cost; // Base integration & engineering cost (€M) + bus
  const bolPower = busTotals.bolPower;
  let powerDraw = 80 + busTotals.powerDraw; // Baseline housekeeping draw (W) + bus
  const bonusDeltaV = busTotals.bonusDeltaV;
  const degradationRate = busTotals.degradationRate;
  const trlValues: number[] = [...busTotals.trlValues];

  selectedInstruments.forEach((iId) => {
    const inst = INSTRUMENTS.find((i) => i.id === iId);
    if (!inst) return;
    totalMass += inst.mass;
    totalCost += inst.cost;
    powerDraw += inst.power;
    trlValues.push(inst.trl ?? 8.0);
  });

  const activeLVConfig = getActiveLVConfig(selectedLV);
  if (selectedLV && activeLVConfig) {
    totalCost += activeLVConfig.cost;
    trlValues.push(selectedLV.trl ?? 9.0);
  }

  totalMass = Math.round(totalMass * 100) / 100;
  totalCost = Math.round(totalCost * 1000) / 1000;

  const rawCapacity = getLauncherMaxPayload(selectedLV, selectedOrbit, mission);
  const rocketCapacity = rawCapacity ?? 0;
  const orbitTargetLabel = getOrbitTargetLabel(selectedOrbit, mission);

  const missionDeltaV =
    selectedOrbit?.deltaVReq ??
    mission.requiredDeltaV ??
    (mission.orbitType === 'LEO' ? 9400 : 12800);

  const totalDeltaV = activeLVConfig
    ? activeLVConfig.deltaV + bonusDeltaV
    : bonusDeltaV;

  const lifespanYears = mission.lifespanYears ?? 5;

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
    totalCost,
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

  if (!selectedLV || !activeLVConfig) {
    binaryErrors.push(
      'LAUNCH GATE FAILED: NO LAUNCH VEHICLE ASSIGNED (HP-03 → 3.2 LAUNCH VEHICLE).'
    );
  } else if (rawCapacity === null || rawCapacity <= 0) {
    binaryErrors.push(
      `LAUNCH GATE FAILED: ${selectedLV.name.toUpperCase()} (${activeLVConfig.name.toUpperCase()}) IS NOT RATED FOR ${orbitTargetLabel} (0 KG CAPACITY).`
    );
  } else if (totalMass > rocketCapacity) {
    binaryErrors.push(
      `LAUNCH GATE FAILED: TOTAL MASS (${totalMass.toLocaleString()} KG) EXCEEDS ${selectedLV.name.toUpperCase()} [${activeLVConfig.name.toUpperCase()}] CAPACITY FOR ${orbitTargetLabel} (${rocketCapacity.toLocaleString()} KG).`
    );
  }

  if (totalCost > mission.maxBudget) {
    const overBy = Math.round((totalCost - mission.maxBudget) * 1000) / 1000;
    binaryErrors.push(
      `BUDGET GATE FAILED: TOTAL COST (€${totalCost}M) EXCEEDS ALLOCATED ${mission.name.toUpperCase()} BUDGET (€${mission.maxBudget}M) BY €${overBy}M.`
    );
  }

  if (totalDeltaV < missionDeltaV) {
    binaryErrors.push(
      `DELTA-V GATE FAILED: TOTAL DELTA-V (${totalDeltaV.toLocaleString()} M/S) < MISSION REQUIREMENT (${missionDeltaV.toLocaleString()} M/S).`
    );
  }

  if (bolPower < powerDraw) {
    binaryErrors.push(
      `POWER GATE (BOL) FAILED: GENERATED POWER (${bolPower} W) < SYSTEM DRAW (${powerDraw} W).`
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

  feedbackLog.push(
    `[OK] Booster ${selectedLV!.name} (${activeLVConfig!.name}) cleared for ${orbitTargetLabel}: ${totalMass.toLocaleString()} kg / ${rocketCapacity.toLocaleString()} kg max.`
  );

  if (busTotals.totalBatteryWh > 0) {
    feedbackLog.push(
      `[OK] Eclipse Energy Storage configured: ${busTotals.totalBatteryWh.toLocaleString()} Wh total battery capacity.`
    );
  }

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

  const activeOrbitId = selectedOrbit?.id ?? (mission.orbitType === 'LEO' ? 'LEO' : 'GSO');
  if (activeOrbitId === 'LEO' && remainingDeltaV < 50) {
    score -= 15;
    feedbackLog.push(
      `[-15 PTS] ODMSP VIOLATION: Remaining Delta-V (${remainingDeltaV} m/s) is below the 50 m/s LEO de-orbit reserve.`
    );
  } else if (activeOrbitId !== 'LEO' && remainingDeltaV < 15) {
    score -= 15;
    feedbackLog.push(
      `[-15 PTS] ODMSP VIOLATION: Remaining Delta-V (${remainingDeltaV} m/s) is below the 15 m/s graveyard orbit reserve.`
    );
  } else {
    feedbackLog.push(
      `[OK] Orbital Debris Mitigation (ODMSP) disposal reserve verified (+${remainingDeltaV} m/s).`
    );
  }

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