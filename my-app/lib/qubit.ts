// Qubit state engine - pure math, no React dependencies

export type Complex = { real: number; imag: number }
export type QubitState = [Complex, Complex] // [alpha, beta]

// ── Complex number operations ────────────────────────────────

export function complexAdd(a: Complex, b: Complex): Complex {
  return { real: a.real + b.real, imag: a.imag + b.imag }
}

export function complexSub(a: Complex, b: Complex): Complex {
  return { real: a.real - b.real, imag: a.imag - b.imag }
}

export function complexMul(a: Complex, b: Complex): Complex {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  }
}

export function complexMag(c: Complex): number {
  return Math.sqrt(c.real * c.real + c.imag * c.imag)
}

export function complexMagSq(c: Complex): number {
  return c.real * c.real + c.imag * c.imag
}

export function complexArg(c: Complex): number {
  return Math.atan2(c.imag, c.real)
}

export function complexConj(c: Complex): Complex {
  return { real: c.real, imag: -c.imag }
}

export function complexScale(c: Complex, s: number): Complex {
  return { real: c.real * s, imag: c.imag * s }
}

export function complexFromPolar(r: number, theta: number): Complex {
  return { real: r * Math.cos(theta), imag: r * Math.sin(theta) }
}

export const COMPLEX_ZERO: Complex = { real: 0, imag: 0 }
export const COMPLEX_ONE: Complex = { real: 1, imag: 0 }
export const COMPLEX_I: Complex = { real: 0, imag: 1 }
export const COMPLEX_NEG_I: Complex = { real: 0, imag: -1 }

// ── Gate matrices (2x2 complex) ──────────────────────────────
// Matrix layout: [[a, b], [c, d]] where row-major
export type GateMatrix = [[Complex, Complex], [Complex, Complex]]

const SQRT2_INV = 1 / Math.sqrt(2)
const T_PHASE: Complex = complexFromPolar(1, Math.PI / 4)

export const GATES: Record<string, GateMatrix> = {
  X: [
    [COMPLEX_ZERO, COMPLEX_ONE],
    [COMPLEX_ONE, COMPLEX_ZERO],
  ],
  Y: [
    [COMPLEX_ZERO, COMPLEX_NEG_I],
    [COMPLEX_I, COMPLEX_ZERO],
  ],
  Z: [
    [COMPLEX_ONE, COMPLEX_ZERO],
    [COMPLEX_ZERO, { real: -1, imag: 0 }],
  ],
  H: [
    [
      { real: SQRT2_INV, imag: 0 },
      { real: SQRT2_INV, imag: 0 },
    ],
    [
      { real: SQRT2_INV, imag: 0 },
      { real: -SQRT2_INV, imag: 0 },
    ],
  ],
  S: [
    [COMPLEX_ONE, COMPLEX_ZERO],
    [COMPLEX_ZERO, COMPLEX_I],
  ],
  T: [
    [COMPLEX_ONE, COMPLEX_ZERO],
    [COMPLEX_ZERO, T_PHASE],
  ],
}

// ── Rotation gate construction ───────────────────────────────

export function rotationGate(axis: 'X' | 'Y' | 'Z', angleDeg: number): GateMatrix {
  const theta = (angleDeg * Math.PI) / 180
  const cosHalf = Math.cos(theta / 2)
  const sinHalf = Math.sin(theta / 2)

  switch (axis) {
    case 'X':
      return [
        [{ real: cosHalf, imag: 0 }, { real: 0, imag: -sinHalf }],
        [{ real: 0, imag: -sinHalf }, { real: cosHalf, imag: 0 }],
      ]
    case 'Y':
      return [
        [{ real: cosHalf, imag: 0 }, { real: -sinHalf, imag: 0 }],
        [{ real: sinHalf, imag: 0 }, { real: cosHalf, imag: 0 }],
      ]
    case 'Z':
      return [
        [complexFromPolar(1, -theta / 2), COMPLEX_ZERO],
        [COMPLEX_ZERO, complexFromPolar(1, theta / 2)],
      ]
  }
}

// ── State operations ─────────────────────────────────────────

export function applyGate(state: QubitState, gate: GateMatrix): QubitState {
  const [alpha, beta] = state
  const newAlpha = complexAdd(complexMul(gate[0][0], alpha), complexMul(gate[0][1], beta))
  const newBeta = complexAdd(complexMul(gate[1][0], alpha), complexMul(gate[1][1], beta))
  return [newAlpha, newBeta]
}

export function normalize(state: QubitState): QubitState {
  const [alpha, beta] = state
  const norm = Math.sqrt(complexMagSq(alpha) + complexMagSq(beta))
  if (norm === 0) return [COMPLEX_ONE, COMPLEX_ZERO]
  return [complexScale(alpha, 1 / norm), complexScale(beta, 1 / norm)]
}

export function normalization(state: QubitState): number {
  return Math.sqrt(complexMagSq(state[0]) + complexMagSq(state[1]))
}

// ── Bloch sphere coordinates ─────────────────────────────────

export function stateToBloch(state: QubitState): { theta: number; phi: number } {
  const [alpha, beta] = state
  const alphaMag = complexMag(alpha)

  // theta = 2 * arccos(|alpha|), clamped for numerical safety
  const theta = 2 * Math.acos(Math.min(1, Math.max(0, alphaMag)))

  // phi = arg(beta) - arg(alpha)
  let phi = complexArg(beta) - complexArg(alpha)

  // Normalize phi to [-pi, pi]
  while (phi > Math.PI) phi -= 2 * Math.PI
  while (phi < -Math.PI) phi += 2 * Math.PI

  return { theta, phi }
}

export function blochToCartesian(theta: number, phi: number): [number, number, number] {
  const x = Math.sin(theta) * Math.cos(phi)
  const y = Math.sin(theta) * Math.sin(phi)
  const z = Math.cos(theta)
  return [x, y, z]
}

export function globalPhase(state: QubitState): number {
  return complexArg(state[0])
}

export function probabilities(state: QubitState): { p0: number; p1: number } {
  return {
    p0: complexMagSq(state[0]),
    p1: complexMagSq(state[1]),
  }
}

// ── Pipeline: run a full gate sequence from initial state ────

export function runCircuit(
  initialAlpha: Complex,
  initialBeta: Complex,
  gateNames: { name: string; isCustom?: boolean }[]
): {
  state: QubitState
  theta: number
  phi: number
  phase: number
  n: number
  blochXYZ: [number, number, number]
} {
  let state: QubitState = normalize([initialAlpha, initialBeta])
  const n = normalization([initialAlpha, initialBeta])

  for (const entry of gateNames) {
    let gate: GateMatrix | undefined

    if (entry.isCustom) {
      // Parse "Rx(45)" or "Ry(90)" etc.
      const match = entry.name.match(/^R([xyz])\((-?\d+(?:\.\d+)?)\)$/i)
      if (match) {
        const axis = match[1].toUpperCase() as 'X' | 'Y' | 'Z'
        const angle = parseFloat(match[2])
        gate = rotationGate(axis, angle)
      }
    } else {
      gate = GATES[entry.name]
    }

    if (gate) {
      state = applyGate(state, gate)
    }
  }

  // Normalize after all gates (should already be unitary, safety check)
  state = normalize(state)
  const { theta, phi } = stateToBloch(state)
  const phase = globalPhase(state)
  const blochXYZ = blochToCartesian(theta, phi)

  return { state, theta, phi, phase, n, blochXYZ }
}
