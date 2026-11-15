export type OrbitRegimeId = 'LEO' | 'GSO' | 'L2';

export interface LeoInclinationOption {
  id: string;
  deg: number;
  label: string;
  description: string;
}

export const LEO_INCLINATIONS: LeoInclinationOption[] = [
  {
    id: 'inc_28_5',
    deg: 28.5,
    label: '28.5° — Cape Canaveral',
    description: 'Lowest Energy Requirement from Florida',
  },
  {
    id: 'inc_51_6',
    deg: 51.6,
    label: '51.6° — ISS Standard',
    description: 'ISS, also good for Telecoms',
  },
  {
    id: 'inc_90',
    deg: 90,
    label: '90° — Polar Orbit',
    description: 'World Coverage, good for earth observation and weather',
  },
  {
    id: 'inc_98',
    deg: 98,
    label: '98° — Sun-Synchronous',
    description: 'Passes from each place at the same time of the day. Good for star observation',
  },
];

export interface OrbitRegime {
  id: OrbitRegimeId;
  code: string;
  name: string;
  altitudeLabel: string;
  periodLabel: string;
  deltaVReq: number;
  mappedObjectiveId: string;
  visualRadius: number;
  inclinationDeg: number;
  selectedInclination?: LeoInclinationOption;
  color: string;
  summary: string;
  engineeringImpact: string;
  idealPayloads: string[];
}

export const ORBIT_REGIMES: OrbitRegime[] = [
  {
    id: 'LEO',
    code: 'REGIME 01 // LOW EARTH ORBIT',
    name: 'LEO (400 KM)',
    altitudeLabel: '400 KM',
    periodLabel: '92.6 MIN',
    deltaVReq: 9400,
    mappedObjectiveId: 'earth_obs',
    visualRadius: 1.81,
    inclinationDeg: 51.6,
    selectedInclination: LEO_INCLINATIONS[1],
    color: '#33ff33',
    summary:
      'A close-proximity orbital band skimming just above Earth’s atmosphere. Spacecraft complete roughly 15.5 revolutions per day, passing rapidly over ground targets.',
    engineeringImpact:
      'Lowest launch energy (Δv) and minimal radio latency, allowing smaller boosters and lightweight antennas—but atmospheric drag requires a 50 m/s de-orbit reserve (ODMSP).',
    idealPayloads: ['High-Res Optical Imager', 'Synthetic Aperture Radar (SAR)', 'Atmospheric Lidar'],
  },
  {
    id: 'GSO',
    code: 'REGIME 02 // GEOSYNCHRONOUS ORBIT',
    name: 'GSO (35,786 KM)',
    altitudeLabel: '35,786 KM',
    periodLabel: '23H 56M 04S',
    deltaVReq: 11800,
    mappedObjectiveId: 'earth_obs',
    visualRadius: 11.25,
    inclinationDeg: 0,
    color: '#ffb000',
    summary:
      'A high-altitude circular orbit whose orbital period matches Earth’s sidereal rotation. Satellites appear nearly stationary over a fixed longitude for continuous hemispheric coverage.',
    engineeringImpact:
      'Requires high-energy transfer stages (+2,400 m/s Δv over LEO), higher-gain comms dishes, and a 15 m/s graveyard orbit disposal reserve at end of life.',
    idealPayloads: ['Wide-Field Weather Imager', 'Ka-Band Relay Transponder', 'Early-Warning IR Sensor'],
  },
  {
    id: 'L2',
    code: 'REGIME 03 // LAGRANGE POINT 2',
    name: 'L2 POINT (1.5M KM)',
    altitudeLabel: '1,500,000 KM (ANTI-SUN)',
    periodLabel: 'HALO ORBIT (~180 DAYS)',
    deltaVReq: 12800,
    mappedObjectiveId: 'lunar_recon',
    visualRadius: 13.5,
    inclinationDeg: 12,
    color: '#38bdf8',
    summary:
      'A gravitational equilibrium point 1.5 million km beyond Earth away from the Sun. Spacecraft orbit in a halo trajectory with Earth, Moon, and Sun all behind their sunshield.',
    engineeringImpact:
      'Demands heavy-lift deep-space boosters, high-gain deep-space telemetry antennas, multi-layer thermal/sun shielding, and precise station-keeping thrusters.',
    idealPayloads: ['Cryogenic IR Spectrometer', 'Deep-Space Magnetometer', 'Coronagraph Telescope'],
  },
];