import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const category = await db.category.create({
      data: {
        name: body.name,
        color: body.color || '#00458f',
        icon: body.icon || 'category',
        sortOrder: body.sortOrder || 0,
      },
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        sortOrder: data.sortOrder,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}
