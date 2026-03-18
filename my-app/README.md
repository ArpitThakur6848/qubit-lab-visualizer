# QubitLab Visualizer

An interactive web app that visualizes single-qubit quantum states on a 3D Bloch sphere. Apply quantum gates, observe state in real time, and ask an AI tutor to explain what you see.

![Status](https://img.shields.io/badge/status-deployed-brightgreen)

---
## Sign-In

Any email and password works for authentication.

## Overview

QubitLab Visualizer helps you conceptualize abstract quantum computing concepts. You can visually see a qubit vector rotate on a Bloch sphere when you apply gates like X, H, or custom rotations, and inspect the resulting amplitudes, probabilities, and Bloch angles.

The app includes:
- A 3D Bloch sphere rendered with React Three Fiber
- Standard gate controls (X, Y, Z, H, S, T) and custom rotation gates
- Save/load circuit sequences (persisted per user via Supabase)
- Run history tracking
- An AI explainer assistant powered by OpenAI

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| 3D Rendering | React Three Fiber + Three.js |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database & Auth | Supabase (PostgreSQL + Auth + RLS) |
| AI | OpenAI API (gpt-4o-mini) |
| Hosting | AWS Amplify |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)
- An OpenAI API key (optional, for AI assistant)

### Installation

```bash
git clone https://github.com/<your-username>/qubit-lab-visualizer.git
cd qubit-lab-visualizer/my-app
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key (needed for AI assistant)

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run Tests

```bash
npm test
```

## Deployment

The app is deployed on AWS Amplify. The `amplify.yml` build spec in the repo root configures the build pipeline. Environment variables are set in the Amplify console.

## Project Structure

```
my-app/
  app/           # Next.js App Router pages and API routes
  components/    # React components (dashboard/, ui/)
  lib/           # Qubit engine, Supabase clients, utilities
  hooks/         # React hooks (useUser)
  docs/          # Architecture, schema, features, progress docs
  supabase/      # SQL schema
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DB_SCHEMA.md)
- [Features](docs/FEATURES.md)
- [Progress](docs/PROGRESS.md)
