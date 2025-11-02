'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, vendorProductsRes, customersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/vendor-products'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/orders')
      ])
      
      const productsData = await productsRes.json()
      const vendorProductsData = await vendorProductsRes.json()
      const customersData = await customersRes.json()
      const ordersData = await ordersRes.json()
      
      const products = productsData.products || []
      const vendorProducts = vendorProductsData.products || []
      const customers = customersData.customers || []
      const orders = ordersData.orders || []
      
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      
      setStats({
        totalProducts: products.length + vendorProducts.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalRevenue
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>
        <Link href="/admin/add-product">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Product
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="text-3xl">🛒</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/admin/products">
            <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">🛍️</div>
              <div className="text-sm font-medium">Products</div>
            </button>
          </Link>
          
          <Link href="/admin/orders">
            <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-medium">Orders</div>
            </button>
          </Link>
          
          <Link href="/admin/customers">
            <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium">Customers</div>
            </button>
          </Link>
          
          <Link href="/admin/vendors">
            <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm font-medium">Vendors</div>
            </button>
          </Link>
          
          <Link href="/admin/analytics">
            <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium">Analytics</div>
            </button>
          </Link>
          
          <Link href="/admin/pending-products">
            <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-sm font-medium">Pending Products</div>
            </button>
          </Link>
          
          <Link href="/">
            <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">🌐</div>
              <div className="text-sm font-medium">Website</div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}