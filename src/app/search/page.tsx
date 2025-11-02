

'use client'
import { useMemo, Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link';
import Image from 'next/image';
import { filterProducts } from '@/lib/search'
import Filters from '@/components/Filters'
import SortBar from '@/components/SortBar'
import ProductCard from '@/components/ProductCard'
import CategoryPills from '@/components/CategoryPills'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CategoryGrid from '@/components/CategoryGrid';
import { cn } from '@/lib/utils';
import { useProductStore } from '@/lib/productStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FASHION_PRODUCTS } from '@/lib/data/fashion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import OfferCard from '@/components/OfferCard';

const techCategories = [
  { name: 'Accessories', href: '/search?category=Tech&subcategory=Accessories', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166', dataAiHint: 'mobile accessories' },
  { name: 'Decor & Lighting', href: '/search?category=Tech&subcategory=Decor%20%26%20Lighting', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_5ba5639c-603e-428a-afe3-eefdc5f0f696.webp?updatedAt=1757157493441', dataAiHint: 'decor lighting' },
  { name: 'Audio', href: '/search?category=Tech&subcategory=Audio', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_413ce869-b6ef-477c-8be8-b78545b87afb.webp?updatedAt=1757152313606', dataAiHint: 'audio speakers' },
  { name: 'Computer Accessories', href: '/search?category=Tech&subcategory=Computer%20Accessories', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/e352de8b-cbde-4b0c-84d9-e7cefc7086fc.webp', dataAiHint: 'computer accessories' },
  { name: 'Outdoor Lighting', href: '/search?category=Tech&subcategory=Outdoor%20Lighting', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/5f7e872992d2b507f33f68da-9-large_0e2c40e8-8e9c-426a-b98c-968cddb10225.avif', dataAiHint: 'outdoor lighting' },
];

const homeCategories = [
    { name: 'Puja-Essentials', href: '/search?category=Home&subcategory=Puja-Essentials', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/1/1.webp?updatedAt=1756551012208', dataAiHint: 'puja essentials' },
    { name: 'Bathroom-Accessories', href: '/search?category=Home&subcategory=Bathroom-Accessories', image: 'https://Shopwave.b-cdn.net/puja%20photos/e7f464c4-3c4f-4b07-82f4-e4d1eee94930_1.b3569a78f0f854174520dbe2b1ef52d8.webp', dataAiHint: 'bathroom accessories' },
    { name: 'Kitchenware', href: '/search?category=Home&subcategory=Kitchenware', image: 'https://Shopwave.b-cdn.net/Homekichan/01_a4e3c239-73ae-4939-8b28-aa03ed6f760f.webp', dataAiHint: 'kitchenware' },
    { name: 'Household-Appliances', href: '/search?category=Home&subcategory=Household-Appliances', image: 'https://Shopwave.b-cdn.net/Homekichan/02_13a215dc-07e6-4d05-98bc-dd30f55e92dc.webp', dataAiHint: 'household appliances' },
    { name: 'Food Storage', href: '/search?category=Home&subcategory=Food%20Storage', image: 'https://Shopwave.b-cdn.net/Eltronicpart-2/storage-box-02.webp', dataAiHint: 'food storage' },
    { name: 'Drinkware', href: '/search?category=Home&subcategory=Drinkware', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/Tumbler-04_8520f518-fd21-4ca9-98f2-149e361dda36.webp?updatedAt=1757179631247', dataAiHint: 'drinkware' },
    { name: 'Kitchen Tools', href: '/search?category=Home&subcategory=Kitchen%20Tools', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/05_af19803f-0274-4f7b-829b-3974c9c6365d.avif?updatedAt=1757139103515', dataAiHint: 'kitchen tools' },
    { name: 'Storage & Organization', href: '/search?category=Home&subcategory=Storage%20%26%20Organization', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/06_d748bf1f-ff1c-42fe-9c83-826bd1544147.avif?updatedAt=1757139337543', dataAiHint: 'storage organization' },
    { name: 'Baking Tools', href: '/search?category=Home&subcategory=Baking%20Tools', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/7636fc2e-a31a-4ba5-bd9a-d985e02e1f0f_f44e78eb-ccad-4b77-9eb4-3ef45c19b93d.webp', dataAiHint: 'baking tools' },
];

const newArrivalsSubCategories = [
  { name: 'diwali Special', href: '/search?category=New%20Arrivals&subcategory=diwali%20Special', image: 'https://ik.imagekit.io/b5qewhvhb/WhatsApp%20Image%202025-09-22%20at%2017.55.22_ee418f7e.jpg', dataAiHint: 'diwali special' },
  { name: 'Gifts', href: '/search?category=New%20Arrivals&subcategory=Gifts', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp', dataAiHint: 'gifts' },
  { name: 'Car Accessories', href: '/search?category=New%20Arrivals&subcategory=Car%20Accessories', image: 'https://Shopwave.b-cdn.net/new%20arival/01_15d3c786-e22a-4818-8a49-d1c8c6662719.webp', dataAiHint: 'car accessories' },
  { name: 'Kitchen Appliances', href: '/search?category=New%20Arrivals&subcategory=Kitchen%20Appliances', image: 'https://Shopwave.b-cdn.net/new%20arival/17865..1.webp', dataAiHint: 'kitchen appliances' },
  { name: 'Home Appliances', href: '/search?category=New%20Arrivals&subcategory=Home%20Appliances', image: 'https://Shopwave.b-cdn.net/new%20arival/4ce6bdd6-4139-4645-8183-d71554df6b88_38f14c77-c503-46cd-be19-4ae0e0c88eb0.webp', dataAiHint: 'home appliances' },
  { name: 'Cleaning Tools', href: '/search?category=New%20Arrivals&subcategory=Cleaning%20Tools', image: 'https://Shopwave.b-cdn.net/new%20arival/609b820c1ce70f90287cc903-large_1_c7125055-2828-46c0-b762-d19bfcdf24ea.webp', dataAiHint: 'cleaning tools' },
  { name: 'Health & Personal Care', href: '/search?category=New%20Arrivals&subcategory=Health%20%26%20Personal%20Care', image: 'https://Shopwave.b-cdn.net/new%20arival/01_c87acdae-de5c-49b0-80e0-5e1af7ed7fa5.webp', dataAiHint: 'health care' },
  { name: 'Cables & Chargers', href: '/search?category=New%20Arrivals&subcategory=Cables%20%26%20Chargers', image: 'https://Shopwave.b-cdn.net/new%20arival/02_71c68310-5be0-4fac-97e3-de92ea6df361.webp', dataAiHint: 'cables chargers' },
  { name: 'Home Organization', href: '/search?category=New%20Arrivals&subcategory=Home%20Organization', image: 'https://Shopwave.b-cdn.net/new%20arival/07_24b9ce72-1c0c-4c5b-bf59-99fefbaa0619.webp', dataAiHint: 'home organization' },
  { name: 'LED Lights', href: '/search?category=New%20Arrivals&subcategory=LED%20Lights', image: 'https://Shopwave.b-cdn.net/new%20arival/Crystal-Ball-Lamp-01_0069f489-bb55-4c74-b7d9-744a6a42123a.webp', dataAiHint: 'led lights' },
  { name: 'Table Lamps', href: '/search?category=New%20Arrivals&subcategory=Table%20Lamps', image: 'https://Shopwave.b-cdn.net/new%20arival/Crystal-Ball-Lamp-03_7b9c5da7-e695-4ee6-aeae-4ac590929bcf.webp', dataAiHint: 'table lamps' },
  { name: 'Photo Frames', href: '/search?category=New%20Arrivals&subcategory=Photo%20Frames', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166', dataAiHint: 'photo frames' },
];

const poojaSubCategories = [
    { name: 'Dhoop', href: '/search?category=Pooja&subcategory=Dhoop', image: 'https://images.unsplash.com/photo-1604543213568-963e6e8a4947?q=80&w=800&auto=format&fit=crop', dataAiHint: 'incense dhoop' },
    { name: 'Agarbatti', href: '/search?category=Pooja&subcategory=Agarbatti', image: 'https://images.unsplash.com/photo-1596701878278-2de47143b4eb?q=80&w=800&auto=format&fit=crop', dataAiHint: 'incense sticks' },
    { name: 'Aasan and Mala', href: '/search?category=Pooja&subcategory=Aasan%20and%20Mala', image: 'https://images.unsplash.com/photo-1616836109961-c8a74e5b2e5e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'prayer beads' },
    { name: 'Photo Frame', href: '/search?category=Pooja&subcategory=Photo%20Frame', image: 'https://images.unsplash.com/photo-1579541620958-c6996119565e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'photo frame' },
];

const foodAndDrinksCategories = [
  { name: 'Beverages', href: '/search?category=Food%20%26%20Drinks&subcategory=Beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy beverages' },
  { name: 'Dry Fruits', href: '/search?category=Food%20%26%20Drinks&subcategory=Dry%20Fruits', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'premium dry fruits' },
  { name: 'Healthy Juice', href: '/search?category=Food%20%26%20Drinks&subcategory=Healthy%20Juice', image: 'https://images.unsplash.com/photo-1578852632225-17a4c48a472c?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy juices' },
];

const groceriesCategories = [
  { name: 'Beverages', href: '/search?category=Groceries&subcategory=Beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy beverages' },
  { name: 'Dry Fruits', href: '/search?category=Groceries&subcategory=Dry%20Fruits', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'premium dry fruits' },
  { name: 'Healthy Juice', href: '/search?category=Groceries&subcategory=Healthy%20Juice', image: 'https://images.unsplash.com/photo-1578852632225-17a4c48a472c?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy juices' },
];

const fashionMainCategories = [
  { name: 'Men', href: '/search?category=Fashion&subcategory=Men', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', dataAiHint: 'mens fashion' },
  { name: 'Women', href: '/search?category=Fashion&subcategory=Women', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', dataAiHint: 'womens fashion' },
  { name: 'Kids', href: '/search?category=Fashion&subcategory=Kids', image: 'https://images.unsplash.com/photo-1503944168849-4d4b47e4b1b6?w=400', dataAiHint: 'kids fashion' },
  { name: 'Accessories', href: '/search?category=Fashion&subcategory=Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300', dataAiHint: 'accessories' },
];

const fashionCategories = [
  { name: 'T-Shirts', href: '/search?category=Fashion&subcategory=T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', dataAiHint: 't-shirts' },
  { name: 'Jeans', href: '/search?category=Fashion&subcategory=Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300', dataAiHint: 'jeans' },
  { name: 'Shirts', href: '/search?category=Fashion&subcategory=Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300', dataAiHint: 'shirts' },
  { name: 'Dresses', href: '/search?category=Fashion&subcategory=Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300', dataAiHint: 'dresses' },
  { name: 'Shoes', href: '/search?category=Fashion&subcategory=Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300', dataAiHint: 'shoes' },
  { name: 'Accessories', href: '/search?category=Fashion&subcategory=Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300', dataAiHint: 'accessories' },
];

function CategoryHeader({ title, description, linkText, bannerImages, categories, bannerColor = "bg-gray-100", buttonColor = "bg-primary" }: { title: string, description: string, linkText: string, bannerImages: string[], categories?: any[], bannerColor?: string, buttonColor?:string }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (bannerImages.length === 0) return;

        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => {
                // Instead of cycling back to 0, pause at the last image
                if (prevIndex >= bannerImages.length - 1) {
                    return prevIndex; // Stay at last image
                }
                return prevIndex + 1;
            });
        }, 4000); // Increased interval to 4 seconds for better viewing

        return () => clearInterval(timer);
    }, [bannerImages.length]);

    // Only show if we have banner images
    if (bannerImages.length === 0) return null;

    return (
        <div className="space-y-8 mb-8">
            <section>
                <div className={cn("relative overflow-hidden rounded-2xl p-4 md:py-2 md:px-6", bannerColor)}>
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="text-center md:text-left z-10">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
                            <p className="mt-2 text-sm md:text-base text-gray-600 max-w-md mx-auto md:mx-0">{description}</p>
                            <Button asChild className={cn("mt-4 text-white px-6 py-2 rounded-lg font-semibold transition-colors", buttonColor)}>
                                <Link href="#product-grid">
                                    {linkText}
                                </Link>
                            </Button>
                        </div>
                        <div className="relative h-32 md:h-40">
                            <AnimatePresence initial={false} mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={bannerImages[currentImageIndex]}
                                        alt={`Banner ${currentImageIndex + 1}`}
                                        fill
                                        className="object-cover rounded-lg shadow-lg"
                                        priority={currentImageIndex === 0}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Progress indicators */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {bannerImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all duration-300",
                                            index === currentImageIndex
                                                ? "bg-white shadow-lg scale-125"
                                                : "bg-white/50 hover:bg-white/75"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {categories && <CategoryGrid categories={categories} buttonColor={buttonColor} />}
        </div>
    );
}

function SearchContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const { products, isLoading } = useProductStore();
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opts = {
    q: sp.get('query') || undefined,
    category: sp.get('category') || undefined,
    subcategory: sp.get('subcategory') || undefined,
    tertiaryCategory: sp.get('tertiaryCategory') || undefined,
    min: sp.get('min') ? Number(sp.get('min')) : undefined,
    max: sp.get('max') ? Number(sp.get('max')) : sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
    brand: sp.get('brand') || undefined,
    rating: sp.get('rating') ? Number(sp.get('rating')) : undefined,
    sort: (sp.get('sort') as any) || undefined,
  }
  
  const list = useMemo(() => {
    try {
      // Combine API products with Fashion products
      const allProducts = [...products, ...FASHION_PRODUCTS.filter(p => p.quantity > 0)];
      return filterProducts(allProducts, opts);
    } catch (err) {
      console.error('Error filtering products:', err);
      setError('Failed to load products. Please try again.');
      return [];
    }
  }, [products, sp])

  const bestSellers = useMemo(() => {
    try {
      if (!products || products.length === 0) return [];
      
      // Get unique products by creating a Map with id as key
      const uniqueProductsMap = new Map();
      products.forEach(p => {
        if (p && p.id && p.quantity > 0 && !uniqueProductsMap.has(p.id)) {
          uniqueProductsMap.set(p.id, p);
        }
      });
      
      // Convert back to array and get diverse products
      const uniqueProducts = Array.from(uniqueProductsMap.values());
      
      // Sort by ratings and popularity, then shuffle for variety
      const sortedProducts = uniqueProducts
        .sort((a, b) => {
          const aRating = (a.ratings?.average || 0) * (a.ratings?.count || 0);
          const bRating = (b.ratings?.average || 0) * (b.ratings?.count || 0);
          return bRating - aRating;
        })
        .slice(0, 50); // Get top 50 rated products
      
      // Shuffle and return 24 products
      const shuffled = [...sortedProducts].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 24);
    } catch (err) {
      console.error('Error processing best sellers:', err);
      return [];
    }
  }, [products]);
  
  const mobileAccessories = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('mobile') || p.name.toLowerCase().includes('phone') || p.name.toLowerCase().includes('stand'))).slice(0, 8);
  }, [products]);
  
  const fansAndCooling = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('fan') || p.name.toLowerCase().includes('cooling') || p.name.toLowerCase().includes('cooler'))).slice(0, 8);
  }, [products]);
  
  const audioProducts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('audio') || p.name.toLowerCase().includes('speaker'))).slice(0, 8);
  }, [products]);
  
  const lightingProducts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('light') || p.name.toLowerCase().includes('led') || p.name.toLowerCase().includes('bulb'))).slice(0, 8);
  }, [products]);
  
  const computerAccessories = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('mouse') || p.name.toLowerCase().includes('computer') || p.name.toLowerCase().includes('laptop'))).slice(0, 8);
  }, [products]);
  
  const powerAndCables = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('cable') || p.name.toLowerCase().includes('adapter') || p.name.toLowerCase().includes('charger') || p.name.toLowerCase().includes('usb'))).slice(0, 8);
  }, [products]);
  
  const allCategoryLinks = [
      { name: 'Tech', href: '/search?category=Tech', image: 'https://images.unsplash.com/photo-1550009158-94ae76552485?q=80&w=400&auto=format&fit=crop', dataAiHint: 'latest gadgets' },
      { name: 'Home', href: '/search?category=Home', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200&auto=format&fit=crop', dataAiHint: 'stylish apparel' },
      { name: 'New Arrivals', href: '/search?category=New%20Arrivals', image: newArrivalsSubCategories[0].image, dataAiHint: 'new arrivals' },
    
      { name: 'Pooja', href: '/search?category=Pooja', image: poojaSubCategories[0]?.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center', dataAiHint: 'pooja items' },
      { name: 'Groceries', href: '/search?category=Groceries', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'fresh groceries' },
  ];
  
  const renderCategoryHeader = () => {
    if (opts.q || opts.subcategory || opts.tertiaryCategory || showAllCategories) return null;

    switch (opts.category) {
        case 'New Arrivals':
            return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Latest New Arrivals"
                      description="Discover our newest collection with special offers and trending products!"
                      linkText="Shop Now"
                      bannerImages={[
                          "https://ik.imagekit.io/b5qewhvhb/WhatsApp%20Image%202025-09-22%20at%2017.55.22_ee418f7e.jpg",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp",
                          "https://Shopwave.b-cdn.net/new%20arival/01_15d3c786-e22a-4818-8a49-d1c8c6662719.webp",
                          "https://Shopwave.b-cdn.net/new%20arival/17865..1.webp",
                          "https://Shopwave.b-cdn.net/new%20arival/4ce6bdd6-4139-4645-8183-d71554df6b88_38f14c77-c503-46cd-be19-4ae0e0c88eb0.webp"
                      ]}
                      bannerColor="bg-purple-50"
                      buttonColor="bg-purple-600 hover:bg-purple-700"
                  />
                  <div>
                      <h2 className="text-2xl font-bold mb-4 text-center">Top New Arrivals</h2>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {newArrivalsSubCategories.map((category) => (
                          <Link key={category.name} href={category.href} className="group block text-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="relative w-16 h-16 mx-auto rounded-lg bg-gray-100 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-300"
                                  data-ai-hint={category.dataAiHint}
                                />
                            </div>
                            <h3 className="mt-2 text-xs font-medium text-gray-700 group-hover:text-brand">{category.name}</h3>
                          </Link>
                        ))}
                      </div>
                  </div>
                </div>
            )
        case 'Tech':
            return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Latest in Tech"
                      description="Explore the newest gadgets and accessories to elevate your lifestyle."
                      linkText="Shop Tech"
                      bannerImages={[
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/12249d16-5521-4931-b03a-e672fc47fb87.webp?updatedAt=1757057794638",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_413ce869-b6ef-477c-8be8-b78545b87afb.webp?updatedAt=1757152313606",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/e352de8b-cbde-4b0c-84d9-e7cefc7086fc.webp",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_5ba5639c-603e-428a-afe3-eefdc5f0f696.webp?updatedAt=1757157493441"
                      ]}
                      bannerColor="bg-blue-50"
                      buttonColor="bg-blue-600 hover:bg-blue-700"
                  />
                  <div>
                      <h2 className="text-2xl font-bold mb-4 text-center">Top Tech Categories</h2>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {techCategories.map((category) => (
                          <Link key={category.name} href={category.href} className="group block text-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="relative w-16 h-16 mx-auto rounded-lg bg-gray-100 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-300"
                                  data-ai-hint={category.dataAiHint}
                                />
                            </div>
                            <h3 className="mt-2 text-xs font-medium text-gray-700 group-hover:text-brand">{category.name}</h3>
                          </Link>
                        ))}
                      </div>
                  </div>
                  

                </div>
            );
        case 'Home':
             return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Beautiful Home & Kitchen"
                      description="Elevate your living space with our curated collection of home and kitchen accessories."
                      linkText="Shop Home & Kitchen"
                      bannerImages={[
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/05_af19803f-0274-4f7b-829b-3974c9c6365d.avif?updatedAt=1757139103515",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/7636fc2e-a31a-4ba5-bd9a-d985e02e1f0f_f44e78eb-ccad-4b77-9eb4-3ef45c19b93d.webp",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/06_d748bf1f-ff1c-42fe-9c83-826bd1544147.avif?updatedAt=1757139337543",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/Tumbler-04_8520f518-fd21-4ca9-98f2-149e361dda36.webp?updatedAt=1757179631247",
                          "https://Shopwave.b-cdn.net/Homekichan/01_a4e3c239-73ae-4939-8b28-aa03ed6f760f.webp"
                      ]}
                      bannerColor="bg-pink-50"
                      buttonColor="bg-pink-600 hover:bg-pink-700"
                  />
                  <div>
                      <h2 className="text-2xl font-bold mb-4 text-center">Top Home Categories</h2>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {homeCategories.map((category) => (
                          <Link key={category.name} href={category.href} className="group block text-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="relative w-16 h-16 mx-auto rounded-lg bg-gray-100 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-300"
                                  data-ai-hint={category.dataAiHint}
                                />
                            </div>
                            <h3 className="mt-2 text-xs font-medium text-gray-700 group-hover:text-brand">{category.name}</h3>
                          </Link>
                        ))}
                      </div>
                  </div>
                </div>
             )
        case 'Food & Drinks':
             return null;
        case 'Pooja':
            return null;
        case 'Fashion':
            return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Fashion & Style"
                      description="Discover the latest trends in fashion with our curated collection of clothing and accessories."
                      linkText="Shop Fashion"
                      bannerImages={[
                          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
                          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
                          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
                          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
                          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"
                      ]}
                      bannerColor="bg-rose-50"
                      buttonColor="bg-rose-600 hover:bg-rose-700"
                  />
                  
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-center">Top Fashion Offers</h2>
                     <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="T-Shirts" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'T-Shirts').slice(0, 6)} href="/search?category=Fashion&subcategory=T-Shirts"/></CarouselItem>
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Jeans" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'Jeans').slice(0, 6)} href="/search?category=Fashion&subcategory=Jeans"/></CarouselItem>
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Dresses" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'Dresses').slice(0, 6)} href="/search?category=Fashion&subcategory=Dresses"/></CarouselItem>
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Shoes" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'Shoes').slice(0, 6)} href="/search?category=Fashion&subcategory=Shoes"/></CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <Link href="/search?category=Fashion&subcategory=Men" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                            alt="Men's Fashion"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Men's Fashion</h3>
                            <p className="text-white/80 text-sm">Shirts, Jeans, T-Shirts & More</p>
                          </div>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Women" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"
                            alt="Women's Fashion"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Women's Fashion</h3>
                            <p className="text-white/80 text-sm">Dresses, Sarees, Kurtis & More</p>
                          </div>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Kids" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"
                            alt="Kids Fashion"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Kids Fashion</h3>
                            <p className="text-white/80 text-sm">Cute & Comfortable Clothing</p>
                          </div>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Accessories" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
                            alt="Fashion Accessories"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Accessories</h3>
                            <p className="text-white/80 text-sm">Bags, Watches, Jewelry & More</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-center">Limited Time Deals</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <Link href="/search?category=Fashion&subcategory=T-Shirts" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" alt="T-Shirts Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">70% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">T-Shirts Collection</h3>
                          <p className="text-white/80 text-xs">Starting ₹299</p>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Jeans" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" alt="Jeans Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">60% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">Premium Jeans</h3>
                          <p className="text-white/80 text-xs">Starting ₹799</p>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Dresses" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" alt="Dresses Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">65% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">Beautiful Dresses</h3>
                          <p className="text-white/80 text-xs">Starting ₹599</p>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Shoes" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400" alt="Shoes Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">55% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">Footwear Collection</h3>
                          <p className="text-white/80 text-xs">Starting ₹999</p>
                        </div>
                      </Link>
                    </div>
                  </section>
                </div>
            )
        case 'Groceries':
            return <CategoryHeader 
                title="Fresh Groceries & Daily Needs"
                description="Get all your daily essentials delivered fresh to your doorstep."
                linkText="Shop Groceries"
                bannerImages={[
                    "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200&auto=format&fit=crop",
                ]}
                categories={groceriesCategories}
                bannerColor="bg-green-50"
                buttonColor="bg-green-600 hover:bg-green-700"
            />
        default:
             if (!opts.category) {
                return null;
            }
            return null;
    }
  }

  const renderTertiaryCategoryHeader = () => {
      const sub = opts.subcategory;
      const tertiary = opts.tertiaryCategory;
      
      // Handle tertiary category headers (like Dresses, T-Shirts, etc.)
      if (tertiary && opts.category === 'Fashion') {
        const tertiaryData = {
          'Dresses': {
            title: 'Beautiful Dresses Collection',
            description: 'Elegant dresses for every occasion - from casual to formal wear.',
            images: [
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
              'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=600',
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700',
            offer: { discount: 65, startingPrice: 599 }
          },
          'T-Shirts': {
            title: 'Premium T-Shirts Collection',
            description: 'Comfortable and stylish t-shirts for everyday wear.',
            images: [
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
              'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
              'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=600'
            ],
            color: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700',
            offer: { discount: 70, startingPrice: 299 }
          },
          'Jeans': {
            title: 'Premium Jeans Collection',
            description: 'High-quality denim jeans in various fits and styles.',
            images: [
              'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
              'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'
            ],
            color: 'bg-indigo-50',
            button: 'bg-indigo-600 hover:bg-indigo-700',
            offer: { discount: 60, startingPrice: 799 }
          },
          'Formal-Shirts': {
            title: 'Formal Shirts Collection',
            description: 'Professional formal shirts for office and business wear.',
            images: [
              'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
              'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600'
            ],
            color: 'bg-gray-50',
            button: 'bg-gray-600 hover:bg-gray-700',
            offer: { discount: 40, startingPrice: 899 }
          },
          'Casual-Shirts': {
            title: 'Casual Shirts Collection',
            description: 'Comfortable casual shirts for everyday style.',
            images: [
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
              'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
              'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600'
            ],
            color: 'bg-green-50',
            button: 'bg-green-600 hover:bg-green-700',
            offer: { discount: 35, startingPrice: 699 }
          },
          'Watches': {
            title: 'Premium Watches Collection',
            description: 'Stylish watches for every occasion and style.',
            images: [
              'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
              'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600',
              'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600'
            ],
            color: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700',
            offer: { discount: 60, startingPrice: 999 }
          },
          'Kurtis': {
            title: 'Designer Kurtis Collection',
            description: 'Traditional and modern kurtis for every occasion.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
              'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
            ],
            color: 'bg-purple-50',
            button: 'bg-purple-600 hover:bg-purple-700',
            offer: { discount: 45, startingPrice: 799 }
          },
          'Sarees': {
            title: 'Elegant Sarees Collection',
            description: 'Beautiful traditional sarees for special occasions.',
            images: [
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
              'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
            ],
            color: 'bg-rose-50',
            button: 'bg-rose-600 hover:bg-rose-700',
            offer: { discount: 50, startingPrice: 1299 }
          },
          'Polo-T-Shirts': {
            title: 'Polo T-Shirts Collection',
            description: 'Classic polo t-shirts for smart casual look.',
            images: [
              'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
            ],
            color: 'bg-teal-50',
            button: 'bg-teal-600 hover:bg-teal-700',
            offer: { discount: 45, startingPrice: 599 }
          },
          'Trousers': {
            title: 'Premium Trousers Collection',
            description: 'Formal and casual trousers for every occasion.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
            ],
            color: 'bg-slate-50',
            button: 'bg-slate-600 hover:bg-slate-700',
            offer: { discount: 35, startingPrice: 999 }
          },
          'Tops': {
            title: 'Stylish Tops Collection',
            description: 'Trendy tops for modern women.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700',
            offer: { discount: 60, startingPrice: 499 }
          },
          'Leggings': {
            title: 'Comfortable Leggings Collection',
            description: 'Stretchable leggings for comfort and style.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
            ],
            color: 'bg-fuchsia-50',
            button: 'bg-fuchsia-600 hover:bg-fuchsia-700',
            offer: { discount: 50, startingPrice: 399 }
          },
          'Sunglasses': {
            title: 'Premium Sunglasses Collection',
            description: 'Stylish sunglasses for UV protection and fashion.',
            images: [
              'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'
            ],
            color: 'bg-yellow-50',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            offer: { discount: 50, startingPrice: 599 }
          },
          'Belts': {
            title: 'Leather Belts Collection',
            description: 'Premium leather belts for formal and casual wear.',
            images: [
              'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600'
            ],
            color: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700',
            offer: { discount: 45, startingPrice: 399 }
          }
        };
        
        const tertiaryInfo = tertiaryData[tertiary as keyof typeof tertiaryData];
        if (tertiaryInfo) {
          return (
            <div className="mb-8 space-y-6">
              <CategoryHeader 
                title={tertiaryInfo.title}
                description={tertiaryInfo.description}
                linkText="Shop Now"
                bannerImages={tertiaryInfo.images}
                bannerColor={tertiaryInfo.color}
                buttonColor={tertiaryInfo.button}
              />
              
              {/* Enhanced Offer Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Deal */}
                <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white text-red-500 px-3 py-1 rounded-full text-sm font-bold">
                        MEGA SALE
                      </div>
                      <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                        {tertiaryInfo.offer.discount}% OFF
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">
                      {tertiary.replace(/-/g, ' ')} Collection
                    </h3>
                    <p className="text-xl mb-3">
                      Starting ₹{tertiaryInfo.offer.startingPrice}
                    </p>
                    <p className="text-sm opacity-90 mb-4">
                      Premium quality • Fast delivery • Easy returns
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-white/20 px-2 py-1 rounded">⏰ Limited Time</span>
                      <span className="bg-white/20 px-2 py-1 rounded">🚚 Free Shipping</span>
                    </div>
                  </div>
                </div>
                
                {/* Side Offers */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold">Extra 10% OFF</div>
                      <div className="text-sm">On orders above ₹1999</div>
                      <div className="text-xs mt-1 opacity-90">Use code: SAVE10</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold">Free Delivery</div>
                      <div className="text-sm">On all orders</div>
                      <div className="text-xs mt-1 opacity-90">No minimum order</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold">Quality Assured</div>
                      <div className="text-sm">Premium Products</div>
                      <div className="text-xs mt-1 opacity-90">100% Authentic</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Flash Sale Timer */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 text-white p-2 rounded-full">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Flash Sale Ends Soon!</h4>
                      <p className="text-sm text-gray-600">Hurry up! Limited stock available</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">23:59:45</div>
                    <div className="text-xs text-gray-500">Hours left</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Default fallback for any tertiary category not defined above
        return (
          <div className="mb-8 space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="text-center">
                <div className="inline-block bg-white text-blue-600 px-4 py-2 rounded-full text-lg font-bold mb-3">
                  SPECIAL OFFER
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {tertiary.replace(/-/g, ' ')} Collection
                </h3>
                <p className="text-xl mb-3">
                  Great Deals Available!
                </p>
                <div className="flex justify-center gap-2 text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded">🚚 Free Shipping</span>
                  <span className="bg-white/20 px-2 py-1 rounded">💯 Quality Assured</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      if (!sub || tertiary) return null;
      
      // Fashion subcategory headers
      if (opts.category === 'Fashion' && sub) {
        const subcategoryData = {
          'Men': {
            title: 'Men\'s Fashion',
            description: 'Discover stylish and comfortable clothing for men.',
            images: [
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
              'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'
            ],
            color: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700',
            categories: [
              { name: 'Formal Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Formal-Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300', price: 899, discount: 40 },
              { name: 'Casual Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Casual-Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300', price: 699, discount: 35 },
              { name: 'T-Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', price: 299, discount: 70 },
              { name: 'Polo T-Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Polo-T-Shirts', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300', price: 599, discount: 45 },
              { name: 'Jeans', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300', price: 799, discount: 60 },
              { name: 'Trousers', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Trousers', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300', price: 999, discount: 35 },
              { name: 'Formal Shoes', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Formal-Shoes', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=300', price: 999, discount: 55 },
              { name: 'Casual Shoes', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Casual-Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300', price: 999, discount: 55 },
              { name: 'Sneakers', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Sneakers', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300', price: 999, discount: 55 },
              { name: 'Jackets', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Jackets', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300', price: 2499, discount: 30 },
              { name: 'Hoodies', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Hoodies', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300', price: 1499, discount: 45 },
              { name: 'Watches', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300', price: 999, discount: 60 }
            ]
          },
          'Women': {
            title: 'Women\'s Fashion',
            description: 'Elegant and trendy fashion for modern women.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
              'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400',
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700',
            categories: [
              { name: 'Dresses', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center', price: 599, discount: 65 },
              { name: 'Sarees', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop&crop=center', price: 1299, discount: 50 },
              { name: 'Kurtis', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Kurtis', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop&crop=center', price: 799, discount: 45 },
              { name: 'Tops', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center', price: 499, discount: 60 },
              { name: 'Jeans', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center', price: 899, discount: 55 },
              { name: 'Leggings', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Leggings', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center', price: 399, discount: 50 },
              { name: 'Skirts', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Skirts', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop&crop=center', price: 699, discount: 40 },
              { name: 'Heels', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Heels', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center', price: 1299, discount: 45 },
              { name: 'Flats', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Flats', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&crop=center', price: 899, discount: 50 },
              { name: 'Sandals', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Sandals', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop&crop=center', price: 799, discount: 40 },
              { name: 'Handbags', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Handbags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', price: 1599, discount: 35 },
              { name: 'Jewelry', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center', price: 699, discount: 55 }
            ]
          },
          'Kids': {
            title: 'Kids Fashion',
            description: 'Cute and comfortable clothing for children.',
            images: [
              'https://images.unsplash.com/photo-1503944168849-4d4b47e4b1b6?w=400',
              'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400'
            ],
            color: 'bg-yellow-50',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            categories: [
              { name: 'Boys T-Shirts', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Boys-T-Shirts', image: 'https://images.unsplash.com/photo-1503944168849-4d4b47e4b1b6?w=400&h=400&fit=crop&crop=center', price: 299, discount: 50 },
              { name: 'Girls Dresses', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Girls-Dresses', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop&crop=center', price: 499, discount: 45 },
              { name: 'Boys Shirts', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Boys-Shirts', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 399, discount: 40 },
              { name: 'Girls Tops', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Girls-Tops', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 349, discount: 45 },
              { name: 'Kids Jeans', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Kids-Jeans', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 599, discount: 50 },
              { name: 'Kids Shorts', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Kids-Shorts', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 299, discount: 40 },
              { name: 'Kids Shoes', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Kids-Shoes', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 799, discount: 35 },
              { name: 'School Uniforms', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=School-Uniforms', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 699, discount: 30 },
              { name: 'Party Wear', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Party-Wear', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 999, discount: 40 },
              { name: 'Sleepwear', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Sleepwear', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 399, discount: 35 },
              { name: 'Winter Wear', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Winter-Wear', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 1299, discount: 45 },
              { name: 'Accessories', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Accessories', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 199, discount: 30 }
            ]
          },
          'T-Shirts': {
            title: 'T-Shirts Collection',
            description: 'Comfortable and stylish t-shirts for every occasion.',
            images: [
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
              'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
              'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400'
            ],
            color: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700'
          },
          'Jeans': {
            title: 'Premium Jeans',
            description: 'High-quality denim jeans in various fits and styles.',
            images: [
              'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
              'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
            ],
            color: 'bg-indigo-50',
            button: 'bg-indigo-600 hover:bg-indigo-700'
          },
          'Shirts': {
            title: 'Stylish Shirts',
            description: 'Professional and casual shirts for every wardrobe.',
            images: [
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
              'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
              'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400'
            ],
            color: 'bg-green-50',
            button: 'bg-green-600 hover:bg-green-700'
          },
          'Dresses': {
            title: 'Beautiful Dresses',
            description: 'Elegant dresses for every special occasion.',
            images: [
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
              'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400',
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700'
          },
          'Shoes': {
            title: 'Footwear Collection',
            description: 'Comfortable and stylish shoes for every step.',
            images: [
              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
              'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
              'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400'
            ],
            color: 'bg-purple-50',
            button: 'bg-purple-600 hover:bg-purple-700'
          },
          'Accessories': {
            title: 'Fashion Accessories',
            description: 'Complete your look with our stylish accessories.',
            images: [
              'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
              'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
              'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'
            ],
            color: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700',
            categories: [
              { name: 'Watches', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center', price: 999, discount: 60 },
              { name: 'Sunglasses', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Sunglasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center', price: 599, discount: 50 },
              { name: 'Belts', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Belts', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop&crop=center', price: 399, discount: 45 },
              { name: 'Wallets', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Wallets', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop&crop=center', price: 699, discount: 40 },
              { name: 'Bags', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', price: 1299, discount: 35 },
              { name: 'Jewelry', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center', price: 799, discount: 55 },
              { name: 'Caps & Hats', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Caps-Hats', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop&crop=center', price: 299, discount: 40 },
              { name: 'Scarves', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Scarves', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', price: 499, discount: 45 },
              { name: 'Ties', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Ties', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center', price: 399, discount: 35 },
              { name: 'Hair Accessories', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Hair-Accessories', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center', price: 199, discount: 50 },
              { name: 'Phone Cases', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Phone-Cases', image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop&crop=center', price: 299, discount: 40 },
              { name: 'Perfumes', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&crop=center', price: 899, discount: 45 }
            ]
          }
        };
        
        const subData = subcategoryData[sub as keyof typeof subcategoryData];
        if (subData) {
          return (
            <div className="mb-8 space-y-8">
              <CategoryHeader 
                title={subData.title}
                description={subData.description}
                linkText="Shop Now"
                bannerImages={subData.images}
                bannerColor={subData.color}
                buttonColor={subData.button}
              />
              {subData.categories && (
                <section>
                  <h2 className="text-2xl font-bold mb-8 text-center">{sub === 'Men' ? 'Men Categories' : sub === 'Women' ? 'Women Categories' : sub === 'Kids' ? 'Kids Categories' : sub === 'Accessories' ? 'Fashion Accessories' : sub + ' Categories'}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {subData.categories.map((category: any) => (
                      <Link key={category.name} href={category.href} className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="relative aspect-square overflow-hidden">
                          <Image 
                            src={category.image} 
                            alt={category.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          {category.discount && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              {category.discount}% OFF
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h4 className="text-sm font-bold mb-1">{category.name}</h4>
                            {category.price && (
                              <p className="text-xs opacity-90">Starting ₹{category.price}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          );
        }
      }
      
      // Handle other subcategories (non-fashion)
      const subcategoryTertiary = [...new Set(products
          .filter(p => p.subcategory === sub && p.tertiaryCategory)
          .map(p => p.tertiaryCategory!)
      )].map(tc => ({
          name: (tc as string).replace(/-/g, ' '),
          href: `/search?category=${opts.category}&subcategory=${sub}&tertiaryCategory=${tc}`,
          image: products.find(p => p.tertiaryCategory === tc)?.image || 'https://images.unsplash.com/photo-1617470732899-736c4f3a743b?q=80&w=800&auto=format&fit=crop',
          dataAiHint: (tc as string).toLowerCase()
      }));

      if(subcategoryTertiary.length === 0) return null;

      return <CategoryHeader 
            title={(sub as string).replace(/-/g, ' ')}
            description="Traditional and effective remedies for your health and well-being."
            linkText="Explore Now"
            bannerImages={[
                'https://images.unsplash.com/photo-1594495894542-a46cc73e081a?q=80&w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1704650312022-ed1a76dbed1b?q=80&w=1200&auto=format&fit=crop'
            ]}
            categories={subcategoryTertiary}
            bannerColor="bg-emerald-50"
            buttonColor="bg-emerald-700 hover:bg-emerald-800"
        />
  }
  
  const PageTitle = () => {
    if (opts.q) {
      return <h1 className="text-2xl font-bold mb-4">Search results for &quot;{opts.q}&quot;</h1>
    }
    
    if (opts.max && !opts.category) {
      return (
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Products Under ₹{opts.max}</h1>
          <p className="text-gray-600 mt-1">Great deals within your budget</p>
        </div>
      )
    }
    
    if (!opts.category && !showAllCategories) {
        return (
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Our Best Sellers</h1>
                <p className="text-gray-600 mt-1">Handpicked for you from our most popular items.</p>
            </div>
        )
    }

    if (!opts.category && showAllCategories) {
         return (
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Shop by Category</h1>
                <p className="text-gray-600 mt-1">Find what you're looking for from our wide selection of categories.</p>
            </div>
        )
    }

    const Breadcrumb = () => (
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/search" className="hover:text-brand">Home</Link>
        {opts.category && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <Link href={`/search?category=${opts.category}`} className="hover:text-brand">
              {opts.category?.replace(/%20/g, ' ')}
            </Link>
          </>
        )}
        {opts.subcategory && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <Link href={`/search?category=${opts.category}&subcategory=${opts.subcategory}`} className="hover:text-brand">
              {opts.subcategory?.replace(/-/g, ' ')}
            </Link>
          </>
        )}
        {opts.tertiaryCategory && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <span className="font-semibold text-gray-700">
                {opts.tertiaryCategory?.replace(/-/g, ' ')}
            </span>
          </>
        )}
      </nav>
    );

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft size={20} />
            </button>
            <Breadcrumb />
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
          <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => {
              setError(null);
              window.location.reload();
            }}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (!opts.q && !opts.category && !opts.subcategory && !opts.tertiaryCategory && !showAllCategories) {
      // Best Seller View
      return (
        <>
          <PageTitle />
          <div className="text-center mb-8 space-x-4">
            <Button onClick={() => router.push('/')} variant="outline">
              &larr; Back to Home
            </Button>
            <Button onClick={() => setShowAllCategories(true)} variant="outline">
              Or, Shop All Categories &rarr;
            </Button>
          </div>

          {/* Popular Categories Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Popular Categories</h2>
              <p className="text-gray-600">Shop from our most loved categories</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {/* Mobile Accessories */}
              <Link href="/search?category=Tech&subcategory=Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166"
                    alt="Mobile Accessories"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">Mobile Accessories</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Computer Accessories */}
              <Link href="/search?category=Tech&subcategory=Computer%20Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-50 to-green-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/e352de8b-cbde-4b0c-84d9-e7cefc7086fc.webp"
                    alt="Computer Accessories"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-green-600">Computer Accessories</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Audio */}
              <Link href="/search?category=Tech&subcategory=Audio" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_413ce869-b6ef-477c-8be8-b78545b87afb.webp?updatedAt=1757152313606"
                    alt="Audio"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-purple-600">Audio</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Lighting */}
              <Link href="/search?category=Tech&subcategory=Decor%20%26%20Lighting" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_5ba5639c-603e-428a-afe3-eefdc5f0f696.webp?updatedAt=1757157493441"
                    alt="Lighting"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-yellow-600">Lighting</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Power & Cables */}
              <Link href="/search?category=Tech&subcategory=Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0260_otg_1.webp?updatedAt=1756627844923"
                    alt="Power & Cables"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-orange-600">Power & Cables</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Fans & Cooling */}
              <Link href="/search?category=Tech&subcategory=Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-50 to-cyan-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/12249d16-5521-4931-b03a-e672fc47fb87.webp?updatedAt=1757057794638"
                    alt="Fans & Cooling"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-cyan-600">Fans & Cooling</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>
            </div>
          </section>

          {/* Trending Products Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Top Products</h2>
              <p className="text-gray-600">Our most popular items this season</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {/* Kitchen Tools */}
              <Link href="/search?category=Home&subcategory=Kitchen%20Tools" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-50 to-red-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/05_af19803f-0274-4f7b-829b-3974c9c6365d.avif?updatedAt=1757139103515"
                    alt="Kitchen Tools"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Kitchen Tools</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Kitchen Appliances */}
              <Link href="/search?category=New%20Arrivals&subcategory=Kitchen%20Appliances" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/17865..1.webp"
                    alt="Kitchen Appliances"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600">Kitchen Appliances</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Home Appliances */}
              <Link href="/search?category=New%20Arrivals&subcategory=Home%20Appliances" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/4ce6bdd6-4139-4645-8183-d71554df6b88_38f14c77-c503-46cd-be19-4ae0e0c88eb0.webp"
                    alt="Home Appliances"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">Home Appliances</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Cleaning Tools */}
              <Link href="/search?category=New%20Arrivals&subcategory=Cleaning%20Tools" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/609b820c1ce70f90287cc903-large_1_c7125055-2828-46c0-b762-d19bfcdf24ea.webp"
                    alt="Cleaning Tools"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-teal-600">Cleaning Tools</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Health & Personal Care */}
              <Link href="/search?category=New%20Arrivals&subcategory=Health%20%26%20Personal%20Care" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-50 to-pink-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/01_c87acdae-de5c-49b0-80e0-5e1af7ed7fa5.webp"
                    alt="Health & Personal Care"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-pink-600">Health & Personal Care</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Home Organization */}
              <Link href="/search?category=New%20Arrivals&subcategory=Home%20Organization" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/07_24b9ce72-1c0c-4c5b-bf59-99fefbaa0619.webp"
                    alt="Home Organization"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-amber-600">Home Organization</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>
            </div>
          </section>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bestSellers.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </>
      );
    }

    if (showAllCategories) {
      // All Categories View
       return (
        <>
            <PageTitle />
             <div className="text-center mb-8">
                <Button onClick={() => setShowAllCategories(false)} variant="outline">
                  &larr; Back to Best Sellers
                </Button>
            </div>
            <CategoryGrid categories={allCategoryLinks} />
        </>
       )
    }

    // Default Filtered View
    return (
      <div id="product-grid" className="scroll-mt-20">
        <div className="md:hidden">
          <CategoryPills />
        </div>
        <div className="grid md:grid-cols-[auto_1fr] gap-6">
          <AnimatePresence>
            {isFilterVisible && (
              <motion.aside 
                className="hidden md:block w-[240px]"
                initial={{ width: 0, opacity: 0, x: -100 }}
                animate={{ width: 240, opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="sticky top-24">
                  <Filters />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <section>
            <PageTitle />
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="md:hidden">
                        <Sheet open={isFilterOpen} onOpenChange={setFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <div className="p-4 overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-4">Filters</h3>
                                    <Filters />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsFilterVisible(!isFilterVisible)}
                      className="hidden md:inline-flex"
                    >
                      {isFilterVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                    </Button>
                    <div className="hidden sm:block">
                      <div className="text-sm text-gray-600">Showing {list.length} result{list.length === 1 ? '' : 's'}</div>
                      {opts.q && !opts.subcategory && <div className="text-xs text-gray-500">for &quot;{opts.q}&quot;</div>}
                    </div>
                </div>
              <SortBar />
            </div>
            {list.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {list.map((p, index) => (
                  <ProductCard key={`${p.id}-${index}`} p={p} />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center py-10 rounded-xl border bg-white">
                    <p className="text-gray-600">No products found in this category.</p>
                    <p className="text-sm text-gray-500">But here are some related products you might like:</p>
                </div>
                
                {/* Show related products when category is empty */}
                {(() => {
                  let relatedProducts = [];
                  
                  // If searching in Tech category, show all tech products
                  if (opts.category === 'Tech') {
                    relatedProducts = products.filter(p => p.category === 'Tech' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Home category, show home products
                  else if (opts.category === 'Home') {
                    relatedProducts = products.filter(p => p.category === 'Home' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in New Arrivals category, show new arrivals products
                  else if (opts.category === 'New Arrivals') {
                    relatedProducts = products.filter(p => {
                      if (!p || !p.quantity || p.quantity <= 0) return false;
                      
                      return (p.category === 'New Arrivals' || 
                       p.subcategory === 'Diwali Special' ||
                       p.subcategory === 'Best Selling' ||
                       p.subcategory === 'Gifts' ||
                       p.category === 'Customizable' ||
                       p.subcategory === 'Pooja Essentials' ||
                       p.subcategory === 'LED Lights' ||
                       p.subcategory === 'Fragrance');
                    }).slice(0, 12);
                  }
                  // If searching in Customizable category, show customizable products
                  else if (opts.category === 'Customizable') {
                    relatedProducts = products.filter(p => p.category === 'Customizable' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Pooja category, show pooja products including dhoop and agarbatti from Home category
                  else if (opts.category === 'Pooja') {
                    relatedProducts = products.filter(p => 
                      (p.category === 'Pooja' || 
                       (p.category === 'Home' && p.subcategory === 'Puja-Essentials')) && p.quantity > 0
                    ).slice(0, 12);
                  }
                  // If searching in Fashion category, show fashion products
                  else if (opts.category === 'Fashion') {
                    relatedProducts = [...products.filter(p => p.category === 'Fashion' && p.quantity > 0), ...FASHION_PRODUCTS.filter(p => p.quantity > 0)].slice(0, 12);
                  }
                  // If searching in Food & Drinks category
                  else if (opts.category === 'Food & Drinks') {
                    relatedProducts = products.filter(p => p.category === 'Food & Drinks' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Pooja category
                  else if (opts.category === 'Pooja') {
                    relatedProducts = products.filter(p => p.category === 'Pooja' && p.quantity > 0).slice(0, 12);
                  }
                  // Default: show popular products from all categories
                  else {
                    relatedProducts = products.filter(p => p.quantity > 0 && p.price.discounted).slice(0, 12);
                  }
                  
                  if (relatedProducts.length === 0) {
                    relatedProducts = products.filter(p => p.quantity > 0).slice(0, 12);
                  }
                  
                  return relatedProducts.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-center">Related Products</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {relatedProducts.map(p => (
                          <ProductCard key={p.id} p={p} />
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {renderCategoryHeader()}
      {renderTertiaryCategoryHeader()}
      {renderContent()}
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><LoadingSpinner /></div>}>
      <SearchContent />
    </Suspense>
  )
}
