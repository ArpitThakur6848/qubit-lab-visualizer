# Project Scope — QubitLab Visualizer

## In-Scope for v1

These are the features that constitute a complete, demoable v1:

1. **Bloch Sphere Visualization** — Render a 3D Bloch sphere with a state vector arrow. The user can orbit/rotate the view. The sphere updates in real time when a gate is applied.

2. **Gate Controls** — Buttons for X, Y, Z, H, S, and T gates. Each click applies the corresponding unitary to the current qubit state. A "Reset" button returns the qubit to |0⟩.

3. **State Display Panel** — Show the current state as:
   - Amplitudes (α, β) with real and imaginary parts
   - Probabilities (|α|², |β|²)
   - Dirac notation (e.g., `0.707|0⟩ + 0.707|1⟩`)

4. **Gate History** — A scrollable list of gates applied in the current session, in order.

5. **Save & Load Circuits** — Authenticated users can save a gate sequence (with a name) to Supabase and reload it later.

6. **Authentication** — Supabase Auth with email/password. Optionally GitHub OAuth if time permits.

7. **AI Explainer** — A simple assistant panel where the user can ask "What does the H gate do?" or "Why is my qubit in this state?" Responses come from OpenAI's chat completions API, scoped with a system prompt to keep answers educational and concise.

8. **Preset Examples** — 3–5 pre-built gate sequences that demonstrate concepts like superposition, bit flip, phase flip, and T-gate rotation.

9. **Deployment** — The app is deployed and accessible via AWS Amplify with environment variables configured.

---

## Nice-to-Have (Post-v1)

These are real features worth building, but not required for the first working version:

- **Animated gate transitions** — Smooth rotation animation on the Bloch sphere when a gate is applied (instead of snapping to the new position)
- **Multi-qubit support** — Extend to 2 qubits; visualize entanglement (significant complexity increase)
- **Gate matrix preview** — Show the 2×2 unitary matrix for the selected gate before applying
- **Measurement simulation** — Simulate collapsing the qubit to |0⟩ or |1⟩ based on probabilities
- **Circuit diagram view** — Render the gate sequence as a standard quantum circuit diagram
- **Share circuits via URL** — Generate shareable links for saved circuits
- **Dark/light theme toggle**
- **Mobile-responsive layout**

---

## Explicitly Out of Scope

These will NOT be built. Listing them to prevent scope creep:

- **Multi-qubit entanglement** — Not in v1. The math and visualization complexity jumps significantly.
- **Custom gate definitions** — Users cannot define arbitrary unitaries. Only the six standard gates.
- **Quantum error simulation** — No noise models, decoherence, or error correction.
- **Backend compute engine** — All qubit math runs client-side. There is no server-side quantum simulation.
- **User-to-user social features** — No sharing between accounts, no public circuit gallery.
- **Microservices architecture** — This is a single Next.js app. No separate backend service.
- **Docker / containerization** — Not needed for a solo Next.js project deployed on Amplify.
- **ML / machine learning** — The OpenAI integration is a simple API call, not a trained model.

---

## Risks and Complexity Notes

| Area | Risk | Mitigation |
|---|---|---|
| React Three Fiber learning curve | R3F has a different mental model than regular React | Start with a minimal sphere + arrow, iterate from there |
| Complex number math | JS has no native complex type; easy to introduce subtle bugs | Write unit tests for the state engine early |
| Bloch sphere coordinate mapping | Converting (α, β) → (θ, φ) → 3D position requires careful math | Reference known formulas; test with known states (|0⟩, |1⟩, |+⟩, |−⟩) |
| OpenAI cost | GPT-4 calls can get expensive | Use GPT-3.5-turbo for v1; set max_tokens; rate-limit on the API route |
| Supabase RLS policies | Row-level security is easy to misconfigure | Keep the schema simple; test policies with the Supabase dashboard |
| Scope creep | Tempting to add multi-qubit, custom gates, etc. | Stick to this scope doc. Build v1 first. |

---

## What Should NOT Be Overengineered

- **State management** — React `useState` or `useReducer` is enough. No Redux, no Zustand, no global state library needed for a single-qubit app.
- **Database schema** — Two or three tables max. Don't normalize into 10 tables.
- **AI integration** — One API route, one system prompt, one model call. No chains, no agents, no vector databases.
- **Auth flow** — Supabase handles it. Don't build custom JWT logic.
- **Testing** — Unit tests for the qubit math engine are valuable. E2E tests for the full app are overkill for v1.
- **CI/CD** — Amplify handles builds on push. No need for custom GitHub Actions pipelines in v1.
- **Component library** — shadcn/ui provides the primitives. Don't build a custom design system.
