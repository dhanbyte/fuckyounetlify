import './globals.css';
import type { Metadata } from 'next';
import RootContent from './RootContent';
import { ClerkProvider } from '@clerk/nextjs';
import { ClerkAuthProvider } from '@/context/ClerkAuthContext';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import SimpleGoogleAuth from '@/components/SimpleGoogleAuth';


export const metadata: Metadata = {
  title: 'ShopWave - India\'s #1 Online Shopping Site | Cheapest Prices | Free Delivery | Best Deals',
  description: 'ShopWave - India\'s #1 Online Shopping Site! Cheapest prices guaranteed, free delivery, best deals on tech, home & ayurvedic products. 50% off sale! Shop now and save more!',
  keywords: 'ShopWave, shop wave, shopwave, online shopping India, best online shopping, cheapest prices, free delivery, tech accessories, home products, ayurvedic products, best deals India, discount shopping, mobile accessories, kitchen items, buy online India, ecommerce India, shopping website India, best price India, fast delivery shopping',
  authors: [{ name: 'ShopWave' }],
  creator: 'ShopWave',
  publisher: 'ShopWave',
  applicationName: 'ShopWave',
  generator: 'ShopWave',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'ShopWave - India\'s #1 Online Shopping Site | Cheapest Prices',
    description: 'ShopWave - India\'s #1 online shopping site! Cheapest prices guaranteed, free delivery, 50% off deals on tech, home & ayurvedic products.',
    siteName: 'ShopWave',
    images: [{
      url: '/logo.png',
      width: 1200,
      height: 630,
      alt: 'ShopWave - Online Shopping',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopWave - India\'s #1 Online Shopping | Cheapest Prices | Free Delivery',
    description: 'ShopWave - India\'s #1 online shopping site! Cheapest prices guaranteed, free delivery, 50% off deals. Shop now and save more!',
    creator: '@shopwave',
    site: '@shopwave',
  },

};

const WhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/919157499884?text=${encodeURIComponent("Hello! I have a question about your products.")}`;
  return (
    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="fixed bottom-10 right-5 py-10 z-50" aria-label="Contact us on WhatsApp">
       <div className="bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-transform hover:scale-110">
         <FaWhatsapp size={24} aria-hidden="true" />
       </div>
    </Link>
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_YWR2YW5jZWQta29pLTU4LmNsZXJrLmFjY291bnRzLmRldiQ';
  
  // Skip Clerk in build if no real key
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.warn('Using fallback Clerk key for build');
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1S9CD9GPJS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1S9CD9GPJS');
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://shopwave.b-cdn.net" />
        <link rel="canonical" href="/" />
        <meta name="google-site-verification" content="shopwave-best-online-shopping-india" />
        <meta name="msvalidate.01" content="shopwave-online-shopping" />
        <meta name="yandex-verification" content="shopwave-india" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ShopWave",
              "alternateName": ["ShopWave India", "Shop Wave", "Shop Wave India"],
              "url": "/",
              "description": "Best online shopping in India for tech accessories, home essentials & ayurvedic products",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "/"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ShopWave",
              "legalName": "ShopWave",
              "brand": "ShopWave",
              "url": "/",
              "logo": "/logo.png",
              "description": "ShopWave - India's #1 online shopping platform with cheapest prices guaranteed, free delivery, and best deals",
              "slogan": "India's #1 Online Shopping Site - Cheapest Prices Guaranteed",
              "priceRange": "₹",
              "hasOfferCatalog": true,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "areaServed": "IN",
              "currenciesAccepted": "INR",
              "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-91574-99884",
                "contactType": "customer service"
              }
            })
          }}
        />
      </head>
      <body className="font-body antialiased bg-white">
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <ClerkAuthProvider>
            <RootContent>{children}</RootContent>
            <SimpleGoogleAuth />
            <WhatsAppButton />
          </ClerkAuthProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}