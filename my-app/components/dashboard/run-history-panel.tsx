'use client'

import { useState, useEffect, useCallback } from 'react'
import { History } from 'lucide-react'
import { loadRunHistory, type RunHistoryEntry } from '@/lib/circuits'
import type { GateEntry } from './control-panel'

interface RunHistoryPanelProps {
  onLoad: (gates: GateEntry[]) => void
  refreshKey: number
}

const panelClass = 'rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md p-4'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RunHistoryPanel({ onLoad, refreshKey }: RunHistoryPanelProps) {
  const [entries, setEntries] = useState<RunHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    const data = await loadRunHistory()
    setEntries(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory, refreshKey])

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-zinc-500" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Run History
        </h2>
        {entries.length > 0 && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {entries.length}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {loading && (
          <p className="text-sm text-zinc-600">Loading...</p>
        )}
        {!loading && entries.length === 0 && (
          <div className={panelClass}>
            <p className="text-sm text-zinc-500">No runs yet. Go to Dashboard and run a circuit to see history here.</p>
          </div>
        )}
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onLoad(entry.gates as GateEntry[])}
            className={`flex w-full flex-col items-start ${panelClass} text-left transition-colors hover:border-zinc-700/60 hover:bg-zinc-800/40`}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(entry.gates as GateEntry[]).slice(0, 8).map((g, i) => (
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
                {(entry.gates as GateEntry[]).length > 8 && (
                  <span className="text-xs text-zinc-500">
                    +{(entry.gates as GateEntry[]).length - 8}
                  </span>
                )}
                {(entry.gates as GateEntry[]).length === 0 && (
                  <span className="text-xs text-zinc-500 italic">no gates</span>
                )}
              </div>
              <span className="ml-3 shrink-0 text-xs text-zinc-600">
                {timeAgo(entry.created_at)}
              </span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-zinc-500">
              <span>θ {entry.result_theta.toFixed(1)}°</span>
              <span>φ {entry.result_phi.toFixed(1)}°</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
