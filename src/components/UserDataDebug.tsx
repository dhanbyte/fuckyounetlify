'use client'
import { useAuth } from '@/context/ClerkAuthContext'
import { useWishlist } from '@/lib/wishlistStore'
import { useCart } from '@/lib/cartStore'
import { useState } from 'react'
import { Button } from './ui/button'

export default function UserDataDebug() {
  const { user } = useAuth()
  const { ids: wishlistIds } = useWishlist()
  const { items: cartItems } = useCart()
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/test-user-data?userId=${encodeURIComponent(user.id)}`)
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error.message })
    }
    setLoading(false)
  }

  const testSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Test wishlist save
      const wishlistResponse = await fetch('/api/test-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          type: 'wishlist', 
          data: ['test-product-1', 'test-product-2'] 
        })
      })
      const wishlistResult = await wishlistResponse.json()
      
      // Test cart save
      const cartResponse = await fetch('/api/test-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          type: 'cart', 
          data: [{ id: 'test-item', name: 'Test Item', qty: 1, price: 100 }] 
        })
      })
      const cartResult = await cartResponse.json()
      
      setTestResult({ wishlistSave: wishlistResult, cartSave: cartResult })
    } catch (error) {
      setTestResult({ error: error.message })
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-100 border border-red-300 rounded-lg p-4 text-sm">
        <div className="font-semibold text-red-800">Debug: User not logged in</div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-50 border border-blue-300 rounded-lg p-4 text-sm max-w-sm">
      <div className="font-semibold text-blue-800 mb-2">User Data Debug</div>
      <div className="space-y-1 text-xs">
        <div><strong>User ID:</strong> {user.id}</div>
        <div><strong>Wishlist:</strong> {wishlistIds.length} items</div>
        <div><strong>Cart:</strong> {cartItems.length} items</div>
      </div>
      
      <div className="mt-3 space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={testDatabase}
          disabled={loading}
        >
          Test DB
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={testSave}
          disabled={loading}
        >
          Test Save
        </Button>
      </div>
      
      {testResult && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}