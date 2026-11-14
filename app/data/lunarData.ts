export interface LunarBeacon {
  id: string;
  code: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  requiredInstrument?: string;
  instrumentName?: string;
  scienceYield: number;
  summary: string;
  detailedScan: string;
}

export const LUNAR_BEACONS: LunarBeacon[] = [
  {
    id: 'shackleton',
    code: 'ANOMALY-01',
    name: 'SHACKLETON CRATER RIM',
    region: 'Lunar South Pole (89.9° S)',
    lat: -82,
    lon: 15,
    requiredInstrument: 'inst_radar',
    instrumentName: 'Synthetic Aperture Radar (SAR)',
    scienceYield: 140,
    summary: 'Permanently shadowed crater floor exhibiting anomalous hydrogen reflections.',
    detailedScan: 'SAR SUB-SURFACE ECHO CONFIRMED: High-dielectric crystalline water-ice deposits detected 1.4m beneath regolith.',
  },
  {
    id: 'tranquility',
    code: 'SITE-11',
    name: 'MARE TRANQUILLITATIS',
    region: '0.67° N, 23.47° E',
    lat: 8,
    lon: 25,
    requiredInstrument: 'inst_cam',
    instrumentName: 'Multispectral Optical Imager',
    scienceYield: 95,
    summary: 'Titanium-rich basaltic mare basin and historic Apollo 11 landing zone.',
    detailedScan: 'OPTICAL TELEMETRY: Descent stage thermal foil and retroreflector array resolved at 0.4m/px.',
  },
  {
    id: 'tycho',
    code: 'ANOMALY-02',
    name: 'TYCHO CENTRAL PEAK',
    region: 'Southern Highlands (43.3° S)',
    lat: -43,
    lon: -11,
    requiredInstrument: 'inst_ir',
    instrumentName: 'Atmospheric IR Spectrometer',
    scienceYield: 110,
    summary: 'Young impact crater with bright ejecta rays and exposed deep-crustal anorthosite.',
    detailedScan: 'IR SPECTRAL SIGNATURE: Impact melt glass and hydroxyl (OH) absorption bands isolated along central uplift.',
  },
  {
    id: 'reiner_gamma',
    code: 'MAG-04',
    name: 'REINER GAMMA SWIRL',
    region: 'Oceanus Procellarum (7.5° N)',
    lat: 12,
    lon: -58,
    requiredInstrument: 'inst_mag',
    instrumentName: 'Fluxgate Magnetometer Boom',
    scienceYield: 130,
    summary: 'High-albedo lunar swirl co-located with a localized crustal magnetic anomaly.',
    detailedScan: 'MAGNETOMETER VECTOR: 38 nT mini-magnetosphere deflecting solar wind protons and shielding surface silicates from space weathering.',
  },
];