import { createClient } from '@/lib/supabase/client'
import type { GateEntry } from '@/components/dashboard/control-panel'

// ── Types ────────────────────────────────────────────────────

export type SavedCircuit = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  gates: GateEntry[]
}

export type RunHistoryEntry = {
  id: string
  gates: GateEntry[]
  alpha_real: number
  alpha_imag: number
  beta_real: number
  beta_imag: number
  result_theta: number
  result_phi: number
  created_at: string
}

// ── Saved Circuits ───────────────────────────────────────────

export async function saveCircuit(
  name: string,
  gates: GateEntry[],
  description?: string
): Promise<{ id: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: circuit, error: circuitError } = await supabase
    .from('saved_circuits')
    .insert({ user_id: user.id, name, description: description || null })
    .select('id')
    .single()

  if (circuitError || !circuit) return { error: circuitError?.message ?? 'Failed to save circuit' }

  if (gates.length > 0) {
    const steps = gates.map((g, i) => ({
      circuit_id: circuit.id,
      gate: g.name,
      is_custom: g.isCustom ?? false,
      step_order: i,
    }))

    const { error: stepsError } = await supabase
      .from('circuit_steps')
      .insert(steps)

    if (stepsError) return { error: stepsError.message }
  }

  return { id: circuit.id }
}

export async function loadCircuits(): Promise<SavedCircuit[]> {
  const supabase = createClient()

  const { data: circuits, error } = await supabase
    .from('saved_circuits')
    .select('id, name, description, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error || !circuits) return []

  const circuitIds = circuits.map((c) => c.id)
  if (circuitIds.length === 0) return []

  const { data: steps } = await supabase
    .from('circuit_steps')
    .select('circuit_id, gate, is_custom, step_order')
    .in('circuit_id', circuitIds)
    .order('step_order', { ascending: true })

  const stepsMap = new Map<string, GateEntry[]>()
  for (const s of steps ?? []) {
    const arr = stepsMap.get(s.circuit_id) ?? []
    arr.push({ name: s.gate, isCustom: s.is_custom ?? false })
    stepsMap.set(s.circuit_id, arr)
  }

  return circuits.map((c) => ({
    ...c,
    gates: stepsMap.get(c.id) ?? [],
  }))
}

export async function deleteCircuit(id: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { error } = await supabase.from('saved_circuits').delete().eq('id', id)
  return error ? { error: error.message } : {}
}

// ── Run History ──────────────────────────────────────────────

export async function saveRunHistory(entry: {
  gates: GateEntry[]
  alphaReal: number
  alphaImag: number
  betaReal: number
  betaImag: number
  resultTheta: number
  resultPhi: number
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('run_history').insert({
    user_id: user.id,
    gates: entry.gates,
    alpha_real: entry.alphaReal,
    alpha_imag: entry.alphaImag,
    beta_real: entry.betaReal,
    beta_imag: entry.betaImag,
    result_theta: entry.resultTheta,
    result_phi: entry.resultPhi,
  })
}

export async function loadRunHistory(): Promise<RunHistoryEntry[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('run_history')
    .select('id, gates, alpha_real, alpha_imag, beta_real, beta_imag, result_theta, result_phi, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !data) return []
  return data
}
