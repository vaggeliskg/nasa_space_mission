import { Objective, ComponentSpec, Instrument, LaunchVehicle } from '../types/mission';

export const OBJECTIVES: Objective[] = [
  {
    id: 'earth_obs',
    name: 'PROJECT TERRA-EYE',
    target: 'Low Earth Orbit (LEO)',
    desc: 'Climate & meteorological observation with high downlink data rate requirements.',
    maxBudget: 150,
    minScience: 120,
    nominalLifeYears: 3,
  },
  {
    id: 'lunar_recon',
    name: 'ARTEMIS SURVEYOR 84',
    target: 'Lunar Polar Orbit',
    desc: 'High-resolution surface elevation and subterranean water ice prospecting.',
    maxBudget: 280,
    minScience: 240,
    nominalLifeYears: 4,
  },
  {
    id: 'mars_vanguard',
    name: 'ARES VANGUARD',
    target: 'Mars Aerocentric Orbit',
    desc: 'Atmospheric methane spectroscopy and landing site geophysical mapping.',
    maxBudget: 450,
    minScience: 380,
    nominalLifeYears: 6,
  },
];

export const BUS_COMPONENTS: ComponentSpec[] = [
  // Power Systems
  { id: 'pwr_solar_fixed', name: 'Body-Mounted Silicon Arrays', category: 'power', mass: 45, cost: 8, powerDelta: 350, desc: 'Reliable, low mass, moderate power output.' },
  { id: 'pwr_solar_deploy', name: 'Deployable Dual-Wing GaAs Solar Arrays', category: 'power', mass: 110, cost: 24, powerDelta: 1200, desc: 'High efficiency, high surface area, higher structural mass.' },
  { id: 'pwr_rtg', name: 'Radioisotope Thermoelectric Gen (RTG)', category: 'power', mass: 180, cost: 65, powerDelta: 850, desc: 'Decay-powered; independent of solar distance. High capital cost.' },

  // Communications
  { id: 'comm_s_band', name: 'Omni-Directional S-Band Antenna', category: 'comm', mass: 15, cost: 5, powerDelta: -45, dataDownlink: 250, desc: 'Low bandwidth beacon telemetry. Basic downlink.' },
  { id: 'comm_x_band', name: 'Parabolic Steerable X-Band Dish', category: 'comm', mass: 40, cost: 16, powerDelta: -120, dataDownlink: 2400, desc: 'High-volume data throughput, requires precise pointing.' },
  { id: 'comm_laser', name: 'Optical Deep-Space Laser Transceiver', category: 'comm', mass: 65, cost: 42, powerDelta: -210, dataDownlink: 12000, desc: 'Next-gen extreme bandwidth, high power draw and thermal load.' },

  // ADCS (Attitude Determination & Control)
  { id: 'adcs_rcs', name: 'Hydrazine Monopropellant RCS Thrusters', category: 'adcs', mass: 90, cost: 12, powerDelta: -30, desc: 'High slew agility, finite propellant reserves.' },
  { id: 'adcs_wheels', name: '3-Axis Reaction Wheels + Star Trackers', category: 'adcs', mass: 55, cost: 22, powerDelta: -85, desc: 'Fine arcsecond pointing accuracy for optical instruments.' },
];

export const INSTRUMENTS: Instrument[] = [
  { id: 'inst_cam', name: 'High-Res Multispectral Optical Imager', mass: 75, cost: 35, power: 110, dataRate: 3500, science: 110, desc: 'Surface cartography and planetary geology visual spectrum.' },
  { id: 'inst_radar', name: 'Synthetic Aperture Radar (SAR)', mass: 140, cost: 58, power: 340, dataRate: 5200, science: 160, desc: 'Penetrates cloud cover, dust storms, and sub-surface regolith.' },
  { id: 'inst_ir', name: 'Atmospheric IR Fourier Spectrometer', mass: 45, cost: 28, power: 85, dataRate: 1100, science: 90, desc: 'Identifies greenhouse volatiles, isotopes, and organic compounds.' },
  { id: 'inst_mag', name: 'Tri-Axial Fluxgate Magnetometer Boom', mass: 18, cost: 12, power: 25, dataRate: 180, science: 50, desc: 'Maps planetary magnetic fields and solar wind interaction.' },
  { id: 'inst_sample', name: 'Robotic Surface Core Drill & In-Situ Assay', mass: 120, cost: 72, power: 220, dataRate: 450, science: 190, desc: 'Direct sample analysis. Highest scientific return, extreme mass.' },
];

export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  { id: 'lv_light', name: 'PEGASUS-84 LIGHT BOOSTER', maxPayloadLEO: 650, maxPayloadDeepSpace: 180, cost: 28, reliability: '92%', desc: 'Solid propellant micro-launcher. Budget-friendly for low mass.' },
  { id: 'lv_medium', name: 'TITAN-IV MEDIUM LAUNCH VEHICLE', maxPayloadLEO: 2400, maxPayloadDeepSpace: 850, cost: 65, reliability: '97%', desc: 'Workhorse multi-stage orbital rocket with hypergolic upper stage.' },
  { id: 'lv_heavy', name: 'SATURN-HEAVY CARRIER BOOSTER', maxPayloadLEO: 7500, maxPayloadDeepSpace: 2800, cost: 120, reliability: '99%', desc: 'Super-heavy lift capability for multi-ton interplanetary payloads.' },
];