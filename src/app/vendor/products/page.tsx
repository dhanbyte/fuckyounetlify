'use client'
import { useState, useEffect } from 'react'
import { Package, Edit, Trash2, Eye, RefreshCw } from 'lucide-react'

export default function MyProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState(null)

  useEffect(() => {
    const loadVendorData = async () => {
      // Check localStorage first
      const isLoggedIn = localStorage.getItem('vendorLoggedIn')
      const vendorDataStr = localStorage.getItem('vendorData')
      
      if (isLoggedIn === 'true' && vendorDataStr) {
        try {
          const vendorData = JSON.parse(vendorDataStr)
          setVendorId(vendorData._id || vendorData.id)
          return
        } catch (e) {
          console.error('Error parsing vendor data:', e)
        }
      }
      
      // Fallback to server session
      try {
        const response = await fetch('/api/vendor/session')
        const result = await response.json()
        
        if (result.success && result.vendor) {
          setVendorId(result.vendor._id)
          return
        }
      } catch (error) {
        console.error('Error fetching vendor session:', error)
      }
      
      window.location.href = '/vendor/login'
    }
    
    loadVendorData()
  }, [])
  
  useEffect(() => {
    if (vendorId) {
      fetchProducts()
    }
  }, [vendorId])

  const fetchProducts = async () => {
    if (!vendorId) return
    
    setLoading(true)
    try {
      console.log('Fetching products for vendorId:', vendorId)
      const response = await fetch(`/api/vendor/products?vendorId=${vendorId}`)
      const data = await response.json()
      
      console.log('API Response:', data)
      
      if (data.success && data.products) {
        setProducts(data.products)
        console.log('Set products:', data.products.length)
      } else {
        console.log('No products found or API error')
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const editProduct = (product) => {
    // Store product data in localStorage for editing
    localStorage.setItem('editProduct', JSON.stringify(product))
    window.location.href = '/vendor/add-product?edit=true'
  }

  const deleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch('/api/vendor/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
        
        if (response.ok) {
          alert('Product deleted successfully')
          fetchProducts()
        }
      } catch (error) {
        alert('Failed to delete product')
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          My Products ({products.length})
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a
            href="/vendor/add-product"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Product
          </a>
        </div>
      </div>

      {!vendorId ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading vendor data...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first product</p>
          <a
            href="/vendor/add-product"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden h-[420px] flex flex-col">
              {product.images && product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description?.length > 60 ? `${product.description.substring(0, 60)}...` : product.description}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-xl font-bold text-green-600">₹{product.discountPrice || product.price}</span>
                    {product.originalPrice && product.originalPrice !== product.discountPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Status: <span className={`px-2 py-1 rounded text-xs ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{product.status}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => editProduct(product)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}