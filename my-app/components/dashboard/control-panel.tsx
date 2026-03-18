'use client'

import { useState } from 'react'
import { Play, Trash2, Plus, Check, X, RotateCcw, FolderOpen } from 'lucide-react'
import { SaveCircuitDialog } from './save-circuit-dialog'

export type GateEntry = {
  name: string
  isCustom?: boolean
}

interface ControlPanelProps {
  onRun: (data: {
    alphaReal: number
    alphaImag: number
    betaReal: number
    betaImag: number
    gates: GateEntry[]
  }) => void
  onReset: () => void
  gates: GateEntry[]
  onGatesChange: (gates: GateEntry[]) => void
  onSaved: () => void
  onOpenSavedCircuits: () => void
}

const STANDARD_GATES = ['X', 'Y', 'Z', 'H', 'S', 'T'] as const

const inputClass =
  'w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-2 py-1.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600'

const sectionHeader = 'text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3'

const panelClass = 'rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md p-4'

export function ControlPanel({ onRun, onReset, gates, onGatesChange, onSaved, onOpenSavedCircuits }: ControlPanelProps) {
  const [alphaReal, setAlphaReal] = useState('1')
  const [alphaImag, setAlphaImag] = useState('0')
  const [betaReal, setBetaReal] = useState('0')
  const [betaImag, setBetaImag] = useState('0')

  const gateSequence = gates
  const setGateSequence = onGatesChange

  const [customAxis, setCustomAxis] = useState<'X' | 'Y' | 'Z'>('X')
  const [customAngle, setCustomAngle] = useState('90')

  const addGate = (name: string) => {
    setGateSequence([...gateSequence, { name }])
  }

  const addCustomGate = () => {
    const angle = parseFloat(customAngle) || 0
    setGateSequence([
      ...gateSequence,
      {
        name: `R${customAxis.toLowerCase()}(${angle})`,
        isCustom: true,
      },
    ])
  }

  const clearSequence = () => setGateSequence([])

  const handleReset = () => {
    setAlphaReal('1')
    setAlphaImag('0')
    setBetaReal('0')
    setBetaImag('0')
    onGatesChange([])
    setCustomAxis('X')
    setCustomAngle('90')
    onReset()
  }

  const handleRun = () => {
    onRun({
      alphaReal: parseFloat(alphaReal) || 0,
      alphaImag: parseFloat(alphaImag) || 0,
      betaReal: parseFloat(betaReal) || 0,
      betaImag: parseFloat(betaImag) || 0,
      gates: gateSequence,
    })
  }

  const isUnitary = customAngle !== '' && !isNaN(parseFloat(customAngle))

  return (
    <div className="flex w-full flex-col overflow-hidden md:w-72 md:shrink-0">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {/* State Input */}
        <div className={panelClass}>
          <h3 className={sectionHeader}>Initial State</h3>
          <div className="space-y-3">
            <ComplexInput
              label="α"
              real={alphaReal}
              imag={alphaImag}
              onRealChange={setAlphaReal}
              onImagChange={setAlphaImag}
            />
            <ComplexInput
              label="β"
              real={betaReal}
              imag={betaImag}
              onRealChange={setBetaReal}
              onImagChange={setBetaImag}
            />
          </div>
        </div>

        {/* Standard Gates */}
        <div className={panelClass}>
          <h3 className={sectionHeader}>Gates</h3>
          <div className="grid grid-cols-3 gap-2">
            {STANDARD_GATES.map((gate) => (
              <button
                key={gate}
                onClick={() => addGate(gate)}
                className="rounded-xl border border-zinc-700/40 bg-zinc-800/30 py-2 text-sm font-mono text-zinc-200 hover:bg-zinc-700/50 hover:text-zinc-100"
              >
                {gate}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Gate */}
        <div className={panelClass}>
          <h3 className={sectionHeader}>Custom Gate</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-zinc-500">Rotation Axis</label>
              <div className="mt-1 flex gap-1">
                {(['X', 'Y', 'Z'] as const).map((axis) => (
                  <button
                    key={axis}
                    onClick={() => setCustomAxis(axis)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-mono ${
                      customAxis === axis
                        ? 'border border-zinc-600/50 bg-zinc-700/60 text-zinc-100'
                        : 'border border-zinc-700/40 bg-zinc-800/30 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {axis}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-zinc-500">Angle (degrees)</label>
              <input
                type="text"
                value={customAngle}
                onChange={(e) => setCustomAngle(e.target.value)}
                className={`mt-1 ${inputClass}`}
                placeholder="90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Unitary</span>
              {isUnitary ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-400" />
              )}
            </div>
            <button
              onClick={addCustomGate}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-700/40 bg-zinc-800/30 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700/50"
            >
              <Plus className="h-3 w-3" />
              Add Gate
            </button>
          </div>
        </div>

        {/* Gate Sequence */}
        {gateSequence.length > 0 && (
          <div className={panelClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Sequence
              </h3>
              <div className="flex items-center gap-1.5">
                <SaveCircuitDialog gates={gateSequence} onSaved={onSaved} />
                <button
                  onClick={clearSequence}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {gateSequence.map((gate, i) => (
                <span
                  key={i}
                  className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-mono ${
                    gate.isCustom
                      ? 'border-sky-700/40 bg-sky-900/20 text-sky-300'
                      : 'border-zinc-700/40 bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  {gate.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Saved Circuits Button */}
        <button
          onClick={onOpenSavedCircuits}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md p-3 text-sm text-zinc-400 hover:border-zinc-700/60 hover:bg-zinc-800/40 hover:text-zinc-200"
        >
          <FolderOpen className="h-4 w-4" />
          Saved Circuits
        </button>
      </div>

      {/* Action Buttons - pinned at bottom */}
      <div className="flex gap-2 pt-3">
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-700/40 bg-zinc-800/30 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700/50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button
          onClick={handleRun}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3 text-sm font-medium text-white hover:bg-sky-500"
        >
          <Play className="h-4 w-4" />
          Run
        </button>
      </div>
    </div>
  )
}

function ComplexInput({
  label,
  real,
  imag,
  onRealChange,
  onImagChange,
}: {
  label: string
  real: string
  imag: string
  onRealChange: (v: string) => void
  onImagChange: (v: string) => void
}) {
  return (
    <div className="flex items-end gap-2">
      <span className="pb-1.5 text-xs font-mono text-zinc-400">{label}</span>
      <div className="flex flex-1 items-center gap-2">
        <div className="flex-1">
          <label className="text-[11px] text-zinc-500">Re</label>
          <input
            type="text"
            value={real}
            onChange={(e) => onRealChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className="text-[11px] text-zinc-500">Im</label>
          <input
            type="text"
            value={imag}
            onChange={(e) => onImagChange(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
