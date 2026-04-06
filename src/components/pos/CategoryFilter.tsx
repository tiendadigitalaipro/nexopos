'use client'

import { usePosStore } from '@/store/usePosStore'
import { useEffect, useState } from 'react'
import { Pill, Heart, Cpu, Apple, LayoutGrid } from 'lucide-react'

const iconMap: Record<string, any> = {
  pill: Pill,
  heart: Heart,
  cpu: Cpu,
  apple: Apple,
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  _count: { products: number }
}

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = usePosStore()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* All */}
      <button
        onClick={() => setSelectedCategory(null)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all touch-manipulation min-h-[44px]
          ${!selectedCategory
            ? 'bg-[#00458f] text-white shadow-md'
            : 'bg-white text-[#727784] hover:bg-[#eff4ff]'
          }`}
      >
        <LayoutGrid className="w-4 h-4" />
        All
      </button>

      {categories.map((cat) => {
        const Icon = iconMap[cat.icon] || LayoutGrid
        const isActive = selectedCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(isActive ? null : cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all touch-manipulation min-h-[44px]
              ${isActive
                ? 'text-white shadow-md'
                : 'bg-white text-[#727784] hover:opacity-80'
              }`}
            style={isActive ? { backgroundColor: cat.color } : undefined}
          >
            <Icon className="w-4 h-4" />
            {cat.name}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-[#eff4ff]'}`}>
              {cat._count.products}
            </span>
          </button>
        )
      })}
    </div>
  )
}
