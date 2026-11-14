export interface LaunchSite {
  id: string;
  code: string;
  name: string;
  agency: string;
  lat: number;
  lon: number;
  inclinationRange: string;
  fuelBonusPercent: number;
  summary: string;
}

export const EARTH_LAUNCH_SITES: LaunchSite[] = [
  {
    id: 'ksc',
    code: 'LC-39A',
    name: 'Kennedy Space Center',
    agency: 'NASA // USA',
    lat: 28.5729,
    lon: -80.649,
    inclinationRange: '28.5° – 57°',
    fuelBonusPercent: 6,
    summary: 'Primary coastal heavy-lift complex with eastward Atlantic launch corridor.',
  },
  {
    id: 'kourou',
    code: 'ELA-4',
    name: 'Guiana Space Centre (Kourou)',
    agency: 'ESA / CNES // FRENCH GUIANA',
    lat: 5.236,
    lon: -52.768,
    inclinationRange: '5.2° – 100°',
    fuelBonusPercent: 12,
    summary: 'Near-equatorial spaceport maximizing Earth rotational velocity for GTO and lunar transfers.',
  },
  {
    id: 'vandenberg',
    code: 'SLC-4E',
    name: 'Vandenberg Space Force Base',
    agency: 'USSF / NASA // CALIFORNIA',
    lat: 34.742,
    lon: -120.5724,
    inclinationRange: '70° – 104° (POLAR / SSO)',
    fuelBonusPercent: 0,
    summary: 'Ideal for high-inclination polar and sun-synchronous Earth observation orbits.',
  },
  {
    id: 'baikonur',
    code: 'SITE-1',
    name: 'Baikonur Cosmodrome',
    agency: 'ROSCOSMOS // KAZAKHSTAN',
    lat: 45.9646,
    lon: 63.3052,
    inclinationRange: '51.6° – 99°',
    fuelBonusPercent: 2,
    summary: 'Historic high-latitude continental launch complex for heavy orbital insertions.',
  },
  {
    id: 'tanegashima',
    code: 'LA-Y1',
    name: 'Tanegashima Space Center',
    agency: 'JAXA // JAPAN',
    lat: 30.3909,
    lon: 130.9681,
    inclinationRange: '30.4° – 98°',
    fuelBonusPercent: 5,
    summary: 'Pacific coastal launch facility supporting geostationary and lunar trajectories.',
  },
];