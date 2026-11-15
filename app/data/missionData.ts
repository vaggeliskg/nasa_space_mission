import {
  Objective,
  BusComponent,
  Instrument,
  LaunchVehicle,
} from '../types/mission';

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
  // HP-01: POWER & THERMAL CONTROL
  // =========================================================================
  {
    id: 'pwr_cubesat_120w',
    name: '6U Deployable Solar Array (120W Peak)',
    category: 'power',
    mass: 4,
    cost: 12,
    powerDelta: 120,
    coolingProvided: 'thermal_iso',
    degradationRate: 0.035,
    trl: 9.0,
    riskPenaltyPercent: 10,
    riskNote: 'Tight power margin; high-draw payloads must operate in short duty cycles.',
    description:
      'Compact CubeSat solar wings (TBIRD/ASTERIA class) with passive ±0.01 K thermal isolation.',
  },
  {
    id: 'pwr_standard_600w',
    name: 'GaAs Wings + Heat-Pipe Radiator (650W)',
    category: 'power',
    mass: 48,
    cost: 45,
    powerDelta: 650,
    coolingProvided: 'minus_40c',
    degradationRate: 0.025,
    trl: 9.0,
    riskPenaltyPercent: 0,
    description:
      'CoRoT-class solar array paired with heat pipes and shadow radiator cooling detectors to -40°C.',
  },
  {
    id: 'pwr_deep_space_1200w',
    name: 'High-Efficiency Array + Cryo-Radiator (1,250W)',
    category: 'power',
    mass: 115,
    cost: 110,
    powerDelta: 1250,
    coolingProvided: 'minus_85c',
    degradationRate: 0.02,
    trl: 8.5,
    riskPenaltyPercent: 0,
    description:
      'Kepler-class solar wings with deep-shadow thermal radiator capable of -85°C focal plane cooling.',
  },
  {
    id: 'pwr_l2_sunshield_2200w',
    name: 'Multi-Layer Sunshield + 2.2 kW Array (160K)',
    category: 'power',
    mass: 210,
    cost: 195,
    powerDelta: 2200,
    coolingProvided: 'cryo_160k',
    degradationRate: 0.018,
    trl: 8.5,
    riskPenaltyPercent: 0,
    description:
      'Gaia/EDRS-class power and passive cryogenic sunshield maintaining 160 K (±50 µK) stability.',
  },

  // =========================================================================
  // HP-02: COMMS, COMMANDING & GROUND SEGMENT
  // =========================================================================
  {
    id: 'comm_sband_midlat',
    name: 'S-Band Transceiver + Mid-Latitude Station',
    category: 'comm',
    mass: 3,
    cost: 10,
    powerDelta: -12,
    dataDownlink: 1.5, // ~28 min/day contact (4 passes/day)
    groundSegmentType: 'mid_latitude',
    hasRedundancy: false,
    trl: 9.5,
    riskPenaltyPercent: 5,
    riskNote: 'Limited to ~4 ground passes/day (28 min); up to 90-min latency between contacts.',
    description:
      'Vulcan Wireless S-band radio (~28 min/day contact). Meets basic 1.5 Gbit/day star telemetry.',
  },
  {
    id: 'comm_xband_polar',
    name: 'X-Band + Svalbard/Kiruna Polar Ground Station',
    category: 'comm',
    mass: 8,
    cost: 28,
    powerDelta: -25,
    dataDownlink: 160, // Up to 14 passes/day in polar LEO
    groundSegmentType: 'polar_station',
    hasRedundancy: true,
    trl: 9.0,
    riskPenaltyPercent: 0,
    description:
      'OPS-SAT X-band radio + RF backup linked to Svalbard (78°N) & Kiruna (68°N) polar stations (14 passes/day).',
  },
  {
    id: 'comm_ka_dsn',
    name: 'Ka-Band High-Gain Dish + DSN Ground Link',
    category: 'comm',
    mass: 42,
    cost: 65,
    powerDelta: -55,
    dataDownlink: 140,
    groundSegmentType: 'mid_latitude',
    hasRedundancy: true,
    trl: 9.0,
    riskPenaltyPercent: 0,
    description:
      'Kepler/Gaia-grade Ka-band steerable dish supporting 5–140 Gbit/day deep-space & L2 downlinks.',
  },
  {
    id: 'comm_geo_relay_link',
    name: 'RF TT&C + Rented GEO Optical Relay Network',
    category: 'comm',
    mass: 22,
    cost: 85,
    powerDelta: -40,
    dataDownlink: 1800,
    groundSegmentType: 'geo_relay',
    hasRedundancy: true,
    trl: 8.5,
    riskPenaltyPercent: 0,
    description:
      'Continuous EDRS/TDRS-style GEO relay routing with RF backup. Eliminates 90-min blind spots & cloud outages.',
  },

  // =========================================================================
  // HP-03: ADCS, POINTING, RADIATION & ONBOARD COMPUTER
  // =========================================================================
  {
    id: 'adcs_nano_coarse',
    name: 'Nanosat Reaction Wheels (90 arcsec, Thin-Skin)',
    category: 'adcs',
    mass: 3,
    cost: 12,
    powerDelta: -10,
    pointingAccuracyArcsec: 90,
    radiationShieldingMm: 2,
    hasRedundancy: false,
    trl: 8.5,
    riskPenaltyPercent: 18,
    riskNote: 'Thin-skin (0.535 g/cm²) radiation shielding and single-string computer vulnerable to solar storms.',
    description:
      'BRITE-class nanosatellite ADCS (90 arcsec RMS) with standard 2 mm thin-skin chassis.',
  },
  {
    id: 'adcs_piezo_fine',
    name: 'Star Tracker + 2-Axis Piezo Stage (0.5 arcsec)',
    category: 'adcs',
    mass: 18,
    cost: 38,
    powerDelta: -28,
    pointingAccuracyArcsec: 0.5,
    radiationShieldingMm: 6,
    hasRedundancy: true,
    trl: 8.0,
    riskPenaltyPercent: 4,
    description:
      'ASTERIA/CoRoT-inspired coarse wheels + fine piezo focal-plane stabilization (0.5 arcsec) & redundant DPU.',
  },
  {
    id: 'adcs_radhard_fgs',
    name: 'Fine Guidance Sensor + 10mm Al Shield (0.01 arcsec)',
    category: 'adcs',
    mass: 65,
    cost: 95,
    powerDelta: -65,
    pointingAccuracyArcsec: 0.01,
    radiationShieldingMm: 10,
    hasRedundancy: true,
    trl: 9.0,
    riskPenaltyPercent: 0,
    description:
      'Kepler/Gaia-grade Fine Guidance Sensors (< 9 mas jitter), 10 mm Al radiation armor (2.7 g/cm²), and dual-redundant DPU.',
  },
];

export const INSTRUMENTS: Instrument[] = [
  // =========================================================================
  // PATH 1: STAR OBSERVATION INSTRUMENTS (5 CARDS)
  // =========================================================================
  {
    id: 'inst_asteria',
    name: 'ASTERIA 6cm CMOS Photometer',
    path: 'star_obs',
    type: '6.07 cm Lens + Piezo CMOS',
    referenceMission: 'ASTERIA (NASA/JPL, 6U CubeSat)',
    mass: 6,
    cost: 15,
    power: 18, // Labelled estimate per spec gap 3.4
    dataRate: 1.2,
    science: 45,
    apertureCm: 6.07,
    simultaneousStars: 1, // Watches 1 bright star at a time (fails >= 10 star rule)
    requiredPointingArcsec: 5,
    requiredCooling: 'thermal_iso',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isEstimated: true,
    trl: 8.5,
    description:
      '6.07 cm f/1.4 Zeiss lens with CMOS imager. Achieves high precision on 1 target star at a time (Power: est.).',
  },
  {
    id: 'inst_brite',
    name: 'BRITE Wide-Field Nanosat Telescope',
    path: 'star_obs',
    type: '3 cm Wide-FOV Photometer (24°)',
    referenceMission: 'BRITE Constellation (Austria/Canada/Poland)',
    mass: 7,
    cost: 18,
    power: 15, // Labelled estimate per spec gap 3.4
    dataRate: 1.4,
    science: 65,
    apertureCm: 3.0,
    simultaneousStars: 15, // Up to 15 bright stars simultaneously
    requiredPointingArcsec: 60,
    requiredCooling: 'thermal_iso',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isEstimated: true,
    trl: 9.0,
    description:
      '24° wide-field 3 cm telescope observing up to 15 bright stars simultaneously in LEO (Power/Data: est.).',
  },
  {
    id: 'inst_corot',
    name: 'CoRoT 27cm 4-CCD Space Telescope',
    path: 'star_obs',
    type: '27 cm Off-Axis Telescope + 4 CCDs (16.8 MP)',
    referenceMission: 'CoRoT (CNES + ESA, 896 km Polar)',
    mass: 300,
    cost: 120,
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
      '27 cm telescope monitoring up to 6,000 stars at once at 1.5 Gbit/day. Requires -40°C focal box cooling.',
  },
  {
    id: 'inst_kepler',
    name: 'Kepler 0.95m Schmidt Photometer',
    path: 'star_obs',
    type: '0.95 m Schmidt Telescope + 42 CCDs (95 MP)',
    referenceMission: 'Kepler (NASA, Earth-Trailing Solar Orbit)',
    mass: 478,
    cost: 260,
    power: 280, // Labelled estimate per spec gap 3.4
    dataRate: 4.5, // 3.6 - 5.4 Gbit/day
    science: 110,
    apertureCm: 95,
    simultaneousStars: 100000,
    requiredPointingArcsec: 0.05,
    requiredCooling: 'minus_85c',
    compatibleOrbits: ['SOLAR_ORBIT', 'L2', 'GEO'],
    isEstimated: true,
    trl: 9.0,
    description:
      '95-megapixel focal plane surveying 100,000 stars simultaneously. Requires -85°C radiator cooling (Power: est.).',
  },
  {
    id: 'inst_gaia',
    name: 'Gaia Dual Astrometric & Spectro Telescope',
    path: 'star_obs',
    type: 'Dual 1.45×0.5 m Mirrors + 106 CCDs (938 MP)',
    referenceMission: 'Gaia (ESA, Sun-Earth L2)',
    mass: 710,
    cost: 420,
    power: 627,
    dataRate: 135, // ~126 - 144 Gbit/day
    science: 150,
    apertureCm: 145,
    simultaneousStars: 2000000,
    requiredPointingArcsec: 0.02,
    requiredCooling: 'cryo_160k',
    compatibleOrbits: ['L2'],
    trl: 9.0,
    description:
      'Twin telescopes with nearly 1 billion pixels mapping 2 billion stars from L2. Demands 160 K sunshield stability.',
  },

  // =========================================================================
  // PATH 2: TELECOMMUNICATIONS PAYLOADS (5 CARDS)
  // =========================================================================
  {
    id: 'inst_opssat_xband',
    name: 'OPS-SAT EWC27 X-Band Radio',
    path: 'telecom',
    type: '50 Mbps X-Band RF Payload',
    referenceMission: 'ESA OPS-SAT (Low-Cost CubeSat RF)',
    mass: 1,
    cost: 8,
    power: 10,
    dataRate: 84, // ~28 min/day gives ~84 Gbit (just under 100 Gbit without polar station)
    science: 40,
    requiredPointingArcsec: 120,
    requiredCooling: 'ambient',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isLaserLink: false,
    trl: 9.5,
    description:
      '0.3 kg, 10 W X-band transmitter (50 Mbps). Needs a polar ground station to exceed 100 Gbit/day.',
  },
  {
    id: 'inst_tbird',
    name: 'TBIRD 200 Gbps Laser Terminal + 2TB SSD',
    path: 'telecom',
    type: 'Direct-to-Earth Optical Laser + 2 TB Buffer',
    referenceMission: 'TBIRD (NASA, 6U CubeSat LEO)',
    mass: 3,
    cost: 22,
    power: 100,
    dataRate: 4800, // 4.8 TB in a 5-min pass
    science: 85,
    requiredPointingArcsec: 2.0, // < 10 urad (~2 arcsec)
    requiredCooling: 'thermal_iso',
    compatibleOrbits: ['LEO', 'LEO_POLAR'],
    isLaserLink: true,
    trl: 8.0,
    description:
      '3 kg optical terminal delivering up to 4.8 TB/pass via 200 Gbps laser. Vulnerable to cloud cover without RF backup.',
  },
  {
    id: 'inst_lcrd',
    name: 'LCRD Dual Optical Relay Terminals',
    path: 'telecom',
    type: '10.8 cm Dual Laser Relay (1.2 Gbps)',
    referenceMission: 'LCRD (NASA, GEO Hosted Relay)',
    mass: 65, // Labelled estimate per spec gap
    cost: 90,
    power: 130, // Labelled estimate per spec gap
    dataRate: 1200,
    science: 100,
    apertureCm: 10.8,
    requiredPointingArcsec: 2.0,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['GEO'],
    isLaserLink: true,
    isEstimated: true,
    trl: 8.5,
    description:
      'Dual GEO optical relay terminals providing 1.2 Gbps low-latency space-to-ground routing (Mass/Power: est.).',
  },
  {
    id: 'inst_edrs_tesat',
    name: 'EDRS-C Tesat 2nd-Gen Laser Terminal',
    path: 'telecom',
    type: '13.5 cm LEO-to-GEO Laser Relay (1.8 Gbps)',
    referenceMission: 'EDRS-C (ESA + Airbus, GEO)',
    mass: 53,
    cost: 155,
    power: 160,
    dataRate: 50000, // At least 50 TB/day
    science: 125,
    apertureCm: 13.5,
    requiredPointingArcsec: 2.0,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['GEO'],
    isLaserLink: true,
    trl: 9.0,
    description:
      '1.8 Gbps (50 TB/day) GEO relay across 45,000 km with Ka-band feeder, eliminating the 90-minute LEO latency delay.',
  },
  {
    id: 'inst_alphasat_lband',
    name: 'Alphasat 11m L-Band Multi-Beam Service',
    path: 'telecom',
    type: '11 m Reflector + 8 DSPs (200+ Spot Beams)',
    referenceMission: 'Alphasat (ESA + Inmarsat, GEO)',
    mass: 1850, // ~2,000 kg total with demonstrators; ~1,850 kg est. alone
    cost: 340,
    power: 1600, // Labelled estimate for L-band payload alone
    dataRate: 900, // 750+ simultaneous user channels
    science: 140,
    apertureCm: 1100,
    requiredPointingArcsec: 15,
    requiredCooling: 'minus_40c',
    compatibleOrbits: ['GEO'],
    isLaserLink: false,
    isEstimated: true,
    trl: 9.0,
    description:
      'Massive 11 m unfurlable reflector serving 750+ user channels across 200+ spot beams directly to ground terminals.',
  },
];

export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'lv_rideshare_electron',
    name: 'SmallSat Launcher / Rideshare (Electron)',
    cost: 15,
    maxPayloadLEO: 300,
    maxPayloadDeepSpace: 80,
    deltaV: 9500,
    trl: 9.0,
    description:
      'Dedicated small launcher / rideshare ideal for 6U CubeSats (ASTERIA, BRITE, TBIRD) up to 300 kg in LEO.',
  },
  {
    id: 'lv_medium_soyuz_vega',
    name: 'Medium-Lift Orbital Booster (Vega-C / Soyuz)',
    cost: 65,
    maxPayloadLEO: 2200,
    maxPayloadDeepSpace: 850,
    deltaV: 11900,
    trl: 9.0,
    description:
      'Workhorse medium booster capable of lofting CoRoT-class LEO polar payloads or GTO/L2 mid-size spacecraft.',
  },
  {
    id: 'lv_heavy_ariane_falcon',
    name: 'Heavy-Lift Deep-Space & GTO Launcher (Ariane 6 / F9)',
    cost: 115,
    maxPayloadLEO: 8500,
    maxPayloadDeepSpace: 3800,
    deltaV: 13200,
    trl: 9.0,
    description:
      'High-energy heavy vehicle required for Gaia (L2), EDRS-C, and multi-ton Alphasat GEO platforms.',
  },
];

// Reference mission comparison table for the post-simulation report screen
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