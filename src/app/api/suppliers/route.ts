import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      include: { _count: { select: { purchases: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supplier = await db.supplier.create({
      data: {
        name: body.name,
        rif: body.rif || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
      },
    })
    return NextResponse.json(supplier)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    const supplier = await db.supplier.update({
      where: { id },
      data: {
        name: data.name,
        rif: data.rif,
        phone: data.phone,
        email: data.email,
        address: data.address,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })
    return NextResponse.json(supplier)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
  }
}
