'use client'

import { useState, useRef, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { RotateCcw } from 'lucide-react'

const BlochSphere = dynamic(
  () => import('./bloch-sphere').then((mod) => ({ default: mod.BlochSphere })),
  { ssr: false }
)

interface SphereViewportProps {
  blochVector: [number, number, number]
}

export function SphereViewport({ blochVector }: SphereViewportProps) {
  const [showXAxis, setShowXAxis] = useState(true)
  const [showYAxis, setShowYAxis] = useState(true)
  const [showZAxis, setShowZAxis] = useState(true)
  const controlsRef = useRef(null)

  const handleReset = useCallback(() => {
    const controls = controlsRef.current as any
    if (controls) {
      controls.reset()
    }
  }, [])

  const toggleBtnClass = (active: boolean) =>
    `rounded-lg px-2.5 py-1 text-xs font-mono transition-none ${
      active
        ? 'border border-zinc-600/50 bg-zinc-700/60 text-zinc-100'
        : 'border border-zinc-700/40 bg-zinc-800/30 text-zinc-500'
    }`

  return (
    <div className="relative flex flex-1 flex-col rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md">
      {/* Controls overlay - top left */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        <span className="mr-1 text-[11px] uppercase tracking-wider text-zinc-500">
          Axes
        </span>
        <button
          onClick={() => setShowXAxis((v) => !v)}
          className={toggleBtnClass(showXAxis)}
          title="Toggle X axis (|+⟩, |-⟩)"
        >
          <span style={{ color: showXAxis ? '#ef4444' : undefined }}>X</span>
        </button>
        <button
          onClick={() => setShowYAxis((v) => !v)}
          className={toggleBtnClass(showYAxis)}
          title="Toggle Y axis (|+i⟩, |-i⟩)"
        >
          <span style={{ color: showYAxis ? '#22c55e' : undefined }}>Y</span>
        </button>
        <button
          onClick={() => setShowZAxis((v) => !v)}
          className={toggleBtnClass(showZAxis)}
          title="Toggle Z axis (|0⟩, |1⟩)"
        >
          <span style={{ color: showZAxis ? '#3b82f6' : undefined }}>Z</span>
        </button>
      </div>

      {/* Reset button - top right */}
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-800/50 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
          title="Reset camera orientation"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-600">
              Loading sphere...
            </div>
          }
        >
          <BlochSphere
            blochVector={blochVector}
            showXAxis={showXAxis}
            showYAxis={showYAxis}
            showZAxis={showZAxis}
            controlsRef={controlsRef}
          />
        </Suspense>
      </div>
    </div>
  )
}
