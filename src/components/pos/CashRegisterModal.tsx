'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Vault, DollarSign } from 'lucide-react'
import { usePosStore } from '@/store/usePosStore'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'

export default function CashRegisterModal() {
  const { setCashRegister } = usePosStore()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if register is already open
    fetch('/api/cash-register')
      .then((r) => r.json())
      .then((reg) => {
        if (reg) {
          setCashRegister(true, reg.id)
        } else {
          setOpen(true)
        }
      })
      .catch(() => {})
  }, [setCashRegister])

  const handleOpen = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cash-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open',
          openingBalance: parseFloat(amount) || 0,
          userId: user?.id,
          name: 'Caja Principal',
        }),
      })

      if (res.ok) {
        const reg = await res.json()
        setCashRegister(true, reg.id)
        setOpen(false)
        toast.success('Cash register opened successfully')
      } else {
        toast.error('Failed to open register')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-0 gap-0">
        <DialogHeader className="bg-gradient-to-r from-[#006c47] to-[#008a5e] px-6 py-4">
          <DialogTitle className="text-white text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <Vault className="w-5 h-5" />
            Open Cash Register
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#727784] text-center">
            Enter the opening balance to start the cash register
          </p>

          <div>
            <label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Opening Balance</label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#727784]" />
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-14 pl-10 text-2xl font-black text-right bg-[#eff4ff] border-0"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
              />
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {[0, 100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="flex-1 h-10 rounded-lg bg-[#eff4ff] text-sm font-bold text-[#00458f] hover:bg-[#d5e3fc] transition-colors touch-manipulation"
              >
                ${amt}
              </button>
            ))}
          </div>

          <Button
            onClick={handleOpen}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-[#006c47] to-[#008a5e] text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Vault className="w-5 h-5 mr-2" />
            )}
            Open Register
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
