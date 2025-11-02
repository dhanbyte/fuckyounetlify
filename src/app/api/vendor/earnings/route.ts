import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'
import VendorOrder from '@/models/VendorOrder'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId || vendorId === 'null' || vendorId === 'undefined') {
      return NextResponse.json({ 
        success: false, 
        message: 'Valid Vendor ID required' 
      }, { status: 400 })
    }

    // Validate ObjectId format
    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid Vendor ID format' 
      }, { status: 400 })
    }

    const vendor = await Vendor.findById(vendorId)
    const orders = await VendorOrder.find({ vendorId }).sort({ createdAt: -1 })

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthEarnings = orders
      .filter(order => new Date(order.createdAt) >= thisMonth && order.status === 'delivered')
      .reduce((sum, order) => sum + (order.total || 0), 0)

    const lastMonthEarnings = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= lastMonth && orderDate < thisMonth && order.status === 'delivered'
      })
      .reduce((sum, order) => sum + (order.total || 0), 0)

    const transactions = orders
      .filter(order => order.status === 'delivered')
      .slice(0, 10)
      .map(order => ({
        orderId: order.orderId,
        amount: order.total,
        date: order.createdAt,
        status: 'Completed'
      }))

    const earnings = {
      totalEarnings: vendor?.totalEarnings || 0,
      pendingPayments: vendor?.pendingPayments || 0,
      thisMonth: thisMonthEarnings,
      lastMonth: lastMonthEarnings,
      transactions
    }

    return NextResponse.json({ 
      success: true, 
      earnings 
    })
  } catch (error) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch earnings' 
    }, { status: 500 })
  }
}