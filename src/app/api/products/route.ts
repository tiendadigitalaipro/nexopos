import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || ''
    const categoryId = req.nextUrl.searchParams.get('categoryId') || ''
    
    const products = await db.product.findMany({
      where: {
        isActive: true,
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { barcode: { equals: search } },
          ],
        } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true, batches: { where: { status: { in: ['healthy', 'near_expiry'] } } } },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const product = await db.product.create({
      data: {
        sku: body.sku,
        barcode: body.barcode || null,
        name: body.name,
        description: body.description || null,
        categoryId: body.categoryId || null,
        costPrice: parseFloat(body.costPrice) || 0,
        salePrice: parseFloat(body.salePrice) || 0,
        wholesalePrice: body.wholesalePrice ? parseFloat(body.wholesalePrice) : null,
        unitsPerBulk: body.unitsPerBulk || null,
        bulkPrice: body.bulkPrice ? parseFloat(body.bulkPrice) : null,
        profitPercent: body.profitPercent || null,
        taxRate: parseFloat(body.taxRate) || 16,
        minStock: parseInt(body.minStock) || 5,
        currentStock: parseInt(body.currentStock) || 0,
      },
    })
    
    // Create initial batch if stock > 0
    if (product.currentStock > 0) {
      await db.batch.create({
        data: {
          productId: product.id,
          batchNumber: `BATCH-${Date.now()}`,
          quantity: product.currentStock,
          remaining: product.currentStock,
          costPrice: product.costPrice,
          status: 'healthy',
        },
      })
    }
    
    return NextResponse.json(product)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    
    const product = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        barcode: data.barcode || null,
        description: data.description || null,
        categoryId: data.categoryId || null,
        costPrice: parseFloat(data.costPrice) || 0,
        salePrice: parseFloat(data.salePrice) || 0,
        wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : null,
        unitsPerBulk: data.unitsPerBulk || null,
        bulkPrice: data.bulkPrice ? parseFloat(data.bulkPrice) : null,
        profitPercent: data.profitPercent || null,
        taxRate: parseFloat(data.taxRate) || 16,
        minStock: parseInt(data.minStock) || 5,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })
    
    return NextResponse.json(product)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    
    await db.product.update({
      where: { id },
      data: { isActive: false },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
