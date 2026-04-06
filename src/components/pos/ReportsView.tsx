'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, ShoppingBag, RefreshCw } from 'lucide-react'

function computeAbcData(productRanking: any[], totalProductSales: number) {
  return productRanking.reduce<Array<{ name: string; total: number; quantity: number; percent: string; cumPercent: string; category: string }>>((acc, p) => {
    const prevCum = acc.length > 0 ? parseFloat(acc[acc.length - 1].cumPercent) : 0
    const pct = (p.total / totalProductSales) * 100
    const cum = prevCum + pct
    const category = cum <= 80 ? 'A' : cum <= 95 ? 'B' : 'C'
    acc.push({ name: p.name, total: p.total, quantity: p.quantity, percent: pct.toFixed(1), cumPercent: cum.toFixed(1), category })
    return acc
  }, [])
}

function AbcAnalysisSection({ data }: { data: any }) {
  const productRanking = data?.topProducts || []
  const totalProductSales = productRanking.reduce((sum: number, p: any) => sum + p.total, 0) || 1
  const abcData = computeAbcData(productRanking, totalProductSales)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-2 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#00458f]" />
        Product Ranking (ABC Analysis)
      </h3>
      <p className="text-[10px] text-[#727784] mb-4">A = 80% of sales | B = 15% | C = 5%</p>

      {abcData.length === 0 ? (
        <p className="text-sm text-[#727784] text-center py-8">No sales data available</p>
      ) : (
        <div className="space-y-2">
          {abcData.map((product, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f9ff]">
              <span className="text-xs font-bold text-[#727784] w-6 text-center">#{i + 1}</span>
              <Badge className={`h-6 w-8 flex items-center justify-center text-[10px] font-black ${product.category === 'A' ? 'bg-[#00458f] text-white' : product.category === 'B' ? 'bg-[#653e00] text-white' : 'bg-[#727784] text-white'}`}>
                {product.category}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0d1c2e] truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#727784]">{product.quantity} sold</span>
                  <span className="text-[10px] text-[#727784]">•</span>
                  <span className="text-[10px] text-[#727784]">{product.percent}% of sales</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#00458f]">${product.total.toFixed(2)}</p>
                <p className="text-[10px] text-[#727784]">Cum: {product.cumPercent}%</p>
              </div>
              <div className="hidden md:block w-16">
                <div className="w-full h-1.5 bg-[#eff4ff] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${product.category === 'A' ? 'bg-[#00458f]' : product.category === 'B' ? 'bg-[#653e00]' : 'bg-[#727784]'}`} style={{ width: `${product.percent}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReportsView() {
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [initialized, setInitialized] = useState(false)
  const [period, setPeriod] = useState('today')
  const [, startTransition] = useTransition()

  const loadReports = () => {
    fetch(`/api/reports?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        startTransition(() => {
          setData(d)
          setInitialized(true)
        })
      })
      .catch(() => {
        startTransition(() => { setInitialized(true) })
      })
  }

  const initialLoad = useRef(true)

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false
      loadReports()
    }
  }, [])

  if (!initialized) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#00458f] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-[#0d1c2e] uppercase tracking-wider">Reports</h1>
          <p className="text-xs text-[#727784]">Sales analytics & product ranking</p>
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
          <Button onClick={loadReports} variant="outline" size="sm" className="border-[#d5e3fc] text-[#727784] hover:bg-[#eff4ff] touch-manipulation h-10">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-black text-[#00458f]">${(data?.totalSales || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Transactions</p>
          <p className="text-2xl font-black text-[#006c47]">{data?.totalTransactions || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Avg Ticket</p>
          <p className="text-2xl font-black text-[#653e00]">
            ${(data?.totalTransactions ? data.totalSales / data.totalTransactions : 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#727784] uppercase tracking-wider">Profit (Est.)</p>
          <p className="text-2xl font-black text-[#7b1fa2]">${(data?.totalProfit || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Sales by Hour */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#00458f]" />
          Sales Distribution by Hour
        </h3>
        <div className="flex items-end gap-1 h-32">
          {Array.from({ length: 24 }, (_, i) => {
            const maxSales = Math.max(...Object.values(data?.salesByHour || { 0: 1 }))
            const value = data?.salesByHour?.[i] || 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${maxSales > 0 ? (value / maxSales) * 100 : 0}%`,
                    minHeight: value > 0 ? '4px' : '1px',
                    backgroundColor: value > 0 ? '#00458f' : '#eff4ff',
                  }}
                />
                <span className="text-[8px] text-[#727784]">{i}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ABC Analysis */}
      <AbcAnalysisSection data={data} />

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-black text-[#0d1c2e] uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#00458f]" />
          Payment Method Breakdown
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Cash', value: data?.cashTotal || 0, color: '#006c47', total: data?.totalSales || 1 },
            { label: 'Card', value: data?.cardTotal || 0, color: '#00458f', total: data?.totalSales || 1 },
            { label: 'Transfer', value: data?.transferTotal || 0, color: '#653e00', total: data?.totalSales || 1 },
            { label: 'Divisas (USD)', value: data?.divisasTotal || 0, color: '#7b1fa2', total: data?.totalSales || 1 },
          ].map((pm) => {
            const percent = (pm.value / pm.total) * 100
            return (
              <div key={pm.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0d1c2e]">{pm.label}</span>
                  <span className="text-xs font-bold" style={{ color: pm.color }}>
                    ${pm.value.toFixed(2)} ({percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#eff4ff] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: pm.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
