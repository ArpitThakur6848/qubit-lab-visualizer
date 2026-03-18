'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { GateEntry } from './control-panel'
import { saveCircuit } from '@/lib/circuits'

interface SaveCircuitDialogProps {
  gates: GateEntry[]
  onSaved?: () => void
}

export function SaveCircuitDialog({ gates, onSaved }: SaveCircuitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const result = await saveCircuit(name.trim(), gates)
    setSaving(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setName('')
      setOpen(false)
      onSaved?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={gates.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700/40 bg-zinc-800/30 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700/50 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Save className="h-3 w-3" />
          Save
        </button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Save Circuit</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Superposition Demo"
              className="mt-1 w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gates.map((g, i) => (
              <span
                key={i}
                className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-mono ${
                  g.isCustom
                    ? 'border-sky-700/40 bg-sky-900/20 text-sky-300'
                    : 'border-zinc-700/40 bg-zinc-800/60 text-zinc-300'
                }`}
              >
                {g.name}
              </span>
            ))}
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>
        <DialogFooter>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
