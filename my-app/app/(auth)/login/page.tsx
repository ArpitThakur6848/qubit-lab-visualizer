import { login } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-700/40 bg-zinc-900/50 p-8 backdrop-blur-md">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Sign in
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your credentials to continue
          </p>
        </div>

        {params?.error && (
          <div className="rounded-xl border border-red-800/30 bg-red-900/20 p-3 text-sm text-red-400">
            {params.error}
          </div>
        )}

        {params?.message && (
          <div className="rounded-xl border border-emerald-800/30 bg-emerald-900/20 p-3 text-sm text-emerald-400">
            {params.message}
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="Enter password"
            />
          </div>

          <Button formAction={login} className="w-full rounded-xl">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-medium text-zinc-300 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
