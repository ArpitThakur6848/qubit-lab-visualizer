'use client'

type ComplexNumber = { real: number; imag: number }

export type QubitStatus = {
  alpha: ComplexNumber
  beta: ComplexNumber
  theta: number
  phi: number
  phase: number
  n: number
  entangled: boolean
}

interface InfoPanelProps {
  status: QubitStatus
  notation: 'dirac' | 'matrix'
  onNotationChange: (notation: 'dirac' | 'matrix') => void
}

function formatComplex(c: ComplexNumber): string {
  const r = c.real
  const i = c.imag
  if (i === 0) return r.toFixed(3)
  if (r === 0) return `${i.toFixed(3)}i`
  const sign = i >= 0 ? '+' : ''
  return `${r.toFixed(3)} ${sign} ${i.toFixed(3)}i`
}

const panelClass =
  'rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md p-4'

export function InfoPanel({ status, notation, onNotationChange }: InfoPanelProps) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-4">
      {/* Status Panel */}
      <div className={panelClass}>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Status
        </h3>
        <div className="space-y-1.5">
          <StatusRow label="α" value={formatComplex(status.alpha)} />
          <StatusRow label="β" value={formatComplex(status.beta)} />
          <div className="my-1.5 h-px bg-zinc-800/60" />
          <StatusRow label="θ" value={`${status.theta.toFixed(1)}\u00B0`} />
          <StatusRow label="φ" value={`${status.phi.toFixed(1)}\u00B0`} />
          <StatusRow label="Phase" value={status.phase.toFixed(3)} />
          <div className="my-1.5 h-px bg-zinc-800/60" />
          <StatusRow label="N" value={status.n.toFixed(4)} />
          <StatusRow label="Entangled" value={status.entangled ? 'Yes' : 'No'} />
        </div>
      </div>

      {/* Notation Panel */}
      <div className={panelClass}>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Notation
        </h3>
        <div className="mb-4 flex gap-1">
          <button
            onClick={() => onNotationChange('dirac')}
            className={`flex-1 rounded-lg py-1.5 text-xs ${
              notation === 'dirac'
                ? 'border border-zinc-600/50 bg-zinc-700/60 text-zinc-100'
                : 'border border-zinc-700/40 bg-zinc-800/30 text-zinc-400'
            }`}
          >
            Dirac
          </button>
          <button
            onClick={() => onNotationChange('matrix')}
            className={`flex-1 rounded-lg py-1.5 text-xs ${
              notation === 'matrix'
                ? 'border border-zinc-600/50 bg-zinc-700/60 text-zinc-100'
                : 'border border-zinc-700/40 bg-zinc-800/30 text-zinc-400'
            }`}
          >
            Matrix
          </button>
        </div>
        <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/40 p-3 font-mono text-sm text-zinc-200">
          {notation === 'dirac' ? (
            <DiracNotation alpha={status.alpha} beta={status.beta} />
          ) : (
            <MatrixNotation alpha={status.alpha} beta={status.beta} />
          )}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs font-mono text-zinc-200">{value}</span>
    </div>
  )
}

function DiracNotation({
  alpha,
  beta,
}: {
  alpha: ComplexNumber
  beta: ComplexNumber
}) {
  const a = formatComplex(alpha)
  const b = formatComplex(beta)

  // Clean display for pure basis states
  const isZeroState = alpha.real === 1 && alpha.imag === 0 && beta.real === 0 && beta.imag === 0
  const isOneState = alpha.real === 0 && alpha.imag === 0 && beta.real === 1 && beta.imag === 0

  if (isZeroState) return <span>|ψ⟩ = |0⟩</span>
  if (isOneState) return <span>|ψ⟩ = |1⟩</span>

  return (
    <span>
      |ψ⟩ = {a}|0⟩ + {b}|1⟩
    </span>
  )
}

function MatrixNotation({
  alpha,
  beta,
}: {
  alpha: ComplexNumber
  beta: ComplexNumber
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-zinc-400">|ψ⟩ =</span>
      <div className="flex flex-col items-center border-l border-r border-zinc-600 px-3 py-1">
        <span className="text-xs">{formatComplex(alpha)}</span>
        <span className="text-xs">{formatComplex(beta)}</span>
      </div>
    </div>
  )
}
