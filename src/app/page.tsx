'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { usePosStore } from '@/store/usePosStore'
import Sidebar, { MobileNav } from '@/components/pos/Sidebar'
import TopBar from '@/components/pos/TopBar'
import LicensePanel from '@/components/pos/LicensePanel'
import LoginScreen from '@/components/pos/LoginScreen'
import SalesTerminal from '@/components/pos/SalesTerminal'
import InventoryModule from '@/components/pos/InventoryModule'
import AdminDashboard from '@/components/pos/AdminDashboard'
import PurchasesModule from '@/components/pos/PurchasesModule'
import ReportsView from '@/components/pos/ReportsView'
import CashRegisterModal from '@/components/pos/CashRegisterModal'
import { Button } from '@/components/ui/button'
import { Loader2, Database } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const { isLicenseValid, isAuthenticated, user, setLicense, setUser } = useAuthStore()
  const { activeTab } = usePosStore()
  const [initializing, setInitializing] = useState(true)

  // On mount, check for existing valid license
  useEffect(() => {
    const init = async () => {
      try {
        // Check license
        const licenseRes = await fetch('/api/license')
        if (licenseRes.ok) {
          const licenseData = await licenseRes.json()
          if (licenseData && licenseData.isActive) {
            setLicense({
              id: licenseData.id,
              licenseKey: licenseData.licenseKey,
              businessName: licenseData.businessName,
              ownerName: licenseData.ownerName,
              email: licenseData.email,
              isActive: licenseData.isActive,
              expiresAt: licenseData.expiresAt,
            })
          }
        }
      } catch {}
      setInitializing(false)
    }
    init()
  }, [setLicense])

  const handleSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      if (res.ok) {
        toast.success('Database seeded! Refreshing...')
        // Re-check license
        const licenseRes = await fetch('/api/license')
        if (licenseRes.ok) {
          const licenseData = await licenseRes.json()
          if (licenseData && licenseData.isActive) {
            setLicense({
              id: licenseData.id,
              licenseKey: licenseData.licenseKey,
              businessName: licenseData.businessName,
              ownerName: licenseData.ownerName,
              email: licenseData.email,
              isActive: licenseData.isActive,
              expiresAt: licenseData.expiresAt,
            })
          }
        }
      } else {
        toast.error('Seed failed')
      }
    } catch {
      toast.error('Network error')
    }
  }

  // Loading state
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#00458f]" />
        <p className="text-sm text-[#727784] font-medium uppercase tracking-wider">Initializing NexoPOS...</p>
      </div>
    )
  }

  // License gate
  if (!isLicenseValid) {
    return (
      <div>
        <LicensePanel />
        {/* Seed button for initial setup */}
        <div className="fixed bottom-4 right-4">
          <Button
            onClick={handleSeed}
            variant="outline"
            size="sm"
            className="bg-white/80 border-[#d5e3fc] text-[#727784] hover:bg-white shadow-sm touch-manipulation h-10"
          >
            <Database className="w-4 h-4 mr-1" />
            Seed Demo Data
          </Button>
        </div>
      </div>
    )
  }

  // Login gate
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Main POS System
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9ff]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        {/* Content */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'sales' && <SalesTerminal />}
          {activeTab === 'inventory' && <InventoryModule />}
          {activeTab === 'admin' && <AdminDashboard />}
          {activeTab === 'purchases' && <PurchasesModule />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Cash Register Modal */}
      <CashRegisterModal />
    </div>
  )
}
