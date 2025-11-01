'use client'
import Link from 'next/link'
import PriceTag from './PriceTag'
import RatingStars from './RatingStars'
import WishlistButton from './WishlistButton'
import { useCart } from '../lib/cartStore'
import { toast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import UniversalImage from './UniversalImage'
import type { Product } from '../lib/types'
import { Button } from './ui/button'
import { useRequireAuth } from '@/hooks/use-require-auth'
import { Palette } from 'lucide-react'

interface CustomizableProductCardProps {
  product: Product;
}

export default function CustomizableProductCard({ product }: CustomizableProductCardProps) {
  const { add } = useCart()
  const { requireAuth, user } = useRequireAuth()
  const price = product.price.discounted ?? product.price.original
  
  // Generate proper slug for the product
  const getProductSlug = () => {
    if (product.slug) return product.slug;
    if (product.id) return product.id;
    if (product._id) return product._id;
    // Fallback: generate slug from name
    return product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
  };
  
  const productSlug = getProductSlug();
  
  const handleAddToCart = () => {
    if (!requireAuth('add items to cart')) {
      return
    }
    add(user.id, { id: product.id, qty: 1, price, name: product.name, image: product.image })
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      className: "bg-green-500 text-white"
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg border border-blue-200 p-2 flex flex-col group hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square mb-2">
        <Link href={`/product/${productSlug}`} className="block h-full">
          <div className="relative w-full h-full overflow-hidden rounded-md">
            {product.image ? (
              <UniversalImage
                src={product.image}
                alt={product.name}
                fill
                className="rounded-md"
                priority={false}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
            <div className="absolute top-1 left-1">
              <div className="bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded flex items-center gap-0.5">
                <Palette className="w-2 h-2" />
                Custom
              </div>
            </div>
          </div>
        </Link>
        <div className="absolute right-1 top-1">
          <WishlistButton id={product.id} />
        </div>
      </div>
      <div className="flex-grow flex flex-col">
        <Link href={`/product/${productSlug}`} className="flex-grow">
          <div className="line-clamp-2 text-[11px] sm:text-xs font-medium leading-tight mb-1 h-6">{product.name}</div>
          <div className="mb-1">
            <RatingStars value={product.ratings?.average || 0} />
          </div>
          <div className="mb-2">
            <PriceTag original={product.price.original} discounted={product.price.discounted} />
          </div>
        </Link>
        <div>
          <Button onClick={handleAddToCart} size="sm" className="w-full h-6 text-[10px] sm:text-xs py-0 bg-blue-600 hover:bg-blue-700">
            Customize & Add
          </Button>
        </div>
      </div>
    </motion.div>
  )
}