'use client'

import { useState, useEffect, useCallback } from 'react'
import { FolderOpen, Trash2, ArrowLeft } from 'lucide-react'
import { loadCircuits, deleteCircuit, type SavedCircuit } from '@/lib/circuits'
import type { GateEntry } from './control-panel'

interface SavedCircuitsPanelProps {
  onLoad: (gates: GateEntry[]) => void
  onBack: () => void
  refreshKey: number
}

const panelClass = 'rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md p-4'

export function SavedCircuitsPanel({ onLoad, onBack, refreshKey }: SavedCircuitsPanelProps) {
  const [circuits, setCircuits] = useState<SavedCircuit[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCircuits = useCallback(async () => {
    setLoading(true)
    const data = await loadCircuits()
    setCircuits(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCircuits()
  }, [fetchCircuits, refreshKey])

  const handleDelete = async (id: string) => {
    await deleteCircuit(id)
    setCircuits((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSelect = (gates: GateEntry[]) => {
    onLoad(gates)
    onBack()
  }

  return (
    <div className="flex w-full flex-col overflow-hidden md:w-72 md:shrink-0">
      {/* Header with back arrow */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={onBack}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <FolderOpen className="h-4 w-4 text-zinc-500" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Saved Circuits
        </h2>
        {circuits.length > 0 && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {circuits.length}
          </span>
        )}
      </div>

      {/* Circuit list */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {loading && (
          <div className={panelClass}>
            <p className="text-sm text-zinc-600">Loading...</p>
          </div>
        )}
        {!loading && circuits.length === 0 && (
          <div className={panelClass}>
            <p className="text-sm text-zinc-500">No saved circuits yet. Build a gate sequence and save it.</p>
          </div>
        )}
        {circuits.map((circuit) => (
          <div
            key={circuit.id}
            className={`group flex items-start justify-between ${panelClass} transition-colors hover:border-zinc-700/60 hover:bg-zinc-800/40`}
          >
            <button
              onClick={() => handleSelect(circuit.gates)}
              className="flex-1 text-left"
            >
              <span className="text-sm font-medium text-zinc-200">
                {circuit.name}
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {circuit.gates.slice(0, 6).map((g, i) => (
                  <span
                    key={i}
                    className={`rounded-lg border px-2 py-0.5 text-xs font-mono ${
                      g.isCustom
                        ? 'border-sky-700/40 bg-sky-900/20 text-sky-300'
                        : 'border-zinc-700/40 bg-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    {g.name}
                  </span>
                ))}
                {circuit.gates.length > 6 && (
                  <span className="text-xs text-zinc-500">
                    +{circuit.gates.length - 6}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => handleDelete(circuit.id)}
              className="ml-2 mt-0.5 text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
