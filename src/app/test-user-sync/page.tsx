'use client'
import { useAuth } from '@/context/ClerkAuthContext'
import { useWishlist } from '@/lib/wishlistStore'
import { useCart } from '@/lib/cartStore'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestUserSyncPage() {
  const { user } = useAuth()
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist()
  const { items: cartItems, add: addToCart } = useCart()
  const [testResults, setTestResults] = useState<any>({})

  if (!user) {
    return (
      <div className="container py-8">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">User Sync Test</h1>
          <p>Please login to test wishlist and cart sync</p>
        </Card>
      </div>
    )
  }

  const testWishlist = async () => {
    console.log('🧪 Testing wishlist...')
    const testProductId = 'test-product-' + Date.now()
    
    // Add to wishlist
    await toggleWishlist(user.id, testProductId)
    
    // Check if it was added
    setTimeout(() => {
      const isInWishlist = wishlistIds.includes(testProductId)
      setTestResults(prev => ({
        ...prev,
        wishlist: {
          added: isInWishlist,
          productId: testProductId,
          totalItems: wishlistIds.length
        }
      }))
    }, 1000)
  }

  const testCart = async () => {
    console.log('🧪 Testing cart...')
    const testItem = {
      id: 'test-cart-' + Date.now(),
      name: 'Test Product',
      image: 'https://via.placeholder.com/100',
      qty: 1,
      price: 99
    }
    
    // Add to cart
    await addToCart(user.id, testItem)
    
    // Check if it was added
    setTimeout(() => {
      const isInCart = cartItems.some(item => item.id === testItem.id)
      setTestResults(prev => ({
        ...prev,
        cart: {
          added: isInCart,
          productId: testItem.id,
          totalItems: cartItems.length
        }
      }))
    }, 1000)
  }

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch(`/api/test-user-data?userId=${encodeURIComponent(user.id)}`)
      const result = await response.json()
      setTestResults(prev => ({
        ...prev,
        database: result
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        database: { error: error.message }
      }))
    }
  }

  return (
    <div className="container py-8 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Data Sync Test</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="space-y-1 text-sm">
              <div>User ID: {user.id}</div>
              <div>Wishlist Items: {wishlistIds.length}</div>
              <div>Cart Items: {cartItems.length}</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Test Actions</h3>
            <div className="space-y-2">
              <Button onClick={testWishlist} className="w-full">
                Test Wishlist Add
              </Button>
              <Button onClick={testCart} className="w-full">
                Test Cart Add
              </Button>
              <Button onClick={testDatabaseConnection} className="w-full">
                Test Database
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Test Results</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Current Wishlist</h3>
        {wishlistIds.length === 0 ? (
          <p className="text-gray-500">No items in wishlist</p>
        ) : (
          <div className="space-y-2">
            {wishlistIds.map(id => (
              <div key={id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{id}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleWishlist(user.id, id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Current Cart</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">No items in cart</p>
        ) : (
          <div className="space-y-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="text-sm">
                  <div>{item.name}</div>
                  <div className="text-gray-500">Qty: {item.qty} | Price: ₹{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}