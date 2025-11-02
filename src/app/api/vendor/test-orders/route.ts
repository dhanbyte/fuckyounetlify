import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId } = await request.json()
    
    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor ID required' 
      }, { status: 400 })
    }

    // Create sample orders for testing
    const sampleOrders = [
      {
        orderId: `ORD-${Date.now()}-1`,
        vendorId: vendorId,
        customerId: 'test-customer-1',
        customerDetails: {
          name: 'Test Customer 1',
          email: 'customer1@test.com',
          phone: '9876543210'
        },
        items: [{
          productId: '5785',
          name: 'Customize 300ml Stainless Steel Mug',
          price: 199,
          quantity: 2,
          image: 'https://Shopwave.b-cdn.net/Custom%20Print%20Products/6_6cbab775-d2f1-40aa-b598-5fe7c1943372.webp'
        }],
        vendorTotal: 398,
        commission: 40,
        netAmount: 358,
        status: 'pending',
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        paymentId: 'pay_test_123'
      },
      {
        orderId: `ORD-${Date.now()}-2`,
        vendorId: vendorId,
        customerId: 'test-customer-2',
        customerDetails: {
          name: 'Test Customer 2',
          email: 'customer2@test.com',
          phone: '9876543211'
        },
        items: [{
          productId: '6537',
          name: 'Customize Stainless Steel Vacuum Water Bottle',
          price: 149,
          quantity: 1,
          image: 'https://Shopwave.b-cdn.net/Custom%20Print%20Products/0213f03e-c450-4e28-8ace-47a577a423b4.webp'
        }],
        vendorTotal: 149,
        commission: 15,
        netAmount: 134,
        status: 'processing',
        shippingAddress: {
          street: '456 Test Avenue',
          city: 'Test City',
          state: 'Test State',
          pincode: '123457'
        },
        paymentId: 'pay_test_456'
      },
      {
        orderId: `ORD-${Date.now()}-3`,
        vendorId: vendorId,
        customerId: 'test-customer-3',
        customerDetails: {
          name: 'Test Customer 3',
          email: 'customer3@test.com',
          phone: '9876543212'
        },
        items: [{
          productId: '14085',
          name: 'Customize Plastic Sports Bottle',
          price: 249,
          quantity: 1,
          image: 'https://Shopwave.b-cdn.net/Custom%20Print%20Products/02_fca261be-a87a-4802-abe9-19da6e291f44.webp'
        }],
        vendorTotal: 249,
        commission: 25,
        netAmount: 224,
        status: 'delivered',
        shippingAddress: {
          street: '789 Test Road',
          city: 'Test City',
          state: 'Test State',
          pincode: '123458'
        },
        paymentId: 'pay_test_789'
      }
    ]

    const createdOrders = await VendorOrder.insertMany(sampleOrders)
    
    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdOrders.length} test orders`,
      orders: createdOrders
    })
  } catch (error) {
    console.error('Error creating test orders:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create test orders' 
    }, { status: 500 })
  }
}