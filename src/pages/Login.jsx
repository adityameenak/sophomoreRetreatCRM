import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const { error: err } = signIn(password)
    if (err) setError(err.message)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-lg font-bold text-white">SR</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Sponsor CRM</h1>
          <p className="mt-1 text-sm text-slate-400">Sophomore Retreat Leadership</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <h2 className="mb-6 text-base font-semibold text-slate-100">Enter team password</h2>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Internal use only — contact Aditya to get access
        </p>
      </div>
    </div>
  )
}
