'use client'
import { useState, useEffect } from 'react'
import { useProductStore } from '@/lib/productStore'
import { Package, Save, Plus, X, Upload, Info } from 'lucide-react'

const defaultCategories = {
  'tech': ['Accessories', 'Audio', 'Computer Accessories', 'Decor & Lighting', 'Outdoor Lighting'],
  'home': ['Puja-Essentials', 'Bathroom-Accessories', 'Kitchenware', 'Household-Appliances', 'Food Storage', 'Drinkware', 'Storage & Organization', 'Kitchen Tools', 'Baking Tools'],
  'fashion': ['Men', 'Women', 'Kids', 'Accessories'],
  'newArrivals': ['Best Selling', 'Fragrance', 'Diwali Special', 'Gifts'],
  'customizable': ['Jewelry','Drinkware','Accessories','Kitchen']
}

const fashionSubcategories = {
  'Men': ['Formal-Shirts', 'Casual-Shirts', 'T-Shirts', 'Polo-T-Shirts', 'Jeans', 'Trousers', 'Formal-Shoes', 'Casual-Shoes', 'Sneakers', 'Jackets', 'Hoodies', 'Watches'],
  'Women': ['Dresses', 'Sarees', 'Kurtis', 'Tops', 'Jeans', 'Leggings', 'Skirts', 'Heels', 'Flats', 'Sandals', 'Handbags', 'Jewelry'],
  'Kids': ['Boys-T-Shirts', 'Girls-Dresses', 'Boys-Shirts', 'Girls-Tops', 'Kids-Jeans', 'Kids-Shorts', 'Kids-Shoes', 'School-Uniforms', 'Party-Wear', 'Sleepwear', 'Winter-Wear', 'Accessories'],
  'Accessories': ['Watches', 'Sunglasses', 'Belts', 'Wallets', 'Bags', 'Jewelry', 'Caps-Hats', 'Scarves', 'Ties', 'Hair-Accessories', 'Phone-Cases', 'Perfumes']
}

export default function AddProduct() {
  const { forceRefresh } = useProductStore()
  const [products, setProducts] = useState([{
    name: '',
    category: '',
    subcategory: '',
    tertiaryCategory: '',
    originalPrice: '',
    discountPrice: '',
    description: '',
    stock: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    images: [],
    imageUrls: [],
    uploadingImages: false
  }])
  const [loading, setLoading] = useState(false)
  const [activeProduct, setActiveProduct] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editProductId, setEditProductId] = useState(null)
  const [categories, setCategories] = useState(defaultCategories)
  const [vendorData, setVendorData] = useState(null)
  const [vendorLoading, setVendorLoading] = useState(true)

  
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        // Check localStorage first
        const isLoggedIn = localStorage.getItem('vendorLoggedIn')
        const vendorDataStr = localStorage.getItem('vendorData')
        
        if (isLoggedIn === 'true' && vendorDataStr) {
          const localVendorData = JSON.parse(vendorDataStr)
          setVendorData(localVendorData)
          setVendorLoading(false)
          return
        }
        
        // Fallback to server session check
        const sessionResponse = await fetch('/api/vendor/session')
        const sessionResult = await sessionResponse.json()
        
        console.log('Session check result:', sessionResult)
        
        if (!sessionResult.success) {
          alert('Please login as vendor first')
          window.location.href = '/vendor/login'
          return
        }
        
        // Get full vendor profile
        const response = await fetch(`/api/vendor/profile?vendorId=${sessionResult.vendor._id}`)
        const result = await response.json()
        
        console.log('Vendor profile result:', result)
        
        if (result.success && result.vendor) {
          setVendorData(result.vendor)
        } else {
          // Use session data as fallback
          setVendorData(sessionResult.vendor)
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error)
        alert('Error loading vendor data. Please try logging in again.')
        window.location.href = '/vendor/login'
      } finally {
        setVendorLoading(false)
      }
    }
    
    fetchVendorData()
    
    // Check if we're editing a product
    const urlParams = new URLSearchParams(window.location.search)
    const isEdit = urlParams.get('edit')
    
    if (isEdit) {
      const editData = localStorage.getItem('editProduct')
      if (editData) {
        const product = JSON.parse(editData)
        setProducts([{
          name: product.name,
          category: product.category === 'Tech' ? 'tech' : 
                   product.category === 'Home' ? 'home' : 
                   product.category === 'New Arrivals' ? 'newArrivals' : 
                   product.category === 'Customizable' ? 'customizable' : product.category,
          subcategory: product.subcategory,
          originalPrice: product.originalPrice?.toString() || product.price?.toString() || '',
          discountPrice: product.discountPrice?.toString() || product.price?.toString() || '',
          description: product.description,
          stock: product.stock?.toString() || '',
          length: product.length?.toString() || '',
          width: product.width?.toString() || '',
          height: product.height?.toString() || '',
          weight: product.weight?.toString() || '',
          images: []
        }])
        setIsEditing(true)
        setEditProductId(product._id)
        localStorage.removeItem('editProduct')
      }
    }
  }, [])

  const addNewProduct = () => {
    setProducts([...products, {
      name: '',
      category: '',
      subcategory: '',
      tertiaryCategory: '',
      originalPrice: '',
      discountPrice: '',
      description: '',
      stock: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      images: [],
      imageUrls: [],
      uploadingImages: false
    }])
    setActiveProduct(products.length)
  }

  const removeProduct = (index) => {
    if (products.length > 1) {
      const newProducts = products.filter((_, i) => i !== index)
      setProducts(newProducts)
      setActiveProduct(Math.max(0, activeProduct - 1))
    }
  }

  const updateProduct = (index, field, value) => {
    const newProducts = [...products]
    newProducts[index][field] = value
    setProducts(newProducts)
  }

  const handleImageUpload = async (index, files) => {
    const newProducts = [...products]
    newProducts[index].images = Array.from(files)
    newProducts[index].uploadingImages = true
    setProducts(newProducts)
    
    // Upload images immediately in background
    const imageUrls = []
    try {
      for (const image of Array.from(files)) {
        const formDataImg = new FormData()
        formDataImg.append('file', image)
        formDataImg.append('fileName', `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
        formDataImg.append('folder', '/vendor-products')

        const uploadResponse = await fetch('/api/imagekit/upload', {
          method: 'POST',
          body: formDataImg
        })

        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          imageUrls.push(uploadData.url)
        }
      }
      
      // Update with uploaded URLs
      const updatedProducts = [...products]
      updatedProducts[index].imageUrls = imageUrls
      updatedProducts[index].uploadingImages = false
      setProducts(updatedProducts)
    } catch (error) {
      console.error('Image upload failed:', error)
      const updatedProducts = [...products]
      updatedProducts[index].uploadingImages = false
      setProducts(updatedProducts)
    }
  }

  const uploadImagesInBackground = async (productId, images) => {
    try {
      const imageUrls = []
      for (const image of images) {
        const formDataImg = new FormData()
        formDataImg.append('file', image)
        formDataImg.append('fileName', `product-${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
        formDataImg.append('folder', '/vendor-products')

        const uploadResponse = await fetch('/api/imagekit/upload', {
          method: 'POST',
          body: formDataImg
        })

        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          imageUrls.push(uploadData.url)
        }
      }
      
      // Update product with real image URLs
      if (imageUrls.length > 0) {
        await fetch('/api/vendor/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            productId, 
            images: imageUrls,
            updateImagesOnly: true 
          })
        })
      }
    } catch (error) {
      console.error('Background image upload failed:', error)
    }
  }

  const replaceImage = async (productIndex, imageIndex, file) => {
    const newProducts = [...products]
    const newImages = [...newProducts[productIndex].images]
    newImages[imageIndex] = file
    newProducts[productIndex].images = newImages
    newProducts[productIndex].uploadingImages = true
    setProducts(newProducts)
    
    // Upload replacement image immediately
    try {
      const formDataImg = new FormData()
      formDataImg.append('file', file)
      formDataImg.append('fileName', `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      formDataImg.append('folder', '/vendor-products')

      const uploadResponse = await fetch('/api/imagekit/upload', {
        method: 'POST',
        body: formDataImg
      })

      const uploadData = await uploadResponse.json()
      if (uploadData.success) {
        const updatedProducts = [...products]
        const newImageUrls = [...updatedProducts[productIndex].imageUrls]
        newImageUrls[imageIndex] = uploadData.url
        updatedProducts[productIndex].imageUrls = newImageUrls
        updatedProducts[productIndex].uploadingImages = false
        setProducts(updatedProducts)
      }
    } catch (error) {
      console.error('Image replacement failed:', error)
      const updatedProducts = [...products]
      updatedProducts[productIndex].uploadingImages = false
      setProducts(updatedProducts)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!vendorData) {
        alert('Vendor data not loaded. Please refresh the page and try again.')
        return
      }

      console.log('Using vendor data:', vendorData)

      for (const product of products) {
        // Validate product data before sending
        if (!product.name || !product.category || !product.subcategory ||
            !product.originalPrice || !product.discountPrice || !product.stock ||
            !product.length || !product.width || !product.height || !product.weight || product.images.length === 0) {
          alert(`Please fill all required fields for "${product.name || 'Product'}": name, category, subcategory, original price, discount price, stock, dimensions (L×W×H), weight, and at least one image`)
          return
        }

        console.log('Adding product:', product.name)
        
        // Use placeholder URLs if images are still uploading
        const imageUrls = product.imageUrls.length > 0 ? product.imageUrls : 
          product.images.map((_, index) => `placeholder-${Date.now()}-${index}`)

        const productData = {
          vendorId: vendorData._id,
          name: product.name,
          brand: vendorData.brandName || vendorData.businessName || 'Unknown Brand',
          category: product.category === 'tech' ? 'Tech' : 
                   product.category === 'home' ? 'Home' : 
                   product.category === 'fashion' ? 'Fashion' :
                   product.category === 'newArrivals' ? 'New Arrivals' : 
                   product.category === 'customizable' ? 'Customizable' : product.category,
          subcategory: product.subcategory,
          tertiaryCategory: product.tertiaryCategory || undefined,
          description: product.description,
          images: imageUrls,
          price: parseFloat(product.discountPrice),
          originalPrice: parseFloat(product.originalPrice),
          discountPrice: parseFloat(product.discountPrice),
          stock: parseInt(product.stock),
          length: parseFloat(product.length),
          width: parseFloat(product.width),
          height: parseFloat(product.height),
          weight: parseInt(product.weight),
          pendingImages: product.images.length > 0 && product.imageUrls.length === 0
        }

        console.log('Sending product data:', productData)

        const response = await fetch('/api/vendor/products', {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEditing ? { ...productData, productId: editProductId } : productData)
        })

        const result = await response.json()
        console.log('API Response:', result)

        if (!result.success) {
          throw new Error(`Failed to add product "${product.name}": ${result.message}`)
        }
        
        // Upload images in background if not already uploaded
        if (product.images.length > 0 && product.imageUrls.length === 0) {
          uploadImagesInBackground(result.productId, product.images)
        }
      }

      // Force refresh the product store to show new products immediately
      if (forceRefresh) {
        await forceRefresh()
      }
      
      alert(`${products.length} product(s) ${isEditing ? 'updated' : 'added'} successfully!`)
      if (isEditing) {
        window.location.href = '/vendor/products'
        return
      }
      setProducts([{
        name: '', category: '', subcategory: '', tertiaryCategory: '', originalPrice: '', discountPrice: '',
        description: '', stock: '', length: '', width: '', height: '', weight: '', images: [], imageUrls: [], uploadingImages: false
      }])
      setActiveProduct(0)
    } catch (error) {
      console.error('Error adding products:', error)
      alert(`Failed to add products: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const currentProduct = products[activeProduct]

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Package className="h-8 w-8" />
          {isEditing ? 'Edit Product' : `Add New Products (${products.length})`}
          {vendorLoading && (
            <span className="ml-4 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded animate-pulse">
              Loading...
            </span>
          )}
        </h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Product Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {products.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveProduct(index)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                      activeProduct === index ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    Product {index + 1}
                    {products.length > 1 && (
                      <X 
                        className="h-4 w-4 hover:bg-red-500 rounded" 
                        onClick={(e) => { e.stopPropagation(); removeProduct(index) }}
                      />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addNewProduct}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={currentProduct.name}
                    onChange={(e) => updateProduct(activeProduct, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={currentProduct.category}
                    onChange={(e) => {
                      updateProduct(activeProduct, 'category', e.target.value)
                      updateProduct(activeProduct, 'subcategory', '')
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="tech">Tech</option>
                    <option value="home">Home Decor</option>
                    <option value="fashion">Fashion</option>
                    <option value="newArrivals">New Arrivals</option>
                    <option value="customizable">Customizable Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategory *</label>
                  <select
                    value={currentProduct.subcategory}
                    onChange={(e) => {
                      updateProduct(activeProduct, 'subcategory', e.target.value)
                      updateProduct(activeProduct, 'tertiaryCategory', '')
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    disabled={!currentProduct.category}
                  >
                    <option value="">Select Subcategory</option>
                    {currentProduct.category && categories[currentProduct.category]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                {currentProduct.category === 'fashion' && currentProduct.subcategory && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Type *</label>
                    <select
                      value={currentProduct.tertiaryCategory}
                      onChange={(e) => updateProduct(activeProduct, 'tertiaryCategory', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Type</option>
                      {fashionSubcategories[currentProduct.subcategory]?.map(type => (
                        <option key={type} value={type}>{type.replace(/-/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Original Price *</label>
                  <input
                    type="number"
                    value={currentProduct.originalPrice}
                    onChange={(e) => updateProduct(activeProduct, 'originalPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Price *</label>
                  <input
                    type="number"
                    value={currentProduct.discountPrice}
                    onChange={(e) => updateProduct(activeProduct, 'discountPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock *</label>
                  <input
                    type="number"
                    value={currentProduct.stock}
                    onChange={(e) => updateProduct(activeProduct, 'stock', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Length (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentProduct.length}
                    onChange={(e) => updateProduct(activeProduct, 'length', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Width (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentProduct.width}
                    onChange={(e) => updateProduct(activeProduct, 'width', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentProduct.height}
                    onChange={(e) => updateProduct(activeProduct, 'height', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (grams) *</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 250"
                    value={currentProduct.weight}
                    onChange={(e) => updateProduct(activeProduct, 'weight', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={currentProduct.description}
                  onChange={(e) => updateProduct(activeProduct, 'description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Images *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Drag & drop images or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(activeProduct, e.target.files)}
                    className="hidden"
                    id={`images-${activeProduct}`}
                  />
                  <label
                    htmlFor={`images-${activeProduct}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Choose Images
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Upload up to 5 images (JPG, PNG). Click on any image to replace it.</p>
                </div>
                {currentProduct.images.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Images will upload after product submission
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from(currentProduct.images).map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`replace-${activeProduct}-${index}`).click()}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newProducts = [...products]
                                const newImages = newProducts[activeProduct].images.filter((_, i) => i !== index)
                                const newImageUrls = newProducts[activeProduct].imageUrls.filter((_, i) => i !== index)
                                newProducts[activeProduct].images = newImages
                                newProducts[activeProduct].imageUrls = newImageUrls
                                setProducts(newProducts)
                              }}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                          <div className={`absolute -bottom-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                            currentProduct.imageUrls[index] ? 'bg-green-600' : 'bg-orange-600'
                          }`}>
                            {currentProduct.imageUrls[index] ? '✓' : '⏳'}
                          </div>
                          <input
                            type="file"
                            id={`replace-${activeProduct}-${index}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files[0] && replaceImage(activeProduct, index, e.target.files[0])}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !vendorData}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  loading || !vendorData ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <Save className="h-5 w-5" />
                {loading ? (isEditing ? 'Updating...' : 'Adding Products...') : 
                 (isEditing ? 'Update Product' : `Add ${products.length} Product(s)`)}
              </button>
            </form>
          </div>

          {/* Product Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Product Preview</h3>
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-3 cursor-pointer ${
                      activeProduct === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setActiveProduct(index)}
                  >
                    <div className="flex gap-3">
                      {product.images[0] && (
                        <img
                          src={URL.createObjectURL(product.images[0])}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {product.name || `Product ${index + 1}`}
                        </h4>
                        <p className="text-xs text-gray-500">{product.category} - {product.subcategory}</p>
                        <div className="flex gap-2 text-xs">
                          {product.discountPrice && (
                            <span className="text-green-600 font-medium">₹{product.discountPrice}</span>
                          )}
                          <span className={product.discountPrice ? 'line-through text-gray-400' : 'text-green-600 font-medium'}>
                            ₹{product.originalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Guide */}
          <div className="lg:col-span-1">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                How to Add Products
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                  <p>Fill product details like name, category, and pricing</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                  <p>Upload high-quality product images (up to 5)</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                  <p>Add multiple products using the "Add Product" button</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                  <p>Review all products in the preview panel</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
                  <p>Click "Add Products" to submit all at once</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-red-100 rounded border-l-4 border-red-500">
                <p className="text-xs text-red-800">
                  <strong>Important:</strong> Discount price is mandatory. Your brand name will be automatically added from your vendor profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}