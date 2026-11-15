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
  // HP-01: POWER — 1.1 BATTERIES (4 CARDS)
  // =========================================================================
  {
    id: 'bat_li_ion_80wh',
    name: 'Compact Li-Ion Pack (80 Wh)',
    category: 'power',
    subCategory: 'batteries',
    mass: 1.5,
    cost: 4,
    powerDelta: -2,
    batteryCapacityWh: 80,
    trl: 9.0,
    riskPenaltyPercent: 8,
    riskNote: 'Low eclipse reserve; only viable for low-power CubeSat duty cycles.',
    description: '6U CubeSat lithium-ion cell pack for short LEO eclipse passes (35 min).',
  },
  {
    id: 'bat_li_ion_450wh',
    name: 'Modular Li-Ion Battery Bank (450 Wh)',
    category: 'power',
    subCategory: 'batteries',
    mass: 6,
    cost: 14,
    powerDelta: -5,
    batteryCapacityWh: 450,
    trl: 9.0,
    riskPenaltyPercent: 0,
    description: 'Flight-proven smallsat battery module supporting continuous night-side telemetry.',
  },
  {
    id: 'bat_sbs_1800wh',
    name: 'High-Density Space Battery (1,800 Wh)',
    category: 'power',
    subCategory: 'batteries',
    mass: 18,
    cost: 35,
    powerDelta: -10,
    batteryCapacityWh: 1800,
    hasRedundancy: true,
    trl: 9.0,
    riskPenaltyPercent: 0,
    description: 'Dual-bus Li-ion battery assembly built for 72-minute GEO equinox eclipses.',
  },
  {
    id: 'bat_deep_4500wh',
    name: 'Deep-Space Redundant Energy Bank (4,500 Wh)',
    category: 'power',
    subCategory: 'batteries',
    mass: 42,
    cost: 75,
    powerDelta: -18,
    batteryCapacityWh: 4500,
    hasRedundancy: true,
    trl: 8.5,
    riskPenaltyPercent: 0,
    description: 'Triple-redundant cell bank with active cell balancing for high-power payloads.',
  },

  // =========================================================================
  // HP-01: POWER — 1.2 SOLAR PANELS (4 CARDS)
  // =========================================================================
  {
    id: 'pwr_cubesat_120w',
    name: '6U Deployable Solar Array (120W Peak)',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 4,
    cost: 12,
    powerDelta: 120,
    degradationRate: 0.035,
    trl: 9.0,
    riskPenaltyPercent: 10,
    riskNote: 'Tight power margin; high-draw payloads must operate in short duty cycles.',
    description: 'Compact CubeSat triple-junction GaAs wings (TBIRD/ASTERIA class).',
  },
  {
    id: 'pwr_standard_600w',
    name: 'Dual-Wing GaAs Solar Array (650W)',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 38,
    cost: 40,
    powerDelta: 650,
    degradationRate: 0.025,
    trl: 9.0,
    riskPenaltyPercent: 0,
    description: 'CoRoT-class articulated solar wings with single-axis solar alpha drive.',
  },
  {
    id: 'pwr_deep_space_1200w',
    name: 'High-Efficiency Triple-Junction Array (1,250W)',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 85,
    cost: 95,
    powerDelta: 1250,
    degradationRate: 0.02,
    trl: 8.5,
    riskPenaltyPercent: 0,
    description: 'Kepler-class rigid composite panels rated for deep-space & L2 solar flux.',
  },
  {
    id: 'pwr_l2_sunshield_2200w',
    name: 'Ultra-Flex 2.2 kW Array + Sunshield Skirt',
    category: 'power',
    subCategory: 'solar_panels',
    mass: 155,
    cost: 165,
    powerDelta: 2200,
    degradationRate: 0.018,
    trl: 8.5,
    riskPenaltyPercent: 0,
    description: 'Gaia/EDRS-class high-output solar array with integrated deployment skirt.',
  },

  // =========================================================================
  // HP-02: COMMUNICATIONS — 2.1 FREQUENCY BAND (4 CARDS)
  // =========================================================================
  {
    id: 'freq_uhf',
    name: 'UHF Band (400–450 MHz)',
    category: 'comm',
    subCategory: 'comm_frequency',
    frequencyBand: 'UHF',
    mass: 1,
    cost: 4,
    powerDelta: -4,
    dataDownlink: 0.5,
    trl: 9.5,
    riskPenaltyPercent: 6,
    riskNote: 'Low bandwidth; unsuitable for high-throughput science or telecom relays.',
    description: 'Omnidirectional TT&C link; resilient to tumble but severely bandwidth-limited.',
  },
  {
    id: 'freq_sband',
    name: 'S-Band (2.2 GHz)',
    category: 'comm',
    subCategory: 'comm_frequency',
    frequencyBand: 'S-Band',
    mass: 2,
    cost: 8,
    powerDelta: -8,
    dataDownlink: 2.0,
    trl: 9.5,
    description: 'Standard spacecraft telemetry & command band; weather-immune up to 2 Mbps.',
  },
  {
    id: 'freq_xband',
    name: 'X-Band (8.4 GHz)',
    category: 'comm',
    subCategory: 'comm_frequency',
    frequencyBand: 'X-Band',
    mass: 4,
    cost: 18,
    powerDelta: -15,
    dataDownlink: 120,
    trl: 9.0,
    description: 'High-rate Earth observation & deep-space science downlink allocation.',
  },
  {
    id: 'freq_kaband_optical',
    name: 'Ka-Band / Optical Hybrid (32 GHz + 1550 nm)',
    category: 'comm',
    subCategory: 'comm_frequency',
    frequencyBand: 'Ka-Band',
    mass: 7,
    cost: 36,
    powerDelta: -25,
    dataDownlink: 1500,
    trl: 8.5,
    description: 'Multi-gigabit Ka-band feeder + optical laser crosslink spectrum.',
  },

  // =========================================================================
  // HP-02: COMMUNICATIONS — 2.2 CONTACT TIME & GROUND NETWORK (4 CARDS)
  // =========================================================================
  {
    id: 'contact_single_midlat',
    name: 'Single Mid-Latitude Ground Station (~28 min/day)',
    category: 'comm',
    subCategory: 'comm_contact',
    groundSegmentType: 'mid_latitude',
    contactMultiplier: 1.0,
    mass: 0,
    cost: 5,
    powerDelta: 0,
    trl: 9.5,
    riskPenaltyPercent: 5,
    riskNote: '4 passes/day; up to 90-minute store-and-forward latency gaps.',
    description: 'One university/agency dish (~4 passes/day). Low ops cost, high latency.',
  },
  {
    id: 'contact_polar_svalbard',
    name: 'Polar Station Network — Svalbard & Kiruna (14 passes/day)',
    category: 'comm',
    subCategory: 'comm_contact',
    groundSegmentType: 'polar_station',
    contactMultiplier: 3.5,
    mass: 0,
    cost: 18,
    powerDelta: 0,
    hasRedundancy: true,
    trl: 9.0,
    description: 'High-latitude Arctic dishes capturing every polar LEO revolution.',
  },
  {
    id: 'contact_dsn_global',
    name: 'Global Deep Space Network (8 hrs/day Scheduled)',
    category: 'comm',
    subCategory: 'comm_contact',
    groundSegmentType: 'mid_latitude',
    contactMultiplier: 6.0,
    mass: 0,
    cost: 35,
    powerDelta: 0,
    hasRedundancy: true,
    trl: 9.0,
    description: '34m/70m global antenna complex (Madrid, Goldstone, Canberra) for L2/deep space.',
  },
  {
    id: 'contact_geo_relay_247',
    name: '24/7 Continuous GEO Relay (EDRS / TDRS)',
    category: 'comm',
    subCategory: 'comm_contact',
    groundSegmentType: 'geo_relay',
    contactMultiplier: 12.0,
    mass: 0,
    cost: 55,
    powerDelta: 0,
    hasRedundancy: true,
    trl: 8.5,
    description: 'Real-time continuous space-to-ground routing with near-zero latency.',
  },

  // =========================================================================
  // HP-02: COMMUNICATIONS — 2.3 TRANSCEIVER & ANTENNA (5x RF POWER RULE!)
  // =========================================================================
  {
    id: 'tx_2w_patch',
    name: '2W RF Patch Transceiver (Draws 10W — 5x Rule)',
    category: 'comm',
    subCategory: 'comm_transceiver',
    rfTransmitWatts: 2,
    powerDelta: -10,
    dataDownlink: 2,
    mass: 1.5,
    cost: 6,
    trl: 9.5,
    description: '2W RF output amplifier drawing 10W bus power (20% PA efficiency) for LEO.',
  },
  {
    id: 'tx_10w_horn',
    name: '10W RF Medium-Gain Horn (Draws 50W — 5x Rule)',
    category: 'comm',
    subCategory: 'comm_transceiver',
    rfTransmitWatts: 10,
    powerDelta: -50,
    dataDownlink: 80,
    mass: 5,
    cost: 18,
    trl: 9.0,
    description: '10W RF SSPA drawing 50W electrical power for high-rate X-band downlinks.',
  },
  {
    id: 'tx_35w_hga',
    name: '35W RF High-Gain Dish + TWTA (Draws 175W — 5x Rule)',
    category: 'comm',
    subCategory: 'comm_transceiver',
    rfTransmitWatts: 35,
    powerDelta: -175,
    dataDownlink: 350,
    mass: 22,
    cost: 42,
    hasRedundancy: true,
    trl: 9.0,
    description: '35W RF Traveling-Wave Tube Amplifier drawing 175W bus power for GEO/L2.',
  },
  {
    id: 'tx_80w_phased_array',
    name: '80W RF Multi-Beam Phased Array (Draws 400W — 5x Rule)',
    category: 'comm',
    subCategory: 'comm_transceiver',
    rfTransmitWatts: 80,
    powerDelta: -400,
    dataDownlink: 1800,
    mass: 48,
    cost: 78,
    hasRedundancy: true,
    trl: 8.5,
    description: '80W RF telecom transponder drawing 400W bus power for multi-beam trunking.',
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
  // HP-04: ADCS (ATTITUDE) — 4.1 ATTITUDE CONTROL (4 CARDS)
  // =========================================================================
  {
    id: 'adcs_nano_coarse',
    name: 'Nanosat Reaction Wheels + Magnetorquers (90 arcsec)',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 3,
    cost: 10,
    powerDelta: -10,
    pointingAccuracyArcsec: 90,
    trl: 9.0,
    description: 'BRITE-class 3-axis micro-wheels (90 arcsec RMS) for wide-field LEO pointing.',
  },
  {
    id: 'adcs_star_tracker_mid',
    name: 'Dual Star Trackers + 4-Wheel Pyramid (5 arcsec)',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 12,
    cost: 24,
    powerDelta: -20,
    pointingAccuracyArcsec: 5.0,
    hasRedundancy: true,
    trl: 9.0,
    description: 'Agile zero-momentum wheel array delivering 5 arcsec pointing stability.',
  },
  {
    id: 'adcs_piezo_fine',
    name: 'Star Tracker + 2-Axis Piezo Stage (0.5 arcsec)',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 18,
    cost: 38,
    powerDelta: -28,
    pointingAccuracyArcsec: 0.5,
    hasRedundancy: true,
    trl: 8.5,
    description: 'ASTERIA/CoRoT-grade coarse wheels + fine piezo focal-plane stabilization.',
  },
  {
    id: 'adcs_radhard_fgs',
    name: 'Fine Guidance Sensor + Cold-Gas Micro-Prop (0.01 arcsec)',
    category: 'adcs',
    subCategory: 'adcs',
    mass: 42,
    cost: 75,
    powerDelta: -55,
    pointingAccuracyArcsec: 0.01,
    hasRedundancy: true,
    trl: 9.0,
    description: 'Kepler/Gaia-grade Fine Guidance Sensors (< 9 mas jitter) for astrometry.',
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
    description: 'Reinforced composite/titanium central tube built for Alphasat/EDRS-class buses.',
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
    description: 'CoRoT/GEO-class heat-pipe loop maintaining optical/RF bays at -40°C.',
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
    description: 'Kepler-class passive radiative cooler eliminating CCD dark current at -85°C.',
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
    description: 'Gaia-class multi-layer sunshield & active cryocooler holding 160 K (±50 µK).',
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
    description: 'ESA standard fault-tolerant SPARC processor with EDAC-protected memory.',
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
    description: '4 m² gossamer drag sail accelerating LEO re-entry to meet 5-year FCC/ESA rules.',
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
    description: 'Targeted Point Nemo ocean disposal burn + battery/propellant tank venting.',
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
    power: 18,
    dataRate: 1.2,
    science: 45,
    apertureCm: 6.07,
    simultaneousStars: 1,
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
    power: 15,
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
    power: 280,
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
    dataRate: 135,
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
    dataRate: 84,
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
    dataRate: 4800,
    science: 85,
    requiredPointingArcsec: 2.0,
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
    mass: 65,
    cost: 90,
    power: 130,
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
    dataRate: 50000,
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
    mass: 1850,
    cost: 340,
    power: 1600,
    dataRate: 900,
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

// =========================================================================
// LAUNCH VEHICLES & CONFIGURATIONS (FROM LAUNCHER DATA EXCEL)
// Columns used: 400km LEO (28.5°, 51.6°, Polar 90°, SSO 98°), 35,786km GSO, L2 (C3 = 0)
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

  // 400 km LEO — match selected inclination degree
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