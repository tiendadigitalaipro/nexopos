'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ArrowRightLeft,
  Banknote,
  ShoppingBag,
  Landmark,
  X,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePosStore } from '@/store/usePosStore'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { setCashRegister, cashRegisterOpen, cashRegisterId } = usePosStore()
  const isAdmin = user?.role === 'admin'
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')
  const [showCloseRegister, setShowCloseRegister] = useState(false)
  const [closing, setClosing] = useState(false)

  const loadDashboard = useCallback(() => {
    setLoading(true)
    fetch(`/api/reports?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    // Check cash register status
    fetch('/api/cash-register')
      .then((r) => r.json())
      .then((reg) => {
        if (reg) {
          setCashRegister(true, reg.id)
        }
      })
      .catch(() => {})
  }, [setCashRegister])

  // Listen for sale completion
  useEffect(() => {
    const handler = () => loadDashboard()
    window.addEventListener('sale-completed', handler)
    return () => window.removeEventListener('sale-completed', handler)
  }, [loadDashboard])

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Landmark className="w-16 h-16 text-[#d5e3fc] mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#0d1c2e] uppercase tracking-wider mb-2">Dashboard</h2>
          <p className="text-sm text-[#727784]">Dashboard data is only available for administrators.</p>
        </div>
      </div>
    )
  }

  const handleCloseRegister = async () => {
    setClosing(true)
    try {
      const res = await fetch('/api/cash-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          registerId: cashRegisterId,
          userId: user?.id,
        }),
      })
      if (res.ok) {
        setCashRegister(false, null)
        toast.success('Cash register closed successfully')
        setShowCloseRegister(false)
        loadDashboard()
      }
    } catch {
      toast.error('Failed to close register')
    } finally {
      setClosing(false)
    }
  }

  if (!data && loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#00458f] border-t-transparent rounded-full" />
      </div>
    )
  }

  const maxHourSales = Math.max(...Object.values(data?.salesByHour || { 0: 1 }))

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-[#0d1c2e] uppercase tracking-wider">Dashboard</h1>
          <p className="text-xs text-[#727784]">Real-time business metrics</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider touch-manipulation min-h-[44px]
                ${period === p ? 'bg-[#00458f] text-white' : 'bg-white text-[#727784] hover:bg-[#eff4ff]'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#00458f]" />
            </div>
            <span className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Total Sales</span>
          </div>
          <p className="text-2xl font-black text-[#00458f]">${(data?.totalSales || 0).toFixed(2)}</p>
          <p className="text-xs text-[#006c47] font-medium">{data?.totalTransactions || 0} transactions</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5e9] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#006c47]" />
            </div>
            <span className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Net Profit</span>
          </div>
          <p className="text-2xl font-black text-[#006c47]">${(data?.totalProfit || 0).toFixed(2)}</p>
          <p className="text-xs text-[#727784]">Est. margin</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#fff3e0] flex items-center justify-center">
              <Landmark className="w-4 h-4 text-[#653e00]" />
            </div>
            <span className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Cash Drawer</span>
          </div>
          <p className="text-2xl font-black text-[#653e00]">
            ${(data?.cashRegister?.currentBalance || 0).toFixed(2)}
          </p>
          <Badge className={`text-[10px] h-5 ${cashRegisterOpen ? 'bg-[#e8f5e9] text-[#006c47]' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>
            {cashRegisterOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#f3e5f5] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#7b1fa2]" />
            </div>
            <span className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Avg Ticket</span>
          </div>
          <p className="text-2xl font-black text-[#7b1fa2]">
            ${(data?.totalTransactions ? data.totalSales / data.totalTransactions : 0).toFixed(2)}
          </p>
          <p className="text-xs text-[#727784]">Per transaction</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Sales by Hour - Bar Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-4">Sales by Hour</h3>
          <div className="flex items-end gap-1 h-40">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all bg-gradient-to-t from-[#00458f] to-[#005cbb]"
                  style={{
                    height: `${maxHourSales > 0 ? ((data?.salesByHour?.[i] || 0) / maxHourSales) * 100 : 0}%`,
                    minHeight: '2px',
                  }}
                />
                <span className="text-[8px] text-[#727784]">{i.toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods + Categories */}
        <div className="space-y-4">
          {/* Payment Methods */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-3">Payment Methods</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Cash', value: data?.cashTotal || 0, color: '#006c47', icon: DollarSign },
                { label: 'Card', value: data?.cardTotal || 0, color: '#00458f', icon: CreditCard },
                { label: 'Transfer', value: data?.transferTotal || 0, color: '#653e00', icon: ArrowRightLeft },
                { label: 'USD', value: data?.divisasTotal || 0, color: '#7b1fa2', icon: Banknote },
              ].map((pm) => {
                const Icon = pm.icon
                return (
                  <div key={pm.label} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: pm.color + '10' }}>
                    <Icon className="w-4 h-4" style={{ color: pm.color }} />
                    <div>
                      <p className="text-[10px] font-bold text-[#727784] uppercase">{pm.label}</p>
                      <p className="text-sm font-black" style={{ color: pm.color }}>${pm.value.toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Categories - Donut */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-3">Top Categories</h3>
            {data?.categorySales?.length > 0 ? (
              <div className="flex items-center gap-4">
                {/* CSS Donut */}
                <div className="relative w-20 h-20 shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: `conic-gradient(${data.categorySales.map((c: any, i: number) => 
                        `${c.color} ${i === 0 ? 0 : data.categorySales.slice(0, i).reduce((s: number, cat: any) => s + cat.total, 0) / (data.categorySales.reduce((s: number, c: any) => s + c.total, 0)) * 360}deg ${(data.categorySales.slice(0, i + 1).reduce((s: number, c: any) => s + c.total, 0) / (data.categorySales.reduce((s: number, c: any) => s + c.total, 0)) * 360)}deg`
                      ).join(', ')})`,
                    }}
                  />
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-[#0d1c2e]">{data.categorySales.length}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  {data.categorySales.slice(0, 4).map((cat: any) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs text-[#727784] flex-1 truncate">{cat.name}</span>
                      <span className="text-xs font-bold text-[#0d1c2e]">${cat.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#727784]">No category data available</p>
            )}
          </div>
        </div>
      </div>

      {/* High Value Transactions */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-3">High-Value Transactions</h3>
        {data?.highValue?.length > 0 ? (
          <div className="space-y-2">
            {data.highValue.map((tx: any) => (
              <div key={tx.saleNumber} className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9ff]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-[#00458f]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0d1c2e]">{tx.saleNumber}</p>
                    <p className="text-[10px] text-[#727784]">{tx.items} items • {tx.paymentMethod}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-[#00458f]">${tx.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#727784] text-center py-4">No transactions yet</p>
        )}
      </div>

      {/* Cash Register Close */}
      {cashRegisterOpen && isAdmin && (
        <Button
          onClick={() => setShowCloseRegister(true)}
          className="w-full h-12 bg-gradient-to-r from-[#ba1a1a] to-[#d32f2f] text-white font-bold uppercase tracking-wider text-sm hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation mb-4"
        >
          <Landmark className="w-5 h-5 mr-2" />
          Close Cash Register (Cierre de Caja)
        </Button>
      )}

      {/* Close Register Dialog */}
      <Dialog open={showCloseRegister} onOpenChange={setShowCloseRegister}>
        <DialogContent className="max-w-sm p-0 gap-0">
          <DialogHeader className="bg-gradient-to-r from-[#ba1a1a] to-[#d32f2f] px-6 py-4">
            <DialogTitle className="text-white text-lg font-black uppercase tracking-wider">
              Close Cash Register
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center space-y-4">
            <p className="text-sm text-[#727784]">Are you sure you want to close the cash register?</p>
            <div className="bg-[#f8f9ff] rounded-xl p-4">
              <p className="text-xs font-bold text-[#727784] uppercase tracking-wider">Current Balance</p>
              <p className="text-3xl font-black text-[#00458f]">${(data?.cashRegister?.currentBalance || 0).toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCloseRegister(false)}
                variant="outline"
                className="flex-1 h-10 font-bold text-xs uppercase tracking-wider touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCloseRegister}
                disabled={closing}
                className="flex-1 h-10 bg-[#ba1a1a] text-white font-bold text-xs uppercase tracking-wider touch-manipulation"
              >
                {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Confirm Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
