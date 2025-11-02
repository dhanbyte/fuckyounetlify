import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'
import Vendor from '@/models/Vendor'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor ID required' 
      }, { status: 400 })
    }

    console.log('Fetching products for vendorId:', vendorId)
    
    // First try with the provided vendorId
    let products = await VendorProduct.find({ vendorId }).sort({ createdAt: -1 })
    console.log('Found products with vendorId:', products.length)
    
    // If no products found, try to find vendor by _id and get products by email
    if (products.length === 0) {
      const mongoose = require('mongoose')
      const Vendor = require('@/models/Vendor').default
      
      try {
        const vendor = await Vendor.findById(vendorId).lean()
        if (vendor && vendor.email) {
          products = await VendorProduct.find({ vendorId: vendor.email }).sort({ createdAt: -1 })
          console.log('Found products with email vendorId:', products.length)
        }
      } catch (e) {
        console.log('Error trying email-based vendorId:', e.message)
      }
    }

    return NextResponse.json({ 
      success: true, 
      products 
    })
  } catch (error) {
    console.error('Error fetching vendor products:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch products',
      products: []
    }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const productData = await request.json()
    const { vendorId } = productData

    if (!vendorId) {
      return NextResponse.json({
        success: false,
        message: 'Vendor ID is required'
      }, { status: 400 })
    }

    console.log('Creating product for vendorId:', vendorId)

    // Fetch vendor data to get brand name
    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return NextResponse.json({
        success: false,
        message: 'Vendor not found'
      }, { status: 404 })
    }

    const product = new VendorProduct({
      vendorId: vendorId,
      productId: `PRD${Date.now()}`,
      name: productData.name,
      category: productData.category,
      subcategory: productData.subcategory,
      tertiaryCategory: productData.tertiaryCategory,
      price: productData.price,
      originalPrice: productData.originalPrice,
      discountPrice: productData.discountPrice,
      description: productData.description,
      images: productData.images || [],
      stock: productData.stock,
      length: productData.length,
      width: productData.width,
      height: productData.height,
      weight: productData.weight,
      brand: vendor.brandName || vendor.companyName || vendor.businessName || 'Unknown Brand',
      rating: 4.2,
      reviewCount: Math.floor(Math.random() * 50) + 10,
      status: 'pending' // Require admin approval
    })

    await product.save()
    console.log('Product created successfully:', product._id)

    return NextResponse.json({
      success: true,
      product,
      productId: product._id
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { productId, vendorId, ...updateData } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID required' 
      }, { status: 400 })
    }
    
    // Fetch vendor data to get brand name for updates
    if (vendorId) {
      const vendor = await Vendor.findById(vendorId)
      if (vendor) {
        updateData.brand = vendor.brandName || vendor.companyName || vendor.businessName || 'Unknown Brand'
      }
    }
    
    const updatedProduct = await VendorProduct.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    )
    
    if (!updatedProduct) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully',
      product: updatedProduct
    })
    
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update product' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID required' 
      }, { status: 400 })
    }

    await VendorProduct.findByIdAndDelete(productId)

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete product' 
    }, { status: 500 })
  }
}