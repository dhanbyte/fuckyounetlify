'use client'
import { useProductStore } from '@/lib/productStore'
import { useState, useEffect } from 'react'

export default function ProductDebugger() {
  const { products, isLoading } = useProductStore()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    if (products.length > 0) {
      const analysis = {
        totalProducts: products.length,
        withSlug: products.filter(p => p.slug).length,
        withoutSlug: products.filter(p => !p.slug).length,
        withValidImage: products.filter(p => p.image && typeof p.image === 'string' && p.image.trim()).length,
        withInvalidImage: products.filter(p => !p.image || typeof p.image !== 'string' || !p.image.trim()).length,
        inStock: products.filter(p => p.quantity > 0).length,
        outOfStock: products.filter(p => p.quantity <= 0).length,
        categories: [...new Set(products.map(p => p.category))],
        sampleProducts: products.slice(0, 3).map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name?.substring(0, 30) + '...',
          hasImage: !!p.image,
          quantity: p.quantity,
          category: p.category
        })),
        problemProducts: products.filter(p => 
          !p.id || !p.name
        ).slice(0, 5).map(p => ({
          id: p.id || 'NO_ID',
          name: p.name?.substring(0, 30) || 'NO_NAME',
          hasImage: !!p.image,
          quantity: p.quantity,
          issues: [
            !p.id && 'Missing ID',
            !p.name && 'Missing Name',
            !p.slug && 'Missing Slug',
            !p.image && 'Missing Image'
          ].filter(Boolean)
        }))
      }
      setDebugInfo(analysis)
    }
  }, [products])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 text-xs max-w-sm max-h-96 overflow-auto z-50 shadow-lg">
      <h3 className="font-bold mb-2">Product Debug Info</h3>
      
      <div className="space-y-2">
        <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
        <div><strong>Total Products:</strong> {debugInfo.totalProducts || 0}</div>
        <div><strong>With Slug:</strong> {debugInfo.withSlug || 0}</div>
        <div><strong>Without Slug:</strong> {debugInfo.withoutSlug || 0}</div>
        <div><strong>With Images:</strong> {debugInfo.withValidImage || 0}</div>
        <div><strong>Without Images:</strong> {debugInfo.withInvalidImage || 0}</div>
        <div><strong>In Stock:</strong> {debugInfo.inStock || 0}</div>
        <div><strong>Out of Stock:</strong> {debugInfo.outOfStock || 0}</div>
        
        {debugInfo.categories && (
          <div>
            <strong>Categories:</strong>
            <div className="text-xs text-gray-600">
              {debugInfo.categories.join(', ')}
            </div>
          </div>
        )}

        {debugInfo.sampleProducts && debugInfo.sampleProducts.length > 0 && (
          <div>
            <strong>Sample Products:</strong>
            {debugInfo.sampleProducts.map((p: any, i: number) => (
              <div key={i} className="text-xs bg-gray-50 p-1 rounded mt-1">
                <div>ID: {p.id}</div>
                <div>Slug: {p.slug || 'NONE'}</div>
                <div>Name: {p.name}</div>
                <div>Image: {p.hasImage ? 'Yes' : 'No'}</div>
                <div>Stock: {p.quantity}</div>
              </div>
            ))}
          </div>
        )}

        {debugInfo.problemProducts && debugInfo.problemProducts.length > 0 && (
          <div>
            <strong>Problem Products:</strong>
            {debugInfo.problemProducts.map((p: any, i: number) => (
              <div key={i} className="text-xs bg-red-50 p-1 rounded mt-1">
                <div>ID: {p.id}</div>
                <div>Name: {p.name}</div>
                <div className="text-red-600">Issues: {p.issues.join(', ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}