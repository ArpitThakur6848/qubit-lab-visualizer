'use client'

import { User, LogOut, ChevronDown } from 'lucide-react'
import { useTransition } from 'react'
import { signout } from '@/app/(auth)/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Tab = 'dashboard' | 'history'

interface TopBarProps {
  email: string
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function TopBar({ email, activeTab, onTabChange }: TopBarProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/50 px-6">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold tracking-tight text-zinc-100">
          QubitLab
        </span>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-zinc-800/60 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-zinc-800/60 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Run History
          </button>
        </nav>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 focus:outline-none">
            <User className="h-4 w-4" />
            <span className="max-w-[160px] truncate">{email}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-xl border-zinc-700/50 bg-zinc-900 backdrop-blur-md"
        >
          <DropdownMenuItem className="rounded-lg text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            disabled={isPending}
            onClick={() => startTransition(() => signout())}
            className="rounded-lg text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
