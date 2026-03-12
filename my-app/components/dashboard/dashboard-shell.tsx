'use client'

import { useState } from 'react'
import { TopBar } from './top-bar'
import { ControlPanel, type GateEntry } from './control-panel'
import { SphereViewport } from './sphere-viewport'
import { InfoPanel, type QubitStatus } from './info-panel'
import { runCircuit } from '@/lib/qubit'

const DEFAULT_STATUS: QubitStatus = {
  alpha: { real: 1, imag: 0 },
  beta: { real: 0, imag: 0 },
  theta: 0,
  phi: 0,
  phase: 0,
  n: 1,
  entangled: false,
}

const DEFAULT_BLOCH: [number, number, number] = [0, 1, 0] // |0⟩ = north pole (Z+ mapped to Y+ in scene)

export function DashboardShell({ email }: { email: string }) {
  const [status, setStatus] = useState<QubitStatus>(DEFAULT_STATUS)
  const [blochVector, setBlochVector] = useState<[number, number, number]>(DEFAULT_BLOCH)
  const [notation, setNotation] = useState<'dirac' | 'matrix'>('dirac')

  const handleRun = (data: {
    alphaReal: number
    alphaImag: number
    betaReal: number
    betaImag: number
    gates: GateEntry[]
  }) => {
    const result = runCircuit(
      { real: data.alphaReal, imag: data.alphaImag },
      { real: data.betaReal, imag: data.betaImag },
      data.gates
    )

    const [bx, by, bz] = result.blochXYZ
    // Map Bloch coordinates to Three.js scene:
    // Bloch X -> scene X, Bloch Z -> scene Y (up), Bloch Y -> scene Z
    setBlochVector([bx, bz, by])

    setStatus({
      alpha: { real: result.state[0].real, imag: result.state[0].imag },
      beta: { real: result.state[1].real, imag: result.state[1].imag },
      theta: (result.theta * 180) / Math.PI,
      phi: (result.phi * 180) / Math.PI,
      phase: result.phase,
      n: result.n,
      entangled: false,
    })
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <TopBar email={email} />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <ControlPanel onRun={handleRun} />
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <SphereViewport blochVector={blochVector} />
          <InfoPanel
            status={status}
            notation={notation}
            onNotationChange={setNotation}
          />
        </div>
      </div>
    </div>
  )
}
