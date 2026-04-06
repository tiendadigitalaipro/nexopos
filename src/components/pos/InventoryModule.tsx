'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useState, useEffect, useRef, useTransition } from 'react'
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
import { Lock, Package, AlertTriangle, Clock, Plus, RefreshCw, Filter } from 'lucide-react'
import AddProductModal from './AddProductModal'
import BatchDetailModal from './BatchDetailModal'
import { toast } from 'sonner'

interface ProductWithBatch {
  id: string
  sku: string
  name: string
  costPrice: number
  salePrice: number
  currentStock: number
  minStock: number
  batchStatus: string
  batchCount: number
  totalRemaining: number
  category: { id: string; name: string; color: string } | null
  batches: any[]
}

export default function InventoryModule() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<ProductWithBatch[]>([])
  const [initialized, setInitialized] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithBatch | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const isAdmin = user?.role === 'admin'

  const initialLoad = useRef(true)
  const [isPending, startTransition] = useTransition()

  const loadInventory = () => {
    fetch('/api/inventory')
      .then((r) => r.json())
      .then((data) => {
        startTransition(() => {
          setProducts(data)
          setInitialized(true)
        })
      })
      .catch(() => {
        startTransition(() => { setInitialized(true) })
      })
  }

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false
      loadInventory()
    }
  }, [])

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#eff4ff] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-[#727784]" />
          </div>
          <h2 className="text-xl font-black text-[#0d1c2e] uppercase tracking-wider mb-2">Access Restricted</h2>
          <p className="text-sm text-[#727784] max-w-sm">
            Inventory management is only available for administrators. Contact your system admin for access.
          </p>
        </div>
      </div>
    )
  }

  const filteredProducts = filter === 'all'
    ? products
    : products.filter((p) => p.batchStatus === filter)

  const stats = {
    total: products.length,
    healthy: products.filter((p) => p.batchStatus === 'healthy').length,
    nearExpiry: products.filter((p) => p.batchStatus === 'near_expiry').length,
    critical: products.filter((p) => p.batchStatus === 'critical').length,
    expired: products.filter((p) => p.batchStatus === 'expired').length,
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      healthy: 'bg-[#e8f5e9] text-[#006c47]',
      near_expiry: 'bg-[#fff3e0] text-[#653e00]',
      critical: 'bg-[#ffdad6] text-[#ba1a1a]',
      expired: 'bg-[#0d1c2e] text-white',
    }
    const labels: Record<string, string> = {
      healthy: 'Healthy',
      near_expiry: 'Near Expiry',
      critical: 'Critical',
      expired: 'Expired',
    }
    return (
      <Badge className={`${styles[status] || styles.healthy} text-[10px] font-bold uppercase tracking-wider h-6 px-2`}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getStockPercentage = (current: number, min: number) => {
    if (min === 0) return 100
    return Math.min((current / min) * 100, 100)
  }

  const getStockColor = (current: number, min: number) => {
    if (current === 0) return 'bg-[#ba1a1a]'
    if (current <= min) return 'bg-[#653e00]'
    return 'bg-[#006c47]'
  }

  const filters = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'healthy', label: 'Healthy', count: stats.healthy },
    { id: 'near_expiry', label: 'Near Expiry', count: stats.nearExpiry },
    { id: 'critical', label: 'Critical', count: stats.critical },
    { id: 'expired', label: 'Expired', count: stats.expired },
  ]

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-[#0d1c2e] uppercase tracking-wider">Inventory</h1>
          <p className="text-xs text-[#727784]">Manage products, batches & stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadInventory}
            variant="outline"
            size="sm"
            className="border-[#d5e3fc] text-[#727784] hover:bg-[#eff4ff] touch-manipulation h-10"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowAddProduct(true)}
            className="bg-gradient-to-r from-[#00458f] to-[#005cbb] text-white font-bold text-xs uppercase tracking-wider h-10 touch-manipulation"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total SKU', value: stats.total, color: '#00458f', bg: '#eff4ff' },
          { label: 'Healthy', value: stats.healthy, color: '#006c47', bg: '#e8f5e9' },
          { label: 'Near Expiry', value: stats.nearExpiry, color: '#653e00', bg: '#fff3e0' },
          { label: 'Critical', value: stats.critical, color: '#ba1a1a', bg: '#ffdad6' },
          { label: 'Expired', value: stats.expired, color: '#0d1c2e', bg: '#f0f0f0' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-3" style={{ backgroundColor: stat.bg }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: stat.color }}>
              {stat.label}
            </p>
            <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-[#727784] shrink-0 mt-2.5" />
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all touch-manipulation min-h-[44px]
              ${filter === f.id
                ? 'bg-[#00458f] text-white'
                : 'bg-white text-[#727784] hover:bg-[#eff4ff]'
              }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {!initialized ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-3 border-[#00458f] border-t-transparent rounded-full" />
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f8f9ff] hover:bg-[#f8f9ff]">
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Product</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">SKU</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Stock</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider hidden lg:table-cell">Level</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-bold text-[#727784] uppercase tracking-wider">Batches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-[#f8f9ff] transition-colors"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: product.category?.color + '15' }}
                        >
                          <Package className="w-4 h-4" style={{ color: product.category?.color || '#727784' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0d1c2e]">{product.name}</p>
                          <p className="text-xs text-[#727784]">${product.salePrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[#727784]">{product.sku}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.category && (
                        <Badge
                          className="text-[10px] font-bold h-5"
                          style={{
                            backgroundColor: product.category.color + '20',
                            color: product.category.color,
                          }}
                        >
                          {product.category.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm font-bold text-[#0d1c2e]">{product.currentStock}</span>
                        <span className="text-xs text-[#727784]"> / min {product.minStock}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="w-20 h-2 bg-[#eff4ff] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getStockColor(product.currentStock, product.minStock)}`}
                          style={{ width: `${getStockPercentage(product.currentStock, product.minStock)}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.batchStatus)}</TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product) }}
                        className="text-xs font-bold text-[#00458f] hover:underline"
                      >
                        {product.batchCount}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>

      {/* Modals */}
      <AddProductModal open={showAddProduct} onClose={() => setShowAddProduct(false)} onSaved={loadInventory} />
      {selectedProduct && (
        <BatchDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={loadInventory}
        />
      )}
    </div>
  )
}
