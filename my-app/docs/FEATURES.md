# Features — QubitLab Visualizer

## 1. Bloch Sphere Visualization

The centrepiece of the app. A 3D sphere rendered with React Three Fiber that represents all possible states of a single qubit.

**What the user sees:**
- A semi-transparent sphere with X, Y, and Z axes drawn through it
- Axis labels: |0⟩ (north pole), |1⟩ (south pole), |+⟩, |−⟩, |+i⟩, |−i⟩
- A colored arrow (state vector) pointing from the centre to a point on the sphere's surface
- Orbit controls — the user can click and drag to rotate the view, scroll to zoom

**How it works:**
- The qubit state `[α, β]` is converted to Bloch coordinates `(θ, φ)` using:
  - `θ = 2 × arccos(|α|)`
  - `φ = arg(β) − arg(α)`
- These angles map to a 3D point: `(sin θ cos φ, sin θ sin φ, cos θ)`
- The arrow is drawn from `(0, 0, 0)` to that point
- On gate application, the arrow moves to the new position

**Key decisions:**
- The sphere is decorative; the math lives in `lib/qubit.ts`, not in the 3D code
- Axis labels are rendered as Three.js text or HTML overlays — whichever looks cleaner

---

## 2. Gate Controls

A panel of buttons that apply standard single-qubit quantum gates.

**Supported gates (v1):**

| Gate | Matrix | Effect |
|------|--------|--------|
| X | `[[0,1],[1,0]]` | Bit flip — swaps |0⟩ and |1⟩ |
| Y | `[[0,−i],[i,0]]` | Bit + phase flip |
| Z | `[[1,0],[0,−1]]` | Phase flip — adds π phase to |1⟩ |
| H | `1/√2 [[1,1],[1,−1]]` | Creates equal superposition |
| S | `[[1,0],[0,i]]` | π/2 phase shift |
| T | `[[1,0],[0,e^(iπ/4)]]` | π/4 phase shift |

**UI behavior:**
- Each gate is a button (styled with shadcn/ui)
- Clicking a gate instantly applies it and updates the sphere + state display
- A "Reset" button sets the state back to |0⟩ = `[1, 0]`
- Buttons are always enabled — any gate can be applied to any state

**Implementation:**
- Each gate is a 2×2 complex matrix defined in `lib/qubit.ts`
- Applying a gate = multiplying the matrix by the current state vector
- The result is normalized (should already be unitary, but normalize as a safety check)

---

## 3. Qubit State Display

A panel that shows the current qubit state in multiple representations.

**Displayed information:**
- **Amplitudes**: α and β shown as complex numbers (e.g., `0.707 + 0.000i`)
- **Probabilities**: `P(|0⟩) = 50.0%`, `P(|1⟩) = 50.0%`
- **Dirac notation**: `0.707|0⟩ + 0.707|1⟩`
- **Bloch coordinates**: θ and φ values (in degrees or radians, with a toggle)

**UI behavior:**
- Updates in real time when a gate is applied
- Numbers are rounded to 3–4 decimal places for readability
- Probability values use a simple bar or visual indicator alongside the number

**Edge cases:**
- When the state is exactly |0⟩ or |1⟩, display it cleanly (not `1.000|0⟩ + 0.000|1⟩`)
- Handle global phase: two states that differ only by a global phase look the same on the Bloch sphere

---

## 4. Gate History

A log of every gate applied in the current session.

**What it shows:**
- An ordered list: `H → X → T → ...`
- The most recent gate is at the bottom (or top, depending on layout)
- A "Clear" button resets the history and the qubit state

**Why it matters:**
- Users need to see what sequence of operations led to the current state
- This list is what gets saved when the user saves a circuit

---

## 5. Preset Learning Examples

Pre-built gate sequences that demonstrate quantum concepts.

**Planned presets:**

| Preset | Gates | Concept |
|--------|-------|---------|
| Superposition | H | Equal superposition from |0⟩ |
| Bit Flip | X | Flipping |0⟩ to |1⟩ |
| Phase Flip | Z | Phase has no effect on |0⟩ — apply H first, then Z, to see it |
| H-Z-H Sequence | H → Z → H | Equivalent to X gate (demonstrates gate equivalences) |
| T Gate Rotation | T → T → T → T | Four T gates = one S gate (shows π/4 accumulation) |

**UI behavior:**
- A dropdown or sidebar with preset names
- Selecting a preset resets the qubit to |0⟩ and applies the gates in sequence
- The gate history populates accordingly
- A short description appears explaining what the preset demonstrates

---

## 6. Saved Circuits

Authenticated users can save and reload gate sequences.

**Save flow:**
1. User applies a sequence of gates
2. User clicks "Save" and enters a name (e.g., "My Superposition Demo")
3. The circuit (name + ordered gate list) is saved to Supabase under their user ID
4. Confirmation toast appears

**Load flow:**
1. User opens a "My Circuits" panel
2. A list of their saved circuits appears (name + date + gate count)
3. Selecting one resets the qubit to |0⟩ and replays the gates
4. The gate history populates with the loaded sequence

**Delete flow:**
- Users can delete their own saved circuits
- Confirmation dialog before deletion

**Constraints:**
- Users can only see and manage their own circuits (enforced by Supabase RLS)
- No sharing between users in v1

---

## 7. AI Explainer Assistant

A chat-style panel where users can ask questions about quantum computing concepts.

**What users can ask:**
- "What does the Hadamard gate do?"
- "Why is my qubit at the equator?"
- "What's the difference between S and T gates?"
- "Explain superposition"

**How it works:**
- User types a question in the chat panel
- The frontend sends the question (and optionally the current qubit state) to `/api/ai`
- The API route calls OpenAI's chat completions with a system prompt:
  ```
  You are a concise quantum computing tutor. Explain concepts clearly using
  simple language. When given a qubit state, relate your explanation to that
  specific state. Keep responses under 150 words.
  ```
- The response is displayed in the chat panel

**Guardrails:**
- The system prompt restricts the model to quantum computing education
- `max_tokens` is capped (e.g., 300) to keep costs and response length reasonable
- No conversation history is persisted — each question is independent (v1)
- Rate limiting on the API route prevents abuse

**What this is NOT:**
- Not a general chatbot
- Not a quantum simulator — it explains concepts, it doesn't compute states
- Not using embeddings, RAG, or fine-tuning — just a well-prompted API call

---

## 8. Authentication

Simple auth so users can save and retrieve their circuits.

**Supported methods (v1):**
- Email + password registration and login

**Optional (if time permits):**
- GitHub OAuth (since the target audience is developers)

**Implementation:**
- Supabase Auth handles everything: registration, login, session tokens, password reset
- Uses `@supabase/ssr` with server-side cookie-based sessions (not the browser-only SDK)
- `createBrowserClient` for client components, `createServerClient` for server components and middleware
- Next.js middleware refreshes the session on every request
- Auth callback route at `/auth/callback` handles email confirmation code exchange
- Protected routes check for an active session server-side before rendering
- Unauthenticated users are redirected to `/login`

**Auth flow:**
- Signup at `/signup` creates the account, then redirects to `/login?message=Account created successfully`
- Login at `/login` authenticates via Supabase, then redirects to `/dashboard`
- Sign out calls a server action, clears the session, and redirects to `/login`

**Auth pages:**
- Dark futuristic styling: `bg-zinc-950` background, translucent card (`bg-zinc-900/50 backdrop-blur-md`), rounded-2xl
- Error messages shown in tinted alert panels (red for errors, emerald for success)
- Links between login and signup pages for easy navigation

---

## 9. Dashboard UI Shell

The main application interface after login. A single-page layout with all quantum controls and readouts.

**Layout:**

```
 ┌──────────────────────────────────────────────────────────────┐
 │ TopBar: "QubitLab"                      [user@email ▾]      │
 ├────────────┬─────────────────────────────────────────────────┤
 │            │                                                 │
 │ Control    │         Bloch Sphere Viewport                   │
 │ Panel      │         (placeholder, flex-1)                   │
 │ (w-72)     │                                                 │
 │            │                                                 │
 │ - State    ├─────────────────────────────────────────────────┤
 │   Input    │                                                 │
 │ - Gates    │         Info Panel                              │
 │ - Custom   │         (status + notation toggle)              │
 │   Gate     │                                                 │
 │ - Sequence │                                                 │
 │ - Run      │                                                 │
 │            │                                                 │
 └────────────┴─────────────────────────────────────────────────┘
```

**TopBar (`components/dashboard/top-bar.tsx`):**
- Left: "QubitLab" title text
- Right: Account dropdown button showing user's email + User icon
- Dropdown menu items: Profile (placeholder), Sign out (calls server action)
- Uses shadcn DropdownMenu, styled with `bg-zinc-900 backdrop-blur-md` and `rounded-xl`

**ControlPanel (`components/dashboard/control-panel.tsx`):**
- Fixed 288px (w-72) sidebar on the left, scrollable content
- Sections separated by translucent panels with section headers (`text-xs uppercase tracking-wider text-zinc-500`)
- **Initial State**: Two ComplexInput subcomponents for alpha and beta amplitudes (each with real + imaginary fields, monospace font)
- **Standard Gates**: 3-column grid of gate buttons (X, Y, Z, H, S, T) styled with `bg-zinc-700/30 hover:bg-zinc-600/40`
- **Custom Gate**: Axis toggle (X/Y/Z buttons), angle input in degrees, unitary check indicator (green check or red X icon), "Add Gate" button
- **Gate Sequence**: Conditional display showing queued gate tags with individual clear buttons (Trash2 icon per gate)
- **Run Button**: Pinned at bottom, full width, `bg-sky-600 hover:bg-sky-500`, rounded-2xl, Play icon
- Exports `GateEntry` type: `{ name: string; isCustom?: boolean }`
- `onRun` callback passes `{ alphaReal, alphaImag, betaReal, betaImag, gates }` to the parent shell

**SphereViewport (`components/dashboard/sphere-viewport.tsx`):**
- Placeholder component that will house the React Three Fiber Bloch sphere in Phase 3
- Currently shows a Circle icon and "Bloch Sphere" label, centered in a translucent panel
- Uses `flex-1` to fill all available vertical space

**InfoPanel (`components/dashboard/info-panel.tsx`):**
- Two-column grid layout at the bottom-right of the dashboard
- **Status Panel**: Displays alpha, beta (formatted as complex numbers), theta, phi (in degrees), phase, normalization (N), and entangled boolean
- **Notation Panel**: Toggle between Dirac and Matrix representations
  - Dirac: Shows `|psi> = alpha|0> + beta|1>` with special formatting for pure basis states
  - Matrix: Shows column vector `[alpha, beta]^T` with CSS bracket styling
- Exports `QubitStatus` type with complex alpha/beta, theta, phi, phase, n, entangled fields
- `formatComplex()` helper for clean complex number display (omits zero parts, handles sign)

**DashboardShell (`components/dashboard/dashboard-shell.tsx`):**
- Client component (`'use client'`) that manages shared state across all dashboard panels
- Holds `QubitStatus` state (default: |0> state with alpha=1, beta=0)
- Holds notation mode state (`'dirac' | 'matrix'`)
- Provides `handleRun` callback: receives control panel data, computes normalization N, updates status
- Composes all sub-components: TopBar, ControlPanel, SphereViewport, InfoPanel
- Full-height layout: `h-screen flex flex-col bg-zinc-950`

**Dashboard Page (`app/dashboard/page.tsx`):**
- Server component with auth guard
- Uses `createClient` from `@/lib/supabase/server` to get the current user
- Redirects unauthenticated users to `/login` via `next/navigation` redirect
- Renders `DashboardShell` with the user's email passed as a prop

---

## 10. Design System

The app follows a consistent visual language across all pages.

**Color palette:**
- Background: `zinc-950` (near black)
- Surface panels: `zinc-900/60` with `backdrop-blur-md` (translucent, frosted glass effect)
- Borders: `zinc-800/50` (subtle, semi-transparent)
- Text primary: `zinc-100`
- Text secondary: `zinc-400` / `zinc-500`
- Accent: `sky-600` (buttons, active states)
- Danger: `red` tint for errors
- Success: `emerald` tint for success messages

**Component styling rules:**
- All panels: `rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md p-4`
- Section headers: `text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3`
- Input fields: `rounded-lg border-zinc-700/50 bg-zinc-800/50 text-zinc-100 font-mono`
- Buttons: `rounded-xl` or `rounded-2xl`, no gradients
- No emojis anywhere (lucide-react icons only)
- No animations or transitions
- No gradients
- No em dashes
- Geist Sans + Geist Mono fonts (loaded via next/font/google)
