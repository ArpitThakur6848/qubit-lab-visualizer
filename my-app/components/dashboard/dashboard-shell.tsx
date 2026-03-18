'use client'

import { useState } from 'react'
import { TopBar, type Tab } from './top-bar'
import { ControlPanel, type GateEntry } from './control-panel'
import { SphereViewport } from './sphere-viewport'
import { InfoPanel, type QubitStatus } from './info-panel'
import { RunHistoryPanel } from './run-history-panel'
import { SavedCircuitsPanel } from './saved-circuits-panel'
import { runCircuit } from '@/lib/qubit'
import { saveRunHistory } from '@/lib/circuits'

const DEFAULT_STATUS: QubitStatus = {
  alpha: { real: 1, imag: 0 },
  beta: { real: 0, imag: 0 },
  theta: 0,
  phi: 0,
  phase: 0,
  n: 1,
  entangled: false,
}

const DEFAULT_BLOCH: [number, number, number] = [0, 1, 0]

export function DashboardShell({ email }: { email: string }) {
  const [status, setStatus] = useState<QubitStatus>(DEFAULT_STATUS)
  const [blochVector, setBlochVector] = useState<[number, number, number]>(DEFAULT_BLOCH)
  const [notation, setNotation] = useState<'dirac' | 'matrix'>('dirac')
  const [gates, setGates] = useState<GateEntry[]>([])
  const [saveRefreshKey, setSaveRefreshKey] = useState(0)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showSavedCircuits, setShowSavedCircuits] = useState(false)

  const handleReset = () => {
    setStatus(DEFAULT_STATUS)
    setBlochVector(DEFAULT_BLOCH)
  }

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
    setBlochVector([bx, bz, by])

    const thetaDeg = (result.theta * 180) / Math.PI
    const phiDeg = (result.phi * 180) / Math.PI

    setStatus({
      alpha: { real: result.state[0].real, imag: result.state[0].imag },
      beta: { real: result.state[1].real, imag: result.state[1].imag },
      theta: thetaDeg,
      phi: phiDeg,
      phase: result.phase,
      n: result.n,
      entangled: false,
    })

    saveRunHistory({
      gates: data.gates,
      alphaReal: data.alphaReal,
      alphaImag: data.alphaImag,
      betaReal: data.betaReal,
      betaImag: data.betaImag,
      resultTheta: thetaDeg,
      resultPhi: phiDeg,
    }).then(() => setHistoryRefreshKey((k) => k + 1))
  }

  const handleLoadCircuit = (loadedGates: GateEntry[]) => {
    setGates(loadedGates)
    // Switch to dashboard tab when loading from history
    if (activeTab !== 'dashboard') setActiveTab('dashboard')
  }

  const handleSaved = () => {
    setSaveRefreshKey((k) => k + 1)
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <TopBar email={email} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'dashboard' && (
        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:flex-row">
          {showSavedCircuits ? (
            <SavedCircuitsPanel
              onLoad={handleLoadCircuit}
              onBack={() => setShowSavedCircuits(false)}
              refreshKey={saveRefreshKey}
            />
          ) : (
            <ControlPanel
              onRun={handleRun}
              onReset={handleReset}
              gates={gates}
              onGatesChange={setGates}
              onSaved={handleSaved}
              onOpenSavedCircuits={() => setShowSavedCircuits(true)}
            />
          )}
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <SphereViewport blochVector={blochVector} />
            <InfoPanel
              status={status}
              notation={notation}
              onNotationChange={setNotation}
            />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <RunHistoryPanel
          onLoad={handleLoadCircuit}
          refreshKey={historyRefreshKey}
        />
      )}
    </div>
  )
}
