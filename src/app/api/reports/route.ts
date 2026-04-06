import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get('period') || 'today'
    
    let startDate: Date
    const today = new Date()
    
    switch (period) {
      case 'week':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      default:
        startDate = new Date(today.toISOString().split('T')[0] + 'T00:00:00')
        break
    }

    // Get sales in period
    const sales = await db.sale.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: startDate },
      },
      include: { items: { include: { product: { include: { category: true } } } } },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate metrics
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const totalProfit = sales.reduce((sum, s) => {
      return sum + s.items.reduce((p, i) => p + (i.total - (i.total / 1.16) * 0.5), 0) // approx profit
    }, 0)
    const totalTransactions = sales.length
    
    const cashTotal = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.totalAmount, 0)
    const cardTotal = sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.totalAmount, 0)
    const transferTotal = sales.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.totalAmount, 0)
    const divisasTotal = sales.filter(s => s.paymentMethod === 'divisas').reduce((sum, s) => sum + s.totalAmount, 0)

    // Sales by hour
    const salesByHour: Record<number, number> = {}
    for (let h = 0; h < 24; h++) salesByHour[h] = 0
    sales.forEach(s => {
      const hour = new Date(s.createdAt).getHours()
      salesByHour[hour] += s.totalAmount
    })

    // Top categories
    const categorySales: Record<string, { name: string; color: string; total: number }> = {}
    sales.forEach(s => {
      s.items.forEach(item => {
        if (item.product?.category) {
          const cat = item.product.category
          if (!categorySales[cat.id]) {
            categorySales[cat.id] = { name: cat.name, color: cat.color, total: 0 }
          }
          categorySales[cat.id].total += item.total
        }
      })
    })

    // Top products
    const productSales: Record<string, { name: string; quantity: number; total: number }> = {}
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = { name: item.productName, quantity: 0, total: 0 }
        }
        productSales[item.productName].quantity += item.quantity
        productSales[item.productName].total += item.total
      })
    })
    const topProducts = Object.values(productSales).sort((a, b) => b.total - a.total).slice(0, 10)

    // High value transactions
    const highValue = [...sales].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10).map(s => ({
      saleNumber: s.saleNumber,
      total: s.totalAmount,
      paymentMethod: s.paymentMethod,
      items: s.items.length,
      customerName: s.customerName,
      createdAt: s.createdAt,
    }))

    // Cash register
    const cashRegister = await db.cashRegister.findFirst({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      totalSales,
      totalProfit,
      totalTransactions,
      cashTotal,
      cardTotal,
      transferTotal,
      divisasTotal,
      salesByHour,
      categorySales: Object.values(categorySales).sort((a, b) => b.total - a.total),
      topProducts,
      highValue,
      cashRegister,
      salesCount: sales.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
