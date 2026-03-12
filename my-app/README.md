# QubitLab Visualizer

An interactive web app that visualizes single-qubit quantum states on a 3D Bloch sphere. You can observe the state of a qubit, apply quantum gates, and watch the state evolve in real time.

![Status](https://img.shields.io/badge/status-in%20development-yellow)

---

## Overview

QubitLab Visualizer is useful for conceptualizing abstract concepts. You can visually see a qubit vector rotate on a Bloch sphere when you apply an X gate, and see the resultant values that occur from it, such as the amplitudes.

The web app includes an AI explainer that can answer clarifying questions from the user.

## Features

- **3D Bloch Sphere** - Interactive, rotatable visualization of a single qubit state using React Three Fiber
- **Quantum Gate Controls** - Apply X, Y, Z, H, S, and T gates
- **State Display** - View amplitudes, probabilities, and Dirac notation
- **Preset Examples** - Pre-built sequences that demonstrate key quantum concepts (superposition, etc.)
- **Save & Load Circuits** - Persist gate sequences to Supabase so you can revisit or share them
- **AI Explainer** - Ask the built-in assistant clarifying questions 

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| 3D Rendering | React Three Fiber + Three.js |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| AI | OpenAI API (chat completions) |
| Hosting | AWS Amplify |


## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project (free tier works)
- An OpenAI API key

### Installation

```bash
git clone https://github.com/<your-username>/qubit-lab-visualizer.git
cd qubit-lab-visualizer/my-app
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
