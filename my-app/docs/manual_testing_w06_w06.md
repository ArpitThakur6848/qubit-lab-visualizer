# Phase 6 — Supabase Setup & Manual Testing

## Prerequisites

- Supabase project created with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Auth working (you can sign-up / sign-in)
- Dev server running: `npm run dev`

---

## Step 1: Run the Schema Migration

1. Open your **Supabase Dashboard** → **SQL Editor**
2. If you already have the `saved_circuits` and `circuit_steps` tables from Phase 5, run **only** the new additions below. Otherwise, run the full `supabase/schema.sql`.

**If tables already exist, run this incremental migration:**

```sql
-- Add is_custom column to circuit_steps (skip if table doesn't exist yet)
ALTER TABLE public.circuit_steps
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false;

-- Create run_history table
CREATE TABLE IF NOT EXISTS public.run_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gates jsonb NOT NULL DEFAULT '[]'::jsonb,
  alpha_real double precision NOT NULL DEFAULT 0,
  alpha_imag double precision NOT NULL DEFAULT 0,
  beta_real double precision NOT NULL DEFAULT 0,
  beta_imag double precision NOT NULL DEFAULT 0,
  result_theta double precision NOT NULL DEFAULT 0,
  result_phi double precision NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_run_history_user
  ON public.run_history (user_id, created_at DESC);

ALTER TABLE public.run_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own run history"
  ON public.run_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own run history"
  ON public.run_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

3. Click **Run** and verify "Success. No rows returned."

---

## Step 2: Verify Tables Exist

1. In Supabase Dashboard → **Table Editor**
2. Confirm these tables exist:
   - `profiles`
   - `saved_circuits`
   - `circuit_steps` (should now have an `is_custom` column)
   - `run_history` (new)
3. Click `run_history` → verify columns: `id`, `user_id`, `gates`, `alpha_real`, `alpha_imag`, `beta_real`, `beta_imag`, `result_theta`, `result_phi`, `created_at`

---

## Manual Testing

### Test 1: Navbar Tabs

1. Navigate to `http://localhost:3000/login`
2. Log in with your test account
3. You should land on `http://localhost:3000/dashboard`
4. **Expected:** The top bar shows "QubitLab" logo followed by two tabs: **Dashboard** (active/highlighted) and **Run History**
5. Click **Run History** tab
6. **Expected:** The main content switches to the Run History view (shows "No runs yet" message if empty). The Bloch sphere and controls are hidden.
7. Click **Dashboard** tab
8. **Expected:** The Bloch sphere, control panel, and info panel return

### Test 2: Save a Circuit

1. On the Dashboard tab, in the **Gates** panel, click **H** then **X** to add two gates
2. A **Sequence** panel should appear showing `H` and `X` tags
3. Click the **Save** button (floppy disk icon) next to the Sequence header
4. A dialog should appear titled "Save Circuit" showing the gate tags
5. Type a name like "Test Circuit 1" and press Enter or click **Save**
6. **Expected:** The dialog closes

### Test 3: Open Saved Circuits Panel

1. On the Dashboard tab, click the **Saved Circuits** button at the bottom of the left sidebar
2. **Expected:** The entire left sidebar is replaced by the Saved Circuits panel, showing a **← back arrow**, "Saved Circuits" title, and the list of saved circuits
3. **Expected:** "Test Circuit 1" appears with `H` `X` gate tags
4. Hover over the circuit — a red trash icon should appear on the right

### Test 4: Load a Saved Circuit (auto-navigates back)

1. While in the Saved Circuits panel, click on "Test Circuit 1"
2. **Expected:** The view automatically navigates back to the main control panel, and the gate sequence in the **Sequence** panel shows `H` `X`

### Test 5: Delete a Saved Circuit

1. Save another circuit (e.g., add `Y` `Z` gates, save as "Test Circuit 2")
2. Click **Saved Circuits** button to open the panel
3. **Expected:** You see 2 circuits
4. Hover over "Test Circuit 2" and click the trash icon
5. **Expected:** "Test Circuit 2" disappears, count badge shows "1"
6. Click the **← back arrow** to go back to the control panel

### Test 6: Run History Recording

1. Back on Dashboard tab, clear the sequence (**Reset**), then add gate: **H**
2. Click **Run**
3. **Expected:** The Bloch sphere moves, status updates
4. Click the **Run History** tab in the top navbar
5. **Expected:** You see one entry with `H` tag, θ and φ values, and "just now" timestamp

### Test 7: Run History Shows Last 10

1. Switch back to **Dashboard** tab
2. Perform several more Runs with different gate combos (e.g., X, then Y, then H+Z)
3. Switch to **Run History** tab each time
4. **Expected:** New runs appear at the top, timestamps update, max 10 entries shown

### Test 8: Load from Run History (switches to Dashboard)

1. On the **Run History** tab, click any history entry
2. **Expected:** The app automatically switches to the **Dashboard** tab, and the gates from that run are loaded into the **Sequence** panel

### Test 9: Custom Gate Persistence

1. On Dashboard, set Rotation Axis to **Y**, Angle to **45**, click **Add Gate**
2. You should see `Ry(45)` in sky-blue in the Sequence
3. Add another standard gate like **H**
4. Save as "Custom Combo"
5. Reset, open **Saved Circuits**, click "Custom Combo"
6. **Expected:** Auto-navigates back. Sequence shows `Ry(45)` (sky-blue) and `H` (gray) correctly

### Test 10: Per-User Isolation

1. Sign out (top-right dropdown → Sign Out)
2. Sign in with a **different** test account
3. Click **Saved Circuits** button
4. **Expected:** No saved circuits (empty message)
5. Click **Run History** tab
6. **Expected:** No runs (empty message)

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Not authenticated" error when saving | Check that you're logged in; verify Supabase env vars in `.env.local` |
| Save succeeds but circuits don't appear | Expand the Saved Circuits panel; check Supabase Table Editor for data |
| Run History not recording | Check browser console for Supabase errors; verify `run_history` table + RLS policies exist |
| RLS policy errors (403/row-level security) | Re-run the SQL migration; ensure all policies are created |
| `is_custom` column missing error | Run `ALTER TABLE public.circuit_steps ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false;` |
