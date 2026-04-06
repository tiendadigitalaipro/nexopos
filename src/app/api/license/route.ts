import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const license = await db.license.findFirst({
      where: { isActive: true },
      orderBy: { activatedAt: 'desc' },
    })
    return NextResponse.json(license || null)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch license' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (body.action === 'validate') {
      const { licenseKey } = body
      const license = await db.license.findUnique({
        where: { licenseKey },
      })
      
      if (!license) {
        return NextResponse.json({ valid: false, error: 'License key not found' }, { status: 404 })
      }
      
      if (!license.isActive) {
        return NextResponse.json({ valid: false, error: 'License is deactivated' }, { status: 403 })
      }
      
      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        await db.license.update({
          where: { id: license.id },
          data: { isActive: false },
        })
        return NextResponse.json({ valid: false, error: 'License has expired' }, { status: 403 })
      }
      
      // Update last validated
      await db.license.update({
        where: { id: license.id },
        data: { lastValidated: new Date() },
      })
      
      return NextResponse.json({ valid: true, license })
    }
    
    if (body.action === 'activate') {
      const { licenseKey, businessName, ownerName, email, phone } = body
      
      const existing = await db.license.findUnique({ where: { licenseKey } })
      if (existing) {
        return NextResponse.json({ error: 'License key already exists' }, { status: 400 })
      }
      
      const license = await db.license.create({
        data: {
          licenseKey,
          businessName,
          ownerName,
          email,
          phone: phone || null,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          maxUsers: body.maxUsers || 5,
        },
      })
      
      return NextResponse.json({ valid: true, license })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'License validation failed' }, { status: 500 })
  }
}
