import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true,
        batches: { orderBy: { receivedDate: 'desc' } },
      },
      orderBy: { name: 'asc' },
    })

    // Enrich with batch status
    const enriched = products.map((p) => {
      const totalRemaining = p.batches.reduce((sum, b) => sum + b.remaining, 0)
      const hasExpired = p.batches.some((b) => b.status === 'expired')
      const hasNearExpiry = p.batches.some((b) => b.status === 'near_expiry')
      const isLowStock = p.currentStock <= p.minStock
      
      let status = 'healthy'
      if (hasExpired) status = 'expired'
      else if (isLowStock) status = 'critical'
      else if (hasNearExpiry) status = 'near_expiry'

      return {
        ...p,
        totalRemaining,
        batchStatus: status,
        batchCount: p.batches.length,
      }
    })

    return NextResponse.json(enriched)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    if (body.action === 'add-batch') {
      const batch = await db.batch.create({
        data: {
          productId: body.productId,
          batchNumber: body.batchNumber || `BATCH-${Date.now()}`,
          supplier: body.supplier || null,
          quantity: body.quantity,
          remaining: body.quantity,
          costPrice: body.costPrice,
          expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
          status: 'healthy',
        },
      })

      // Update product stock
      await db.product.update({
        where: { id: body.productId },
        data: { currentStock: { increment: body.quantity } },
      })

      return NextResponse.json(batch)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to update inventory' }, { status: 500 })
  }
}
