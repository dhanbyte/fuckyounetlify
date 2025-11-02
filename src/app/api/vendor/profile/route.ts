import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const email = searchParams.get('email')

    if (!vendorId && !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor ID or email required' 
      })
    }

    const vendor = vendorId ? 
      await Vendor.findById(vendorId).maxTimeMS(3000).lean() : 
      await Vendor.findOne({ email }).maxTimeMS(3000).lean()
    
    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found' 
      })
    }

    // Calculate real statistics
    try {
      const VendorProduct = require('@/models/VendorProduct').default
      const VendorOrder = require('@/models/VendorOrder').default
      
      const [productCount, orderStats, earningsStats] = await Promise.all([
        VendorProduct.countDocuments({ vendorId: vendor._id }),
        VendorOrder.aggregate([
          { $match: { vendorId: vendor._id.toString() } },
          { $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
          }}
        ]),
        VendorOrder.aggregate([
          { $match: { vendorId: vendor._id.toString(), status: { $ne: 'cancelled' } } },
          { $group: {
            _id: null,
            totalEarnings: { $sum: '$vendorTotal' },
            totalRevenue: { $sum: '$total' }
          }}
        ])
      ])
      
      const orderData = orderStats[0] || { totalOrders: 0, pendingOrders: 0 }
      const earningsData = earningsStats[0] || { totalEarnings: 0, totalRevenue: 0 }
      
      // Add calculated stats to vendor object
      const vendorWithStats = {
        ...vendor,
        totalProducts: productCount,
        totalOrders: orderData.totalOrders,
        pendingOrders: orderData.pendingOrders,
        totalEarnings: earningsData.totalEarnings || 0,
        totalRevenue: earningsData.totalRevenue || 0,
        pendingPayments: earningsData.totalEarnings || 0, // Assuming all earnings are pending
        rating: vendor.rating || 4.2,
        reviewCount: vendor.reviewCount || 0
      }
      
      return NextResponse.json({ 
        success: true, 
        vendor: vendorWithStats
      })
    } catch (statsError) {
      console.error('Error calculating stats:', statsError)
      // Return vendor without stats if calculation fails
      return NextResponse.json({ 
        success: true, 
        vendor: {
          ...vendor,
          totalProducts: 0,
          totalOrders: 0,
          pendingOrders: 0,
          totalEarnings: 0,
          totalRevenue: 0,
          pendingPayments: 0,
          rating: 4.2,
          reviewCount: 0
        }
      })
    }

  } catch (error) {
    console.error('Error fetching vendor profile:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId, ...updateData } = await request.json()
    console.log('Updating vendor profile:', vendorId)

    // Add timestamp
    updateData.updatedAt = new Date()

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updateData,
      { new: true, maxTimeMS: 3000 }
    )

    if (!vendor) {
      console.log('Vendor not found:', vendorId)
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found' 
      }, { status: 404 })
    }

    console.log('Vendor profile updated successfully')
    return NextResponse.json({ 
      success: true, 
      vendor,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating vendor profile:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update profile',
      details: error.message
    }, { status: 500 })
  }
}