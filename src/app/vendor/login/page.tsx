'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VendorLogin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  
  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = localStorage.getItem('vendorLoggedIn')
      if (isLoggedIn === 'true') {
        router.push('/vendor/dashboard')
      } else {
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/vendor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.vendor.status === 'approved') {
          // Store vendor data in localStorage
          localStorage.setItem('vendorEmail', data.vendor.email)
          localStorage.setItem('vendorData', JSON.stringify(data.vendor))
          localStorage.setItem('vendorLoggedIn', 'true')
          
          // Create server session
          const sessionResponse = await fetch('/api/vendor/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.vendor.email })
          })
          
          toast({ title: "Success", description: `Welcome ${data.vendor.businessName}!` })
          router.push('/vendor/dashboard')
        } else {
          toast({ title: "Pending", description: "Your account is pending admin approval" })
        }
      } else {
        toast({ title: "Error", description: data.error })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({ title: "Error", description: "Login failed" })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking login status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">🏪 Vendor Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="mt-4 text-center space-y-2">
          <Link href="/vendor/register" className="block text-blue-600 hover:underline">
            New vendor? Register here
          </Link>
          <Link href="/" className="block text-gray-600 hover:underline">
            Back to website
          </Link>
        </div>
      </div>
    </div>
  )
}