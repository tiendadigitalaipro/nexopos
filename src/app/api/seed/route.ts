import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear existing data
    await db.saleItem.deleteMany()
    await db.sale.deleteMany()
    await db.purchaseItem.deleteMany()
    await db.purchaseOrder.deleteMany()
    await db.batch.deleteMany()
    await db.product.deleteMany()
    await db.category.deleteMany()
    await db.supplier.deleteMany()
    await db.cashRegister.deleteMany()
    await db.dailySummary.deleteMany()
    await db.user.deleteMany()
    await db.license.deleteMany()

    // Create license
    const license = await db.license.create({
      data: {
        licenseKey: 'PRECISION-2024-PRO',
        businessName: 'Farmacia Precisión',
        ownerName: 'Dr. Juan Pérez',
        email: 'admin@precision.com',
        phone: '+58 412-1234567',
        maxUsers: 10,
        isActive: true,
        expiresAt: new Date('2025-12-31'),
      },
    })

    // Create users
    const admin = await db.user.create({
      data: {
        name: 'Admin',
        email: 'admin@pos.com',
        password: 'admin123',
        pin: '1234',
        role: 'admin',
        licenseId: license.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Cajero',
        email: 'cashier@pos.com',
        password: 'cashier123',
        pin: '0000',
        role: 'cashier',
        licenseId: license.id,
      },
    })

    // Create categories
    const categories = await Promise.all([
      db.category.create({ data: { name: 'Antibiotics', color: '#00458f', icon: 'pill', sortOrder: 0 } }),
      db.category.create({ data: { name: 'Personal Care', color: '#006c47', icon: 'heart', sortOrder: 1 } }),
      db.category.create({ data: { name: 'Electronics', color: '#c45100', icon: 'cpu', sortOrder: 2 } }),
      db.category.create({ data: { name: 'Vitamins', color: '#7b1fa2', icon: 'apple', sortOrder: 3 } }),
    ])

    // Create products
    const products = await Promise.all([
      db.product.create({
        data: {
          sku: 'ANT-001', name: 'Amoxicilina 500mg', categoryId: categories[0].id,
          costPrice: 2.50, salePrice: 5.00, currentStock: 150, minStock: 20,
          barcode: '7591234560001', profitPercent: 100, taxRate: 16,
        },
      }),
      db.product.create({
        data: {
          sku: 'ANT-002', name: 'Azitromicina 500mg', categoryId: categories[0].id,
          costPrice: 4.00, salePrice: 8.50, currentStock: 80, minStock: 15,
          barcode: '7591234560002', profitPercent: 112, taxRate: 16,
        },
      }),
      db.product.create({
        data: {
          sku: 'ANT-003', name: 'Ciprofloxacino 250mg', categoryId: categories[0].id,
          costPrice: 3.00, salePrice: 6.00, currentStock: 5, minStock: 10,
          barcode: '7591234560003', profitPercent: 100, taxRate: 16,
        },
      }),
      db.product.create({
        data: {
          sku: 'PER-001', name: 'Jabón Antibacterial', categoryId: categories[1].id,
          costPrice: 1.20, salePrice: 2.50, currentStock: 200, minStock: 30,
          barcode: '7591234560004', profitPercent: 108, taxRate: 16,
        },
      }),
      db.product.create({
        data: {
          sku: 'PER-002', name: 'Protector Solar SPF50', categoryId: categories[1].id,
          costPrice: 5.00, salePrice: 12.00, currentStock: 45, minStock: 10,
          barcode: '7591234560005', profitPercent: 140, taxRate: 16,
        },
      }),
      db.product.create({
        data: {
          sku: 'ELE-001', name: 'Termómetro Digital', categoryId: categories[2].id,
          costPrice: 8.00, salePrice: 18.00, currentStock: 25, minStock: 5,
          barcode: '7591234560006', profitPercent: 125, taxRate: 16,
        },
      }),
      db.product.create({
        data: {
          sku: 'ELE-002', name: 'Tensiómetro Brazalete', categoryId: categories[2].id,
          costPrice: 25.00, salePrice: 55.00, currentStock: 12, minStock: 3,
          barcode: '7591234560007', profitPercent: 120, taxRate: 16, unitsPerBulk: 5, bulkPrice: 110.00,
        },
      }),
      db.product.create({
        data: {
          sku: 'VIT-001', name: 'Vitamina C 1000mg', categoryId: categories[3].id,
          costPrice: 3.50, salePrice: 7.00, currentStock: 300, minStock: 50,
          barcode: '7591234560008', profitPercent: 100, taxRate: 16, unitsPerBulk: 12, bulkPrice: 60.00,
        },
      }),
      db.product.create({
        data: {
          sku: 'VIT-002', name: 'Complejo B', categoryId: categories[3].id,
          costPrice: 4.00, salePrice: 9.00, currentStock: 3, minStock: 20,
          barcode: '7591234560009', profitPercent: 125, taxRate: 16,
        },
      }),
      db.product.create({
        data: {
          sku: 'VIT-003', name: 'Omega 3 Concentrado', categoryId: categories[3].id,
          costPrice: 10.00, salePrice: 22.00, currentStock: 60, minStock: 10,
          barcode: '7591234560010', profitPercent: 120, taxRate: 16,
        },
      }),
    ])

    // Create batches
    const today = new Date()
    await Promise.all([
      db.batch.create({
        data: {
          productId: products[0].id, batchNumber: 'B-2024-001', supplier: 'Distribuidora XYZ',
          quantity: 100, remaining: 100, costPrice: 2.50, status: 'healthy',
          expirationDate: new Date(today.getFullYear() + 1, 5, 15),
        },
      }),
      db.batch.create({
        data: {
          productId: products[0].id, batchNumber: 'B-2024-002', supplier: 'Distribuidora XYZ',
          quantity: 50, remaining: 50, costPrice: 2.50, status: 'near_expiry',
          expirationDate: new Date(today.getFullYear(), today.getMonth() + 2, 1),
        },
      }),
      db.batch.create({
        data: {
          productId: products[2].id, batchNumber: 'B-2023-010', supplier: 'Farmacos Global',
          quantity: 30, remaining: 5, costPrice: 2.80, status: 'critical',
          expirationDate: new Date(today.getFullYear() + 1, 0, 1),
        },
      }),
      db.batch.create({
        data: {
          productId: products[3].id, batchNumber: 'B-2023-005', supplier: 'Higiene Total',
          quantity: 200, remaining: 200, costPrice: 1.20, status: 'healthy',
          expirationDate: new Date(today.getFullYear() + 2, 0, 1),
        },
      }),
    ])

    // Create suppliers
    await Promise.all([
      db.supplier.create({
        data: {
          name: 'Distribuidora XYZ',
          rif: 'J-12345678-9',
          phone: '+58 212-5551234',
          email: 'ventas@distribuidoraxyz.com',
          address: 'Caracas, Venezuela',
          balance: 1500.00,
        },
      }),
      db.supplier.create({
        data: {
          name: 'Farmacos Global',
          rif: 'J-87654321-0',
          phone: '+58 212-5559876',
          email: 'info@farmacosglobal.com',
          address: 'Valencia, Venezuela',
          balance: 800.00,
        },
      }),
    ])

    // Create cash register
    await db.cashRegister.create({
      data: {
        name: 'Caja Principal',
        openingBalance: 500.00,
        currentBalance: 500.00,
        status: 'open',
        openedBy: admin.id,
        openedAt: new Date(),
      },
    })

    // Create some sample sales for reports
    const paymentMethods = ['cash', 'card', 'transfer', 'divisas']
    for (let i = 0; i < 15; i++) {
      const saleDate = new Date()
      saleDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 3))
      
      const numItems = Math.floor(Math.random() * 3) + 1
      const selectedProducts = products.slice(0, 5)
      const items = selectedProducts.slice(0, numItems)
      const subtotal = items.reduce((sum, p) => sum + p.salePrice * (Math.floor(Math.random() * 2) + 1), 0)
      const tax = subtotal * 0.16
      const igtf = subtotal * 0.03
      const total = subtotal + tax + igtf
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

      await db.sale.create({
        data: {
          saleNumber: `V${saleDate.getTime()}-${i}`,
          userId: admin.id,
          status: 'completed',
          subtotal,
          taxAmount: tax,
          igtfAmount: igtf,
          totalAmount: total,
          paymentMethod: method,
          items: {
            create: items.map((p) => ({
              productId: p.id,
              productName: p.name,
              quantity: Math.floor(Math.random() * 2) + 1,
              unitPrice: p.salePrice,
              total: p.salePrice * (Math.floor(Math.random() * 2) + 1),
            })),
          },
          createdAt: saleDate,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Seed failed' }, { status: 500 })
  }
}
