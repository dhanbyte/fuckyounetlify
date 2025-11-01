import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'
import VendorOrder from '@/models/VendorOrder'

export const dynamic = 'force-dynamic'
export const maxDuration = 10
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor ID required' 
      }, { status: 400 })
    }
    
    console.log('📊 Fetching stats for vendorId:', vendorId)
    await dbConnect()
    
    // Debug: Check what orders exist in the database
    const allOrders = await VendorOrder.find({}).limit(5).lean()
    console.log('📊 Sample orders in database:', allOrders.map(o => ({ 
      orderId: o.orderId, 
      vendorId: o.vendorId, 
      status: o.status,
      total: o.vendorTotal 
    })))

    // Get vendor details to find the correct vendorId used in products and orders
    const mongoose = require('mongoose')
    const Vendor = require('@/models/Vendor').default
    
    let actualVendorId = vendorId
    let vendor = null
    
    try {
      vendor = await Vendor.findById(vendorId).lean()
      if (vendor && vendor.vendorId) {
        actualVendorId = vendor.vendorId
      }
      console.log('🔍 Vendor found:', { _id: vendorId, vendorId: vendor?.vendorId, email: vendor?.email })
    } catch (e) {
      console.log('Error fetching vendor details:', e.message)
    }
    
    // Count products for this vendor using direct vendorId
    const productStats = await VendorProduct.countDocuments({ vendorId }).maxTimeMS(3000)
    console.log('Product count for vendorId:', vendorId, '=', productStats)
    
    // Direct query with the vendorId (MongoDB _id)
    const totalOrders = await VendorOrder.countDocuments({ vendorId }).maxTimeMS(3000)
    const pendingOrders = await VendorOrder.countDocuments({ vendorId, status: 'pending' }).maxTimeMS(3000)
    
    console.log(`📊 Direct query for vendorId ${vendorId}: ${totalOrders} orders, ${pendingOrders} pending`)
    
    const earningsResult = await VendorOrder.aggregate([
      { $match: { vendorId, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalEarnings: { $sum: '$netAmount' } } }
    ]).maxTimeMS(3000)
    
    const totalEarnings = earningsResult[0]?.totalEarnings || 0
    
    console.log('📊 Order stats found:', { totalOrders, pendingOrders, totalEarnings, actualVendorId })
    
    const stats = {
      totalProducts: productStats,
      totalOrders: totalOrders,
      totalEarnings: totalEarnings,
      pendingOrders: pendingOrders
    }

    console.log('📊 Final vendor stats:', stats)
    console.log('📊 VendorId used for queries:', vendorId)

    return NextResponse.json({ 
      success: true, 
      stats
    })
  } catch (error) {
    console.error('❌ Error fetching vendor stats:', error)
    
    return NextResponse.json({ 
      success: true,
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalEarnings: 0,
        pendingOrders: 0
      }
    })
  }
}