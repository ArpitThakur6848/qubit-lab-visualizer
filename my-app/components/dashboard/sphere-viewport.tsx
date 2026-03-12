import { Circle } from 'lucide-react'

export function SphereViewport() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-2xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-md">
      <div className="flex flex-col items-center gap-3 text-zinc-600">
        <Circle className="h-16 w-16 stroke-1" />
        <span className="text-sm">Bloch Sphere</span>
      </div>
    </div>
  )
}
