'use client'

import { usePosStore } from '@/store/usePosStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PauseCircle, PlayCircle, Trash2, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function HeldSalesModal() {
  const { heldSales, resumeSale, removeHeldSale, setActiveTab } = usePosStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-held-sales', handler)
    return () => window.removeEventListener('open-held-sales', handler)
  }, [])

  const handleResume = (saleId: string) => {
    resumeSale(saleId)
    setOpen(false)
    setActiveTab('sales')
    toast.success('Sale resumed')
  }

  const handleRemove = (saleId: string) => {
    removeHeldSale(saleId)
    toast.info('Held sale removed')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-[#653e00] to-[#8a5a1a] px-6 py-4">
          <DialogTitle className="text-white text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <PauseCircle className="w-5 h-5" />
            Held Sales ({heldSales.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {heldSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <PauseCircle className="w-10 h-10 text-[#d5e3fc] mb-2" />
              <p className="text-sm text-[#727784]">No held sales</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {heldSales.map((sale) => (
                <div key={sale.id} className="bg-[#f8f9ff] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-[#727784] uppercase tracking-wider">{sale.saleNumber}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#727784] mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(sale.heldAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <p className="text-lg font-black text-[#00458f]">${sale.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="text-xs text-[#727784] mb-3">
                    {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleResume(sale.id)}
                      size="sm"
                      className="flex-1 h-9 bg-[#00458f] text-white font-bold text-xs uppercase tracking-wider touch-manipulation"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                    <Button
                      onClick={() => handleRemove(sale.id)}
                      variant="outline"
                      size="sm"
                      className="h-9 border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ffdad6] touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
