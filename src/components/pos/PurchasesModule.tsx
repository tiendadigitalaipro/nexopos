'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Truck, Plus, Eye, RefreshCw, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PurchasesModule() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [purchases, setPurchases] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPO, setShowNewPO] = useState(false)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [poForm, setPoForm] = useState({
    supplierId: '',
    status: 'pending',
    items: [{ productName: '', quantity: '1', unitCost: '0', productId: '' }],
  })
  const [products, setProducts] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/suppliers'),
        fetch('/api/products'),
      ])
      setPurchases(await poRes.json())
      setSuppliers(await supRes.json())
      setProducts(await prodRes.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleAddItem = () => {
    setPoForm({
      ...poForm,
      items: [...poForm.items, { productName: '', quantity: '1', unitCost: '0', productId: '' }],
    })
  }

  const handleRemoveItem = (index: number) => {
    setPoForm({
      ...poForm,
      items: poForm.items.filter((_, i) => i !== index),
    })
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...poForm.items]
    newItems[index] = { ...newItems[index], [field]: value }

    // If product selected, auto-fill name
    if (field === 'productId' && value) {
      const product = products.find((p: any) => p.id === value)
      if (product) newItems[index].productName = product.name
    }

    setPoForm({ ...poForm, items: newItems })
  }

  const handleSubmitPO = async () => {
    if (poForm.items.length === 0 || poForm.items.every((i) => !i.productName)) {
      toast.error('Add at least one item')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: poForm.supplierId || null,
          status: poForm.status,
          items: poForm.items.filter((i) => i.productName).map((i) => ({
            productId: i.productId || null,
            productName: i.productName,
            quantity: parseInt(i.quantity) || 0,
            unitCost: parseFloat(i.unitCost) || 0,
          })),
        }),
      })

      if (res.ok) {
        toast.success('Purchase order created!')
        setShowNewPO(false)
        setPoForm({ supplierId: '', status: 'pending', items: [{ productName: '', quantity: '1', unitCost: '0', productId: '' }] })
        loadData()
      } else {
        toast.error('Failed to create order')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/purchases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        toast.success(`Order marked as ${status}`)
        loadData()
      }
    } catch {
      toast.error('Failed to update')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-[#fff3e0] text-[#653e00]',
      received: 'bg-[#e8f5e9] text-[#006c47]',
      paid: 'bg-[#eff4ff] text-[#00458f]',
      cancelled: 'bg-[#ffdad6] text-[#ba1a1a]',
    }
    return (
      <Badge className={`${styles[status] || styles.pending} text-[10px] font-bold uppercase tracking-wider h-6 px-2`}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-[#0d1c2e] uppercase tracking-wider">Purchases</h1>
          <p className="text-xs text-[#727784]">Manage purchase orders & suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm" className="border-[#d5e3fc] text-[#727784] hover:bg-[#eff4ff] touch-manipulation h-10">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={() => setShowNewPO(true)} className="bg-gradient-to-r from-[#00458f] to-[#005cbb] text-white font-bold text-xs uppercase tracking-wider h-10 touch-manipulation">
              <Plus className="w-4 h-4 mr-1" />
              New Order
            </Button>
          )}
        </div>
      </div>

      {/* Suppliers Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {suppliers.slice(0, 4).map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center">
                <Truck className="w-4 h-4 text-[#00458f]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0d1c2e]">{s.name}</p>
                <p className="text-[10px] text-[#727784]">{s.rif}</p>
              </div>
            </div>
            <p className="text-sm font-black text-[#653e00]">Balance: ${s.balance.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-3 border-[#00458f] border-t-transparent rounded-full" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-[#d5e3fc] mx-auto mb-2" />
            <p className="text-sm text-[#727784]">No purchase orders</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f8f9ff] hover:bg-[#f8f9ff]">
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Order #</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Supplier</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider hidden md:table-cell">Items</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Total</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((po) => (
                  <TableRow key={po.id} className="hover:bg-[#f8f9ff]">
                    <TableCell className="text-xs font-mono font-bold text-[#0d1c2e]">{po.orderNumber}</TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold">{po.supplier?.name || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-[#727784]">
                      {po.items?.length || 0} items
                    </TableCell>
                    <TableCell className="text-sm font-bold text-[#00458f]">${po.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelectedPO(selectedPO?.id === po.id ? null : po)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#eff4ff] touch-manipulation"
                        >
                          <Eye className="w-4 h-4 text-[#727784]" />
                        </button>
                        {po.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(po.id, 'received')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#e8f5e9] touch-manipulation"
                            title="Mark as received"
                          >
                            <Package className="w-4 h-4 text-[#006c47]" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>

      {/* Selected PO Detail */}
      {selectedPO && (
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-3">
            {selectedPO.orderNumber} - Items
          </h3>
          <div className="space-y-2">
            {selectedPO.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9ff]">
                <div>
                  <p className="text-sm font-semibold text-[#0d1c2e]">{item.productName}</p>
                  <p className="text-xs text-[#727784]">Qty: {item.quantity} × ${item.unitCost.toFixed(2)}</p>
                </div>
                <p className="text-sm font-bold text-[#00458f]">${item.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Purchase Order Modal */}
      {showNewPO && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#00458f] to-[#005cbb] px-6 py-4 rounded-t-2xl">
              <h2 className="text-white text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-5 h-5" />
                New Purchase Order
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Supplier */}
              <div>
                <label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Supplier</label>
                <select
                  value={poForm.supplierId}
                  onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                  className="w-full h-10 mt-1 px-3 rounded-lg bg-[#eff4ff] text-sm focus:outline-none focus:ring-2 focus:ring-[#00458f]/30"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div>
                <label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Items</label>
                <div className="space-y-2 mt-2">
                  {poForm.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full h-9 px-2 rounded-lg bg-[#eff4ff] text-xs focus:outline-none"
                        >
                          <option value="">Product</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-16 h-9 px-2 rounded-lg bg-[#eff4ff] text-xs text-center"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                        className="w-24 h-9 px-2 rounded-lg bg-[#eff4ff] text-xs text-center"
                        placeholder="Cost"
                      />
                      {poForm.items.length > 1 && (
                        <button onClick={() => handleRemoveItem(idx)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#ffdad6] text-[#ba1a1a]">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddItem} variant="outline" size="sm" className="w-full h-8 mt-2 border-[#d5e3fc] text-[#00458f] text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setShowNewPO(false)} variant="outline" className="flex-1 h-10 font-bold text-xs uppercase tracking-wider">
                  Cancel
                </Button>
                <Button onClick={handleSubmitPO} disabled={submitting} className="flex-1 h-10 bg-gradient-to-r from-[#00458f] to-[#005cbb] text-white font-bold text-xs uppercase tracking-wider">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4 mr-1" />}
                  Create Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
