'use client'
import { useState, useEffect } from 'react'
import { ShoppingBag, Eye, Package, User, MapPin, Phone, Mail, Calendar, Truck, CheckCircle, XCircle, Copy, Clock, Search } from 'lucide-react'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
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
      
      // Check if we're already on login page to prevent redirect loop
      if (!window.location.pathname.includes('/vendor/login')) {
        window.location.href = '/vendor/login'
      }
    }
    
    loadVendorData()
  }, [])

  useEffect(() => {
    if (vendorId) {
      fetchOrders()
    }
  }, [vendorId])

  const fetchOrders = async () => {
    if (!vendorId) return
    
    try {
      const response = await fetch(`/api/vendor/orders?vendorId=${vendorId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch('/api/vendor/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      
      if (response.ok) {
        alert('Order status updated')
        fetchOrders()
      }
    } catch (error) {
      alert('Failed to update order status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'confirmed': return <Package className="h-4 w-4 text-blue-500" />
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const copyCustomerDetails = (order) => {
    const details = `
Order: ${order.orderId}
Customer: ${order.customerDetails?.name || 'N/A'}
Email: ${order.customerDetails?.email || 'N/A'}
Phone: ${order.customerDetails?.phone || 'N/A'}
${order.shippingAddress ? `
Address: ${order.shippingAddress.street}
City: ${order.shippingAddress.city}
State: ${order.shippingAddress.state}
Pincode: ${order.shippingAddress.pincode}` : ''}
Total: ₹${order.total}
Status: ${order.status}
    `.trim()
    
    navigator.clipboard.writeText(details)
    alert('Customer details copied to clipboard!')
  }

  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedOrder) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedOrder(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Order Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">Order #{selectedOrder.orderId}</h2>
              <p className="text-gray-600">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">₹{selectedOrder.total?.toLocaleString()}</div>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                {getStatusIcon(selectedOrder.status)}
                {selectedOrder.status}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </h3>
              <button
                onClick={() => copyCustomerDetails(selectedOrder)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Copy className="h-4 w-4" />
                Copy Details
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Name:</span> {selectedOrder.customerDetails?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span> {selectedOrder.customerDetails?.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span> {selectedOrder.customerDetails?.phone || 'N/A'}
                  </div>
                </div>
                <div>
                  {selectedOrder.shippingAddress && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Shipping Address:</span>
                      </div>
                      <div className="text-gray-700 ml-6">
                        {selectedOrder.shippingAddress.street}<br/>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br/>
                        Pincode: {selectedOrder.shippingAddress.pincode}
                      </div>
                    </div>
                  )}
                  {selectedOrder.paymentId && (
                    <div className="mb-2">
                      <span className="font-medium">Payment ID:</span> {selectedOrder.paymentId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({selectedOrder.products?.length || 0})
            </h3>
            <div className="space-y-3">
              {selectedOrder.products?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img 
                    src={item.image || '/images/placeholder.jpg'} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Brand: {item.brand || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{(item.price * item.quantity)?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">₹{item.price} per item</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{(selectedOrder.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Update Order Status</h3>
            <div className="flex flex-wrap gap-3">
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, 'confirmed')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Order
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, 'cancelled')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </button>
                </>
              )}
              {selectedOrder.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, 'shipped')}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, 'cancelled')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </button>
                </>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Delivered
                </button>
              )}
              {selectedOrder.status === 'delivered' && (
                <div className="text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Order Completed Successfully
                </div>
              )}
              {selectedOrder.status === 'cancelled' && (
                <div className="text-red-600 font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Order Cancelled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
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
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="h-8 w-8" />
        My Orders ({orders.length})
      </h1>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, email, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">Orders will appear here when customers buy your products</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Orders ({filteredOrders.length})</h2>
          </div>
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <div 
                key={order._id} 
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Order #{order.orderId}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{order.customerDetails?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{order.customerDetails?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{order.customerDetails?.phone || 'Phone not provided'}</span>
                      </div>
                    </div>
                    {order.shippingAddress && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold mb-2">₹{order.total?.toLocaleString()}</div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{order.products?.length || 0} items</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}