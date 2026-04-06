'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { usePosStore } from '@/store/usePosStore'
import { ShoppingCart, Package, BarChart3, Truck, Settings, LogOut, X } from 'lucide-react'

const navItems = [
  { id: 'sales', label: 'POS', icon: ShoppingCart },
  { id: 'inventory', label: 'INVENTORY', icon: Package },
  { id: 'admin', label: 'DASHBOARD', icon: BarChart3 },
  { id: 'purchases', label: 'PURCHASES', icon: Truck },
  { id: 'reports', label: 'REPORTS', icon: BarChart3 },
]

export default function Sidebar() {
  const { activeTab, setActiveTab } = usePosStore()
  const { user, logout } = useAuthStore()

  const isAdmin = user?.role === 'admin'

  return (
    <aside className="hidden lg:flex flex-col w-[72px] bg-[#00458f] text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-[#003570]">
        <span className="text-xl font-black tracking-tighter">PP</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center py-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isDisabled = item.id === 'inventory' && !isAdmin

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all touch-manipulation
                ${isActive
                  ? 'bg-white/20 text-white scale-105'
                  : isDisabled
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white/70 hover:bg-white/10 hover:text-white active:scale-95'
                }`}
              disabled={isDisabled}
              title={item.label}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center justify-center w-16 h-16 text-white/60 hover:text-white hover:bg-white/10 transition-all touch-manipulation active:scale-95 mb-4"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </aside>
  )
}

export function MobileNav() {
  const { activeTab, setActiveTab } = usePosStore()
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#00458f] text-white z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isDisabled = item.id === 'inventory' && !isAdmin

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-12 transition-all touch-manipulation
                ${isActive
                  ? 'text-white'
                  : isDisabled
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white/60'
                }`}
              disabled={isDisabled}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[8px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
