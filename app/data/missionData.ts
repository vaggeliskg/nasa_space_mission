import {
  Objective,
  BusComponent,
  Instrument,
  LaunchVehicle,
  LaunchVehicleConfiguration,
} from '../types/mission';
import { OrbitRegime } from './orbitData';

export const OBJECTIVES: Objective[] = [
  {
    id: 'star_obs',
    name: 'Star Observation & Exoplanet Survey',
    target: 'Bright Target Star Fields',
    description:
      'Detect exoplanet transits and measure stellar brightness/positions. Requires < 60 arcsec pointing stability, > 1 Gbit/day downlink, ≥ 1 year lifetime, and observing ≥ 10 stars simultaneously.',
    maxBudget: 700,
    minScience: 60,
    requiredDeltaV: 9400,
    lifespanYears: 2,
    orbitType: 'LEO',
    requirements: {
      maxPointingArcsec: 60,
      minDataGbitPerDay: 1,
      minStarsSimultaneous: 10,
      minLifetimeYears: 1,
    },
  },
  {
    id: 'telecom',
    name: 'High-Throughput Space Telecommunications',
    target: 'Orbital Relay & Earth User Network',
    description:
      'Deliver high-volume customer data from space to Earth via direct-to-Earth laser, GEO relay, or multi-beam service. Requires > 100 Gbit/day throughput, < 90 min delivery delay, and > 2 years lifetime.',
    maxBudget: 500,
    minScience: 60,
    requiredDeltaV: 11800,
    lifespanYears: 5,
    orbitType: 'GEO',
    requirements: {
      minDataGbitPerDay: 100,
      maxLatencyMinutes: 90,
      minLifetimeYears: 2,
    },
  },
];

export const BUS_COMPONENTS: BusComponent[] = [
  // =========================================================================
  // HP-01: POWER — 1.1 BATTERIES (B1–B4, STACKABLE WITH + AND -)
  // =========================================================================
  {
    id: 'bat_isispace_45wh',
    name: 'B1. ISISPACE battery pack',
    fits: 'CubeSats 3U to 12U (up to 3 packs per board)',
    category: 'power',
    subCategory: 'batteries',
    mass: 0.25,
    cost: 0.00275, // €2,750
    priceEur: 2750,
    powerDelta: 0,
    batteryCapacityWh: 45,
    trl: 9.0,
    description:
      '45 Wh/unit (~179 Wh/kg). Fits CubeSats 3U to 12U (up to 3 packs per board). Stackable with + / -.',
  },
  {
    id: 'bat_dragonfly_28_300',
    name: 'B2. Dragonfly 28-300 Battery Module',
    fits: 'micro, ~50 kg class',
    category: 'power',
    subCategory: 'batteries',
    mass: 4.73,
    cost: 0.0134, // €13,400
    priceEur: 13400,
    powerDelta: 0,
    batteryCapacityWh: 270,
    trl: 9.0,
    description:
      '270 Wh/unit (up to 297 Wh, ~57–62 Wh/kg). Fits microsatellites (~50 kg class). Stackable with + / -.',
  },
  {
    id: 'bat_endurosat_eps_iv',
    name: 'B3. EnduroSat EPS IV battery pack',
    fits: 'mini to medium',
    category: 'power',
    subCategory: 'batteries',
    mass: 19.5,
    extraUnitMass: 13.0,
    cost: 0.07, // €70,000 first unit
    extraUnitCost: 0.03, // ~€30,000 each extra pack
    priceEur: 70000,
    extraUnitPriceEur: 30000,
    powerDelta: 0,
    batteryCapacityWh: 1100,
    hasRedundancy: true,
    trl: 9.0,
    description:
      '1,100 Wh/unit (~85 Wh/kg). 1st unit: 19.5 kg & €70,000 (includes power distribution); extra packs: +13 kg & ~€30,000 each.',
  },
  {
    id: 'bat_saft_ves180',
    name: 'B4. Saft VES180 cell',
    fits: 'medium to large, GEO and L2',
    category: 'power',
    subCategory: 'batteries',
    mass: 1.11,
    cost: 0.005, // €5,000 per cell
    priceEur: 5000,
    powerDelta: 0,
    batteryCapacityWh: 180,
    hasRedundancy: true,
    trl: 9.5,
    description:
      '~180 Wh/cell (≥175 Wh/kg). Built for medium-to-large GEO & L2 spacecraft. Stackable with + / -.',
  },

  // =========================================================================
  // HP-01: POWER — 1.2 SOLAR PANELS (P2–P5)
  // =========================================================================
  {
    id: 'pwr_dhv_dsa_6u_2d_l',
    name: 'P2. DHV DSA-6U-2D-L, pair',
    fits: 'CubeSats 6U to 12U',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 1.6,
    cost: 0.0155,
    priceEur: 15500,
    powerDelta: 109,
    degradationRate: 0.03,
    trl: 9.0,
    description:
      'Deployable Solar Array sized for 6U–12U CubeSats with double deployable wings (two panels fold out, ~109 W BOL).',
  },
  {
    id: 'pwr_dhv_bmsa_355w',
    name: 'P3. DHV BMSA-355W',
    fits: 'micro and mini',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 7.0,
    cost: 0.0506,
    priceEur: 50600,
    powerDelta: 355,
    degradationRate: 0.025,
    trl: 9.0,
    description:
      'Body-Mounted Solar Array fixed directly onto the satellite sides—no deployment mechanisms required (355 W BOL, micro & mini class).',
  },
  {
    id: 'pwr_redwire_rosa',
    name: 'P4. Redwire ROSA',
    fits: 'mini to large',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 10.0,
    cost: 0.15665,
    priceEur: 156650,
    powerDelta: 1100,
    degradationRate: 0.02,
    trl: 9.0,
    description:
      'Roll-Out Solar Array: flexible photovoltaic blanket that unrolls on composite booms without motors (~1,100 W BOL, mini to large).',
  },
  {
    id: 'pwr_dhv_dsa_1268w',
    name: 'P5. DHV DSA-1268W',
    fits: 'medium and large',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 27.6,
    cost: 0.1806,
    priceEur: 180600,
    powerDelta: 1268,
    degradationRate: 0.02,
    trl: 9.0,
    description:
      'Deployable Solar Array with quintuple wing architecture—five rigid panels fold out for 1,268 W BOL (medium and large satellites).',
  },

  // =========================================================================
  // HP-02: COMMUNICATIONS — STAR OBSERVATION (C1–C6) & TELECOM (T-C1 to T-C3 + C4)
  // =========================================================================
  {
    id: 'comm_c1_uhf',
    name: 'C1. UHF',
    path: 'star_obs',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Radio',
    groundNetwork: 'University station, mid-latitude',
    maxDataRateLabel: '9.6 kbit/s',
    mass: 0.075, // 75 g
    cost: 0.0085, // ~€8,500
    priceEur: 8500,
    powerDelta: -4, // under 4 W DC
    dataDownlink: 0.016,
    downlinkByRegime: {
      leoHighIncl: 0.016,
      leoLowIncl: 0.016,
      l2: null,
    },
    trl: 9.5,
    description:
      'Radio transceiver bundled with mid-latitude university station (9.6 kbit/s max). Delivers ~0.016 Gbit/day in LEO; not usable at L2.',
  },
  {
    id: 'comm_c2_sband',
    name: 'C2. S-band',
    path: 'star_obs',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Radio',
    groundNetwork: 'Commercial network with polar station',
    maxDataRateLabel: '2 Mbit/s',
    mass: 0.36, // 360 g
    cost: 0.0125, // ~€12,500
    priceEur: 12500,
    powerDelta: -12, // 12 W DC
    dataDownlink: 12,
    downlinkByRegime: {
      leoHighIncl: 12,
      leoLowIncl: 3.4,
      l2: null,
    },
    trl: 9.5,
    description:
      'Radio link with commercial polar ground network (2 Mbit/s max). Delivers ~12 Gbit/day in high-incl. LEO and ~3.4 Gbit/day in low-incl. LEO; not usable at L2.',
  },
  {
    id: 'comm_c3_xband',
    name: 'C3. X-band',
    path: 'star_obs',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Radio',
    groundNetwork: 'Commercial network with polar station',
    maxDataRateLabel: '140 Mbit/s',
    mass: 0.3, // ~300 g
    cost: 0.0287, // ~€28,700
    priceEur: 28700,
    powerDelta: -12, // 12 W DC
    dataDownlink: 136,
    downlinkByRegime: {
      leoHighIncl: 136,
      leoLowIncl: 38,
      l2: null,
    },
    trl: 9.0,
    description:
      'High-rate X-band radio with commercial polar ground network (140 Mbit/s max). Delivers ~136 Gbit/day in high-incl. LEO (~38 Gbit/day low-incl.); not usable at L2.',
  },
  {
    id: 'comm_c4_laser',
    name: 'C4. Laser',
    path: 'both',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Laser (infrared light)',
    groundNetwork: 'Optical ground station',
    maxDataRateLabel: '100 Mbit/s',
    mass: 0.38, // ~360 to 400 g
    cost: 0.089, // ~€89,000
    priceEur: 89000,
    powerDelta: -8.25, // 8 to 8.5 W DC
    dataDownlink: 168,
    downlinkByRegime: {
      leoHighIncl: 168,
      leoLowIncl: 168,
      l2: null,
      gso: 168,
    },
    trl: 8.5,
    description:
      'Infrared optical laser terminal with optical ground station (100 Mbit/s max). Delivers ~168 Gbit/day in clear-sky LEO/GSO; not usable at L2.',
  },
  {
    id: 'comm_c5_ds_xband',
    name: 'C5. Deep-space X-band',
    path: 'star_obs',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Radio',
    groundNetwork: 'Deep Space Network',
    maxDataRateLabel: '256 kbit/s',
    mass: 1.1, // 1.1 kg
    cost: 0.356, // ~€356,000
    priceEur: 356000,
    powerDelta: -35, // 35 W DC
    dataDownlink: 6.9,
    downlinkByRegime: {
      leoHighIncl: null,
      leoLowIncl: null,
      l2: 6.9,
    },
    trl: 9.0,
    description:
      'Deep-space X-band transponder bundled with Deep Space Network tracking (256 kbit/s max). Delivers ~6.9 Gbit/day from L2; not usable in LEO.',
  },
  {
    id: 'comm_c6_ds_xkaband',
    name: 'C6. Large deep-space X/Ka-band',
    path: 'star_obs',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Radio',
    groundNetwork: 'Deep Space Network',
    maxDataRateLabel: 'Up to 300 Msymbols/s',
    mass: 3.0, // 3.0 kg
    cost: 0.89, // ~€890,000
    priceEur: 890000,
    powerDelta: -30, // 30 W DC
    dataDownlink: 130,
    downlinkByRegime: {
      leoHighIncl: null,
      leoLowIncl: null,
      l2: 130,
    },
    trl: 9.0,
    description:
      'High-rate X/Ka-band deep-space radio bundled with Deep Space Network (up to 300 Msymbols/s). Delivers ~130 Gbit/day from L2; not usable in LEO.',
  },
  {
    id: 'comm_tc1_uhf',
    name: 'T-C1. UHF',
    path: 'telecom',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Radio (TT&C)',
    groundNetwork: 'University station, mid-latitude',
    mass: 0.075, // 75 g
    cost: 0.0085, // ~€8,500
    priceEur: 8500,
    powerDelta: -4, // under 4 W
    dataDownlink: 0.016,
    trl: 9.5,
    description:
      'Compact UHF telemetry & command transceiver (75 g, < 4 W DC). Same hardware baseline as C1.',
  },
  {
    id: 'comm_tc2_sband',
    name: 'T-C2. S-band',
    path: 'telecom',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Radio (TT&C)',
    groundNetwork: 'Commercial network with polar station',
    mass: 0.36, // 360 g
    cost: 0.0125, // ~€12,500
    priceEur: 12500,
    powerDelta: -12, // 12 W
    dataDownlink: 12,
    trl: 9.5,
    description:
      'S-band telemetry & command transceiver (360 g, 12 W DC). Same hardware baseline as C2.',
  },
  {
    id: 'comm_tc3_sband_backup',
    name: 'T-C3. S-band + backup',
    path: 'telecom',
    category: 'comm',
    subCategory: 'comm',
    linkType: 'Redundant Radio (TT&C)',
    groundNetwork: 'Commercial network with polar station',
    mass: 0.72, // 720 g (2 x C2)
    cost: 0.0249, // ~€24,900
    priceEur: 24900,
    powerDelta: -12, // 12 W (one transmits at a time)
    dataDownlink: 12,
    hasRedundancy: true,
    trl: 9.5,
    description:
      'Dual redundant S-band transceivers (2× C2, one transmits at a time — 720 g total, 12 W DC active draw).',
  },

  // =========================================================================
  // HP-03: PROPULSION — 3.1 PROPULSION SYSTEM (4 CARDS)
  // =========================================================================
  {
    id: 'prop_cold_gas',
    name: 'Cold-Gas Micro-Thruster Pod (+120 m/s Δv)',
    category: 'propulsion',
    subCategory: 'propulsion',
    mass: 4,
    cost: 8,
    powerDelta: -8,
    deltaVAdded: 120,
    trl: 9.5,
    description: 'Non-toxic nitrogen thruster pod for LEO drag makeup and momentum dumping.',
  },
  {
    id: 'prop_green_monoprop',
    name: 'AF-M315E Green Monopropellant (+450 m/s Δv)',
    category: 'propulsion',
    subCategory: 'propulsion',
    mass: 24,
    cost: 24,
    powerDelta: -22,
    deltaVAdded: 450,
    trl: 8.5,
    description: 'High-density green chemical propulsion for orbit raising & station-keeping.',
  },
  {
    id: 'prop_hall_ion',
    name: 'Hall-Effect Xenon Ion Thruster (+1,800 m/s Δv)',
    category: 'propulsion',
    subCategory: 'propulsion',
    mass: 38,
    cost: 52,
    powerDelta: -320,
    deltaVAdded: 1800,
    trl: 9.0,
    description: 'High-Isp electric propulsion for multi-year GEO station-keeping & L2 transfers.',
  },
  {
    id: 'prop_biprop_apogee',
    name: 'Dual-Mode Bipropellant Apogee Engine (+2,600 m/s Δv)',
    category: 'propulsion',
    subCategory: 'propulsion',
    mass: 95,
    cost: 85,
    powerDelta: -45,
    deltaVAdded: 2600,
    hasRedundancy: true,
    trl: 9.5,
    description: '400N MMH/NTO apogee kick engine + RCS thrusters for GTO-to-GEO circularization.',
  },

  // =========================================================================
  // HP-04: ADCS (ATTITUDE) — 4.1 ATTITUDE CONTROL (5 CARDS FOR BOTH MISSIONS)
  // =========================================================================
  {
    id: 'adcs_a1_simple',
    name: 'A1. Simple',
    fits: 'CubeSat',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 0.1, // ~0.05 to 0.16 kg
    cost: 0.0178, // ~€17,800
    priceEur: 17800,
    powerDelta: -2, // ~1 to 2.3 W
    pointingAccuracyArcsec: 18000, // ~5 deg (18,000 arcsec)
    pointingKnowledgeArcsec: 360, // ~0.1 deg (360 arcsec)
    wheelUnloading: 'No wheels',
    compatibleOrbitIds: ['LEO'],
    trl: 9.5,
    description:
      '3 magnetic torquers (coils pushing against Earth’s magnetic field) + sun sensors & magnetometer; no wheels. ~5° (18,000") accuracy, ~0.1° (360") knowledge. Works in LEO only.',
  },
  {
    id: 'adcs_a2a_cubesat',
    name: 'A2a. CubeSat unit',
    fits: '3U to 12U',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 1.23,
    cost: 0.089, // ~€89,000
    priceEur: 89000,
    powerDelta: -4, // ~4 W
    pointingAccuracyArcsec: 11, // 0.003 deg (~11 arcsec)
    pointingKnowledgeArcsec: 6, // ~6 arcsec
    wheelUnloading: 'Magnetic torquers',
    compatibleOrbitIds: ['LEO'],
    trl: 9.0,
    description:
      'Integrated 3U–12U unit: 3 reaction wheels + 3 magnetic torquers + 1 star tracker. 0.003° (~11") accuracy, ~6" knowledge. Works in LEO only.',
  },
  {
    id: 'adcs_a2b_smallsat',
    name: 'A2b. Smallsat unit',
    fits: 'micro to mini',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 7, // ~7 kg
    cost: 0.267, // ~€267,000
    priceEur: 267000,
    powerDelta: -15, // ~15 W (up to ~170 W while turning)
    pointingAccuracyArcsec: 7, // 0.002 deg (~7 arcsec)
    pointingKnowledgeArcsec: 6, // ~6 arcsec
    wheelUnloading: 'Magnetic torquers',
    compatibleOrbitIds: ['LEO'],
    hasRedundancy: true,
    trl: 9.0,
    description:
      'Micro-to-mini integrated unit: 3–4 reaction wheels + 3 magnetic torquers + 2 star trackers. 0.002° (~7") accuracy, ~6" knowledge (~15 W, up to ~170 W slewing). Works in LEO only.',
  },
  {
    id: 'adcs_a3_advanced',
    name: 'A3. Advanced',
    fits: 'medium to large',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 17, // ~17 kg
    cost: 0.89, // ~€890,000
    priceEur: 890000,
    powerDelta: -30, // ~30 W (up to ~440 W while turning)
    pointingAccuracyArcsec: 1, // ~1 arcsec
    pointingKnowledgeArcsec: 3, // 3 arcsec
    wheelUnloading: 'Magnetic torquers',
    compatibleOrbitIds: ['LEO'],
    hasRedundancy: true,
    trl: 9.0,
    description:
      'Medium-to-large suite: 4 large reaction wheels + 3 large magnetic torquers + 1 high-accuracy star tracker + telescope centroid loop. ~1" accuracy, 3" knowledge (~30 W, up to ~440 W slewing). Works in LEO only.',
  },
  {
    id: 'adcs_a4_wheels_thrusters',
    name: 'A4. Wheels + thrusters',
    fits: 'any (CubeSat & large versions)',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 20, // ~20 kg (CubeSat version ~1.9 kg)
    cost: 1.068, // ~€1,068,000 (CubeSat version ~€178,000)
    priceEur: 1068000,
    powerDelta: -30, // as A3 + ~20 W while firing
    pointingAccuracyArcsec: 1, // ~1 arcsec (CubeSat version ~11 arcsec)
    pointingKnowledgeArcsec: 3, // 3 arcsec (CubeSat version ~6 arcsec)
    wheelUnloading: 'Thrusters (cold-gas)',
    compatibleOrbitIds: ['LEO', 'GSO', 'L2'],
    hasRedundancy: true,
    trl: 9.0,
    description:
      'Reaction wheels + star tracker + cold-gas thrusters for wheel unloading instead of magnetic torquers. ~1" accuracy, 3" knowledge (CubeSat: 1.9 kg, ~11", €178k). Works in LEO, GEO, and L2.',
  },

  // =========================================================================
  // HP-05: BUS & SYSTEMS — 5.1 STRUCTURE (4 CARDS)
  // =========================================================================
  {
    id: 'struct_6u_alu',
    name: '6U Modular Aluminum CubeSat Frame',
    category: 'systems',
    subCategory: 'structure',
    mass: 3,
    cost: 5,
    powerDelta: 0,
    trl: 9.5,
    description: 'Lightweight 6061-T6 anodized frame supporting up to 25 kg total wet mass.',
  },
  {
    id: 'struct_espa_ring',
    name: 'ESPA-Class Honeycomb Aluminum Bus',
    category: 'systems',
    subCategory: 'structure',
    mass: 45,
    cost: 22,
    powerDelta: 0,
    trl: 9.0,
    description: 'Standard small-to-medium satellite octagonal core with high launch stiffness.',
  },
  {
    id: 'struct_cfrp_optical',
    name: 'Zero-CTE Carbon-Fiber (CFRP) Optical Bench',
    category: 'systems',
    subCategory: 'structure',
    mass: 75,
    cost: 55,
    powerDelta: 0,
    trl: 9.0,
    description: 'Thermally invariant graphite-epoxy truss preventing mirror defocus across ΔT.',
  },
  {
    id: 'struct_heavy_geo_cylinder',
    name: 'Heavy Central Thrust Cylinder (Multi-Ton GEO)',
    category: 'systems',
    subCategory: 'structure',
    mass: 190,
    cost: 80,
    powerDelta: 0,
    trl: 9.5,
    description: 'Reinforced composite/titanium central tube built for multi-ton GEO platforms.',
  },

  // =========================================================================
  // HP-05: BUS & SYSTEMS — 5.2 RADIATION SHIELDING (4 CARDS)
  // =========================================================================
  {
    id: 'rad_2mm_thinskin',
    name: '2mm Thin-Skin Chassis (0.54 g/cm²)',
    category: 'systems',
    subCategory: 'radiation',
    mass: 2,
    cost: 3,
    powerDelta: 0,
    radiationShieldingMm: 2,
    trl: 9.0,
    riskPenaltyPercent: 14,
    riskNote: 'Minimal shielding; vulnerable to Van Allen belts, GSO, and solar flare SEUs.',
    description: 'Basic LEO protection against low-energy trapped protons.',
  },
  {
    id: 'rad_6mm_graded_z',
    name: '6mm Graded-Z Aluminum-Tantalum Vault',
    category: 'systems',
    subCategory: 'radiation',
    mass: 14,
    cost: 16,
    powerDelta: 0,
    radiationShieldingMm: 6,
    trl: 9.0,
    description: 'Spot-shielded avionics enclosure suitable for polar LEO and South Atlantic Anomaly.',
  },
  {
    id: 'rad_10mm_geo_armor',
    name: '10mm High-Density GEO / L2 Armor (2.7 g/cm²)',
    category: 'systems',
    subCategory: 'radiation',
    mass: 32,
    cost: 34,
    powerDelta: 0,
    radiationShieldingMm: 10,
    trl: 9.0,
    description: 'Full 5–10 year total ionizing dose (TID) protection for GEO & L2 missions.',
  },
  {
    id: 'rad_16mm_deep_vault',
    name: '16mm Polyethylene-Tantalum Deep-Space Vault',
    category: 'systems',
    subCategory: 'radiation',
    mass: 58,
    cost: 60,
    powerDelta: 0,
    radiationShieldingMm: 16,
    trl: 8.5,
    description: 'Hydrogen-rich + high-Z shield blocking galactic cosmic rays & secondary Bremsstrahlung.',
  },

  // =========================================================================
  // HP-05: BUS & SYSTEMS — 5.3 THERMAL CONTROL (4 CARDS)
  // =========================================================================
  {
    id: 'therm_mli_passive',
    name: 'MLI Blankets + Passive Louvers (±0.01 K Iso)',
    category: 'systems',
    subCategory: 'thermal',
    mass: 2,
    cost: 4,
    powerDelta: -4,
    coolingProvided: 'thermal_iso',
    trl: 9.5,
    description: 'Multi-layer Kapton insulation & survival heaters for LEO smallsats.',
  },
  {
    id: 'therm_heatpipe_minus40',
    name: 'Ammonia Heat Pipes + Shadow Radiator (-40°C)',
    category: 'systems',
    subCategory: 'thermal',
    mass: 16,
    cost: 18,
    powerDelta: -18,
    coolingProvided: 'minus_40c',
    trl: 9.0,
    description: 'Heat-pipe loop maintaining optical/RF bays at -40°C.',
  },
  {
    id: 'therm_cryo_minus85',
    name: 'Deep-Space V-Groove Radiator (-85°C)',
    category: 'systems',
    subCategory: 'thermal',
    mass: 35,
    cost: 42,
    powerDelta: -35,
    coolingProvided: 'minus_85c',
    trl: 8.5,
    description: 'Passive radiative cooler eliminating CCD dark current at -85°C.',
  },
  {
    id: 'therm_sunshield_160k',
    name: 'Deployable Cryo-Sunshield + Pulse-Tube (160 K)',
    category: 'systems',
    subCategory: 'thermal',
    mass: 75,
    cost: 85,
    powerDelta: -95,
    coolingProvided: 'cryo_160k',
    trl: 8.5,
    description: 'Multi-layer sunshield & active cryocooler holding 160 K (±50 µK).',
  },

  // =========================================================================
  // HP-05: BUS & SYSTEMS — 5.4 ON-BOARD COMPUTER (OBC) (4 CARDS)
  // =========================================================================
  {
    id: 'obc_cots_arm',
    name: 'COTS Dual-Core ARM Flight Computer',
    category: 'systems',
    subCategory: 'obc',
    mass: 0.8,
    cost: 4,
    powerDelta: -5,
    hasRedundancy: false,
    trl: 8.5,
    riskPenaltyPercent: 12,
    riskNote: 'Single-string COTS processor susceptible to latch-ups without triple voting.',
    description: 'High-speed CubeSat OBC with software watchdog; best for short LEO missions.',
  },
  {
    id: 'obc_leon3_ft',
    name: 'Rad-Tolerant LEON3-FT SpaceWire OBC',
    category: 'systems',
    subCategory: 'obc',
    mass: 4,
    cost: 16,
    powerDelta: -12,
    hasRedundancy: true,
    trl: 9.0,
    description: 'Fault-tolerant SPARC processor with EDAC-protected memory.',
  },
  {
    id: 'obc_rad750_dual',
    name: 'Dual-Redundant RAD750 Cold-Spare Avionics',
    category: 'systems',
    subCategory: 'obc',
    mass: 11,
    cost: 38,
    powerDelta: -24,
    hasRedundancy: true,
    trl: 9.5,
    description: 'Deep-space workhorse flight computer with hardware triple-modular redundancy.',
  },
  {
    id: 'obc_vpu_onboard_ai',
    name: 'Rad-Hard DPU + 2TB On-Board Science Processor',
    category: 'systems',
    subCategory: 'obc',
    mass: 18,
    cost: 58,
    powerDelta: -42,
    hasRedundancy: true,
    trl: 8.5,
    description: 'Performs real-time star centroiding, packetization, and lossless compression on orbit.',
  },

  // =========================================================================
  // HP-05: BUS & SYSTEMS — 5.5 END OF LIFE (EOL) DISPOSAL (4 CARDS)
  // =========================================================================
  {
    id: 'eol_natural_decay',
    name: 'Unassisted Atmospheric Decay (< 420 km LEO)',
    category: 'systems',
    subCategory: 'eol',
    mass: 0,
    cost: 1,
    powerDelta: 0,
    trl: 9.5,
    riskPenaltyPercent: 6,
    riskNote: 'Only compliant below ~450 km LEO; fails ODMSP in high LEO, GEO, or L2.',
    description: 'Relies purely on residual aerodynamic drag for re-entry within 5–25 years.',
  },
  {
    id: 'eol_drag_sail',
    name: 'Deployable Kapton De-Orbit Drag Sail',
    category: 'systems',
    subCategory: 'eol',
    mass: 2.5,
    cost: 7,
    powerDelta: -2,
    deltaVAdded: 65,
    trl: 8.5,
    description: '4 m² gossamer drag sail accelerating LEO re-entry to meet 5-year disposal rules.',
  },
  {
    id: 'eol_controlled_reentry',
    name: 'Dedicated De-Orbit Burn + Passivation Kit',
    category: 'systems',
    subCategory: 'eol',
    mass: 12,
    cost: 16,
    powerDelta: -5,
    deltaVAdded: 140,
    hasRedundancy: true,
    trl: 9.0,
    description: 'Targeted ocean disposal burn + battery/propellant tank venting.',
  },
  {
    id: 'eol_graveyard_boost',
    name: 'GEO / L2 Graveyard Orbit Transfer Sequencer',
    category: 'systems',
    subCategory: 'eol',
    mass: 15,
    cost: 22,
    powerDelta: -6,
    deltaVAdded: 80,
    hasRedundancy: true,
    trl: 9.0,
    description: 'Raises GEO spacecraft +300 km above the geostationary belt & passivates bus.',
  },
];

export const INSTRUMENTS: Instrument[] = [
  // =========================================================================
  // PATH 1: STAR OBSERVATION PAYLOADS (6 CARDS)
  // =========================================================================
  {
    id: 'inst_asteria',
    name: 'Compact CMOS camera, 6 cm',
    path: 'star_obs',
    type: '6 cm Precision Photometric CMOS Camera',
    referenceMission: 'ASTERIA',
    mass: 4,
    cost: 0.45, // ~€0.45M
    priceEur: 450000,
    power: 5,
    dataRate: 1.2,
    science: 45,
    apertureCm: 6.0,
    simultaneousStars: 1,
    requiredPointingArcsec: 5,
    requiredCooling: 'thermal_iso',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isEstimated: true,
    trl: 8.5,
    description:
      'Compact 6 cm CMOS camera (~4 kg, ~5 W). High-precision photometry on 1 target star at a time.',
  },
  {
    id: 'inst_brite',
    name: 'Wide-field nano-telescope, 3 cm',
    path: 'star_obs',
    type: '3 cm Wide-FOV Optical Photometer',
    referenceMission: 'BRITE',
    mass: 2.5,
    cost: 0.27, // ~€0.27M
    priceEur: 270000,
    power: 2,
    dataRate: 1.4,
    science: 65,
    apertureCm: 3.0,
    simultaneousStars: 15,
    requiredPointingArcsec: 60,
    requiredCooling: 'thermal_iso',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isEstimated: true,
    trl: 9.0,
    description:
      'Ultra-light 3 cm wide-field nano-telescope (~2.5 kg, ~2 W) monitoring up to 15 bright stars simultaneously.',
  },
  {
    id: 'inst_cheops_trap',
    name: 'Precision single-star telescope, 32 cm',
    path: 'star_obs',
    type: '32 cm Ritchey-Chrétien Photometer (Single Target)',
    referenceMission: 'CHEOPS (Trap Card)',
    mass: 58,
    cost: 15, // ~€15M
    power: 60,
    dataRate: 1.2,
    science: 40,
    apertureCm: 32,
    simultaneousStars: 1,
    requiredPointingArcsec: 4.0,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isEstimated: true,
    trl: 9.0,
    description:
      '32 cm high-precision photometer (58 kg, 60 W) optimized for ultra-deep follow-up of 1 individual star at a time.',
  },
  {
    id: 'inst_corot',
    name: 'Small CCD telescope, 27 cm',
    path: 'star_obs',
    type: '27 cm Off-Axis Telescope + 4 CCDs',
    referenceMission: 'CoRoT',
    mass: 300,
    cost: 44.5, // ~€44.5M
    power: 150,
    dataRate: 1.5,
    science: 85,
    apertureCm: 27,
    simultaneousStars: 6000,
    requiredPointingArcsec: 1.0,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['LEO_POLAR', 'LEO'],
    trl: 9.0,
    description:
      '27 cm space telescope (300 kg, 150 W) monitoring up to 6,000 stars simultaneously at 1.5 Gbit/day. Requires -40°C focal box cooling.',
  },
  {
    id: 'inst_kepler',
    name: 'Wide-field photometer, 95 cm',
    path: 'star_obs',
    type: '95 cm Schmidt Telescope + 42 CCDs',
    referenceMission: 'Kepler',
    mass: 478,
    cost: 133.5, // ~€133.5M
    power: 300,
    dataRate: 4.5,
    science: 110,
    apertureCm: 95,
    simultaneousStars: 100000,
    requiredPointingArcsec: 0.05,
    requiredCooling: 'minus_85c',
    compatibleOrbits: ['SOLAR_ORBIT', 'L2', 'GEO'],
    isEstimated: true,
    trl: 9.0,
    description:
      '95 cm Schmidt wide-field photometer (478 kg, ~300 W) surveying 100,000 stars simultaneously. Requires -85°C cooling.',
  },
  {
    id: 'inst_gaia',
    name: 'Dual-telescope survey instrument',
    path: 'star_obs',
    type: 'Dual Astrometric & Spectroscopic Telescope',
    referenceMission: 'Gaia',
    mass: 524,
    cost: 150, // ~€150M
    power: 627,
    dataRate: 135,
    science: 150,
    apertureCm: 145,
    simultaneousStars: 2000000,
    requiredPointingArcsec: 0.02,
    requiredCooling: 'cryo_160k',
    compatibleOrbits: ['L2'],
    trl: 9.0,
    description:
      'Twin astrometric & spectroscopic survey payload module (524 kg, 627 W) mapping millions of stars from L2. Demands 160 K sunshield stability.',
  },

  // =========================================================================
  // PATH 2: TELECOMMUNICATIONS PAYLOADS (6 CARDS)
  // =========================================================================
  {
    id: 'inst_opssat_xband',
    name: 'Compact X-band radio',
    path: 'telecom',
    type: '140 Mbit/s X-Band RF Payload',
    referenceMission: 'OPS-SAT / C3',
    mass: 0.3, // ~0.3 kg
    cost: 0.0287, // ~€28,700
    priceEur: 28700,
    power: 12,
    dataRate: 136,
    science: 40,
    requiredPointingArcsec: 120,
    requiredCooling: 'ambient',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isLaserLink: false,
    trl: 9.5,
    description:
      'Compact 140 Mbit/s X-band radio payload (~0.3 kg, 12 W). Delivers ~136 Gbit/day in high-inclination LEO with polar stations.',
  },
  {
    id: 'inst_tbird',
    name: 'CubeSat laser terminal',
    path: 'telecom',
    type: '3U Optical Lasercom Terminal',
    referenceMission: 'TBIRD',
    mass: 3, // ~3 kg
    cost: 0.89, // ~€0.89M
    priceEur: 890000,
    power: 50,
    dataRate: 4800,
    science: 85,
    requiredPointingArcsec: 2.0,
    requiredCooling: 'thermal_iso',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isLaserLink: true,
    isEstimated: true,
    trl: 8.5,
    description:
      '3U optical lasercom payload (~3 kg, ~50 W) delivering multi-terabit direct-to-Earth optical bursts in clear-sky LEO.',
  },
  {
    id: 'inst_leo_kuband',
    name: 'LEO Ku-band broadband payload',
    path: 'telecom',
    type: 'LEO Ku-Band Broadband Transponder',
    referenceMission: 'LEO Broadband Smallsat',
    mass: 50, // ~50 kg
    cost: 0.45, // ~€0.45M
    priceEur: 450000,
    power: 300,
    dataRate: 600,
    science: 90,
    requiredPointingArcsec: 30,
    requiredCooling: 'thermal_iso',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isLaserLink: false,
    isEstimated: true,
    trl: 9.0,
    description:
      'High-capacity LEO Ku-band broadband communications payload (~50 kg, ~300 W) for low-latency user data routing.',
  },
  {
    id: 'inst_edrs_tesat',
    name: 'GEO laser relay terminal',
    path: 'telecom',
    type: 'GEO Optical Laser Relay Terminal',
    referenceMission: 'Tesat LCT (EDRS)',
    mass: 50, // ~50 kg
    cost: 26.7, // ~€26.7M
    power: 160,
    dataRate: 50000,
    science: 125,
    apertureCm: 13.5,
    requiredPointingArcsec: 2.0,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['GEO', 'GSO'],
    isLaserLink: true,
    isEstimated: true,
    trl: 9.0,
    description:
      'Single GEO optical laser relay terminal (~50 kg, ~160 W) providing high-speed space-to-ground optical data relay.',
  },
  {
    id: 'inst_lcrd',
    name: 'Laser relay terminal pair (GEO)',
    path: 'telecom',
    type: 'Dual GEO Optical Laser Relay Terminals',
    referenceMission: 'LCRD',
    mass: 150, // ~150 kg for two
    cost: 44.5, // ~€44.5M
    power: 500,
    dataRate: 1200,
    science: 110,
    apertureCm: 10.8,
    requiredPointingArcsec: 2.0,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['GEO', 'GSO'],
    isLaserLink: true,
    isEstimated: true,
    trl: 8.5,
    description:
      'Dual GEO optical laser relay terminal pair (~150 kg total, ~500 W) supporting simultaneous bidirectional space-to-ground optical routing.',
  },
  {
    id: 'inst_alphasat_lband',
    name: 'Mobile service payload, L-band (GEO)',
    path: 'telecom',
    type: 'GEO High-Power L-Band Multi-Beam Payload',
    referenceMission: 'Alphasat',
    mass: 1000, // ~1,000 kg
    cost: 178, // ~€178M
    power: 10000, // ~10 kW
    dataRate: 900,
    science: 140,
    apertureCm: 1100,
    requiredPointingArcsec: 15,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['GEO', 'GSO'],
    isLaserLink: false,
    isEstimated: true,
    trl: 9.0,
    description:
      'High-capacity GEO L-band mobile service payload (~1,000 kg, ~10 kW) serving hundreds of simultaneous user spot beams.',
  },
];

// =========================================================================
// LAUNCH VEHICLES & CONFIGURATIONS
// =========================================================================
export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'lv_pegasus',
    company: 'Northrop Grumman',
    name: 'Northrop Grumman Pegasus',
    selectedConfigId: 'pegasus_xl',
    trl: 9.0,
    description:
      'Air-launched small orbital booster rated for 400 km LEO across all inclinations (up to 400 kg). Not rated for GSO or L2.',
    configurations: [
      {
        id: 'pegasus_xl',
        name: 'XL',
        cost: 15,
        deltaV: 9500,
        capacities: {
          leo28_5: 400,
          leo51_6: 365,
          leoPolar: 300,
          leoSSO: 285,
          gso: null,
          l2: null,
        },
      },
    ],
  },
  {
    id: 'lv_falcon_9',
    company: 'SpaceX',
    name: 'SpaceX Falcon 9',
    selectedConfigId: 'f9_ft_rtls',
    trl: 9.5,
    description:
      'Medium-heavy two-stage launcher supporting all 400 km LEO inclinations and light L2 missions. Choose RTLS or ASDS recovery.',
    configurations: [
      {
        id: 'f9_ft_rtls',
        name: 'Full Thrust, RTLS',
        cost: 55,
        deltaV: 13000,
        capacities: {
          leo28_5: 11660,
          leo51_6: 10860,
          leoPolar: 9010,
          leoSSO: 8960,
          gso: null,
          l2: 1770,
        },
      },
      {
        id: 'f9_ft_asds',
        name: 'Full Thrust, ASDS',
        cost: 67,
        deltaV: 13100,
        capacities: {
          leo28_5: 15520,
          leo51_6: 14460,
          leoPolar: 12120,
          leoSSO: 12130,
          gso: null,
          l2: 3310,
        },
      },
    ],
  },
  {
    id: 'lv_falcon_heavy',
    company: 'SpaceX',
    name: 'SpaceX Falcon Heavy',
    selectedConfigId: 'fh_recovered',
    trl: 9.0,
    description:
      'Triple-core heavy lift vehicle dedicated to high-energy L2 (C3 = 0) deep-space injections in Recovered or Expendable configuration.',
    configurations: [
      {
        id: 'fh_recovered',
        name: 'Recovered',
        cost: 97,
        deltaV: 13200,
        capacities: {
          leo28_5: null,
          leo51_6: null,
          leoPolar: null,
          leoSSO: null,
          gso: null,
          l2: 6690,
        },
      },
      {
        id: 'fh_expendable',
        name: 'Expendable',
        cost: 150,
        deltaV: 13500,
        capacities: {
          leo28_5: null,
          leo51_6: null,
          leoPolar: null,
          leoSSO: null,
          gso: null,
          l2: 15010,
        },
      },
    ],
  },
  {
    id: 'lv_vulcan',
    company: 'United Launch Alliance',
    name: 'ULA Vulcan Centaur',
    selectedConfigId: 'vulcan_vc2',
    trl: 8.5,
    description:
      'Modular heavy booster scalable from 0 to 6 solid rocket boosters (VC0–VC6) for 28.5°/51.6° LEO, GSO transfer, and L2.',
    configurations: [
      {
        id: 'vulcan_vc0',
        name: 'VC0 (0 SRBs)',
        cost: 85,
        deltaV: 13000,
        capacities: {
          leo28_5: 9470,
          leo51_6: 8720,
          leoPolar: null,
          leoSSO: null,
          gso: null,
          l2: 2100,
        },
      },
      {
        id: 'vulcan_vc2',
        name: 'VC2 (2 SRBs)',
        cost: 105,
        deltaV: 13100,
        capacities: {
          leo28_5: 16810,
          leo51_6: 15660,
          leoPolar: null,
          leoSSO: null,
          gso: 7580,
          l2: 5920,
        },
      },
      {
        id: 'vulcan_vc4',
        name: 'VC4 (4 SRBs)',
        cost: 125,
        deltaV: 13200,
        capacities: {
          leo28_5: 22310,
          leo51_6: 20800,
          leoPolar: null,
          leoSSO: null,
          gso: 10790,
          l2: 8550,
        },
      },
      {
        id: 'vulcan_vc6',
        name: 'VC6 (6 SRBs)',
        cost: 145,
        deltaV: 13400,
        capacities: {
          leo28_5: 26450,
          leo51_6: 24730,
          leoPolar: null,
          leoSSO: null,
          gso: 13630,
          l2: 10850,
        },
      },
    ],
  },
  {
    id: 'lv_new_glenn',
    company: 'Blue Origin',
    name: 'Blue Origin New Glenn',
    selectedConfigId: 'new_glenn_std',
    trl: 8.5,
    description:
      '7-meter heavy-lift orbital rocket offering massive 400 km (28.5°/51.6°) LEO, GSO transfer (12,085 kg), and L2 (7,180 kg) lift.',
    configurations: [
      {
        id: 'new_glenn_std',
        name: 'Standard (Reusable Booster)',
        cost: 110,
        deltaV: 13200,
        capacities: {
          leo28_5: 36290,
          leo51_6: 34110,
          leoPolar: null,
          leoSSO: null,
          gso: 12085,
          l2: 7180,
        },
      },
    ],
  },
];

// =========================================================================
// HELPER: RESOLVE EFFECTIVE DOWNLINK (GBIT/DAY) FOR A COMM COMPONENT & ORBIT
// =========================================================================
export function getCommDownlinkForOrbit(
  comp: BusComponent,
  orbit: OrbitRegime | null
): number | null {
  if (!comp.downlinkByRegime) {
    return comp.dataDownlink ?? 0;
  }
  const orbitId = orbit?.id ?? 'LEO';
  if (orbitId === 'L2') {
    return comp.downlinkByRegime.l2;
  }
  if (orbitId === 'GSO') {
    return (
      comp.downlinkByRegime.gso ??
      comp.downlinkByRegime.leoLowIncl ??
      comp.dataDownlink ??
      0
    );
  }
  const deg = orbit?.selectedInclination?.deg ?? orbit?.inclinationDeg ?? 51.6;
  const isHighIncl = deg >= 80;
  return isHighIncl ? comp.downlinkByRegime.leoHighIncl : comp.downlinkByRegime.leoLowIncl;
}

// =========================================================================
// HELPER: COMPUTE TOTALS FOR SELECTED BUS ITEMS (SUPPORTS STACKED BATTERIES)
// =========================================================================
export interface BusSelectionTotals {
  mass: number;
  cost: number;
  bolPower: number;
  powerDraw: number;
  totalBatteryWh: number;
  bonusDeltaV: number;
  dataDownlink: number;
  contactMultiplier: number;
  degradationRate: number;
  commCompatibleWithOrbit: boolean;
  incompatibleCommName: string | null;
  adcsCompatibleWithOrbit: boolean;
  incompatibleAdcsName: string | null;
  pointingAccuracyArcsec: number | null;
  trlValues: number[];
}

export function calculateBusSelectionTotals(
  selectedBusIds: string[],
  orbit: OrbitRegime | null = null
): BusSelectionTotals {
  const counts = new Map<string, number>();
  selectedBusIds.forEach((id) => {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  let mass = 0;
  let cost = 0;
  let bolPower = 0;
  let powerDraw = 0;
  let totalBatteryWh = 0;
  let bonusDeltaV = 0;
  let dataDownlink = 0;
  let contactMultiplier = 1;
  let degradationRate = 0.025;
  let commCompatibleWithOrbit = true;
  let incompatibleCommName: string | null = null;
  let adcsCompatibleWithOrbit = true;
  let incompatibleAdcsName: string | null = null;
  let pointingAccuracyArcsec: number | null = null;
  const trlValues: number[] = [];

  const activeOrbitId = orbit?.id ?? 'LEO';

  counts.forEach((qty, id) => {
    const comp = BUS_COMPONENTS.find((c) => c.id === id);
    if (!comp || qty <= 0) return;

    const unitMass = comp.mass + (qty - 1) * (comp.extraUnitMass ?? comp.mass);
    const unitCost = comp.cost + (qty - 1) * (comp.extraUnitCost ?? comp.cost);

    mass += unitMass;
    cost += unitCost;

    if (comp.batteryCapacityWh) {
      totalBatteryWh += comp.batteryCapacityWh * qty;
    }
    if (comp.deltaVAdded) {
      bonusDeltaV += comp.deltaVAdded * qty;
    }
    if (comp.powerDelta > 0) {
      bolPower += comp.powerDelta * qty;
      if (typeof comp.degradationRate === 'number') {
        degradationRate = comp.degradationRate;
      }
    } else if (comp.rfTransmitWatts) {
      powerDraw += comp.rfTransmitWatts * 5 * qty;
    } else {
      powerDraw += Math.abs(comp.powerDelta) * qty;
    }

    if (comp.category === 'comm') {
      const orbitRate = getCommDownlinkForOrbit(comp, orbit);
      if (orbitRate === null) {
        commCompatibleWithOrbit = false;
        incompatibleCommName = comp.name;
      } else {
        dataDownlink += orbitRate * qty;
      }
    } else if (comp.dataDownlink) {
      dataDownlink += comp.dataDownlink * qty;
    }

    if (comp.category === 'adcs') {
      if (typeof comp.pointingAccuracyArcsec === 'number') {
        pointingAccuracyArcsec = comp.pointingAccuracyArcsec;
      }
      if (
        comp.compatibleOrbitIds &&
        !comp.compatibleOrbitIds.includes(activeOrbitId)
      ) {
        adcsCompatibleWithOrbit = false;
        incompatibleAdcsName = comp.name;
      }
    }

    if (comp.contactMultiplier) {
      contactMultiplier = Math.max(contactMultiplier, comp.contactMultiplier);
    }

    for (let i = 0; i < qty; i++) {
      trlValues.push(comp.trl ?? 8.5);
    }
  });

  return {
    mass: Math.round(mass * 1000) / 1000,
    cost: Math.round(cost * 100000) / 100000,
    bolPower,
    powerDraw,
    totalBatteryWh,
    bonusDeltaV,
    dataDownlink: Math.round(dataDownlink * 1000) / 1000,
    contactMultiplier,
    degradationRate,
    commCompatibleWithOrbit,
    incompatibleCommName,
    adcsCompatibleWithOrbit,
    incompatibleAdcsName,
    pointingAccuracyArcsec,
    trlValues,
  };
}

export function getActiveLVConfig(lv: LaunchVehicle | null): LaunchVehicleConfiguration | null {
  if (!lv || !lv.configurations?.length) return null;
  return (
    lv.configurations.find((c) => c.id === lv.selectedConfigId) ??
    lv.configurations[0]
  );
}

export function getOrbitTargetLabel(
  orbit: OrbitRegime | null,
  fallbackObjective?: Objective
): string {
  if (!orbit) {
    return fallbackObjective?.orbitType === 'GEO' ? 'GSO (35,786 KM)' : 'LEO 400 KM (51.6°)';
  }
  if (orbit.id === 'LEO') {
    const deg = orbit.selectedInclination?.deg ?? orbit.inclinationDeg ?? 51.6;
    if (deg === 90) return 'LEO 400 KM (90° POLAR)';
    if (deg === 98) return 'LEO 400 KM (98° SSO)';
    return `LEO 400 KM (${deg}°)`;
  }
  if (orbit.id === 'GSO') return 'GSO (35,786 KM)';
  return 'L2 POINT (C3 = 0)';
}

export function getLauncherMaxPayload(
  lv: LaunchVehicle | null,
  orbit: OrbitRegime | null,
  fallbackObjective?: Objective
): number | null {
  const cfg = getActiveLVConfig(lv);
  if (!cfg) return null;

  const orbitId =
    orbit?.id ?? (fallbackObjective?.orbitType === 'GEO' ? 'GSO' : 'LEO');

  if (orbitId === 'GSO') {
    return cfg.capacities.gso;
  }
  if (orbitId === 'L2') {
    return cfg.capacities.l2;
  }

  const deg = orbit?.selectedInclination?.deg ?? orbit?.inclinationDeg ?? 51.6;
  if (Math.abs(deg - 28.5) < 0.5) return cfg.capacities.leo28_5;
  if (Math.abs(deg - 51.6) < 0.5) return cfg.capacities.leo51_6;
  if (Math.abs(deg - 90) < 0.5) return cfg.capacities.leoPolar;
  if (Math.abs(deg - 98) < 0.5) return cfg.capacities.leoSSO;

  return cfg.capacities.leo51_6;
}

export type DifficultyLevel = 'easy' | 'medium' | 'advanced' | 'expert';

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  tag: string;
  description: string;
  budgets: {
    starObservation: number; // €M
    telecom: number; // €M
  };
}

export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  {
    id: 'easy',
    label: 'EASY',
    tag: 'GENEROUS FUNDING',
    description: 'Ample engineering reserves and high-margin commercial boosters.',
    budgets: {
      starObservation: 700,
      telecom: 500,
    },
  },
  {
    id: 'medium',
    label: 'MEDIUM',
    tag: 'STANDARD AGENCY',
    description: 'Realistic institutional budget requiring balanced subsystem trade-offs.',
    budgets: {
      starObservation: 214,
      telecom: 300,
    },
  },
  {
    id: 'advanced',
    label: 'ADVANCED',
    tag: 'CONSTRAINED CAP',
    description: 'Tight mass-to-cost margins; every watt and kilogram counts.',
    budgets: {
      starObservation: 66,
      telecom: 100,
    },
  },
  {
    id: 'expert',
    label: 'EXPERT',
    tag: 'NEWSPACE / CUBESAT',
    description: 'Ultra-lean shoestring budget; requires extreme miniaturization.',
    budgets: {
      starObservation: 20,
      telecom: 50,
    },
  },
];

export const REFERENCE_MISSIONS = {
  star_obs: [
    { name: 'ASTERIA', class: 'CubeSat (6U)', orbit: 'LEO', massKg: 12, powerW: 40, dataGbitDay: 1.2 },
    { name: 'CoRoT', class: 'Medium', orbit: 'LEO Polar (896 km)', massKg: 630, powerW: 530, dataGbitDay: 1.5 },
    { name: 'Kepler', class: 'Advanced', orbit: 'Earth-Trailing Solar', massKg: 1052, powerW: 1100, dataGbitDay: 4.5 },
    { name: 'Gaia', class: 'Expert', orbit: 'Sun-Earth L2', massKg: 2030, powerW: 1561, dataGbitDay: 135 },
    { name: 'CHEOPS / TESS / JWST / PLATO', class: 'Benchmarks', orbit: 'LEO / HEO / L2', massKg: 280, powerW: 600, dataGbitDay: 50 },
  ],
  telecom: [
    { name: 'TBIRD', class: 'CubeSat (6U)', orbit: 'LEO Direct-to-Earth', massKg: 12, powerW: 120, dataGbitDay: 4800 },
    { name: 'LCRD', class: 'Medium (Hosted)', orbit: 'GEO Laser Relay', massKg: 450, powerW: 800, dataGbitDay: 1200 },
    { name: 'EDRS-C', class: 'Advanced', orbit: 'GEO Laser Relay', massKg: 3186, powerW: 2800, dataGbitDay: 50000 },
    { name: 'Alphasat', class: 'Expert', orbit: 'GEO User Service', massKg: 6600, powerW: 12000, dataGbitDay: 900 },
    { name: 'TDRS / Eutelsat Quantum', class: 'Benchmarks', orbit: 'GEO Relay / Software', massKg: 3500, powerW: 5000, dataGbitDay: 10000 },
  ],
};