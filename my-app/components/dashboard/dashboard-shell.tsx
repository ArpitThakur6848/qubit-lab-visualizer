'use client'

import { useState } from 'react'
import { TopBar } from './top-bar'
import { ControlPanel, type GateEntry } from './control-panel'
import { SphereViewport } from './sphere-viewport'
import { InfoPanel, type QubitStatus } from './info-panel'

const DEFAULT_STATUS: QubitStatus = {
  alpha: { real: 1, imag: 0 },
  beta: { real: 0, imag: 0 },
  theta: 0,
  phi: 0,
  phase: 0,
  n: 1,
  entangled: false,
}

export function DashboardShell({ email }: { email: string }) {
  const [status, setStatus] = useState<QubitStatus>(DEFAULT_STATUS)
  const [notation, setNotation] = useState<'dirac' | 'matrix'>('dirac')

  const handleRun = (data: {
    alphaReal: number
    alphaImag: number
    betaReal: number
    betaImag: number
    gates: GateEntry[]
  }) => {
    // Placeholder: updates status with input values
    // Will be replaced by qubit state engine computation
    const n = Math.sqrt(
      data.alphaReal ** 2 +
        data.alphaImag ** 2 +
        data.betaReal ** 2 +
        data.betaImag ** 2
    )

    setStatus({
      alpha: { real: data.alphaReal, imag: data.alphaImag },
      beta: { real: data.betaReal, imag: data.betaImag },
      theta: 0,
      phi: 0,
      phase: 0,
      n: n || 0,
      entangled: false,
    })
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <TopBar email={email} />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <ControlPanel onRun={handleRun} />
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <SphereViewport />
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
