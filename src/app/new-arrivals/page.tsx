'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/lib/productStore';
import { NEWARRIVALS_PRODUCTS } from '@/lib/data/newarrivals';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';

// Smart categorization function
const getProductsForSubcategory = (subcategoryName: string, allProducts: Product[]) => {
  switch (subcategoryName) {
    case 'Diwali Special':
      return allProducts.filter(p => 
        p.subcategory === 'Diwali Special' ||
        p.name.toLowerCase().includes('diwali') ||
        p.name.toLowerCase().includes('light') ||
        p.name.toLowerCase().includes('led') ||
        p.name.toLowerCase().includes('lamp') ||
        p.name.toLowerCase().includes('candle') ||
        p.name.toLowerCase().includes('decoration')
      );
    case 'Best Selling':
      return allProducts.filter(p => 
        p.subcategory === 'Best Selling' ||
        (p.ratings?.average || 0) >= 4.0 ||
        (p.ratings?.count || 0) >= 15
      );
    case 'Gifts':
      return allProducts.filter(p => 
        p.subcategory === 'Gifts' ||
        p.name.toLowerCase().includes('gift') ||
        p.name.toLowerCase().includes('decoration') ||
        p.name.toLowerCase().includes('butterfly') ||
        p.name.toLowerCase().includes('sticker')
      );
    case 'Pooja Essentials':
      return allProducts.filter(p => 
        p.subcategory === 'Pooja Essentials' ||
        p.name.toLowerCase().includes('pooja') ||
        p.name.toLowerCase().includes('divine') ||
        p.name.toLowerCase().includes('shubh') ||
        p.name.toLowerCase().includes('labh')
      );
    case 'Fragrance':
      return allProducts.filter(p => 
        p.subcategory === 'Fragrance' ||
        p.name.toLowerCase().includes('fragrance') ||
        p.name.toLowerCase().includes('perfume') ||
        p.name.toLowerCase().includes('scent')
      );
    default:
      return allProducts.filter(p => p.subcategory === subcategoryName);
  }
};

const subcategories = [
  { name: 'Fragrance', products: [], image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop', title: 'Divine Scents', desc: 'Premium fragrances and aromatherapy', href: '/new-arrivals/fragrance' },
  { name: 'Pooja Essentials', products: [], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', title: 'Sacred Items', desc: 'Everything for your daily prayers', href: '/new-arrivals/pooja-essentials' },
  { name: 'Diwali Special', products: [], image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400&h=300&fit=crop', title: 'Celebrate Diwali', desc: 'Festival of lights special collection', href: '/new-arrivals/diwali-special' },
  { name: 'Best Selling', products: [], image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop', title: 'Top Picks', desc: 'Most loved products by customers', href: '/new-arrivals/best-selling' },
  { name: 'Gifts', products: [], image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=300&fit=crop', title: 'Perfect Gifts', desc: 'Thoughtful presents for every occasion', href: '/new-arrivals/gifts' },
  { name: 'Customizable', products: [], image: 'https://Shopwave.b-cdn.net/Custom%20Print%20Products/1_1cbbb949-ade4-42bd-acaa-29a6bc20d5b3.webp', title: 'Customizable Products', desc: 'Personalize your favorite items', href: '/new-arrivals/customizable' },
];

export default function NewArrivalsPage() {
  const { products, isLoading } = useProductStore();
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % subcategories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const allNewArrivals = useMemo(() => {
    // Get all products that should be in New Arrivals
    const apiNewArrivals = products.filter(p => 
      (p.category === 'New Arrivals' || 
       p.category === 'Tech' || 
       p.category === 'Home' ||
       p.category === 'Customizable') && 
      p.quantity > 0
    );
    const jsonNewArrivals = NEWARRIVALS_PRODUCTS.filter(p => p.quantity > 0);
    
    // Remove duplicates by creating a Map with id as key
    const uniqueProductsMap = new Map();
    [...apiNewArrivals, ...jsonNewArrivals].forEach(p => {
      if (p && p.id && !uniqueProductsMap.has(p.id)) {
        uniqueProductsMap.set(p.id, p);
      }
    });
    
    return Array.from(uniqueProductsMap.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filteredProducts = [];
    if (selectedSubcategory === 'All') {
      filteredProducts = allNewArrivals;
    } else if (selectedSubcategory === 'Customizable') {
      filteredProducts = products.filter(p => p.category === 'Customizable' && p.quantity > 0);
    } else {
      // Use smart categorization
      filteredProducts = getProductsForSubcategory(selectedSubcategory, allNewArrivals).filter(p => p.quantity > 0);
    }
    
    // Remove duplicates by ID for consistent display
    const uniqueProductsMap = new Map();
    filteredProducts.forEach(p => {
      if (p && p.id && !uniqueProductsMap.has(p.id)) {
        uniqueProductsMap.set(p.id, p);
      }
    });
    const uniqueProducts = Array.from(uniqueProductsMap.values());
    
    if (sortBy === 'price-low') return [...uniqueProducts].sort((a, b) => (a.price.discounted || a.price.original) - (b.price.discounted || b.price.original));
    if (sortBy === 'price-high') return [...uniqueProducts].sort((a, b) => (b.price.discounted || b.price.original) - (a.price.discounted || a.price.original));
    if (sortBy === 'rating') return [...uniqueProducts].sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    return uniqueProducts;
  }, [selectedSubcategory, allNewArrivals, sortBy, products]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative h-32 md:h-40 overflow-hidden rounded-xl bg-gradient-to-r from-brand/10 to-brand/5">
        <div className="flex h-full">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{subcategories[currentSlide].title}</h1>
              <p className="text-gray-600 text-sm md:text-base">{subcategories[currentSlide].desc}</p>
            </div>
          </div>
          <div className="w-32 md:w-48 relative">
            <Image 
              src={subcategories[currentSlide].image}
              alt={subcategories[currentSlide].name}
              fill 
              className="object-cover rounded-r-xl" 
            />
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {subcategories.map((_, index) => (
            <div key={index} className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-brand' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.name}
              href={subcategory.href}
              className={`relative block h-32 overflow-hidden rounded-xl group ${selectedSubcategory === subcategory.name ? 'ring-2 ring-brand' : ''}`}
            >
              <Image 
                src={subcategory.image} 
                alt={subcategory.name} 
                fill 
                className="object-cover transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <h3 className="text-sm font-bold text-white text-center">{subcategory.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">
            {selectedSubcategory === 'All' ? 'All New Arrivals' : selectedSubcategory} ({filteredProducts.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="default">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
            <div className="flex gap-2 overflow-x-auto">
              <button 
                onClick={() => setSelectedSubcategory('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedSubcategory === 'All' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {subcategories.map(sub => (
                <button 
                  key={sub.name}
                  onClick={() => setSelectedSubcategory(sub.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedSubcategory === sub.name ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} p={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
}