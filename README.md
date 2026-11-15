## Getting Started

```bash
npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ABOUT THE PROJECT:

An interactive 3D spacecraft engineering and orbital mission planning simulator styled as an 80's retro Mission Control terminal. Players select an orbital regime, assemble a spacecraft from real-world aerospace subsystems within strict mass, power, and budget constraints, pass a  Flight Readiness Assessment, and launch into a 3D orbital simulation.

## Mission Flows

1. **Title & Teletype Briefing (`/`, `/briefing`)** — Retro terminal boot-up with Web Audio API sound effects and mission parameters.
2. **Orbital Regime Selection (`/orbits`)** — Interactive 3D Earth visualizer displaying **LEO (400 km)**, **GSO (35,786 km)**, and the **Sun-Earth L2 Point** with orbital mechanics specs and $\Delta v$ requirements.
3. **Vehicle Assembly Building (`/mission`)** — Two-stage spacecraft builder featuring a 3D interactive hull with 5 hardpoints (`HP-01` Power, `HP-02` Comms, `HP-03` ADCS, `HP-04` Payload, `HP-05` Launcher), real-time telemetry margins, an interactive VAB spotlight tour, and a Flight Readiness Assessment engine (evaluating binary launch gates, Mass Growth Allowance, TRL risk, End-of-Life power degradation, and ODMSP space debris mitigation).
4. **Orbital Simulation (`/simulation`)** — Real-time 3D launch ascent and orbital trajectory execution.Tech Stack & Tools Used

## Tech Stack & Tools Used

* **Framework:** [Next.js](https://nextjs.org/) (App Router & Turbopack)^^
* **Language:**[TypeScript](https://www.typescriptlang.org/)
* **UI & Styling:**[React](https://react.dev/) & [Tailwind CSS](https://tailwindcss.com/)
* **3D Rendering & WebGL:**[Three.js](https://threejs.org/),[React Three Fiber (`@react-three/fiber`)](https://docs.pmnd.rs/react-three-fiber), & [Drei (`@react-three/drei`)](https://github.com/pmndrs/drei)
* **Audio Engine:** Native browser **Web Audio API** (80s analog ambient synthesizer, CRT UI blips, and teletype briefing audio)
* **Tooling & Version Control:** Node.js, npm, Git

## License

This project is licensed under the  **GNU General Public License v3.0 (GPL-3.0)** .

You are free to run, study, share, and modify this software under the terms of the GPL-3.0 license. Any distributed derivative works must also be licensed under the GPL-3.0. See the [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html) for full details.
