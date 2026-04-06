'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Package, AlertTriangle, Clock, Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  product: any
  onClose: () => void
  onUpdated: () => void
}

export default function BatchDetailModal({ product, onClose, onUpdated }: Props) {
  const [addBatchOpen, setAddBatchOpen] = useState(false)
  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    supplier: '',
    quantity: '',
    costPrice: '',
    expirationDate: '',
  })
  const [adding, setAdding] = useState(false)

  const handleAddBatch = async () => {
    if (!newBatch.quantity || !newBatch.costPrice) {
      toast.error('Quantity and cost price are required')
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-batch',
          productId: product.id,
          batchNumber: newBatch.batchNumber || `B-${Date.now()}`,
          supplier: newBatch.supplier,
          quantity: parseInt(newBatch.quantity),
          costPrice: parseFloat(newBatch.costPrice),
          expirationDate: newBatch.expirationDate || null,
        }),
      })

      if (res.ok) {
        toast.success('Batch added successfully!')
        onUpdated()
        setAddBatchOpen(false)
        setNewBatch({ batchNumber: '', supplier: '', quantity: '', costPrice: '', expirationDate: '' })
      } else {
        toast.error('Failed to add batch')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setAdding(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      healthy: 'bg-[#e8f5e9] text-[#006c47]',
      near_expiry: 'bg-[#fff3e0] text-[#653e00]',
      critical: 'bg-[#ffdad6] text-[#ba1a1a]',
      expired: 'bg-[#0d1c2e] text-white',
    }
    return (
      <Badge className={`${styles[status] || styles.healthy} text-[10px] font-bold uppercase tracking-wider h-5 px-2`}>
        {status}
      </Badge>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="bg-gradient-to-r from-[#00458f] to-[#005cbb] px-6 py-4">
          <DialogTitle className="text-white text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Product Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#eff4ff] rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-[#727784] uppercase">Stock</p>
              <p className="text-xl font-black text-[#00458f]">{product.currentStock}</p>
            </div>
            <div className="bg-[#e8f5e9] rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-[#727784] uppercase">Sale Price</p>
              <p className="text-xl font-black text-[#006c47]">${product.salePrice.toFixed(2)}</p>
            </div>
            <div className="bg-[#fff8f0] rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-[#727784] uppercase">Cost Price</p>
              <p className="text-xl font-black text-[#653e00]">${product.costPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Batches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider">Batches</h3>
              <Button
                onClick={() => setAddBatchOpen(!addBatchOpen)}
                size="sm"
                className="h-8 bg-[#00458f] text-white text-[10px] font-bold uppercase tracking-wider touch-manipulation"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Batch
              </Button>
            </div>

            {/* Add Batch Form */}
            {addBatchOpen && (
              <div className="bg-[#f8f9ff] rounded-xl p-4 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#727784] uppercase">Batch Number</label>
                    <input
                      type="text"
                      value={newBatch.batchNumber}
                      onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                      className="w-full h-8 px-2 rounded-md bg-white text-xs border border-[#d5e3fc]/50 focus:outline-none focus:ring-1 focus:ring-[#00458f]/30"
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#727784] uppercase">Supplier</label>
                    <input
                      type="text"
                      value={newBatch.supplier}
                      onChange={(e) => setNewBatch({ ...newBatch, supplier: e.target.value })}
                      className="w-full h-8 px-2 rounded-md bg-white text-xs border border-[#d5e3fc]/50 focus:outline-none focus:ring-1 focus:ring-[#00458f]/30"
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#727784] uppercase">Quantity *</label>
                    <input
                      type="number"
                      value={newBatch.quantity}
                      onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                      className="w-full h-8 px-2 rounded-md bg-white text-xs border border-[#d5e3fc]/50 focus:outline-none focus:ring-1 focus:ring-[#00458f]/30"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#727784] uppercase">Cost Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBatch.costPrice}
                      onChange={(e) => setNewBatch({ ...newBatch, costPrice: e.target.value })}
                      className="w-full h-8 px-2 rounded-md bg-white text-xs border border-[#d5e3fc]/50 focus:outline-none focus:ring-1 focus:ring-[#00458f]/30"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#727784] uppercase">Expiration Date</label>
                  <input
                    type="date"
                    value={newBatch.expirationDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expirationDate: e.target.value })}
                    className="w-full h-8 px-2 rounded-md bg-white text-xs border border-[#d5e3fc]/50 focus:outline-none focus:ring-1 focus:ring-[#00458f]/30"
                  />
                </div>
                <Button
                  onClick={handleAddBatch}
                  disabled={adding}
                  size="sm"
                  className="w-full h-9 bg-[#006c47] text-white text-xs font-bold uppercase tracking-wider touch-manipulation"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Add Batch
                </Button>
              </div>
            )}

            {/* Batch List */}
            {product.batches && product.batches.length > 0 ? (
              <div className="space-y-2">
                {product.batches.map((batch: any) => (
                  <div key={batch.id} className="bg-[#f8f9ff] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-[#0d1c2e]">{batch.batchNumber}</span>
                      {getStatusBadge(batch.status)}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[10px] text-[#727784]">
                      <div>
                        <span className="font-bold uppercase block">Qty</span>
                        {batch.remaining}/{batch.quantity}
                      </div>
                      <div>
                        <span className="font-bold uppercase block">Cost</span>
                        ${batch.costPrice.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-bold uppercase block">Supplier</span>
                        {batch.supplier || '-'}
                      </div>
                      <div>
                        <span className="font-bold uppercase block">Expires</span>
                        {batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-[#727784]">
                No batches found for this product
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
