# Progress & Roadmap — QubitLab Visualizer

Track what's done and what's next. Check off items as they're completed.

---

## Phase 1: Project Foundation

- [x] Initialize Next.js project with App Router
- [x] Set up Tailwind CSS v4
- [x] Install and configure shadcn/ui
- [x] Create project documentation (README, scope, architecture, features)
- [x] Set up folder structure (`components/`, `lib/`, `hooks/`, `types/`)
- [x] Configure path aliases (`@/components`, `@/lib`, etc.)
- [x] Create `.env.local` with placeholder values
- [x] Add `.env.example` to repo (without secrets)

## Phase 2: Qubit State Engine

- [x] Define complex number utility functions (add, multiply, magnitude, argument)
- [x] Define qubit state type (`[Complex, Complex]`)
- [x] Implement gate matrices (X, Y, Z, H, S, T)
- [x] Implement matrix-vector multiplication for gate application
- [x] Implement state-to-Bloch-coordinates conversion (θ, φ)
- [x] Implement probability calculation
- [x] Implement Dirac notation string formatting
- [x] Implement rotation gate construction (Rx, Ry, Rz from axis + angle)
- [x] Implement full circuit runner pipeline (initial state + gate sequence)
- [ ] Write unit tests for all gate applications against known results
- [ ] Write unit tests for coordinate conversion (|0⟩, |1⟩, |+⟩, |−⟩)

## Phase 3: Bloch Sphere Visualization

- [x] Install React Three Fiber and Three.js (`@react-three/fiber`, `@react-three/drei`)
- [x] Create a basic `<Canvas>` with orbit controls
- [x] Render a semi-transparent sphere with wireframe rings (equator, longitude)
- [x] Draw X, Y, Z axes through the sphere (color-coded: red, green, blue)
- [x] Add axis labels (|0⟩, |1⟩, |+⟩, |-⟩, |+i⟩, |-i⟩)
- [x] Render the state vector arrow from origin to Bloch point (sky blue with arrowhead)
- [x] Connect the arrow position to the qubit state engine output
- [x] User can rotate/zoom the sphere freely with orbit controls
- [x] Reset camera button to return to default orientation
- [x] Toggle buttons for X, Y, Z axis visibility
- [x] Dynamic import with SSR disabled for Three.js compatibility
- [ ] Verify correct positioning for known states (|0⟩ = north, |1⟩ = south, |+⟩ = equator)

## Phase 4: Gate Controls & State Display (UI Shell)

- [x] Create gate button components (X, Y, Z, H, S, T)
- [x] Wire gate buttons to the state engine
- [x] Create state display component (amplitudes, Dirac/Matrix notation, Bloch angles)
- [x] Create gate sequence component (ordered list of applied gates with clear)
- [x] Create custom gate builder component (axis, angle, unitary check)
- [ ] Add "Reset" functionality (qubit state back to |0⟩, sequence cleared)
- [x] Layout the main page: sphere center, controls left, status bottom-right
- [x] Dark mode futuristic styling (translucent panels, rounded edges, zinc palette)
- [ ] Responsive layout adjustments for smaller screens

## Phase 5: Supabase Integration

- [x] Create a Supabase project
- [x] Set up Supabase SSR clients (`lib/supabase/client.ts`, `server.ts`, `middleware.ts`)
- [x] Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [x] Implement email/password authentication (sign up, sign in, sign out)
- [x] Add auth state management (`useUser` hook + middleware session refresh)
- [x] Define `saved_circuits` and `circuit_steps` tables in SQL schema
- [x] Define RLS policies in SQL schema (users can only access their own data)
- [ ] Build save circuit function (insert circuit + steps)
- [ ] Build load circuit list function (fetch user's circuits)
- [ ] Build load single circuit function (fetch steps, replay gates)
- [ ] Build delete circuit function
- [ ] Add UI for save/load/delete (modal or sidebar panel)

## Phase 5b: Auth UI

- [x] Create login page with dark futuristic styling
- [x] Create signup page with dark futuristic styling
- [x] Implement auth callback route for email confirmation
- [x] Add Next.js middleware for session refresh on every request
- [x] Signup redirects to login with success message (no "check email" page)
- [x] Login redirects to `/dashboard` on success
- [x] Sign out redirects to `/login`

## Phase 5c: Dashboard UI Shell

- [x] Create `DashboardShell` client component (shared state management)
- [x] Create `TopBar` component (app title, account dropdown with sign out)
- [x] Create `ControlPanel` component (state input, gates, custom gate, sequence, run)
- [x] Create `SphereViewport` placeholder component (for future 3D rendering)
- [x] Create `InfoPanel` component (status readout, Dirac/Matrix notation toggle)
- [x] Create `/dashboard` page with auth guard (server-side redirect if unauthenticated)
- [x] Enable global dark mode via `className="dark"` on `<html>` element
- [x] Install shadcn dropdown-menu component
- [x] TypeScript compilation verified (zero errors)

## Phase 6: Preset Learning Examples

- [ ] Define 3-5 preset gate sequences with descriptions
- [ ] Create preset selector component (dropdown or cards)
- [ ] Implement preset loading (reset then apply gates in sequence)
- [ ] Show a short explanation for each preset

## Phase 7: AI Explainer

- [ ] Create `/api/ai` route in Next.js
- [ ] Write the system prompt for the quantum computing tutor
- [ ] Implement OpenAI chat completions call with `max_tokens` cap
- [ ] Add basic rate limiting or request throttling
- [ ] Create chat panel component in the frontend
- [ ] Wire chat input to the API route
- [ ] Display AI responses in the panel
- [ ] Optionally pass current qubit state as context to the AI

## Phase 8: Polish & Deploy

- [ ] Review and clean up all components
- [ ] Ensure consistent styling across the app
- [ ] Add loading states and error handling for network calls
- [ ] Test auth flow end-to-end (sign up, save, sign out, sign in, load)
- [ ] Test AI explainer with various questions
- [ ] Set up AWS Amplify project
- [ ] Configure environment variables in Amplify
- [ ] Deploy to Amplify
- [ ] Verify production build works correctly
- [ ] Test deployed app end-to-end
- [ ] Update README with live URL

---

## Status Key

- `[x]` = Done
- `[ ]` = Not started

Update this file as work progresses. Each checkbox should be checked off individually when the task is verified complete.
