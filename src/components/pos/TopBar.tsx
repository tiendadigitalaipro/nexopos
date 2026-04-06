'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { usePosStore } from '@/store/usePosStore'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

export default function TopBar() {
  const { user } = useAuthStore()
  const { searchQuery, setSearchQuery, cart, setMobileCartOpen } = usePosStore()
  const [mobileSearch, setMobileSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    if (mobileSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [mobileSearch])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    // Check if it looks like a barcode (all digits, length >= 8)
    if (/^\d{8,}$/.test(value)) {
      setSearchQuery(value)
    }
  }

  return (
    <header className="h-14 bg-white flex items-center px-4 gap-3 border-b border-[#d5e3fc]/50">
      {/* Logo for mobile */}
      <div className="lg:hidden flex items-center gap-2">
        <span className="text-lg font-black text-[#00458f] tracking-tighter">NexoPOS</span>
      </div>

      {/* Desktop Logo */}
      <div className="hidden lg:flex items-center gap-2 w-48">
        <span className="text-lg font-black text-[#00458f] tracking-tighter">NexoPOS</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        {mobileSearch ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727784]" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, SKU, or scan barcode..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#eff4ff] text-sm text-[#0d1c2e] placeholder:text-[#727784] focus:outline-none focus:ring-2 focus:ring-[#00458f]/30"
                autoFocus
              />
            </div>
            <button
              onClick={() => { setMobileSearch(false); setSearchQuery('') }}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#eff4ff] transition-colors"
            >
              <X className="w-5 h-5 text-[#727784]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setMobileSearch(true)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#eff4ff] transition-colors touch-manipulation"
          >
            <Search className="w-5 h-5 text-[#727784]" />
          </button>
        )}
        <div className="hidden lg:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727784]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, SKU, or scan barcode..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#eff4ff] text-sm text-[#0d1c2e] placeholder:text-[#727784] focus:outline-none focus:ring-2 focus:ring-[#00458f]/30"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Mobile Cart Button */}
        <button
          onClick={() => setMobileCartOpen(true)}
          className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#eff4ff] transition-colors touch-manipulation"
        >
          <ShoppingCart className="w-5 h-5 text-[#0d1c2e]" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-[#006c47] text-white rounded-full">
              {cartCount}
            </Badge>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eff4ff]">
          <User className="w-4 h-4 text-[#00458f]" />
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider">{user?.name}</span>
            <span className="text-[10px] text-[#727784] uppercase ml-2">{user?.role}</span>
          </div>
          <Badge variant="outline" className="sm:hidden text-[10px] h-5 border-[#00458f] text-[#00458f]">
            {user?.role}
          </Badge>
        </div>
      </div>
    </header>
  )
}
