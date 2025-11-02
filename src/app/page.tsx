
'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import BannerSlider from '../components/BannerSlider';
import SafeProductCard from '../components/SafeProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '../components/ui/carousel'
import OfferCard from '../components/OfferCard';
import type { Product } from '../lib/types';

import { useProductStore } from '../lib/productStore';
import { NEWARRIVALS_PRODUCTS } from '../lib/data/newarrivals';
import { FASHION_PRODUCTS } from '../lib/data/fashion';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import MixedProductGrid from '../components/MixedProductGrid';
import { useToast } from '../hooks/use-toast';
import BusinessOpportunityBanner from '../components/BusinessOpportunityBanner';
import FashionCatalog from '../components/FashionCatalog';
import ModernFashionCategories from '../components/ModernFashionCategories';
import { MessageCircle, Users } from 'lucide-react';





const filterCategories = ['All', 'Electronics', 'Home', 'Fashion', 'New Arrivals', 'Customizable'];
const PRODUCTS_TO_SHOW = 8;
const VISIBLE_COUNT_KEY = 'home_visible_count';
const SELECTED_CATEGORY_KEY = 'home_selected_category';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { products, isLoading, init } = useProductStore();
  
  // Ensure products are loaded
  useEffect(() => {
    if (!products.length && !isLoading) {
      console.log('Initializing products...');
      init();
    }
  }, [products.length, isLoading, init]);
  
  useEffect(() => {
    console.log('Homepage products loaded:', products.length);
    if (products.length > 0) {
      console.log('First product:', products[0]);
    }
  }, [products]);
  const { toast } = useToast();
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_TO_SHOW);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [api, setApi] = useState<CarouselApi>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    const savedVisibleCount = localStorage.getItem(VISIBLE_COUNT_KEY);
    const savedCategory = localStorage.getItem(SELECTED_CATEGORY_KEY);

    if (savedVisibleCount) {
      setVisibleCount(parseInt(savedVisibleCount, 10));
    }
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')

    if (refCode) {
      toast({
        title: "Referral Link Detected!",
        description: `Use code ${refCode} at checkout for 5% discount`,
      })

      // Clean URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [toast])





  const techDeals = useMemo(() => {
    return products.filter(p => (p.category === 'Tech' || p.category === 'Electronics') && p.quantity > 0);
  }, [products]);

  const homeDeals = useMemo(() => {
    return products.filter(p => p.category === 'Home' && p.quantity > 0);
  }, [products]);

  const newArrivals = useMemo(() => {
    const apiNewArrivals = products.filter(p => p.category === 'New Arrivals' && p.quantity > 0);
    const jsonNewArrivals = NEWARRIVALS_PRODUCTS.filter(p => p.quantity > 0);
    return [...apiNewArrivals, ...jsonNewArrivals];
  }, [products]);

  const fashionDeals = useMemo(() => {
    const apiFashion = products.filter(p => p.category === 'Fashion' && (p.quantity > 0 || p.stock > 0));
    const jsonFashion = FASHION_PRODUCTS.filter(p => p.quantity > 0);
    return [...apiFashion, ...jsonFashion];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const inStockProducts = products.filter(p => p.quantity > 0);
    if (selectedCategory === 'All') {
      return [...inStockProducts, ...FASHION_PRODUCTS.filter(p => p.quantity > 0)];
    }
    if (selectedCategory === 'Electronics') {
      return inStockProducts.filter(p => p.category === 'Electronics' || p.category === 'Tech');
    }
    if (selectedCategory === 'New Arrivals') {
      const apiNewArrivals = inStockProducts.filter(p => p.category === 'New Arrivals');
      const jsonNewArrivals = NEWARRIVALS_PRODUCTS.filter(p => p.quantity > 0);
      return [...apiNewArrivals, ...jsonNewArrivals];
    }
    if (selectedCategory === 'Fashion') {
      const apiFashion = inStockProducts.filter(p => p.category === 'Fashion');
      const jsonFashion = FASHION_PRODUCTS.filter(p => p.quantity > 0);
      return [...apiFashion, ...jsonFashion];
    }
    if (selectedCategory === 'Customizable') {
      return inStockProducts.filter(p => p.category === 'Customizable');
    }
    return inStockProducts.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(PRODUCTS_TO_SHOW);
    localStorage.setItem(SELECTED_CATEGORY_KEY, category);
    localStorage.setItem(VISIBLE_COUNT_KEY, PRODUCTS_TO_SHOW.toString());
  };

  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredProducts.length) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const newCount = visibleCount + PRODUCTS_TO_SHOW;
      setVisibleCount(newCount);
      localStorage.setItem(VISIBLE_COUNT_KEY, newCount.toString());
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, visibleCount, filteredProducts.length]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loadMoreProducts, visibleCount, filteredProducts.length]);



  if (!mounted) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "ShopWave",
              "alternateName": "Shop Wave",
              "description": "ShopWave - India's #1 online shopping destination! Cheapest prices guaranteed, free delivery, 50% off deals on tech accessories, home essentials & ayurvedic products across India.",
              "url": "/",
              "telephone": "+91-91574-99884",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "ShopWave Products",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Tech Accessories",
                      "category": "Electronics"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Home & Kitchen",
                      "category": "Home & Garden"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Ayurvedic Products",
                      "category": "Health & Beauty"
                    }
                  }
                ]
              }
            })
          }}
        />
      </Head>
      <div className="space-y-8">
      <BannerSlider />

      <section>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
            <Link href="/search?category=Tech" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_0748acd3-4797-400f-997d-6cecf6b22f5a.webp?updatedAt=1756628128432" alt="Tech" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="tech gadgets" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Tech Accessories</h3>
                </div>
            </Link>
            <Link href="/search?category=Home" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://Shopwave.b-cdn.net/new%20arival/17865..1.webp" alt="Home" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="modern living room" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Home & Kitchen</h3>
                </div>
            </Link>
            <Link href="/search?category=Fashion" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400" alt="Fashion" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="fashion clothing" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Fashion</h3>
                </div>
            </Link>
            <Link href="/search?category=New%20Arrivals" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp" alt="New Arrivals" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="new arrivals shopping" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">New Arrivals</h3>
                </div>
            </Link>
        </div>
      </section>



      <section id="tech-offers">
        <h2 className="text-2xl font-bold mb-4 text-center">Top Offers</h2>
         <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Mobile Accessories" products={techDeals} href="/search?subcategory=Accessories"/></CarouselItem>
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Kitchen Tools" products={homeDeals} href="/search?subcategory=Kitchen%20Tools"/></CarouselItem>
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Fashion" products={fashionDeals} href="/search?category=Fashion"/></CarouselItem>
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="LED Lights" products={newArrivals} href="/search?subcategory=LED%20Lights"/></CarouselItem>
          </CarouselContent>

        </Carousel>
      </section>



      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
          <Link href="/search?subcategory=Accessories" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166" alt="Mobile Accessories" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Mobile</h4>
          </Link>

          <Link href="/search?subcategory=Computer%20Accessories" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/01_d6ef1d68-1400-4132-ad4a-a54ca8de4577.avif" alt="Computer Accessories" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Computer</h4>
          </Link>

          <Link href="/search?subcategory=Audio" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/NEW%20ARIVALS/01_67515437-4d2e-40ab-8ecf-bcabffe751be.webp" alt="Audio" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Audio</h4>
          </Link>

          <Link href="/search?subcategory=Lighting" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/07_4a3ac08b-5f90-4f47-9c6f-a48d0999f3e7.webp?updatedAt=1756628649421" alt="Lighting" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Lighting</h4>
          </Link>

          <Link href="/search?subcategory=Power%20%26%20Cables" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_0748acd3-4797-400f-997d-6cecf6b22f5a.webp?updatedAt=1756628128432" alt="Power & Cables" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Cables</h4>
          </Link>

          <Link href="/search?subcategory=Fans" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/12249d16-5521-4931-b03a-e672fc47fb87.webp?updatedAt=1757057794638" alt="Fans & Cooling" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Fans</h4>
          </Link>

          <Link href="/search?subcategory=LED%20Lights" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/NEW%20ARIVALS/3_12e4cc87-a760-425d-badf-365f48f8677d.webp" alt="LED Lights" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">LED</h4>
          </Link>

          <Link href="/search?subcategory=Car%20Accessories" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/new%20arival/01_15d3c786-e22a-4818-8a49-d1c8c6662719.webp" alt="Car Accessories" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Car</h4>
          </Link>

          <Link href="/search?subcategory=Kitchen%20Appliances" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/new%20arival/17865..1.webp" alt="Kitchen Appliances" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Kitchen</h4>
          </Link>

          <Link href="/search?subcategory=Cables%20%26%20Chargers" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/new%20arival/02_71c68310-5be0-4fac-97e3-de92ea6df361.webp" alt="Cables & Chargers" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Chargers</h4>
          </Link>

          <Link href="/search?subcategory=Gifts" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/04_light_59099232-79e1-4dec-805f-42dc9208c96b.webp" alt="Gifts" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Gifts</h4>
          </Link>

          <Link href="/search?subcategory=T-Shirts" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300" alt="T-Shirts" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">T-Shirts</h4>
          </Link>

          <Link href="/search?subcategory=Shirts" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300" alt="Shirts" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Shirts</h4>
          </Link>

          <Link href="/search?subcategory=Dresses" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300" alt="Dresses" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Dresses</h4>
          </Link>

          <Link href="/search?subcategory=Shoes" className="block text-center hidden md:block">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300" alt="Shoes" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Shoes</h4>
          </Link>

          <Link href="/search?subcategory=Jeans" className="block text-center hidden md:block">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=300" alt="Jeans" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Jeans</h4>
          </Link>

          <Link href="/search?subcategory=Watches" className="block text-center hidden md:block">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300" alt="Watches" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Watches</h4>
          </Link>

          <Link href="/search?subcategory=Bags" className="block text-center hidden md:block">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300" alt="Bags" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Bags</h4>
          </Link>

          <Link href="/search?subcategory=Sunglasses" className="block text-center hidden md:block">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300" alt="Sunglasses" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Sunglasses</h4>
          </Link>



          <Link href="/search?category=Customizable" className="block text-center">
            <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm">
              <Image src="https://Shopwave.b-cdn.net/Custom%20Print%20Products/6_6cbab775-d2f1-40aa-b598-5fe7c1943372.webp" alt="Customise Product" fill loading="lazy" className="object-cover" />
            </div>
            <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">Custom</h4>
          </Link>
        </div>
      </section>



      {/* Electronics Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">📱 Electronics</h2>
          <Link href="/search?category=Tech" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {techDeals.map((product, index) => (
              <div key={`tech-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">🏠 Home & Kitchen</h2>
          <Link href="/search?category=Home" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {homeDeals.map((product, index) => (
              <div key={`home-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">👕 Fashion</h2>
          <Link href="/search?category=Fashion" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {fashionDeals.map((product, index) => (
              <div key={`fashion-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">✨ New Arrivals</h2>
          <Link href="/new-arrivals" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {newArrivals.map((product, index) => (
              <div key={`new-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customizable Products Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">🎨 Custom Products</h2>
          <Link href="/search?category=Customizable" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {products.filter(p => p.category === 'Customizable' && p.quantity > 0).map((product, index) => (
              <div key={`custom-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Price Section */}
      {/* <section className="mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 px-4">💰 Explore Our Prices</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 px-4">
          <Link href="/search?maxPrice=49" className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹49</div>
            <div className="text-xs opacity-90">Under ₹49</div>
          </Link>
          <Link href="/search?maxPrice=99" className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹99</div>
            <div className="text-xs opacity-90">Under ₹99</div>
          </Link>
          <Link href="/search?maxPrice=299" className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹299</div>
            <div className="text-xs opacity-90">Under ₹299</div>
          </Link>
          <Link href="/search?maxPrice=399" className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹399</div>
            <div className="text-xs opacity-90">Under ₹399</div>
          </Link>
          <Link href="/search?maxPrice=499" className="bg-gradient-to-r from-red-400 to-red-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹499</div>
            <div className="text-xs opacity-90">Under ₹499</div>
          </Link>
        </div>
      </section>

      {/* All Products Section */}
 



      <BusinessOpportunityBanner />

    </div>
    </>
  );
}
