
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/context/ClerkAuthContext'
import { useUser } from '@clerk/nextjs'

export default function OrdersPage(){
  const { user } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (user?.id || clerkUser?.id) {
        fetchOrders()
      } else {
        setIsLoading(false)
      }
    }
  }, [user, clerkUser, isLoaded])

  const fetchOrders = async () => {
    try {
      // Use Clerk user ID directly - this is what's stored in orders
      const userId = clerkUser?.id || user?.id
      console.log('🔍 Fetching orders for userId:', userId)
      
      const response = await fetch(`/api/user/orders?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || isLoading) {
    return <div className="flex justify-center py-10"><LoadingSpinner /></div>;
  }
  
  if (!user && !clerkUser) {
    return (
       <div className="card p-8 text-center">
          <h2 className="text-lg font-medium text-gray-700">Please Login</h2>
          <p className="text-sm text-gray-500 mt-1">Login to view your order history.</p>
          <Link href="/sign-in" className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">Go to Login</Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Your Orders</h1>
      {!orders.length && <div className="rounded-2xl border bg-white p-8 text-center text-gray-600">
        <h2 className="text-lg font-medium text-gray-700">No orders placed yet.</h2>
        <p className="text-sm text-gray-500 mt-1">When you place an order, it will appear here.</p>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">Continue Shopping</Link>
        </div>
      }
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="card p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-2 mb-2">
              <div>
                <div className="font-semibold">Order <span className="text-brand">#{o.id}</span></div>
                <div className="text-xs text-gray-500">Placed on: {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="mt-2 sm:mt-0 text-sm font-medium">Total: ₹{o.total.toLocaleString('en-IN')}</div>
            </div>

            <div className="space-y-2 mb-3">
              {o.items.map(item => (
                <div key={item.productId} className="flex items-center gap-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0">
                    <Image src={item.image || '/images/placeholder.jpg'} alt={item.name} fill className="rounded-md object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="hover:underline">{item.name}</div>
                    {item.customName && (
                      <div className="text-xs text-blue-600 font-medium">Custom: "{item.customName}"</div>
                    )}
                    <div className="text-xs text-gray-500">Qty: {item.qty}</div>
                  </div>
                  <div className="text-gray-700">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row text-sm justify-between items-start pt-2 border-t">
              <div className="text-gray-600">
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  o.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{o.status}</span>
                <div className="text-xs text-gray-500 mt-1">Payment: <span className="font-medium">{o.payment}</span></div>
              </div>
              <div className="mt-2 sm:mt-0 sm:text-right">
                <div className="font-medium">Deliver to:</div>
                <div className="text-xs text-gray-500">{o.address.fullName}, {o.address.line1}, {o.address.city} {o.address.pincode}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
