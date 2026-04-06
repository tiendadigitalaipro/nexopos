import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const register = await db.cashRegister.findFirst({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(register || null)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch cash register' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (body.action === 'open') {
      // Close any open registers first
      await db.cashRegister.updateMany({
        where: { status: 'open' },
        data: { status: 'closed', closedAt: new Date() },
      })

      const register = await db.cashRegister.create({
        data: {
          name: body.name || 'Caja Principal',
          openingBalance: parseFloat(body.openingBalance) || 0,
          currentBalance: parseFloat(body.openingBalance) || 0,
          status: 'open',
          openedBy: body.userId,
          openedAt: new Date(),
        },
      })
      return NextResponse.json(register)
    }

    if (body.action === 'close') {
      const registerId = body.registerId
      if (!registerId) {
        return NextResponse.json({ error: 'Register ID required' }, { status: 400 })
      }

      const register = await db.cashRegister.update({
        where: { id: registerId },
        data: {
          status: 'closed',
          closedBy: body.userId,
          closedAt: new Date(),
        },
      })
      return NextResponse.json(register)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed to update cash register' }, { status: 500 })
  }
}
