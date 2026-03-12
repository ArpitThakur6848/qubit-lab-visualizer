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

export function TopBar({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/50 px-6">
      <span className="text-lg font-semibold tracking-tight text-zinc-100">
        QubitLab
      </span>
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
