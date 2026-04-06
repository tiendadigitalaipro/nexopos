'use client'

import { usePosStore, type CartItem } from '@/store/usePosStore'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Plus, Package, AlertTriangle } from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  salePrice: number
  currentStock: number
  minStock: number
  category: { id: string; name: string; color: string } | null
}

export default function ProductGrid() {
  const { selectedCategory, searchQuery, addToCart, setActiveTab, user } = usePosStore()
  const [products, setProducts] = useState<Product[]>([])
  const [, startTransition] = useTransition()
  const initialized = useRef(false)
  const prevSearch = useRef(searchQuery)
  const prevCategory = useRef(selectedCategory)

  useEffect(() => {
    if (initialized.current && prevSearch.current === searchQuery && prevCategory.current === selectedCategory) return
    initialized.current = true
    prevSearch.current = searchQuery
    prevCategory.current = selectedCategory

    startTransition(() => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCategory) params.set('categoryId', selectedCategory)

      fetch(`/api/products?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setProducts(data)
        })
        .catch(() => {})
    })
  }, [selectedCategory, searchQuery, startTransition])

  const handleAddToCart = (product: Product) => {
    if (product.currentStock <= 0) return
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.salePrice,
      total: product.salePrice,
    }
    addToCart(item)
  }

  const isLowStock = (product: Product) => product.currentStock <= product.minStock
  const isOutOfStock = (product: Product) => product.currentStock <= 0

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Package className="w-12 h-12 text-[#d5e3fc] mb-3" />
          <p className="text-[#727784] font-medium">No products found</p>
          <p className="text-sm text-[#727784]/60">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => handleAddToCart(product)}
              disabled={isOutOfStock(product)}
              className={`group relative bg-white rounded-xl p-3 text-left transition-all active:scale-[0.97] touch-manipulation
                ${isOutOfStock(product)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-md hover:ring-2 hover:ring-[#00458f]/20 cursor-pointer'
                }
                min-h-[120px] flex flex-col justify-between
              `}
            >
              {/* Category color bar */}
              <div
                className="absolute top-0 left-3 right-3 h-1 rounded-b-full"
                style={{ backgroundColor: product.category?.color || '#d5e3fc' }}
              />

              {/* Product Info */}
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-[#0d1c2e] leading-tight line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-[10px] text-[#727784] font-mono">{product.sku}</p>
              </div>

              {/* Price & Stock */}
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p className="text-lg font-black text-[#00458f]">
                    ${product.salePrice.toFixed(2)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    isOutOfStock(product) ? 'text-[#ba1a1a]' : isLowStock(product) ? 'text-[#653e00]' : 'text-[#006c47]'
                  }`}>
                    {isOutOfStock(product) ? 'OUT OF STOCK' : `${product.currentStock} units`}
                  </p>
                </div>

                {!isOutOfStock(product) && (
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00458f] to-[#005cbb] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                )}

                {isLowStock(product) && !isOutOfStock(product) && (
                  <AlertTriangle className="w-4 h-4 text-[#653e00]" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
