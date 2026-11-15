This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ABOUT THE PROJECT:

An interactive 3D spacecraft engineering and orbital mission planning simulator styled as an 80's retro Mission Control terminal. Players select an orbital regime, assemble a spacecraft from real-world aerospace subsystems within strict mass, power, and budget constraints, pass a  Flight Readiness Assessment, and launch into a 3D orbital simulation.

## Mission Flow

1. **Title & Teletype Briefing (`/`, `/briefing`)** — Retro terminal boot-up with Web Audio API sound effects and mission parameters.
2. **Orbital Regime Selection (`/orbits`)** — Interactive 3D Earth visualizer displaying **LEO (400 km)**, **GSO (35,786 km)**, and the **Sun-Earth L2 Point** with orbital mechanics specs and $\Delta v$ requirements.
3. **Vehicle Assembly Building (`/mission`)** — Two-stage spacecraft builder featuring a 3D interactive hull with 5 hardpoints (`HP-01` Power, `HP-02` Comms, `HP-03` ADCS, `HP-04` Payload, `HP-05` Launcher), real-time telemetry margins, an interactive VAB spotlight tour, and a Flight Readiness Assessment engine (evaluating binary launch gates, Mass Growth Allowance, TRL risk, End-of-Life power degradation, and ODMSP space debris mitigation).
4. **Orbital Simulation (`/simulation`)** — Real-time 3D launch ascent and orbital trajectory execution.

## Codebase Structure:

Main files:

```text
app/
├── page.tsx                        # Main CRT title screen & menu
├── briefing/page.tsx               # Animated teletype mission briefing
├── orbits/page.tsx                 # 3D orbital regime selector (LEO, GSO, L2)
├── mission/page.tsx                # Two-stage VAB spacecraft planner & readiness console
├── simulation/page.tsx             # 3D orbital flight & telemetry simulation
├── components/
│   ├── StarField.tsx               # Background starfield renderer
│   ├── mission/
│   │   ├── TelemetryHud.tsx        # Live mass, power, science & budget constraint bar
│   │   ├── StageObjective.tsx      # Scientific mandate selection cards
│   │   ├── InteractiveSpacecraftStage.tsx # 3D spacecraft hull with clickable hardpoint pins
│   │   ├── PartSideInspector.tsx   # Subsystem & booster configuration drawer
│   │   └── MissionHelpModal.tsx    # Stepped SVG arrow spotlight tutorial for the VAB
│   └── orbits/
│       └── OrbitGlobeViewer.tsx    # Interactive 3D Earth & orbital ring visualizer
├── data/
│   ├── missionData.ts              # Objectives, bus components, instruments & boosters
│   └── orbitData.ts                # LEO, GSO, and L2 orbital parameters & engineering impacts
├── lib/
│   ├── evaluateMission.ts          # Flight readiness gates, NASA efficiency scoring & rank engine
│   └── sound.ts                    # Web Audio API retro CRT synthesizer (clicks, blips, teletype)
└── types/
    └── mission.ts                  # TypeScript interfaces for objectives, hardware & telemetry
public/
└── models/                         # 3D GLTF/GLB assets (earth.glb, spaceship.glb)
```
