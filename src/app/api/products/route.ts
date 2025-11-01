import { NextResponse } from 'next/server';
import { TECH_PRODUCTS } from '@/lib/data/tech';
import { HOME_PRODUCTS } from '@/lib/data/home';

// Fallback products data
const fallbackProducts = [
  {
    _id: '1',
    name: 'Wireless Bluetooth Headphones',
    category: 'Tech',
    subcategory: 'Audio',
    brand: 'TechBrand',
    price: 999,
    originalPrice: 1299,
    image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_53521c05-9caa-4905-9410-e18e9ee19322.webp',
    description: 'High-quality wireless Bluetooth headphones with noise cancellation',
    inStock: true,
    quantity: 15,
    slug: 'wireless-bluetooth-headphones',
    isNew: true
  },
  {
    _id: '2',
    name: 'LED Desk Lamp',
    category: 'Home',
    subcategory: 'Lighting',
    brand: 'HomeBrand',
    price: 599,
    originalPrice: 799,
    image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/07_4a3ac08b-5f90-4f47-9c6f-a48d0999f3e7.webp',
    description: 'Modern LED desk lamp with adjustable brightness',
    inStock: true,
    quantity: 8,
    slug: 'led-desk-lamp',
    isNew: false
  },
  {
    _id: '3',
    name: 'USB-C Charging Cable',
    category: 'Tech',
    subcategory: 'Cables & Chargers',
    brand: 'TechBrand',
    price: 299,
    originalPrice: 399,
    image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_0748acd3-4797-400f-997d-6cecf6b22f5a.webp',
    description: 'Fast charging USB-C cable 2 meter length',
    inStock: true,
    quantity: 25,
    slug: 'usb-c-charging-cable',
    isNew: true
  }
];

let dbConnect: any;
let Product: any;
let VendorProduct: any;
let { MongoClient } = require('mongodb');

try {
  dbConnect = require('@/lib/dbConnect').default;
  Product = require('@/models/Product').default;
  VendorProduct = require('@/models/VendorProduct').default;
} catch (error) {
  console.warn('Database modules not available, using fallback products');
}

// GET all products with filtering support
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit')
        
        // Always try to connect to database first
        if (dbConnect && Product) {
            try {
                await dbConnect();
                
                // Connect to MongoDB directly to check vendor status
                const client = new MongoClient(process.env.MONGODB_URI);
                await client.connect();
                const db = client.db(process.env.MONGODB_DB_NAME);
                
                // Fetch both regular products and approved vendor products
                const [regularProducts, vendorProducts] = await Promise.all([
                    Product.find({}).lean(),
                    VendorProduct ? VendorProduct.find({ 
                        status: 'active'
                    }).lean() : []
                ]);
                
                console.log(`Found ${regularProducts.length} regular products and ${vendorProducts.length} approved vendor products`);
                
                await client.close();
                
                // Transform regular products
                const transformedRegularProducts = regularProducts.map(product => ({
                    ...product,
                    id: product._id.toString(),
                    _id: product._id.toString(),
                    slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || product._id.toString(),
                    shortDescription: product.description?.substring(0, 100) + '...' || '',
                    extraImages: product.extraImages || [],
                    features: product.features || [],
                    specifications: product.specifications || {},
                    ratings: product.ratings || { average: 0, count: 0 },
                    subcategory: product.subcategory || '',
                    isVendorProduct: false
                }));

                // Transform vendor products to match expected format
                const transformedVendorProducts = vendorProducts.map(product => ({
                    ...product,
                    id: product._id.toString(),
                    _id: product._id.toString(),
                    image: product.images?.[0] || '',
                    extraImages: product.images || [],
                    shortDescription: product.description?.substring(0, 100) + '...' || '',
                    features: [],
                    specifications: {},
                    ratings: { 
                        average: product.rating || 4.2, 
                        count: product.reviewCount || Math.floor(Math.random() * 50) + 10 
                    },
                    inStock: product.stock > 0,
                    quantity: product.stock,
                    isVendorProduct: true,
                    slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || product._id.toString(),
                    // Match the exact price format used by other products
                    price_original: product.originalPrice || product.price,
                    price_discounted: product.discountPrice || product.price,
                    price_currency: '₹',
                    // Also add the price object format
                    price: {
                        original: product.originalPrice || product.price,
                        discounted: product.discountPrice || product.price,
                        currency: '₹'
                    }
                }));

                // Combine: Database products first, then vendor products, then JSON products
                let allProducts = [...transformedRegularProducts, ...transformedVendorProducts];
                
                // Add JSON products if we have fewer products than needed
                if (!limit || allProducts.length < Number(limit)) {
                    const jsonProducts = [
                        ...TECH_PRODUCTS,
                        ...HOME_PRODUCTS
                    ].map(p => ({
                        ...p,
                        id: p.id,
                        isVendorProduct: false,
                        inStock: true
                    }));
                    
                    allProducts = [...allProducts, ...jsonProducts];
                }
                
                // Apply limit if specified
                const finalProducts = limit && !isNaN(Number(limit)) ? 
                    allProducts.slice(0, Number(limit)) : allProducts;

                console.log(`Returning ${finalProducts.length} products (${transformedRegularProducts.length} DB + ${transformedVendorProducts.length} vendor + ${finalProducts.length - transformedRegularProducts.length - transformedVendorProducts.length} JSON)`);
                
                // Add cache control headers to prevent caching
                const response = NextResponse.json(finalProducts);
                response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                response.headers.set('Pragma', 'no-cache');
                response.headers.set('Expires', '0');
                return response;
                
            } catch (dbError) {
                console.error('Database error:', dbError);
                // Fall through to fallback
            }
        }
        
        // Return JSON products if database fails
        console.log('Using JSON products - database connection failed');
        
        // Combine tech and home products
        const allProducts = [
            ...TECH_PRODUCTS,
            ...HOME_PRODUCTS
        ].map(p => ({
            ...p,
            isVendorProduct: false,
            inStock: true
        }));
        
        const finalProducts = limit && !isNaN(Number(limit)) ? 
            allProducts.slice(0, Number(limit)) : allProducts;
            
        return NextResponse.json(finalProducts);
        
    } catch (error) {
        console.error('Error in GET /api/products:', error);
        return NextResponse.json(fallbackProducts.map(p => ({
            ...p,
            id: p._id,
            price: { original: p.originalPrice, discounted: p.price }
        })));
    }
}

// POST - create a new product
export async function POST(request: Request) {
    try {
        if (!dbConnect || !Product) {
            return NextResponse.json({ 
                success: false, 
                error: 'Database not available' 
            }, { status: 500 });
        }

        await dbConnect();
        const productData = await request.json();
        console.log('Received product data:', productData);
        
        const product = new Product(productData);
        const savedProduct = await product.save();
        console.log('Product saved successfully:', savedProduct._id);
        
        const transformedProduct = {
            ...savedProduct.toObject(),
            id: savedProduct._id.toString(),
            _id: savedProduct._id.toString()
        };

        return NextResponse.json({ 
            success: true,
            data: transformedProduct 
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error in POST /api/products:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to create product' 
        }, { status: 500 });
    }
}