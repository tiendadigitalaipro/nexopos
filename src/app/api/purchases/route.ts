import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const purchases = await db.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(purchases)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const orderNumber = `PO-${Date.now()}`
    
    let subtotal = 0
    for (const item of body.items) {
      subtotal += item.quantity * item.unitCost
    }
    const taxAmount = subtotal * 0.16
    const totalAmount = subtotal + taxAmount

    const purchase = await db.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: body.supplierId || null,
        status: body.status || 'pending',
        subtotal,
        taxAmount,
        totalAmount,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId || null,
            productName: item.productName,
            quantity: item.quantity,
            unitCost: item.unitCost,
            total: item.quantity * item.unitCost,
            batchId: item.batchId || null,
          })),
        },
      },
    })

    // If received, update product stock
    if (body.status === 'received') {
      for (const item of body.items) {
        if (item.productId) {
          await db.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          })

          await db.batch.create({
            data: {
              productId: item.productId,
              batchNumber: `BATCH-${Date.now()}-${item.productId.slice(-4)}`,
              quantity: item.quantity,
              remaining: item.quantity,
              costPrice: item.unitCost,
              status: 'healthy',
            },
          })
        }
      }
    }

    return NextResponse.json(purchase)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to create purchase' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    
    const purchase = await db.purchaseOrder.update({
      where: { id },
      data: {
        status: data.status,
        receivedDate: data.status === 'received' ? new Date() : undefined,
      },
    })
    
    // If status changed to received, update stock
    if (data.status === 'received') {
      const order = await db.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      })
      if (order) {
        for (const item of order.items) {
          if (item.productId) {
            await db.product.update({
              where: { id: item.productId },
              data: { currentStock: { increment: item.quantity } },
            })
            await db.batch.create({
              data: {
                productId: item.productId,
                batchNumber: `BATCH-${Date.now()}-${item.productId.slice(-4)}`,
                quantity: item.quantity,
                remaining: item.quantity,
                costPrice: item.unitCost,
                status: 'healthy',
              },
            })
          }
        }
      }
    }

    return NextResponse.json(purchase)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to update purchase' }, { status: 500 })
  }
}
