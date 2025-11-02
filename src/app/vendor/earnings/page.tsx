'use client'
import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'

export default function Earnings() {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    thisMonth: 0,
    lastMonth: 0,
    transactions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      // Get vendor ID from localStorage
      const vendorDataStr = localStorage.getItem('vendorData')
      let vendorId = null
      
      if (vendorDataStr) {
        try {
          const vendorData = JSON.parse(vendorDataStr)
          vendorId = vendorData._id || vendorData.id
        } catch (e) {
          console.error('Error parsing vendor data:', e)
        }
      }
      
      if (!vendorId) {
        console.error('No vendor ID found')
        window.location.href = '/vendor/login'
        return
      }
      
      const response = await fetch(`/api/vendor/earnings?vendorId=${vendorId}`)
      const data = await response.json()
      
      if (data.success) {
        setEarnings(data.earnings)
      } else {
        console.error('Earnings fetch error:', data.message)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Earnings Dashboard
        </h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">₹{earnings.totalEarnings?.toLocaleString() || 0}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">₹{earnings.pendingPayments?.toLocaleString() || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">₹{earnings.thisMonth?.toLocaleString() || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Month</p>
              <p className="text-2xl font-bold text-purple-600">₹{earnings.lastMonth?.toLocaleString() || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        
        {earnings.transactions?.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500">Earnings will appear here when you make sales</p>
          </div>
        ) : (
          <div className="divide-y">
            {earnings.transactions?.map((transaction, index) => (
              <div key={index} className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Order #{transaction.orderId}</h3>
                  <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+₹{transaction.amount}</p>
                  <p className="text-sm text-gray-600">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}