'use client'

import { useState, useEffect } from 'react'
import { usePosStore } from '@/store/usePosStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, DollarSign, ArrowRightLeft, Banknote, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentModal() {
  const { cart, getSubtotal, getTaxAmount, getIgtfAmount, getDiscountAmount, getTotalAmount, clearCart, customerName, setCustomerName, cashRegisterId } = usePosStore()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashGiven, setCashGiven] = useState('')
  const [processing, setProcessing] = useState(false)

  const total = getTotalAmount()

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-payment', handler)
    return () => window.removeEventListener('open-payment', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setCashGiven('')
      setPaymentMethod('cash')
    }
  }, [open])

  const change = paymentMethod === 'cash' && cashGiven ? parseFloat(cashGiven) - total : 0
  const canProcess = paymentMethod === 'cash' ? (cashGiven && parseFloat(cashGiven) >= total) : true

  const handleProcess = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process',
          userId: user?.id,
          cashRegisterId: cashRegisterId,
          paymentMethod,
          paymentRef: paymentMethod === 'card' ? `CARD-${Date.now()}` : paymentMethod === 'transfer' ? `TRF-${Date.now()}` : null,
          customerName: customerName || null,
          subtotal: getSubtotal(),
          taxAmount: getTaxAmount(),
          igtfAmount: getIgtfAmount(),
          discountAmount: getDiscountAmount(),
          totalAmount: total,
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          profit: cart.reduce((sum, item) => sum + (item.total - item.total * 0.5), 0),
        }),
      })

      if (res.ok) {
        toast.success('Payment processed successfully!')
        clearCart()
        setOpen(false)
        window.dispatchEvent(new CustomEvent('sale-completed'))
      } else {
        toast.error('Failed to process payment')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setProcessing(false)
    }
  }

  const quickCashAmounts = [
    total,
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total)

  const methods = [
    { id: 'cash', label: 'Cash', icon: DollarSign, color: '#006c47' },
    { id: 'card', label: 'Card', icon: CreditCard, color: '#00458f' },
    { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, color: '#653e00' },
    { id: 'divisas', label: 'USD', icon: Banknote, color: '#7b1fa2' },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-[#00458f] to-[#005cbb] px-6 py-4">
          <DialogTitle className="text-white text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Total */}
          <div className="text-center p-4 rounded-xl bg-[#f8f9ff]">
            <p className="text-xs font-bold text-[#727784] uppercase tracking-wider">Total Amount</p>
            <p className="text-3xl font-black text-[#00458f]">${total.toFixed(2)}</p>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-xs font-bold text-[#727784] uppercase tracking-wider mb-2">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => {
                const Icon = m.icon
                const isActive = paymentMethod === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all touch-manipulation
                      ${isActive
                        ? 'text-white shadow-md'
                        : 'bg-[#eff4ff] text-[#727784] hover:bg-[#d5e3fc]'
                      }`}
                    style={isActive ? { backgroundColor: m.color } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cash Input */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-[#727784] uppercase tracking-wider mb-2">Cash Received</p>
                <Input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="0.00"
                  className="h-12 text-lg font-bold text-right bg-[#eff4ff] border-0"
                  autoFocus
                />
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {quickCashAmounts.slice(0, 4).map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashGiven(amount.toString())}
                    className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs font-bold text-[#00458f] hover:bg-[#d5e3fc] transition-colors touch-manipulation min-h-[36px]"
                  >
                    ${amount.toFixed(0)}
                  </button>
                ))}
              </div>

              {/* Change */}
              {cashGiven && parseFloat(cashGiven) >= total && (
                <div className="p-3 rounded-xl bg-[#e8f5e9] border border-[#006c47]/20">
                  <p className="text-xs font-bold text-[#006c47] uppercase tracking-wider">Change</p>
                  <p className="text-2xl font-black text-[#006c47]">${change.toFixed(2)}</p>
                </div>
              )}

              {cashGiven && parseFloat(cashGiven) < total && (
                <p className="text-sm text-[#ba1a1a] font-medium">Insufficient amount</p>
              )}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <p className="text-xs font-bold text-[#727784] uppercase tracking-wider mb-2">Customer Name (Optional)</p>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="h-10 bg-[#eff4ff] border-0"
            />
          </div>

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            disabled={!canProcess || processing}
            className="w-full h-12 bg-gradient-to-r from-[#006c47] to-[#008a5e] text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Check className="w-5 h-5 mr-2" />
            )}
            Confirm Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
