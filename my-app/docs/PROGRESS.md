# Progress & Roadmap — QubitLab Visualizer

Track what's done and what's next. Check off items as they're completed.

---

## Phase 1: Project Foundation

- [x] Initialize Next.js project with App Router
- [x] Set up Tailwind CSS v4
- [x] Install and configure shadcn/ui
- [x] Create project documentation (README, scope, architecture, features)
- [ ] Set up folder structure (`components/`, `lib/`, `hooks/`, `types/`)
- [ ] Configure path aliases (`@/components`, `@/lib`, etc.)
- [ ] Create `.env.local` with placeholder values
- [ ] Add `.env.example` to repo (without secrets)

## Phase 2: Qubit State Engine

- [ ] Define complex number utility functions (add, multiply, magnitude, argument)
- [ ] Define qubit state type (`[Complex, Complex]`)
- [ ] Implement gate matrices (X, Y, Z, H, S, T)
- [ ] Implement matrix-vector multiplication for gate application
- [ ] Implement state-to-Bloch-coordinates conversion (θ, φ)
- [ ] Implement probability calculation
- [ ] Implement Dirac notation string formatting
- [ ] Write unit tests for all gate applications against known results
- [ ] Write unit tests for coordinate conversion (|0⟩, |1⟩, |+⟩, |−⟩)

## Phase 3: Bloch Sphere Visualization

- [ ] Install React Three Fiber and Three.js (`@react-three/fiber`, `@react-three/drei`)
- [ ] Create a basic `<Canvas>` with orbit controls
- [ ] Render a wireframe or semi-transparent sphere
- [ ] Draw X, Y, Z axes through the sphere
- [ ] Add axis labels (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩)
- [ ] Render the state vector arrow from origin to Bloch point
- [ ] Connect the arrow position to the qubit state engine output
- [ ] Verify correct positioning for known states (|0⟩ = north, |1⟩ = south, |+⟩ = equator)

## Phase 4: Gate Controls & State Display

- [ ] Create gate button components (X, Y, Z, H, S, T, Reset)
- [ ] Wire gate buttons to the state engine
- [ ] Create state display component (amplitudes, probabilities, Dirac notation)
- [ ] Create gate history component (ordered list of applied gates)
- [ ] Add "Reset" functionality (qubit → |0⟩, history → empty)
- [ ] Layout the main page: sphere on one side, controls + display on the other
- [ ] Basic styling and responsiveness

## Phase 5: Supabase Integration

- [ ] Create a Supabase project
- [ ] Set up Supabase client in `lib/supabase.ts`
- [ ] Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Implement email/password authentication (sign up, sign in, sign out)
- [ ] Add auth state management (session context or hook)
- [ ] Create `saved_circuits` and `circuit_steps` tables in Supabase
- [ ] Set up RLS policies (users can only access their own data)
- [ ] Build save circuit function (insert circuit + steps)
- [ ] Build load circuit list function (fetch user's circuits)
- [ ] Build load single circuit function (fetch steps, replay gates)
- [ ] Build delete circuit function
- [ ] Add UI for save/load/delete (modal or sidebar panel)

## Phase 6: Preset Learning Examples

- [ ] Define 3–5 preset gate sequences with descriptions
- [ ] Create preset selector component (dropdown or cards)
- [ ] Implement preset loading (reset → apply gates in sequence)
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
- [ ] Test auth flow end-to-end (sign up → save → sign out → sign in → load)
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
