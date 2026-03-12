# Frontend Documentation -- QubitLab Visualizer

Comprehensive reference for every frontend file, its purpose, and how the pieces connect.

---

## Tech Stack

| Concern | Package | Version |
|---------|---------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5 |
| React | React + ReactDOM | 19.2.3 || 3D Rendering | three + @react-three/fiber + @react-three/drei | latest || Styling | Tailwind CSS v4 | 4.x |
| Component library | shadcn/ui (new-york style) | latest |
| Primitives | radix-ui (unified package) | 1.4.3 |
| Icons | lucide-react | latest |
| Auth / DB | @supabase/supabase-js + @supabase/ssr | latest |
| Fonts | Geist Sans + Geist Mono (next/font/google) | -- |

---

## Folder Structure

```
my-app/
  app/
    layout.tsx                    # Root layout (dark mode, fonts, metadata)
    page.tsx                      # Landing page (redirect or placeholder)
    globals.css                   # Tailwind imports, dark mode CSS vars
    (auth)/
      actions.ts                  # Server actions: login, signup, signout
      login/
        page.tsx                  # Login page (server component)
      signup/
        page.tsx                  # Signup page (server component)
    auth/
      callback/
        route.ts                  # Auth callback (code exchange)
    dashboard/
      page.tsx                    # Dashboard page (server component, auth guard)
  components/
    ui/
      button.tsx                  # shadcn Button (CVA variants)
      dropdown-menu.tsx           # shadcn DropdownMenu (Radix)
    dashboard/
      top-bar.tsx                 # App header with account dropdown
      control-panel.tsx           # Left sidebar: state input, gates, sequence
      sphere-viewport.tsx         # Bloch sphere viewport with axis toggles + reset
      bloch-sphere.tsx            # 3D Bloch sphere (React Three Fiber)
      info-panel.tsx              # Status readout + notation toggle
      dashboard-shell.tsx         # Client wrapper managing shared state
  hooks/
    use-user.ts                   # useUser() hook (auth state listener)
  lib/
    utils.ts                      # cn() utility (clsx + tailwind-merge)
    qubit.ts                      # Qubit state engine (complex math, gates, Bloch coords)
    supabase/
      client.ts                   # createBrowserClient (client components)
      server.ts                   # createServerClient (server components)
      middleware.ts               # updateSession (middleware)
  middleware.ts                   # Next.js middleware (session refresh)
  supabase/
    schema.sql                    # SQL schema + RLS policies
  .env.example                    # Environment variable template
```

---

## Global Configuration

### Root Layout (`app/layout.tsx`)

- Sets `<html lang="en" className="dark">` to enable global dark mode
- Loads Geist Sans and Geist Mono fonts via `next/font/google`, applied as CSS variables
- Metadata: title "QubitLab Visualizer", description for SEO
- Body: applies font variables + `antialiased` class

### Global CSS (`app/globals.css`)

- Imports `shadcn/tailwind.css` and `tailwindcss`
- Defines dark mode variant: `@custom-variant dark (&:is(.dark *))`
- Sets oklch-based CSS custom properties for background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart colors, and sidebar colors under `.dark` class

### Middleware (`middleware.ts`)

- Runs on every request (matcher excludes `_next/static`, `_next/image`, `favicon.ico`)
- Calls `updateSession(request)` from `lib/supabase/middleware`
- Ensures Supabase auth cookies stay fresh across page navigations

---

## Auth System

### Server Actions (`app/(auth)/actions.ts`)

Three server actions using `createClient()` from `lib/supabase/server`:

| Action | Behavior |
|--------|----------|
| `login(formData)` | Calls `supabase.auth.signInWithPassword`, redirects to `/dashboard` on success, redirects to `/login?error=...` on failure |
| `signup(formData)` | Calls `supabase.auth.signUp`, redirects to `/login?message=Account created successfully` on success |
| `signout()` | Calls `supabase.auth.signOut`, redirects to `/login` |

### Login Page (`app/(auth)/login/page.tsx`)

- Async server component, receives `searchParams` for error/success messages
- Centered card layout on `bg-zinc-950` background
- Translucent card: `bg-zinc-900/50 backdrop-blur-md border-zinc-800/50 rounded-2xl`
- Input fields: `bg-zinc-800/50 border-zinc-700/50 rounded-lg text-zinc-100` with floating labels
- Error alert: red-tinted panel; success alert: emerald-tinted panel
- "Sign in" button (`bg-sky-600`), link to `/signup` at the bottom

### Signup Page (`app/(auth)/signup/page.tsx`)

- Same styling as login
- Fields: email, password, confirm password
- On success, redirects to login with success message (no "check your email" flow)
- Link to `/login` at the bottom

### Auth Callback (`app/auth/callback/route.ts`)

- GET handler that receives an auth code from email confirmation links
- Exchanges the code for a session via `supabase.auth.exchangeCodeForSession(code)`
- Redirects to the `next` URL parameter or `/` on success

### useUser Hook (`hooks/use-user.ts`)

- Client-side hook returning `{ user, loading }`
- On mount: calls `supabase.auth.getUser()` to get the current user
- Subscribes to `onAuthStateChange` events to update the user when sessions change
- Returns `null` user while loading

### Supabase Clients (`lib/supabase/`)

| File | Function | Usage |
|------|----------|-------|
| `client.ts` | `createClient()` | Client components (browser). Uses `createBrowserClient` from `@supabase/ssr` |
| `server.ts` | `createClient()` | Server components, server actions. Uses `createServerClient` with `cookies()` from `next/headers` for cookie get/set/remove |
| `middleware.ts` | `updateSession(request)` | Next.js middleware. Creates a server client that reads/writes cookies on the response, calls `supabase.auth.getUser()` to refresh the session |

---

## Dashboard

### Page (`app/dashboard/page.tsx`)

- Server component
- Creates a Supabase server client, calls `supabase.auth.getUser()`
- If no user: calls `redirect('/login')` (server-side redirect, never renders the page)
- If authenticated: renders `<DashboardShell email={user.email ?? ''} />`

### DashboardShell (`components/dashboard/dashboard-shell.tsx`)

The single client boundary for the entire dashboard. Owns all shared state.

**State:**
- `status: QubitStatus` - current qubit state readout (default: |0> with alpha=1+0i, beta=0+0i, N=1)
- `blochVector: [number, number, number]` - current state vector in scene coordinates (default: [0,1,0] = north pole)
- `notation: 'dirac' | 'matrix'` - selected notation display mode (default: `'dirac'`)

**`handleRun` callback:**
- Receives `{ alphaReal, alphaImag, betaReal, betaImag, gates }` from ControlPanel
- Calls `runCircuit()` from `lib/qubit.ts` to compute the full state after all gates
- Maps Bloch XYZ to scene coordinates (swaps Y/Z for Three.js Y-up convention)
- Updates both `status` and `blochVector` state, triggering InfoPanel and SphereViewport re-renders

**Layout:**
```
div.flex.h-screen.flex-col.bg-zinc-950.text-zinc-100
  TopBar
  div.flex.flex-1.gap-4.overflow-hidden.p-4
    ControlPanel
    div.flex.flex-1.flex-col.gap-4.overflow-hidden
      SphereViewport
      InfoPanel
```

### TopBar (`components/dashboard/top-bar.tsx`)

**Purpose:** App header with branding and user account controls.

**Structure:**
- Left: "QubitLab" text (`text-lg font-semibold`)
- Right: shadcn `DropdownMenu` with trigger showing user email + `User` icon (lucide-react)
- Dropdown items: "Profile" (placeholder), "Sign out" (calls `signout` server action via `useTransition`)

**Styling:**
- Header bar: `bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-3`
- Dropdown content: `bg-zinc-900 backdrop-blur-md rounded-xl border-zinc-800`

### ControlPanel (`components/dashboard/control-panel.tsx`)

**Purpose:** All quantum state input controls in a fixed-width left sidebar.

**Exports:**
- `GateEntry` type: `{ name: string; isCustom?: boolean }`
- `ControlPanel` component accepting `onRun: (data) => void`

**Sections (top to bottom):**

1. **Initial State** - Two `ComplexInput` subcomponents for alpha and beta
   - Each has "Re" (real) and "Im" (imaginary) number input fields
   - Defaults: alpha = 1+0i, beta = 0+0i
   - Monospace font, `bg-zinc-800/50` inputs

2. **Standard Gates** - 3-column grid of buttons: X, Y, Z, H, S, T
   - Clicking a gate appends a `GateEntry` to the sequence
   - Style: `bg-zinc-700/30 hover:bg-zinc-600/40 rounded-xl`

3. **Custom Gate** - Build a rotation gate from axis + angle
   - Axis toggle: three buttons (X, Y, Z) with `bg-sky-600` active state
   - Angle input: degrees, number type
   - Unitary indicator: green `Check` icon if angle is a non-zero number, red `X` icon otherwise
   - "Add Gate" button appends `R_{axis}(angle)` to the sequence

4. **Gate Sequence** - Conditional list of queued gates
   - Each gate shown as a tag with name + `Trash2` icon for removal
   - Only renders when gates.length > 0
   - `bg-zinc-800/40 rounded-lg` tags

5. **Run Button** - Pinned at bottom of the sidebar
   - `bg-sky-600 hover:bg-sky-500 rounded-2xl` with `Play` icon
   - Fires `onRun` with all state input values and the gate sequence

**Layout:** `w-72 flex flex-col gap-4 overflow-hidden` with scrollable inner section

### SphereViewport (`components/dashboard/sphere-viewport.tsx`)

**Purpose:** Container for the 3D Bloch sphere with overlay controls.

**Props:**
- `blochVector: [number, number, number]` - the qubit state vector in scene coordinates

**Features:**
- Dynamically imports the `BlochSphere` R3F component with `ssr: false` (Three.js cannot run on the server)
- Suspense fallback shows "Loading sphere..." while the 3D canvas initializes
- Overlay controls positioned absolutely over the canvas:
  - **Axis toggles** (top-left): Three buttons (X, Y, Z) to show/hide each axis. Labels colors match axis colors (red/green/blue)
  - **Reset button** (top-right): `RotateCcw` icon, calls `controls.reset()` to return camera to default orientation
- Holds a `controlsRef` passed down to `BlochSphere` for programmatic camera reset
- `flex-1` to fill all available vertical space

### BlochSphere (`components/dashboard/bloch-sphere.tsx`)

**Purpose:** The 3D Bloch sphere rendered with React Three Fiber.

**Props:**
- `blochVector: [number, number, number]` - state vector position on the unit sphere
- `showXAxis`, `showYAxis`, `showZAxis: boolean` - toggle axis visibility
- `controlsRef` - ref to OrbitControls for programmatic reset

**3D Scene contents:**
- **Lighting**: Ambient light (0.6) + two directional lights for even illumination
- **OrbitControls**: Full rotation, zoom (min 2, max 6 distance), no panning
- **Transparent sphere**: 48-segment sphere geometry, zinc-700 color, 12% opacity, double-sided
- **Wireframe rings**: Three great-circle rings (equator XZ, longitude XY, longitude YZ) drawn with `Line` from drei
- **Axes** (conditionally rendered):
  - X axis (red): Labels |+> and |-> at tips
  - Y axis (green): Labels |+i> and |-i> at tips
  - Z axis (blue): Labels |0> and |1> at tips (north/south poles)
  - Each axis extends 1.35 sphere radii, labels at 1.5 radii
- **State vector arrow**: Sky blue (#38bdf8) cylinder shaft + cone arrowhead + glowing tip dot
  - Arrow computed via quaternion rotation from +Y to target direction
  - Emissive material for visibility against dark background
- **Origin dot**: Small zinc sphere at the center

**Coordinate mapping:**
- Bloch sphere math uses standard physics convention: Z = up (|0> at north)
- Three.js uses Y = up convention
- Mapping: Bloch X -> scene X, Bloch Z -> scene Y (up), Bloch Y -> scene Z

**Sub-components:**
- `WireframeSphere` - transparent sphere + equator/longitude rings
- `EquatorRing` - parametric circle in XY, XZ, or YZ plane
- `Axis` - line + two labels (positive and negative)
- `AxisLabel` - HTML overlay via drei's `<Html>` component
- `StateVectorArrow` - shaft cylinder + cone arrowhead + tip sphere
- `BlochSphereContent` - all scene children (separated for Canvas context)

### InfoPanel (`components/dashboard/info-panel.tsx`)

**Purpose:** Displays computed qubit status and notation.

**Exports:**
- `QubitStatus` type: `{ alpha, beta (each { real, imag }), theta, phi, phase, n, entangled }`
- `InfoPanel` component accepting `status`, `notation`, `onNotationChange`

**Sub-sections:**

1. **Status Panel** (left column)
   - Rows: alpha, beta (formatted complex), theta (degrees), phi (degrees), Phase, N (normalization), Entangled (Yes/No)
   - Uses `StatusRow` subcomponent for consistent key-value display
   - `formatComplex()` helper: handles zero parts, signs, edge cases

2. **Notation Panel** (right column)
   - Toggle: two buttons for Dirac / Matrix, active state highlighted with `bg-zinc-700/50`
   - **Dirac display** (`DiracNotation` subcomponent): Shows `|psi> = alpha|0> + beta|1>`, with special formatting when values are exactly 0 or 1
   - **Matrix display** (`MatrixNotation` subcomponent): Shows column vector with CSS-styled brackets (`border-l-2 border-r-2 border-zinc-400`)

**Layout:** Two-column grid with consistent panel styling

---

## Shared Types

### GateEntry

```typescript
type GateEntry = {
  name: string       // e.g. "X", "H", "Ry(45)"
  isCustom?: boolean // true for user-defined rotation gates
}
```

### QubitStatus

```typescript
type QubitStatus = {
  alpha: { real: number; imag: number }
  beta: { real: number; imag: number }
  theta: number      // polar angle in radians
  phi: number        // azimuthal angle in radians
  phase: number      // global phase
  n: number          // normalization factor
  entangled: boolean
}
```

---

## Styling Conventions

All components follow these rules consistently:

| Element | Classes |
|---------|---------|
| Panel container | `rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md p-4` |
| Section header | `text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3` |
| Input field | `rounded-lg border-zinc-700/50 bg-zinc-800/50 text-zinc-100 font-mono` |
| Primary button | `bg-sky-600 hover:bg-sky-500 text-white rounded-2xl` |
| Gate button | `bg-zinc-700/30 hover:bg-zinc-600/40 rounded-xl font-mono` |
| Dropdown | `bg-zinc-900 backdrop-blur-md rounded-xl border-zinc-800` |

**Hard rules:**
- No emojis (lucide-react icons only)
- No animations or transitions
- No gradients
- No em dashes in UI text
- Minimalistic, futuristic aesthetic
- Translucent panels with backdrop blur for depth

---

## Data Flow: Run Button

```
User fills alpha/beta inputs, adds gates, clicks "Run"
        |
        v
ControlPanel fires onRun({ alphaReal, alphaImag, betaReal, betaImag, gates })
        |
        v
DashboardShell.handleRun() receives data
        |
        v
Calls runCircuit() from lib/qubit.ts:
  1. Normalizes initial state [alpha, beta]
  2. For each gate in sequence:
     - Standard gates (X,Y,Z,H,S,T): looks up matrix in GATES
     - Custom gates (Rx/Ry/Rz): parses name, builds rotation matrix
     - Applies gate via matrix-vector multiplication
  3. Normalizes final state
  4. Computes Bloch coordinates (theta, phi) via stateToBloch()
  5. Converts to Cartesian (x,y,z) via blochToCartesian()
  6. Returns state, angles, phase, normalization, blochXYZ
        |
        v
DashboardShell maps Bloch coords -> scene coords:
  scene = [blochX, blochZ, blochY] (Y-up convention)
        |
        v
SphereViewport re-renders: arrow moves to new position on sphere
InfoPanel re-renders: amplitudes, angles, notation all update
```

---

## Qubit State Engine (`lib/qubit.ts`)

Pure math module with no React dependencies. Fully testable.

**Complex number operations:**
- `complexAdd`, `complexSub`, `complexMul` - arithmetic
- `complexMag`, `complexMagSq` - magnitude and magnitude squared
- `complexArg` - argument (phase angle)
- `complexConj` - conjugate
- `complexScale` - scalar multiplication
- `complexFromPolar` - construct from (r, theta)
- Constants: `COMPLEX_ZERO`, `COMPLEX_ONE`, `COMPLEX_I`, `COMPLEX_NEG_I`

**Gate matrices (2x2 complex):**
- Standard gates: X, Y, Z, H, S, T stored in `GATES` record
- `rotationGate(axis, angleDeg)` - constructs Rx, Ry, or Rz rotation matrix from axis and angle in degrees

**State operations:**
- `applyGate(state, gate)` - matrix-vector multiplication
- `normalize(state)` - normalizes to unit vector
- `normalization(state)` - computes norm of unnormalized state

**Bloch sphere coordinates:**
- `stateToBloch(state)` - converts [alpha, beta] to (theta, phi), handles edge cases
- `blochToCartesian(theta, phi)` - converts angles to (x, y, z) on unit sphere
- `globalPhase(state)` - arg(alpha)
- `probabilities(state)` - P(|0>), P(|1>)

**Pipeline:**
- `runCircuit(alpha, beta, gates)` - full pipeline: normalize, apply all gates, compute final Bloch coordinates. Returns `{ state, theta, phi, phase, n, blochXYZ }`

---

## What's Next

The Bloch sphere visualization and qubit state engine are complete. Remaining frontend work:

1. **Unit Tests** - Verify gate applications and coordinate conversions against known results
2. **Reset Button** - Add qubit state reset to |0> with sequence clear
3. **Save/Load UI** - Circuit persistence via Supabase (already have schema + RLS)
4. **Preset Examples** - Pre-built gate sequences for learning
5. **AI Chat Panel** - OpenAI-powered explainer
6. **Responsive Layout** - Adapt dashboard for smaller screens
