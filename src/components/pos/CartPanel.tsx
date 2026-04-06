'use client'

import { usePosStore } from '@/store/usePosStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, DollarSign, ArrowRightLeft, Banknote, PauseCircle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function CartPanel() {
  const {
    cart, removeFromCart, updateQuantity, clearCart,
    getSubtotal, getTaxAmount, getIgtfAmount, getDiscountAmount, getTotalAmount,
    discountPercent, setDiscountPercent,
    holdCurrentSale, mobileCartOpen, setMobileCartOpen,
  } = usePosStore()

  const subtotal = getSubtotal()
  const taxAmount = getTaxAmount()
  const igtfAmount = getIgtfAmount()
  const discountAmount = getDiscountAmount()
  const totalAmount = getTotalAmount()

  const handleHold = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    holdCurrentSale()
    toast.success('Sale held successfully')
  }

  const handleDiscount = (percent: number) => {
    if ([0, 5, 10, 15, 20, 25].includes(percent)) {
      setDiscountPercent(discountPercent === percent ? 0 : percent)
    }
  }

  const cartContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#d5e3fc]/30">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#00458f]" />
          <h2 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider">Current Sale</h2>
          {cart.length > 0 && (
            <Badge className="bg-[#00458f] text-white text-[10px] h-5 px-1.5">{cart.length}</Badge>
          )}
        </div>
        {/* Mobile close */}
        <button
          onClick={() => setMobileCartOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#eff4ff] touch-manipulation"
        >
          <X className="w-4 h-4 text-[#727784]" />
        </button>
      </div>

      {/* Items */}
      <ScrollArea className="flex-1 px-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <ShoppingCart className="w-10 h-10 text-[#d5e3fc] mb-2" />
            <p className="text-sm text-[#727784]">No items in cart</p>
            <p className="text-xs text-[#727784]/60">Scan or tap products to add</p>
          </div>
        ) : (
          <div className="py-3 space-y-2">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#f8f9ff] group"
              >
                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0d1c2e] truncate">{item.productName}</p>
                  <p className="text-xs text-[#727784]">${item.unitPrice.toFixed(2)} each</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-[#eff4ff] transition-colors touch-manipulation active:scale-90"
                  >
                    <Minus className="w-3 h-3 text-[#727784]" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#0d1c2e]">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-[#eff4ff] transition-colors touch-manipulation active:scale-90"
                  >
                    <Plus className="w-3 h-3 text-[#00458f]" />
                  </button>
                </div>

                {/* Total & Delete */}
                <div className="text-right w-16">
                  <p className="text-sm font-bold text-[#0d1c2e]">${item.total.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#727784] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors touch-manipulation opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Totals & Actions */}
      <div className="border-t border-[#d5e3fc]/30 p-4 space-y-3 bg-white">
        {/* Discount buttons */}
        <div className="flex gap-1.5">
          {[0, 5, 10, 15, 20, 25].map((p) => (
            <button
              key={p}
              onClick={() => handleDiscount(p)}
              className={`flex-1 h-7 rounded-md text-[10px] font-bold transition-all touch-manipulation
                ${discountPercent === p
                  ? 'bg-[#00458f] text-white'
                  : 'bg-[#eff4ff] text-[#727784] hover:bg-[#d5e3fc]'
                }`}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-[#727784]">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#727784]">
            <span>VAT (16%)</span>
            <span className="font-medium">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#727784]">
            <span>IGTF (3%)</span>
            <span className="font-medium">${igtfAmount.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-[#006c47]">
              <span>Discount ({discountPercent}%)</span>
              <span className="font-medium">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-black text-[#0d1c2e] pt-1 border-t border-[#d5e3fc]/30">
            <span>TOTAL</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => {
              if (cart.length === 0) {
                toast.error('Add items to cart first')
                return
              }
              const event = new CustomEvent('open-payment')
              window.dispatchEvent(event)
            }}
            disabled={cart.length === 0}
            className="w-full h-12 bg-gradient-to-r from-[#00458f] to-[#005cbb] text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation disabled:opacity-40"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Process Payment
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleHold}
              disabled={cart.length === 0}
              variant="outline"
              className="flex-1 h-10 border-[#d5e3fc] text-[#727784] hover:bg-[#eff4ff] touch-manipulation disabled:opacity-40 font-bold text-xs uppercase tracking-wider"
            >
              <PauseCircle className="w-4 h-4 mr-1" />
              Hold
            </Button>
            <Button
              onClick={clearCart}
              disabled={cart.length === 0}
              variant="outline"
              className="flex-1 h-10 border-[#d5e3fc] text-[#727784] hover:bg-[#ffdad6] hover:text-[#ba1a1a] hover:border-[#ba1a1a]/30 touch-manipulation disabled:opacity-40 font-bold text-xs uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Cart Panel */}
      <div className="hidden lg:flex w-[340px] bg-white border-l border-[#d5e3fc]/30 flex-col">
        {cartContent}
      </div>

      {/* Mobile Cart Drawer */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileCartOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl">
            {cartContent}
          </div>
        </div>
      )}
    </>
  )
}
