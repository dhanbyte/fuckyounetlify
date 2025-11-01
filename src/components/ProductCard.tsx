'use client'
import Link from 'next/link'
import PriceTag from './PriceTag'
import RatingStars from './RatingStars'
import WishlistButton from './WishlistButton'
import { useCart } from '../lib/cartStore'
import { toast } from '../hooks/use-toast'
import { motion } from 'framer-motion'
import ProductSuggestionsRow from './ProductSuggestionsRow'
import UniversalImage from './UniversalImage'
import type { Product } from '../lib/types'
import { Button } from './ui/button'
import { useRequireAuth } from '../hooks/use-require-auth';
import { useNotificationStore } from '../lib/notificationStore'
import { BellRing, Check } from 'lucide-react'

export default function ProductCard({ p, product, suggest }: { p?: Product; product?: Product; suggest?: any[] }) {
  const productData = p || product;
  if (!productData) return null;
  
  const { add } = useCart();
  const { requireAuth, user } = useRequireAuth();
  const { addNotification, hasNotification } = useNotificationStore();
  const price = productData.price?.discounted ?? productData.price_discounted ?? productData.price?.original ?? productData.price_original ?? 0;
  
  // Generate proper slug for the product
  const getProductSlug = () => {
    if (productData.slug) return productData.slug;
    if (productData.id) return productData.id;
    if (productData._id) return productData._id;
    // Fallback: generate slug from name
    return productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
  };
  
  const productSlug = getProductSlug();
  
  const handleAddToCart = () => {
    if (!requireAuth('add items to cart')) {
      return;
    }
    add(user.id, { 
      id: productData.id, 
      qty: 1, 
      price, 
      name: productData.name, 
      image: productData.image,
      weight: productData.weight || 100, // Default weight if not specified
      category: productData.category
    });
    toast({
      title: "Added to Cart",
      description: `${productData.name} has been added to your cart.`,
      className: "bg-green-500 text-white"
    });
  };

  const handleNotifyMe = () => {
    if (!requireAuth('get notified about this product')) {
      return;
    }
    if (!hasNotification(productData.id)) {
      addNotification(user.id, productData.id);
      toast({ 
        title: "You're on the list!", 
        description: `We'll notify you when ${productData.name} is back in stock.`,
        className: "bg-blue-500 text-white"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg border border-gray-200 p-2 md:p-3 flex flex-col group hover:shadow-md transition-all duration-200"
    >
      <div className="relative w-full aspect-square mb-2 md:mb-3 overflow-hidden rounded-md bg-gray-50">
        <Link href={`/product/${productSlug}`} className="absolute inset-0">
          {productData.image ? (
            <UniversalImage
              src={productData.image}
              alt={productData.name}
              fill
              className="group-hover:scale-105 transition-transform duration-200"
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          {(productData.quantity === 0 || productData.stock === 0) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded-full">OUT OF STOCK</span>
            </div>
          )}
        </Link>
        
        {/* Discount Badge */}
        {((productData.price?.discounted || productData.price_discounted) && (productData.price?.original || productData.price_original)) && (
          <div className="absolute left-1 top-1 bg-red-500 text-white px-0.5 md:px-2 py-0.5 md:py-1 rounded-full text-[8px] md:text-xs font-bold z-10">
            {Math.round((((productData.price?.original || productData.price_original) - (productData.price?.discounted || productData.price_discounted)) / (productData.price?.original || productData.price_original)) * 100)}% OFF
          </div>
        )}
        
        <div className="absolute right-1 top-1">
          <WishlistButton id={productData.id} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <Link href={`/product/${productSlug}`} className="flex-1">
          <h3 className="line-clamp-2 text-xs md:text-sm font-medium text-gray-900 mb-1 md:mb-2 leading-tight">
            {productData.name}
          </h3>
          <div className="mb-1 md:mb-2">
            <RatingStars value={productData.ratings?.average || 0} size="xs" />
          </div>
          <div className="mb-2 md:mb-3">
            <PriceTag 
              original={productData.price?.original || productData.price_original} 
              discounted={productData.price?.discounted || productData.price_discounted} 
              size="sm" 
            />
          </div>
        </Link>
        
        <div className="mt-auto">
          {(productData.quantity > 0 || productData.stock > 0) ? (
            <Button onClick={handleAddToCart} className="w-full h-7 md:h-9 text-xs md:text-sm font-medium">
              Add
            </Button>
          ) : (
            hasNotification(productData.id) ? (
              <Button className="w-full h-7 md:h-9 text-xs md:text-sm" disabled>
                <Check className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                Added
              </Button>
            ) : (
              <Button onClick={handleNotifyMe} variant="secondary" className="w-full h-7 md:h-9 text-xs md:text-sm">
                <BellRing className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                Notify
              </Button>
            )
          )}
        </div>
      </div>
      
      {suggest && suggest.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <div className="mb-2 text-sm font-medium text-gray-500">Customers also viewed</div>
          <ProductSuggestionsRow products={suggest} />
        </div>
      )}
    </motion.div>
  )
}
