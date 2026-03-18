# Manual Testing — Phases 2–4 Completion

## Prerequisites

- Node.js installed
- `npm install` completed in `my-app/`
- Dev server running: `npm run dev` from `my-app/`
- Supabase project configured with valid `.env.local` credentials
- A test user account (create via `/signup` if needed)

---

## Test 1: Unit Tests (Phases 2 & 3 verification)

1. Open a terminal in `my-app/`
2. Run `npm test`
3. **Expected:** 61 tests pass across these groups:
   - Gate Applications (30 tests): X, Y, Z, H, S, T gates, compositions, rotations
   - Bloch Coordinate Conversion (17 tests): stateToBloch, blochToCartesian, end-to-end
   - Probabilities (5 tests)
   - runCircuit pipeline (5 tests)
   - Bloch sphere positioning (4 tests)

---

## Test 2: Reset Functionality

1. Navigate to `http://localhost:3000/login`
2. Log in with your test account credentials
3. You are redirected to `/dashboard`
4. In the **Control Panel** (left sidebar):
   - Change **α Re** to `0.707`, **α Im** to `0`
   - Change **β Re** to `0.707`, **β Im** to `0`
   - Click the **H** gate button to add it to the sequence
   - Click the **X** gate button to add it to the sequence
   - The **Sequence** section should show `H` and `X` tags
5. Click the **Run** button
   - **Expected:** The Bloch sphere arrow moves, status panel updates with new values
6. Click the **Reset** button (left of the Run button, with a rotate icon)
   - **Expected:**
     - α Re resets to `1`, α Im to `0`
     - β Re resets to `0`, β Im to `0`
     - Gate sequence is cleared (Sequence section disappears)
     - Bloch sphere arrow returns to the north pole (straight up)
     - Status panel shows: α = 1.000, β = 0.000, θ = 0.0°, φ = 0.0°

---

## Test 3: Responsive Layout

1. Open `http://localhost:3000/dashboard` in Chrome
2. Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
3. **Desktop (1920×1080):**
   - Control panel is on the left (fixed 288px width)
   - Bloch sphere fills the center
   - Info panels are in a 2-column grid at the bottom
4. **Tablet (768×1024, e.g. iPad):**
   - Layout should stack: control panel on top (full width), sphere below
   - Info panels stay in 2-column grid
5. **Mobile (375×667, e.g. iPhone SE):**
   - Control panel takes full width at the top
   - Sphere viewport is below the control panel
   - Info panels stack to 1 column
   - All controls remain usable — scrollable if content overflows
6. Resize the browser window gradually from wide to narrow
   - **Expected:** No content overflow, no horizontal scrollbar, no clipped buttons

---

## Test 4: Bloch Sphere Known State Positioning

1. On `/dashboard`, ensure α=1, β=0 (default |0⟩ state)
2. Click **Run** with no gates in the sequence
   - **Expected:** Arrow points straight UP (north pole = |0⟩)
3. Click **Reset**, then add the **X** gate, click **Run**
   - **Expected:** Arrow points straight DOWN (south pole = |1⟩)
4. Click **Reset**, then add the **H** gate, click **Run**
   - **Expected:** Arrow points to the equator in the +X direction (|+⟩ state)
   - Status shows θ ≈ 90.0°, φ ≈ 0.0°

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Tests fail with "vitest not found" | Run `npm install` to install dev dependencies |
| Login redirects back to login | Check `.env.local` has correct Supabase URL and anon key |
| Blank sphere viewport | Check browser console for WebGL errors; try a different browser |
| Reset button missing | Clear browser cache or hard-refresh (Ctrl+Shift+R) |
