import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0]
    const held = req.nextUrl.searchParams.get('held') === 'true'
    
    if (held) {
      const heldSales = await db.sale.findMany({
        where: { isHeld: true, status: 'held' },
        include: { items: true },
        orderBy: { heldAt: 'desc' },
      })
      return NextResponse.json(heldSales)
    }

    const startDate = new Date(date + 'T00:00:00')
    const endDate = new Date(date + 'T23:59:59')
    
    const sales = await db.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'completed',
      },
      include: { items: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(sales)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (body.action === 'hold') {
      const saleNumber = `HLD-${Date.now()}`
      const sale = await db.sale.create({
        data: {
          saleNumber,
          userId: body.userId,
          cashRegisterId: body.cashRegisterId,
          status: 'held',
          isHeld: true,
          heldAt: new Date(),
          subtotal: body.subtotal,
          taxAmount: body.taxAmount,
          igtfAmount: body.igtfAmount,
          discountAmount: body.discountAmount,
          totalAmount: body.totalAmount,
          customerName: body.customerName || null,
          items: {
            create: body.items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
      })
      return NextResponse.json(sale)
    }

    if (body.action === 'process') {
      const saleNumber = `V${Date.now()}`
      
      // Create the sale
      const sale = await db.sale.create({
        data: {
          saleNumber,
          userId: body.userId,
          cashRegisterId: body.cashRegisterId,
          status: 'completed',
          subtotal: body.subtotal,
          taxAmount: body.taxAmount,
          igtfAmount: body.igtfAmount,
          discountAmount: body.discountAmount,
          totalAmount: body.totalAmount,
          paymentMethod: body.paymentMethod,
          paymentRef: body.paymentRef || null,
          customerName: body.customerName || null,
          items: {
            create: body.items.map((item: any) => ({
              productId: item.productId,
              batchId: item.batchId || null,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
      })

      // Update product stock
      for (const item of body.items) {
        if (item.productId) {
          await db.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          })
          
          // Update batch remaining stock if batchId provided
          if (item.batchId) {
            await db.batch.update({
              where: { id: item.batchId },
              data: { remaining: { decrement: item.quantity } },
            })
          } else {
            // Find a healthy batch to decrement from
            const batches = await db.batch.findMany({
              where: { productId: item.productId, remaining: { gt: 0 }, status: { in: ['healthy', 'near_expiry'] } },
              orderBy: { expirationDate: 'asc' },
            })
            let remaining = item.quantity
            for (const batch of batches) {
              if (remaining <= 0) break
              const decrement = Math.min(remaining, batch.remaining)
              await db.batch.update({
                where: { id: batch.id },
                data: { remaining: { decrement: decrement } },
              })
              remaining -= decrement
            }
          }
        }
      }

      // Update cash register balance
      if (body.cashRegisterId && body.paymentMethod === 'cash') {
        await db.cashRegister.update({
          where: { id: body.cashRegisterId },
          data: { currentBalance: { increment: body.totalAmount } },
        })
      }

      // Update daily summary
      const today = new Date().toISOString().split('T')[0]
      const existing = await db.dailySummary.findUnique({ where: { date: today } })
      if (existing) {
        await db.dailySummary.update({
          where: { date: today },
          data: {
            totalSales: { increment: body.totalAmount },
            totalProfit: { increment: body.profit || 0 },
            totalTransactions: { increment: 1 },
            ...(body.paymentMethod === 'cash' ? { cashTotal: { increment: body.totalAmount } } : {}),
            ...(body.paymentMethod === 'card' ? { cardTotal: { increment: body.totalAmount } } : {}),
            ...(body.paymentMethod === 'transfer' ? { transferTotal: { increment: body.totalAmount } } : {}),
            ...(body.paymentMethod === 'divisas' ? { divisasTotal: { increment: body.totalAmount } } : {}),
          },
        })
      } else {
        await db.dailySummary.create({
          data: {
            date: today,
            totalSales: body.totalAmount,
            totalProfit: body.profit || 0,
            totalTransactions: 1,
            ...(body.paymentMethod === 'cash' ? { cashTotal: body.totalAmount } : {}),
            ...(body.paymentMethod === 'card' ? { cardTotal: body.totalAmount } : {}),
            ...(body.paymentMethod === 'transfer' ? { transferTotal: body.totalAmount } : {}),
            ...(body.paymentMethod === 'divisas' ? { divisasTotal: body.totalAmount } : {}),
          },
        })
      }

      return NextResponse.json(sale)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to process sale' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Sale ID required' }, { status: 400 })
    
    await db.sale.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 })
  }
}
