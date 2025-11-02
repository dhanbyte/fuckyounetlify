import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'
import AdminUser from '@/models/AdminUser'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor ID required' 
      })
    }

    console.log('Fetching orders for vendorId:', vendorId)
    
    // Get vendor details to find the correct vendorId used in orders
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
    
    // First try with the actual vendorId
    let orders = await VendorOrder.find({ vendorId: actualVendorId })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50))
      .maxTimeMS(5000)
      .lean()
      
    console.log('Found orders with actualVendorId:', orders.length)
    
    // If no orders found, try with original vendorId or email
    if (orders.length === 0) {
      orders = await VendorOrder.find({ vendorId })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 50))
        .maxTimeMS(5000)
        .lean()
      console.log('Found orders with original vendorId:', orders.length)
      
      if (orders.length === 0 && vendor && vendor.email) {
        orders = await VendorOrder.find({ vendorId: vendor.email })
          .sort({ createdAt: -1 })
          .limit(Math.min(limit, 50))
          .maxTimeMS(5000)
          .lean()
        console.log('Found orders with email vendorId:', orders.length)
      }
    }

    // Fetch customer details for each order
    const ordersWithCustomerDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          // Find customer details by email (customerId)
          const customer = await AdminUser.findOne({ 
            $or: [
              { userId: order.customerId },
              { email: order.customerId }
            ]
          }).lean()
          
          return {
            _id: order._id,
            orderId: order.orderId,
            customerId: order.customerId,
            customerDetails: customer ? {
              name: customer.fullName || customer.name || 'Customer',
              email: customer.email || order.customerId,
              phone: customer.phone || customer.phoneNumber || customer.mobile || 'Phone not provided',
              address: customer.address || 'Address not provided',
              city: customer.city || 'City not provided',
              state: customer.state || 'State not provided',
              pincode: customer.pincode || customer.zipCode || 'Pincode not provided'
            } : {
              name: order.customerDetails?.name || 'Customer',
              email: order.customerDetails?.email || order.customerId,
              phone: order.customerDetails?.phone || 'Phone not provided',
              address: 'Address not provided',
              city: 'City not provided', 
              state: 'State not provided',
              pincode: 'Pincode not provided'
            },
            products: order.items || [],
            total: order.vendorTotal,
            subtotal: order.vendorTotal,
            shipping: 0,
            tax: 0,
            status: order.status,
            createdAt: order.createdAt,
            shippingAddress: order.shippingAddress || null,
            paymentId: order.paymentId || null
          }
        } catch (error) {
          console.error('Error fetching customer details for order:', order.orderId, error)
          return {
            _id: order._id,
            orderId: order.orderId,
            customerId: order.customerId,
            customerDetails: {
              name: order.customerDetails?.name || 'Customer',
              email: order.customerDetails?.email || order.customerId,
              phone: order.customerDetails?.phone || 'Phone not provided',
              address: 'Address not provided',
              city: 'City not provided',
              state: 'State not provided', 
              pincode: 'Pincode not provided'
            },
            products: order.items || [],
            total: order.vendorTotal,
            subtotal: order.vendorTotal,
            shipping: 0,
            tax: 0,
            status: order.status,
            createdAt: order.createdAt,
            shippingAddress: order.shippingAddress || null,
            paymentId: order.paymentId || null
          }
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      orders: ordersWithCustomerDetails 
    })

  } catch (error) {
    console.error('Error fetching vendor orders:', error)
    return NextResponse.json({ 
      success: true,
      orders: []
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { orderId, status } = await request.json()

    // Update order status
    const order = await VendorOrder.findByIdAndUpdate(
      orderId,
      { 
        status, 
        updatedAt: new Date(),
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() }),
        ...(status === 'cancelled' && { cancelledAt: new Date() })
      },
      { new: true }
    )

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order ${status} successfully`,
      order 
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update order' 
    })
  }
}