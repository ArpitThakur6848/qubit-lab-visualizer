# Architecture — QubitLab Visualizer

## High-Level Architecture

QubitLab is a **single Next.js application** with three external dependencies:

```
┌──────────────────────────────────────────────────────┐
│                    BROWSER                           │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ Bloch Sphere │  │ Gate Panel  │  │ State Display│ │
│  │ (R3F/Three)  │  │ (Buttons)   │  │ (Text/Math)  │ │
│  └──────┬───────┘  └──────┬──────┘  └──────┬───────┘ │
│         │                 │                │         │
│         └─────────┬───────┘────────────────┘         │
│                   │                                  │
│          ┌────────▼─────────┐                        │
│          │ Qubit State      │  ← Pure math, runs     │
│          │ Engine (lib/)    │    entirely in browser  │
│          └──────────────────┘                        │
│                                                      │
│          ┌──────────────────┐                        │
│          │ Supabase Client  │  ← Auth + data reads   │
│          │ (browser SDK)    │    via anon key + RLS   │
│          └────────┬─────────┘                        │
└───────────────────┼──────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌────▼────┐ ┌───▼──────┐
   │ Next.js │ │Supabase │ │ OpenAI   │
   │ API     │ │ (DB +   │ │ API      │
   │ Routes  │ │  Auth)  │ │          │
   └─────────┘ └─────────┘ └──────────┘
        │
   Hosted on AWS Amplify
```

There is no separate backend service. Next.js API routes handle server-side concerns (OpenAI calls, any server-side Supabase operations). Everything deploys as one unit.

---

## Layer Responsibilities

### Frontend (React + Next.js App Router)

- Renders the UI: Bloch sphere, gate buttons, state readout, AI chat panel
- Manages application state via React hooks (`useState`, `useReducer`)
- Calls the qubit state engine on every gate application
- Communicates with Supabase directly for auth and circuit CRUD (using the browser SDK)
- Calls Next.js API routes for OpenAI requests

### Visualization Layer (React Three Fiber)

- Renders a 3D Bloch sphere inside a `<Canvas>` component
- Draws the state vector as an arrow (or line) from the origin to the point on the sphere
- Draws axis labels (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩)
- Supports orbit controls so the user can rotate the view
- Receives (θ, φ) coordinates from the state engine and positions the arrow accordingly

### Qubit State Engine (`lib/qubit.ts`)

- Stores the qubit state as a 2-element complex vector: `[α, β]` where `|ψ⟩ = α|0⟩ + β|1⟩`
- Defines gate matrices as 2×2 complex arrays
- Applies a gate via matrix-vector multiplication
- Converts the state vector to Bloch sphere coordinates using:
  - `θ = 2 * arccos(|α|)`
  - `φ = arg(β) - arg(α)`
- Computes probabilities: `P(0) = |α|²`, `P(1) = |β|²`
- This is pure math — no React, no side effects, fully testable

### Database Layer (Supabase)

- **Auth**: Handles user registration, login, and session management
- **Database**: PostgreSQL with row-level security (RLS)
- **Tables**: `users` (managed by Supabase Auth), `saved_circuits`, `circuit_steps`
- The browser SDK talks directly to Supabase using the anon key; RLS policies ensure users can only access their own data

### AI Layer (OpenAI API)

- A Next.js API route (`/api/ai`) receives user questions and forwards them to OpenAI
- A system prompt scopes the assistant to quantum computing education
- The API route keeps the OpenAI key server-side (never exposed to the browser)
- Uses `gpt-3.5-turbo` for cost efficiency; upgradeable to `gpt-4` later

### Hosting (AWS Amplify)

- Deploys the Next.js app (supports SSR via App Router)
- Manages environment variables (`OPENAI_API_KEY`, Supabase keys)
- Auto-deploys on push to `main` branch
- Provides HTTPS and a default domain (custom domain optional)

---

## Data Flows

### Applying a Gate

```
User clicks "H" button
        │
        ▼
GatePanel component calls applyGate("H")
        │
        ▼
State engine multiplies H matrix × current state vector
        │
        ▼
New state [α', β'] is computed
        │
        ▼
State engine converts to (θ, φ) for Bloch sphere
        │
        ▼
React state updates → Bloch sphere re-renders with new arrow position
                     → State display re-renders with new amplitudes
                     → Gate history appends "H"
```

All of this happens client-side. No network calls. Instantaneous.

### Saving a Circuit

```
User clicks "Save Circuit"
        │
        ▼
Frontend collects: circuit name + ordered list of gate names
        │
        ▼
Supabase client inserts into `saved_circuits` table
  (user_id from auth session, name, created_at)
        │
        ▼
Supabase client inserts into `circuit_steps` table
  (one row per gate, with step_order)
        │
        ▼
RLS policy ensures user_id matches the authenticated user
        │
        ▼
UI confirms save
```

### Loading a Circuit

```
User selects a saved circuit from their list
        │
        ▼
Supabase client queries `saved_circuits` + `circuit_steps`
  (filtered by user_id via RLS)
        │
        ▼
Frontend resets qubit to |0⟩
        │
        ▼
Frontend replays each gate in order through the state engine
        │
        ▼
Bloch sphere and state display update to final state
```

### Asking the AI Explainer

```
User types: "What does the H gate do?"
        │
        ▼
Frontend POSTs to /api/ai with { message, currentState (optional) }
        │
        ▼
API route constructs messages array:
  - system: "You are a quantum computing tutor..."
  - user: the question + optional state context
        │
        ▼
API route calls OpenAI chat completions
        │
        ▼
Response streamed or returned to frontend
        │
        ▼
AI panel displays the explanation
```

---

## Where Each Service Fits

### Supabase

- **Why**: Provides auth, a PostgreSQL database, and RLS in one managed service — no backend to build
- **What it handles**: User accounts, saved circuit persistence
- **What it does NOT handle**: Qubit math, AI calls, 3D rendering

### OpenAI

- **Why**: Provides natural-language explanations of quantum concepts without building a knowledge base from scratch
- **What it handles**: Answering user questions about gates, states, and quantum concepts
- **What it does NOT handle**: Running simulations, storing data, rendering UI

### AWS Amplify

- **Why**: Simple deployment for Next.js apps with environment variable management and auto-deploy
- **What it handles**: Hosting, HTTPS, CI/CD on push
- **What it does NOT handle**: Database, auth, compute beyond serving the Next.js app
