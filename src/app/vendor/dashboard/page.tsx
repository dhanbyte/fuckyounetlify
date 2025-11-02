'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, TrendingUp, Plus, Edit, Bell, Eye } from 'lucide-react'
import VendorDashboardSkeleton from '@/components/VendorDashboardSkeleton'

export default function VendorDashboard() {
  const [stats, setStats] = useState(null)
  const [vendorInfo, setVendorInfo] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        // First check localStorage for quick auth
        const isLoggedIn = localStorage.getItem('vendorLoggedIn')
        const vendorData = localStorage.getItem('vendorData')
        
        if (isLoggedIn === 'true' && vendorData) {
          const vendor = JSON.parse(vendorData)
          setVendorInfo({ 
            id: vendor._id, 
            email: vendor.email,
            businessName: vendor.businessName 
          })
          fetchVendorData(vendor._id)
          return
        }
        
        // Fallback to server session check
        const response = await fetch('/api/vendor/session')
        const result = await response.json()
        
        if (result.success && result.vendor) {
          console.log('✅ Session valid for:', result.vendor.businessName)
          
          setVendorInfo({ 
            id: result.vendor._id, 
            email: result.vendor.email,
            businessName: result.vendor.businessName 
          })
          fetchVendorData(result.vendor._id)
        } else {
          console.log('❌ No valid session, redirecting to login')
          localStorage.clear()
          window.location.href = '/vendor/login'
        }
      } catch (error) {
        console.error('❌ Session check failed:', error)
        localStorage.clear()
        window.location.href = '/vendor/login'
      }
    }
    
    loadVendorData()
    
    // Remove auto-refresh to prevent navigation issues
    // Manual refresh button is available instead
  }, [vendorInfo?.id])

  const fetchVendorData = async (vendorId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    
    try {
      // Add cache busting parameter
      const timestamp = Date.now()
      
      // Fetch vendor profile with real statistics
      const profileRes = await fetch(`/api/vendor/profile?vendorId=${vendorId}&t=${timestamp}`)
      const profileData = await profileRes.json()
      
      if (profileData.success && profileData.vendor) {
        const vendor = profileData.vendor
        const finalStats = {
          totalProducts: vendor.totalProducts || 0,
          totalOrders: vendor.totalOrders || 0,
          totalEarnings: vendor.totalEarnings || 0,
          pendingOrders: vendor.pendingOrders || 0
        }
        
        console.log('📊 Real vendor stats:', finalStats)
        setStats(finalStats)
      } else {
        console.error('❌ Profile API failed:', profileData.error)
        setStats({ totalProducts: 0, totalOrders: 0, totalEarnings: 0, pendingOrders: 0 })
      }
      
      setLastFetch(timestamp)
      
      // Load secondary data
      Promise.allSettled([
        fetch(`/api/vendor/notifications?vendorId=${vendorId}&limit=5`).then(res => res.ok ? res.json() : null),
        fetch(`/api/vendor/orders?vendorId=${vendorId}&limit=5`).then(res => res.ok ? res.json() : null)
      ]).then(([notifResult, orderResult]) => {
        if (notifResult.status === 'fulfilled' && notifResult.value) {
          setNotifications(notifResult.value.notifications || [])
        }
        if (orderResult.status === 'fulfilled' && orderResult.value) {
          setRecentOrders(orderResult.value.orders || [])
        }
      })
      
    } catch (error) {
      console.error('Error fetching vendor data:', error)
      setStats({ totalProducts: 0, totalOrders: 0, totalEarnings: 0, pendingOrders: 0 })
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
    }
  }
  
  const refreshData = () => {
    if (vendorInfo?.id && !refreshing) {
      fetchVendorData(vendorInfo.id, true)
    }
  }

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch('/api/vendor/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true })
      })
      
      setNotifications(notifications.map(n => 
        n._id === notificationId ? {...n, read: true} : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/vendor/session', { method: 'DELETE' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear all localStorage data
    localStorage.removeItem('vendorEmail')
    localStorage.removeItem('vendorData')
    localStorage.removeItem('vendorLoggedIn')
    localStorage.clear()
    
    // Clear component state
    setVendorInfo(null)
    setStats(null)
    setNotifications([])
    setRecentOrders([])
    
    // Redirect to login
    window.location.href = '/vendor/login'
  }

  if (loading) {
    return <VendorDashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">🏪 Vendor Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {vendorInfo?.businessName || vendorInfo?.email}
              </span>
              <button 
                onClick={refreshData} 
                disabled={refreshing}
                className="border px-3 py-1 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/debug/orders')
                    const data = await res.json()
                    alert(`Orders in DB:\nVendor Orders: ${data.vendorOrdersCount}\nAdmin Orders: ${data.adminOrdersCount}`)
                  } catch (error) {
                    alert('Failed to check orders')
                  }
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Check Orders
              </button>
              <button 
                onClick={async () => {
                  if (vendorInfo?.id) {
                    try {
                      const res = await fetch('/api/vendor/test-orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vendorId: vendorInfo.id })
                      })
                      const data = await res.json()
                      if (data.success) {
                        alert('Test orders created!')
                        refreshData()
                      }
                    } catch (error) {
                      alert('Failed to create test orders')
                    }
                  }
                }}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Add Test Orders
              </button>
              <button onClick={logout} className="border px-3 py-1 rounded text-sm hover:bg-gray-50">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        {/* Welcome Message for New Vendors */}
        {(stats?.totalProducts || 0) === 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">🎉 Welcome to ShopWave Vendor Portal!</h2>
            <p className="mb-4">Get started by adding your first product and start selling online.</p>
            <Link href="/vendor/add-product">
              <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100">
                Add Your First Product →
              </button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Products</p>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                {(stats?.totalProducts || 0) === 0 && (
                  <p className="text-xs text-blue-600 mt-1">Add your first product!</p>
                )}
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                {(stats?.totalOrders || 0) === 0 && (
                  <p className="text-xs text-green-600 mt-1">Orders will appear here</p>
                )}
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
                {(stats?.pendingOrders || 0) === 0 && (
                  <p className="text-xs text-orange-600 mt-1">No pending orders</p>
                )}
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">₹{stats?.totalEarnings?.toLocaleString() || 0}</p>
                {(stats?.totalEarnings || 0) === 0 && (
                  <p className="text-xs text-purple-600 mt-1">Start selling to earn!</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`p-3 rounded-lg border cursor-pointer ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => markNotificationRead(notification._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Link href="/vendor/orders">
                  <button className="text-blue-600 hover:underline text-sm">View All</button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">Order #{order.orderId}</p>
                          <p className="text-xs text-gray-500">{order.customerEmail}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.vendorTotal?.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/vendor/add-product">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <Plus className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Add Product</div>
              </button>
            </Link>
            
            <Link href="/vendor/products">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-sm font-medium">My Products</div>
              </button>
            </Link>
            
            <Link href="/vendor/orders">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-sm font-medium">My Orders</div>
              </button>
            </Link>
            
            <Link href="/vendor/earnings">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">Earnings</div>
              </button>
            </Link>
            
            <Link href="/vendor/profile">
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <Edit className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                <div className="text-sm font-medium">My Profile</div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}