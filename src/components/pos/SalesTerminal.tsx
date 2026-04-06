'use client'

import { usePosStore } from '@/store/usePosStore'
import CategoryFilter from './CategoryFilter'
import ProductGrid from './ProductGrid'
import CartPanel from './CartPanel'
import PaymentModal from './PaymentModal'
import HeldSalesModal from './HeldSalesModal'
import { Button } from '@/components/ui/button'
import { PauseCircle, Package } from 'lucide-react'

export default function SalesTerminal() {
  const { heldSales } = usePosStore()

  return (
    <>
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Filters */}
          <div className="px-4 lg:px-6 pt-4">
            <CategoryFilter />
          </div>

          {/* Product Grid */}
          <ProductGrid />
        </div>

        {/* Cart Panel (Desktop) */}
        <CartPanel />
      </div>

      {/* Held Sales Button (floating) */}
      {heldSales.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 z-40">
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('open-held-sales'))}
            className="h-12 bg-[#653e00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all touch-manipulation"
          >
            <PauseCircle className="w-4 h-4 mr-2" />
            Held ({heldSales.length})
          </Button>
        </div>
      )}

      <PaymentModal />
      <HeldSalesModal />
    </>
  )
}
