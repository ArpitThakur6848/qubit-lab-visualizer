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
- The frontend uses `@supabase/supabase-js` to manage auth state
- Protected routes/features check for an active session before allowing save/load
- Unauthenticated users can still use the Bloch sphere and gates — they just can't save
