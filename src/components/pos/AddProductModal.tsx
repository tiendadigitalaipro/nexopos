'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Package, Calculator, Percent } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function AddProductModal({ open, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    costPrice: '',
    salePrice: '',
    wholesalePrice: '',
    unitsPerBulk: '',
    bulkPrice: '',
    profitPercent: '',
    manualProfit: '',
    minStock: '5',
    currentStock: '0',
    taxRate: '16',
  })

  const loadCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  useEffect(() => {
    if (open) loadCategories()
  }, [open])

  const handleBulkCalc = () => {
    const units = parseInt(form.unitsPerBulk)
    const bulkCost = parseFloat(form.bulkPrice)
    if (units > 0 && bulkCost > 0) {
      const unitCost = bulkCost / units
      setForm((f) => ({ ...f, costPrice: unitCost.toFixed(2) }))
      toast.info(`Unit cost calculated: $${unitCost.toFixed(2)}`)
    }
  }

  const handleProfitCalc = (percent: string) => {
    const cost = parseFloat(form.costPrice)
    const pct = parseFloat(percent)
    if (cost > 0 && pct > 0) {
      const salePrice = cost * (1 + pct / 100)
      setForm((f) => ({ ...f, salePrice: salePrice.toFixed(2), profitPercent: percent, manualProfit: '' }))
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.sku) {
      toast.error('Name and SKU are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salePrice: form.salePrice || (parseFloat(form.costPrice) * 1.5).toFixed(2),
          profitPercent: form.profitPercent || form.manualProfit || null,
        }),
      })

      if (res.ok) {
        toast.success('Product created successfully!')
        onSaved()
        onClose()
        setForm({
          name: '', sku: '', barcode: '', categoryId: '', costPrice: '', salePrice: '',
          wholesalePrice: '', unitsPerBulk: '', bulkPrice: '', profitPercent: '', manualProfit: '',
          minStock: '5', currentStock: '0', taxRate: '16',
        })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create product')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const profitOptions = Array.from({ length: 91 }, (_, i) => i + 10) // 10 to 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="bg-gradient-to-r from-[#00458f] to-[#005cbb] px-6 py-4 sticky top-0 z-10">
          <DialogTitle className="text-white text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter product name"
                className="h-10 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">SKU *</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  placeholder="SKU-001"
                  className="h-10 mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Barcode</Label>
                <Input
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="7591234560001"
                  className="h-10 mt-1 font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger className="h-10 mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 bg-[#f8f9ff] rounded-xl p-4">
            <h3 className="text-xs font-bold text-[#00458f] uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Pricing
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Cost Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  placeholder="0.00"
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Sale Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  placeholder="0.00"
                  className="h-10 mt-1"
                />
              </div>
            </div>

            {/* Profit Percentage */}
            <div>
              <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-3 h-3" />
                Profit Percentage
              </Label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={form.profitPercent}
                  onValueChange={(v) => handleProfitCalc(v)}
                >
                  <SelectTrigger className="h-10 flex-1">
                    <SelectValue placeholder="Select %" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    <SelectItem value="manual">Manual Input</SelectItem>
                    {profitOptions.map((p) => (
                      <SelectItem key={p} value={p.toString()}>{p}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={form.profitPercent === 'manual' ? form.manualProfit : ''}
                  onChange={(e) => {
                    setForm({ ...form, manualProfit: e.target.value, profitPercent: 'manual' })
                    if (e.target.value) handleProfitCalc(e.target.value)
                  }}
                  placeholder="Enter %"
                  className="h-10 w-24"
                  disabled={form.profitPercent !== 'manual'}
                />
              </div>
            </div>

            {/* Wholesale */}
            <div>
              <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Wholesale Price</Label>
              <Input
                type="number"
                step="0.01"
                value={form.wholesalePrice}
                onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })}
                placeholder="0.00"
                className="h-10 mt-1"
              />
            </div>
          </div>

          {/* Bulk Price Calculator */}
          <div className="space-y-3 bg-[#fff8f0] rounded-xl p-4">
            <h3 className="text-xs font-bold text-[#653e00] uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Bulk Price Calculator
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Units per Bulk</Label>
                <Input
                  type="number"
                  value={form.unitsPerBulk}
                  onChange={(e) => setForm({ ...form, unitsPerBulk: e.target.value })}
                  placeholder="12"
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Bulk Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.bulkPrice}
                  onChange={(e) => setForm({ ...form, bulkPrice: e.target.value })}
                  placeholder="60.00"
                  className="h-10 mt-1"
                />
              </div>
            </div>
            <Button
              onClick={handleBulkCalc}
              variant="outline"
              size="sm"
              className="w-full h-10 border-[#653e00]/30 text-[#653e00] hover:bg-[#653e00]/10 font-bold text-xs uppercase tracking-wider touch-manipulation"
            >
              <Calculator className="w-4 h-4 mr-1" />
              Calculate Unit Cost
            </Button>
          </div>

          {/* Stock & Tax */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Current Stock</Label>
                <Input
                  type="number"
                  value={form.currentStock}
                  onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                  className="h-10 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Min Stock Alert</Label>
                <Input
                  type="number"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  className="h-10 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-[#727784] uppercase tracking-wider">Tax Rate (%)</Label>
              <Select value={form.taxRate} onValueChange={(v) => setForm({ ...form, taxRate: v })}>
                <SelectTrigger className="h-10 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16">16% (Standard)</SelectItem>
                  <SelectItem value="8">8% (Reduced)</SelectItem>
                  <SelectItem value="0">0% (Exempt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-[#00458f] to-[#005cbb] text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Package className="w-5 h-5 mr-2" />
            )}
            Save Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
