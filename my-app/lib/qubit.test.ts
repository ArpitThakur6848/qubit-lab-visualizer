import { describe, it, expect } from 'vitest'
import {
  applyGate,
  normalize,
  stateToBloch,
  blochToCartesian,
  probabilities,
  runCircuit,
  GATES,
  rotationGate,
  COMPLEX_ONE,
  COMPLEX_ZERO,
  COMPLEX_I,
  COMPLEX_NEG_I,
  type QubitState,
  type Complex,
} from './qubit'

// ── Helpers ──────────────────────────────────────────────────

const SQRT2_INV = 1 / Math.sqrt(2)

/** Check two complex numbers are approximately equal */
function expectComplex(got: Complex, expected: Complex, tol = 1e-9) {
  expect(got.real).toBeCloseTo(expected.real, 8)
  expect(got.imag).toBeCloseTo(expected.imag, 8)
}

/** Check a qubit state matches expected values */
function expectState(got: QubitState, expectedAlpha: Complex, expectedBeta: Complex) {
  expectComplex(got[0], expectedAlpha)
  expectComplex(got[1], expectedBeta)
}

// Well-known basis states
const KET_0: QubitState = [COMPLEX_ONE, COMPLEX_ZERO]
const KET_1: QubitState = [COMPLEX_ZERO, COMPLEX_ONE]
const KET_PLUS: QubitState = [
  { real: SQRT2_INV, imag: 0 },
  { real: SQRT2_INV, imag: 0 },
]
const KET_MINUS: QubitState = [
  { real: SQRT2_INV, imag: 0 },
  { real: -SQRT2_INV, imag: 0 },
]
const KET_PLUS_I: QubitState = [
  { real: SQRT2_INV, imag: 0 },
  { real: 0, imag: SQRT2_INV },
]
const KET_MINUS_I: QubitState = [
  { real: SQRT2_INV, imag: 0 },
  { real: 0, imag: -SQRT2_INV },
]

// ── Gate Application Tests ───────────────────────────────────

describe('Gate Applications', () => {
  describe('X gate (bit flip)', () => {
    it('X|0⟩ = |1⟩', () => {
      const result = applyGate(KET_0, GATES.X)
      expectState(result, COMPLEX_ZERO, COMPLEX_ONE)
    })

    it('X|1⟩ = |0⟩', () => {
      const result = applyGate(KET_1, GATES.X)
      expectState(result, COMPLEX_ONE, COMPLEX_ZERO)
    })

    it('XX = Identity (X applied twice returns to original)', () => {
      const after1 = applyGate(KET_0, GATES.X)
      const after2 = applyGate(after1, GATES.X)
      expectState(after2, COMPLEX_ONE, COMPLEX_ZERO)
    })

    it('X|+⟩ = |+⟩ (eigenvector of X)', () => {
      const result = normalize(applyGate(KET_PLUS, GATES.X))
      expectState(result, { real: SQRT2_INV, imag: 0 }, { real: SQRT2_INV, imag: 0 })
    })
  })

  describe('Y gate (bit + phase flip)', () => {
    it('Y|0⟩ = i|1⟩', () => {
      const result = applyGate(KET_0, GATES.Y)
      expectState(result, COMPLEX_ZERO, COMPLEX_I)
    })

    it('Y|1⟩ = -i|0⟩', () => {
      const result = applyGate(KET_1, GATES.Y)
      expectState(result, COMPLEX_NEG_I, COMPLEX_ZERO)
    })

    it('YY = Identity', () => {
      const after1 = applyGate(KET_0, GATES.Y)
      const after2 = applyGate(after1, GATES.Y)
      // Y² = I for Pauli matrices, so YY|0⟩ = |0⟩
      expectComplex(after2[0], COMPLEX_ONE)
      expectComplex(after2[1], COMPLEX_ZERO)
    })
  })

  describe('Z gate (phase flip)', () => {
    it('Z|0⟩ = |0⟩ (no change to |0⟩)', () => {
      const result = applyGate(KET_0, GATES.Z)
      expectState(result, COMPLEX_ONE, COMPLEX_ZERO)
    })

    it('Z|1⟩ = -|1⟩', () => {
      const result = applyGate(KET_1, GATES.Z)
      expectState(result, COMPLEX_ZERO, { real: -1, imag: 0 })
    })

    it('Z|+⟩ = |−⟩', () => {
      const result = applyGate(KET_PLUS, GATES.Z)
      expectState(result, { real: SQRT2_INV, imag: 0 }, { real: -SQRT2_INV, imag: 0 })
    })

    it('ZZ = Identity', () => {
      const after1 = applyGate(KET_1, GATES.Z)
      const after2 = applyGate(after1, GATES.Z)
      expectState(after2, COMPLEX_ZERO, COMPLEX_ONE)
    })
  })

  describe('H gate (Hadamard)', () => {
    it('H|0⟩ = |+⟩', () => {
      const result = applyGate(KET_0, GATES.H)
      expectState(result, { real: SQRT2_INV, imag: 0 }, { real: SQRT2_INV, imag: 0 })
    })

    it('H|1⟩ = |−⟩', () => {
      const result = applyGate(KET_1, GATES.H)
      expectState(result, { real: SQRT2_INV, imag: 0 }, { real: -SQRT2_INV, imag: 0 })
    })

    it('HH = Identity', () => {
      const after1 = applyGate(KET_0, GATES.H)
      const after2 = applyGate(after1, GATES.H)
      expectState(after2, COMPLEX_ONE, COMPLEX_ZERO)
    })

    it('H|+⟩ = |0⟩', () => {
      const result = applyGate(KET_PLUS, GATES.H)
      expectComplex(result[0], COMPLEX_ONE)
      expectComplex(result[1], COMPLEX_ZERO)
    })
  })

  describe('S gate (π/2 phase)', () => {
    it('S|0⟩ = |0⟩', () => {
      const result = applyGate(KET_0, GATES.S)
      expectState(result, COMPLEX_ONE, COMPLEX_ZERO)
    })

    it('S|1⟩ = i|1⟩', () => {
      const result = applyGate(KET_1, GATES.S)
      expectState(result, COMPLEX_ZERO, COMPLEX_I)
    })

    it('SS = Z', () => {
      // SS|1⟩ should equal Z|1⟩ = -|1⟩
      const ss = applyGate(applyGate(KET_1, GATES.S), GATES.S)
      const z = applyGate(KET_1, GATES.Z)
      expectState(ss, z[0], z[1])
    })

    it('S|+⟩ = (1/√2)(|0⟩ + i|1⟩) = |+i⟩', () => {
      const result = applyGate(KET_PLUS, GATES.S)
      expectState(result, { real: SQRT2_INV, imag: 0 }, { real: 0, imag: SQRT2_INV })
    })
  })

  describe('T gate (π/4 phase)', () => {
    it('T|0⟩ = |0⟩', () => {
      const result = applyGate(KET_0, GATES.T)
      expectState(result, COMPLEX_ONE, COMPLEX_ZERO)
    })

    it('T|1⟩ = e^(iπ/4)|1⟩', () => {
      const result = applyGate(KET_1, GATES.T)
      expectComplex(result[0], COMPLEX_ZERO)
      expect(result[1].real).toBeCloseTo(Math.cos(Math.PI / 4), 8)
      expect(result[1].imag).toBeCloseTo(Math.sin(Math.PI / 4), 8)
    })

    it('TT = S', () => {
      // TT|1⟩ should equal S|1⟩ = i|1⟩
      const tt = applyGate(applyGate(KET_1, GATES.T), GATES.T)
      const s = applyGate(KET_1, GATES.S)
      expectComplex(tt[0], s[0])
      expectComplex(tt[1], s[1])
    })

    it('TTTT = Z (four T gates = Z)', () => {
      let state = KET_1 as QubitState
      for (let i = 0; i < 4; i++) state = applyGate(state, GATES.T)
      const z = applyGate(KET_1, GATES.Z)
      expectComplex(state[0], z[0])
      expectComplex(state[1], z[1])
    })
  })

  describe('Gate compositions', () => {
    it('HZH = X', () => {
      // HZH|0⟩ should equal X|0⟩ = |1⟩
      let state: QubitState = KET_0
      state = applyGate(state, GATES.H)
      state = applyGate(state, GATES.Z)
      state = applyGate(state, GATES.H)
      expectState(state, COMPLEX_ZERO, COMPLEX_ONE)
    })

    it('HXH = Z', () => {
      // HXH|+⟩ = Z|+⟩ = |−⟩
      let state: QubitState = KET_PLUS
      state = applyGate(state, GATES.H)
      state = applyGate(state, GATES.X)
      state = applyGate(state, GATES.H)
      const expected = applyGate(KET_PLUS, GATES.Z)
      expectState(state, expected[0], expected[1])
    })
  })

  describe('Rotation gates', () => {
    it('Rx(180°) ≈ -iX (same effect as X up to global phase)', () => {
      const rx180 = rotationGate('X', 180)
      const result = applyGate(KET_0, rx180)
      // Rx(π)|0⟩ = -i|1⟩
      expectComplex(result[0], COMPLEX_ZERO)
      expectComplex(result[1], { real: 0, imag: -1 })
    })

    it('Ry(180°) ≈ -iY (same visible effect as Y)', () => {
      const ry180 = rotationGate('Y', 180)
      const result = applyGate(KET_0, ry180)
      // Ry(π)|0⟩ = |1⟩
      expectComplex(result[0], COMPLEX_ZERO)
      expectComplex(result[1], COMPLEX_ONE)
    })

    it('Rz(180°) ≈ -iZ', () => {
      const rz180 = rotationGate('Z', 180)
      const result = applyGate(KET_1, rz180)
      // Rz(π)|1⟩ = ie^(iπ/2)|1⟩ = i|1⟩
      expectComplex(result[0], COMPLEX_ZERO)
      expectComplex(result[1], COMPLEX_I)
    })

    it('Rx(360°) = -I (global phase of -1)', () => {
      const rx360 = rotationGate('X', 360)
      const result = applyGate(KET_0, rx360)
      expectComplex(result[0], { real: -1, imag: 0 })
      expectComplex(result[1], COMPLEX_ZERO)
    })

    it('Ry(90°)|0⟩ puts state on equator', () => {
      const ry90 = rotationGate('Y', 90)
      const result = applyGate(KET_0, ry90)
      const probs = probabilities(result)
      expect(probs.p0).toBeCloseTo(0.5, 6)
      expect(probs.p1).toBeCloseTo(0.5, 6)
    })
  })
})

// ── Coordinate Conversion Tests ──────────────────────────────

describe('Bloch Coordinate Conversion', () => {
  describe('stateToBloch', () => {
    it('|0⟩ → θ=0 (north pole)', () => {
      const { theta, phi } = stateToBloch(KET_0)
      expect(theta).toBeCloseTo(0, 8)
      // phi is undefined when theta=0, any value is acceptable
    })

    it('|1⟩ → θ=π (south pole)', () => {
      const { theta } = stateToBloch(KET_1)
      expect(theta).toBeCloseTo(Math.PI, 8)
    })

    it('|+⟩ → θ=π/2, φ=0 (equator, +X)', () => {
      const { theta, phi } = stateToBloch(KET_PLUS)
      expect(theta).toBeCloseTo(Math.PI / 2, 8)
      expect(phi).toBeCloseTo(0, 8)
    })

    it('|−⟩ → θ=π/2, φ=π (equator, -X)', () => {
      const { theta, phi } = stateToBloch(KET_MINUS)
      expect(theta).toBeCloseTo(Math.PI / 2, 8)
      expect(Math.abs(phi)).toBeCloseTo(Math.PI, 8)
    })

    it('|+i⟩ → θ=π/2, φ=π/2 (equator, +Y)', () => {
      const { theta, phi } = stateToBloch(KET_PLUS_I)
      expect(theta).toBeCloseTo(Math.PI / 2, 8)
      expect(phi).toBeCloseTo(Math.PI / 2, 8)
    })

    it('|-i⟩ → θ=π/2, φ=-π/2 (equator, -Y)', () => {
      const { theta, phi } = stateToBloch(KET_MINUS_I)
      expect(theta).toBeCloseTo(Math.PI / 2, 8)
      expect(phi).toBeCloseTo(-Math.PI / 2, 8)
    })
  })

  describe('blochToCartesian', () => {
    it('North pole (θ=0) → (0, 0, 1)', () => {
      const [x, y, z] = blochToCartesian(0, 0)
      expect(x).toBeCloseTo(0, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(1, 8)
    })

    it('South pole (θ=π) → (0, 0, -1)', () => {
      const [x, y, z] = blochToCartesian(Math.PI, 0)
      expect(x).toBeCloseTo(0, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(-1, 8)
    })

    it('Equator +X (θ=π/2, φ=0) → (1, 0, 0)', () => {
      const [x, y, z] = blochToCartesian(Math.PI / 2, 0)
      expect(x).toBeCloseTo(1, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(0, 8)
    })

    it('Equator +Y (θ=π/2, φ=π/2) → (0, 1, 0)', () => {
      const [x, y, z] = blochToCartesian(Math.PI / 2, Math.PI / 2)
      expect(x).toBeCloseTo(0, 8)
      expect(y).toBeCloseTo(1, 8)
      expect(z).toBeCloseTo(0, 8)
    })

    it('Equator -X (θ=π/2, φ=π) → (-1, 0, 0)', () => {
      const [x, y, z] = blochToCartesian(Math.PI / 2, Math.PI)
      expect(x).toBeCloseTo(-1, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(0, 8)
    })
  })

  describe('End-to-end: state → Bloch → Cartesian', () => {
    it('|0⟩ → north pole (0, 0, 1)', () => {
      const { theta, phi } = stateToBloch(KET_0)
      const [x, y, z] = blochToCartesian(theta, phi)
      expect(x).toBeCloseTo(0, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(1, 8)
    })

    it('|1⟩ → south pole (0, 0, -1)', () => {
      const { theta, phi } = stateToBloch(KET_1)
      const [x, y, z] = blochToCartesian(theta, phi)
      expect(x).toBeCloseTo(0, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(-1, 8)
    })

    it('|+⟩ → equator +X (1, 0, 0)', () => {
      const { theta, phi } = stateToBloch(KET_PLUS)
      const [x, y, z] = blochToCartesian(theta, phi)
      expect(x).toBeCloseTo(1, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(0, 8)
    })

    it('|−⟩ → equator -X (-1, 0, 0)', () => {
      const { theta, phi } = stateToBloch(KET_MINUS)
      const [x, y, z] = blochToCartesian(theta, phi)
      expect(x).toBeCloseTo(-1, 8)
      expect(y).toBeCloseTo(0, 8)
      expect(z).toBeCloseTo(0, 8)
    })

    it('|+i⟩ → equator +Y (0, 1, 0)', () => {
      const { theta, phi } = stateToBloch(KET_PLUS_I)
      const [x, y, z] = blochToCartesian(theta, phi)
      expect(x).toBeCloseTo(0, 8)
      expect(y).toBeCloseTo(1, 8)
      expect(z).toBeCloseTo(0, 8)
    })

    it('|-i⟩ → equator -Y (0, -1, 0)', () => {
      const { theta, phi } = stateToBloch(KET_MINUS_I)
      const [x, y, z] = blochToCartesian(theta, phi)
      expect(x).toBeCloseTo(0, 8)
      expect(y).toBeCloseTo(-1, 8)
      expect(z).toBeCloseTo(0, 8)
    })
  })
})

// ── Probability Tests ────────────────────────────────────────

describe('Probabilities', () => {
  it('|0⟩ → 100% |0⟩, 0% |1⟩', () => {
    const p = probabilities(KET_0)
    expect(p.p0).toBeCloseTo(1, 8)
    expect(p.p1).toBeCloseTo(0, 8)
  })

  it('|1⟩ → 0% |0⟩, 100% |1⟩', () => {
    const p = probabilities(KET_1)
    expect(p.p0).toBeCloseTo(0, 8)
    expect(p.p1).toBeCloseTo(1, 8)
  })

  it('|+⟩ → 50% each', () => {
    const p = probabilities(KET_PLUS)
    expect(p.p0).toBeCloseTo(0.5, 8)
    expect(p.p1).toBeCloseTo(0.5, 8)
  })

  it('H|0⟩ → 50% each', () => {
    const result = applyGate(KET_0, GATES.H)
    const p = probabilities(result)
    expect(p.p0).toBeCloseTo(0.5, 8)
    expect(p.p1).toBeCloseTo(0.5, 8)
  })

  it('probabilities always sum to 1 after gate application', () => {
    const gates = ['X', 'Y', 'Z', 'H', 'S', 'T']
    for (const g of gates) {
      const result = applyGate(KET_PLUS, GATES[g])
      const p = probabilities(result)
      expect(p.p0 + p.p1).toBeCloseTo(1, 8)
    }
  })
})

// ── runCircuit Pipeline Tests ────────────────────────────────

describe('runCircuit pipeline', () => {
  it('no gates returns normalized initial state', () => {
    const result = runCircuit(COMPLEX_ONE, COMPLEX_ZERO, [])
    expectState(result.state, COMPLEX_ONE, COMPLEX_ZERO)
    expect(result.theta).toBeCloseTo(0, 8)
  })

  it('single H gate from |0⟩ produces |+⟩', () => {
    const result = runCircuit(COMPLEX_ONE, COMPLEX_ZERO, [{ name: 'H' }])
    expectState(result.state, { real: SQRT2_INV, imag: 0 }, { real: SQRT2_INV, imag: 0 })
  })

  it('H → Z → H sequence from |0⟩ = X|0⟩ = |1⟩', () => {
    const result = runCircuit(COMPLEX_ONE, COMPLEX_ZERO, [
      { name: 'H' },
      { name: 'Z' },
      { name: 'H' },
    ])
    expectComplex(result.state[0], COMPLEX_ZERO)
    // Allow for sign (global phase)
    expect(Math.abs(result.state[1].real)).toBeCloseTo(1, 8)
  })

  it('custom rotation gate Ry(90) from |0⟩ goes to equator', () => {
    const result = runCircuit(COMPLEX_ONE, COMPLEX_ZERO, [
      { name: 'Ry(90)', isCustom: true },
    ])
    const p = probabilities(result.state)
    expect(p.p0).toBeCloseTo(0.5, 6)
    expect(p.p1).toBeCloseTo(0.5, 6)
  })

  it('blochXYZ is on unit sphere', () => {
    const result = runCircuit(COMPLEX_ONE, COMPLEX_ZERO, [{ name: 'H' }, { name: 'T' }])
    const [x, y, z] = result.blochXYZ
    const r = Math.sqrt(x * x + y * y + z * z)
    expect(r).toBeCloseTo(1, 6)
  })
})

// ── Bloch Sphere Positioning (visual verification) ───────────

describe('Bloch sphere correct positioning for known states', () => {
  it('|0⟩ maps to scene north pole (scene Y = 1)', () => {
    // In dashboard-shell, the mapping is: bloch X → scene X, bloch Z → scene Y, bloch Y → scene Z
    const result = runCircuit(COMPLEX_ONE, COMPLEX_ZERO, [])
    const [bx, by, bz] = result.blochXYZ
    // scene coords: [bx, bz, by]
    const sceneX = bx
    const sceneY = bz  // bloch Z becomes scene Y (up)
    const sceneZ = by
    expect(sceneX).toBeCloseTo(0, 6)
    expect(sceneY).toBeCloseTo(1, 6) // north pole = up
    expect(sceneZ).toBeCloseTo(0, 6)
  })

  it('|1⟩ maps to scene south pole (scene Y = -1)', () => {
    const result = runCircuit(COMPLEX_ZERO, COMPLEX_ONE, [])
    const [bx, by, bz] = result.blochXYZ
    const sceneX = bx
    const sceneY = bz
    const sceneZ = by
    expect(sceneX).toBeCloseTo(0, 6)
    expect(sceneY).toBeCloseTo(-1, 6) // south pole = down
    expect(sceneZ).toBeCloseTo(0, 6)
  })

  it('|+⟩ (H|0⟩) maps to equator (scene Y ≈ 0, scene X = 1)', () => {
    const result = runCircuit(COMPLEX_ONE, COMPLEX_ZERO, [{ name: 'H' }])
    const [bx, by, bz] = result.blochXYZ
    const sceneX = bx
    const sceneY = bz
    const sceneZ = by
    expect(sceneY).toBeCloseTo(0, 6) // on equator
    expect(sceneX).toBeCloseTo(1, 6) // +X direction
  })

  it('|−⟩ (H|1⟩ normalized) maps to equator -X', () => {
    // H|1⟩ = |−⟩ = (|0⟩ - |1⟩)/√2
    const result = runCircuit(COMPLEX_ZERO, COMPLEX_ONE, [{ name: 'H' }])
    const [bx, by, bz] = result.blochXYZ
    const sceneX = bx
    const sceneY = bz
    expect(sceneY).toBeCloseTo(0, 6) // on equator
    expect(sceneX).toBeCloseTo(-1, 6) // -X direction
  })
})
