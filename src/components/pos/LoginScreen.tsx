'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Fingerprint, Delete, LogIn, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginScreen() {
  const { setUser, license } = useAuthStore()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
      if (newPin.length === 4) {
        authenticate(newPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const authenticate = async (pinValue: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinValue }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          pin: data.pin,
        })
        toast.success(`Welcome, ${data.name}!`)
      } else {
        setError(data.error || 'Invalid PIN')
        setPin('')
      }
    } catch {
      setError('Authentication failed')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00458f] to-[#005cbb] mb-3">
            <Fingerprint className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black text-[#0d1c2e] uppercase tracking-wider">PIN Login</h2>
          {license && (
            <p className="text-xs text-[#727784] mt-1">{license.businessName}</p>
          )}
        </div>

        {/* PIN Display */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full transition-all duration-150 ${
                  pin.length > i
                    ? 'bg-[#00458f] scale-110'
                    : 'bg-[#d5e3fc]'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="text-center text-sm text-[#ba1a1a] font-medium mb-3">
              {error}
            </div>
          )}

          {/* PIN Pad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {digits.map((d, i) => {
              if (d === '') {
                return <div key={`empty-${i}`} />
              }
              if (d === 'del') {
                return (
                  <button
                    key="del"
                    onClick={handleDelete}
                    className="h-14 rounded-xl bg-[#eff4ff] flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
                  >
                    <Delete className="w-5 h-5 text-[#727784]" />
                  </button>
                )
              }
              return (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="h-14 rounded-xl bg-[#f8f9ff] text-xl font-bold text-[#0d1c2e] flex items-center justify-center hover:bg-[#eff4ff] active:scale-95 transition-all touch-manipulation"
                >
                  {d}
                </button>
              )
            })}
          </div>

          <Button
            onClick={handleClear}
            variant="ghost"
            className="w-full h-10 text-[#727784] hover:text-[#0d1c2e] touch-manipulation"
          >
            Clear
          </Button>
        </div>

        {/* User hints */}
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-[#727784] uppercase tracking-wider mb-2 text-center">
            Available PINs
          </p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-xs text-[#727784]">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </div>
              <code className="text-sm font-mono font-bold text-[#00458f]">1234</code>
            </div>
            <div className="w-px bg-[#d5e3fc]" />
            <div className="text-center">
              <div className="text-xs text-[#727784]">Cashier</div>
              <code className="text-sm font-mono font-bold text-[#00458f]">0000</code>
            </div>
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <Loader2 className="w-8 h-8 animate-spin text-[#00458f]" />
          </div>
        )}
      </div>
    </div>
  )
}
