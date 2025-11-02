import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'
import AdminOrder from '@/models/AdminOrder'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const vendorOrders = await VendorOrder.find({}).limit(10).lean()
    const adminOrders = await AdminOrder.find({}).limit(10).lean()
    
    return NextResponse.json({ 
      success: true,
      vendorOrdersCount: vendorOrders.length,
      adminOrdersCount: adminOrders.length,
      sampleVendorOrders: vendorOrders.map(o => ({
        orderId: o.orderId,
        vendorId: o.vendorId,
        status: o.status,
        total: o.vendorTotal,
        netAmount: o.netAmount
      })),
      sampleAdminOrders: adminOrders.map(o => ({
        orderId: o.orderId,
        userId: o.userId,
        status: o.status,
        total: o.total
      }))
    })
  } catch (error) {
    console.error('Debug orders error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}