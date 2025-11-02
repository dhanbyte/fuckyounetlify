'use client'
import { useState, useEffect } from 'react'
import { Building, User, Phone, Mail, MapPin, CreditCard, Save, Edit, Package } from 'lucide-react'

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [newPhoto, setNewPhoto] = useState(null)

  useEffect(() => {
    fetchVendorProfile()
  }, [])

  const fetchVendorProfile = async () => {
    try {
      // Check localStorage first
      const isLoggedIn = localStorage.getItem('vendorLoggedIn')
      const vendorDataStr = localStorage.getItem('vendorData')
      
      if (isLoggedIn === 'true' && vendorDataStr) {
        try {
          const localVendorData = JSON.parse(vendorDataStr)
          // Fetch full profile using vendor ID
          const response = await fetch(`/api/vendor/profile?vendorId=${localVendorData._id}`)
          const data = await response.json()
          
          if (data.success) {
            setVendorData(data.vendor)
            return
          }
        } catch (e) {
          console.error('Error using localStorage data:', e)
        }
      }
      
      // Fallback to session check
      const sessionResponse = await fetch('/api/vendor/session')
      const sessionData = await sessionResponse.json()
      
      if (!sessionData.success) {
        window.location.href = '/vendor/login'
        return
      }
      
      // Try with vendorId first, then email
      let response = await fetch(`/api/vendor/profile?vendorId=${sessionData.vendor._id}`)
      let data = await response.json()
      
      if (!data.success && sessionData.vendor.email) {
        response = await fetch(`/api/vendor/profile?email=${sessionData.vendor.email}`)
        data = await response.json()
      }
      
      if (data.success) {
        setVendorData(data.vendor)
      } else {
        console.error('Profile fetch error:', data.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      window.location.href = '/vendor/login'
    } finally {
      setLoading(false)
    }
  }
  

  
  const setVendorData = (vendorData) => {
    setVendor(vendorData)
    setFormData({
      name: vendorData.name,
      businessName: vendorData.businessName,
      brandName: vendorData.brandName || '',
      phone: vendorData.phone,
      businessType: vendorData.businessType || 'Individual',
      gstNumber: vendorData.gstNumber || '',
      panNumber: vendorData.panNumber || '',
      aadharNumber: vendorData.aadharNumber || '',
      street: vendorData.address?.street || '',
      city: vendorData.address?.city || '',
      state: vendorData.address?.state || '',
      pincode: vendorData.address?.pincode || '',
      bankName: vendorData.bankDetails?.bankName || '',
      accountNumber: vendorData.bankDetails?.accountNumber || '',
      ifscCode: vendorData.bankDetails?.ifscCode || '',
      accountHolder: vendorData.bankDetails?.accountHolder || '',
      accountType: vendorData.bankDetails?.accountType || 'Savings'
    })
  }

  const handleSave = async () => {
    try {
      const vendorId = vendor._id
      let photoUrl = vendor.profilePhoto
      
      if (newPhoto) {
        try {
          console.log('Uploading new photo...')
          const formDataPhoto = new FormData()
          formDataPhoto.append('file', newPhoto)
          formDataPhoto.append('fileName', `vendor-${vendorId}-${Date.now()}`)
          formDataPhoto.append('folder', '/vendor-profiles')
          
          const uploadResponse = await fetch('/api/imagekit/upload', {
            method: 'POST',
            body: formDataPhoto
          })
          
          const uploadData = await uploadResponse.json()
          console.log('Photo upload response:', uploadData)
          
          if (uploadData.success) {
            photoUrl = uploadData.url
            console.log('Photo uploaded successfully:', photoUrl)
          } else {
            console.error('Photo upload failed:', uploadData.message)
            alert('Photo upload failed: ' + uploadData.message)
          }
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError)
          alert('Photo upload error. Profile will be saved without photo change.')
        }
      }

      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          name: formData.name,
          businessName: formData.businessName,
          brandName: formData.brandName,
          phone: formData.phone,
          businessType: formData.businessType,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber,
          aadharNumber: formData.aadharNumber,
          profilePhoto: photoUrl,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          },
          bankDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            accountHolder: formData.accountHolder,
            accountType: formData.accountType
          }
        })
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        setEditing(false)
        setNewPhoto(null)
        fetchVendorProfile()
      }
    } catch (error) {
      alert('Failed to update profile')
    }
  }

  const changePassword = async (newPassword) => {
    try {
      const vendorId = vendor._id
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          password: newPassword
        })
      })

      if (response.ok) {
        alert('Password changed successfully!')
      } else {
        alert('Failed to change password')
      }
    } catch (error) {
      alert('Error changing password')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Vendor Profile Not Found</h2>
            <p className="text-gray-600 mb-4">Please register as a vendor first or login with correct credentials.</p>
            <div className="flex gap-2 justify-center">
              <a href="/vendor/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Register as Vendor
              </a>
              <a href="/vendor/login" className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
                Vendor Login
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendor Profile</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchVendorProfile}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2"
            >
              🔄 Refresh
            </button>
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Photo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Photo
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 border-2 border-gray-300 rounded-full overflow-hidden">
                {newPhoto ? (
                  <img src={URL.createObjectURL(newPhoto)} alt="New" className="w-full h-full object-cover" />
                ) : vendor.profilePhoto ? (
                  <img src={vendor.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPhoto(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Upload a new profile photo</p>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Login Credentials
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vendor ID</label>
                <p className="text-gray-700 font-mono">{vendor.vendorId || 'Not Generated'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <p className="text-gray-700">{vendor.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••"
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      const newPassword = prompt('Enter new password (min 6 characters):')
                      if (newPassword && newPassword.length >= 6) {
                        changePassword(newPassword)
                      } else if (newPassword) {
                        alert('Password must be at least 6 characters long')
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.businessName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.brandName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vendor.status === 'approved' ? 'bg-green-100 text-green-800' :
                  vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {vendor.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Commission Rate</label>
                <p className="text-gray-700">{vendor.commission || 15}%</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                {editing ? (
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="LLP">LLP</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{vendor.businessType || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GST Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.gstNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PAN Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.panNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Aadhar Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Optional"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.aadharNumber || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.address?.street}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{vendor.address?.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-700">{vendor.address?.state}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pincode</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.address?.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.bankName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Holder</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.accountHolder || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.accountNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">IFSC Code</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.ifscCode || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account Type</label>
                {editing ? (
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{vendor.bankDetails?.accountType || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Earnings</label>
                <p className="text-2xl font-bold text-green-600">₹{vendor.totalEarnings?.toLocaleString() || 0}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pending Payments</label>
                <p className="text-2xl font-bold text-orange-600">₹{vendor.pendingPayments?.toLocaleString() || 0}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Total Revenue</label>
                <p className="text-2xl font-bold text-blue-600">₹{vendor.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Performance Stats
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{vendor.totalProducts || 0}</p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{vendor.totalOrders || 0}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{vendor.rating || 'N/A'}</p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{vendor.reviewCount || 0}</p>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}