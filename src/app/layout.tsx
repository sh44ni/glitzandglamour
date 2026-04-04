import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ProgressBar from '@/components/ProgressBar';
import Script from 'next/script';
import PageTracker from '@/components/PageTracker';
import Chatbot from '@/components/Chatbot';
import OnboardingGuard from '@/components/OnboardingGuard';
import AprilPromoPopup from '@/components/AprilPromoPopup';

const GA_ID = 'G-4VMS8GSC0P';

export const metadata: Metadata = {
  metadataBase: new URL('https://glitzandglamours.com'),
  title: 'Glitz & Glamour Studio | Nails, Hair & Beauty in Vista, CA',
  description: 'Premium nail, hair, and beauty services by JoJany in Vista, CA. Book your appointment today.',
  manifest: '/manifest.json',
  keywords: 'nails, hair, beauty, salon, Vista CA, San Marcos, gel nails, balayage, facials, JoJany',
  icons: {
    icon: '/favicon-glitz.png',
    apple: '/favicon-glitz.png',
    shortcut: '/favicon-glitz.png',
  },
  openGraph: {
    title: 'Glitz & Glamour Studio',
    description: 'Nails, Hair & Beauty in Vista, CA',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF2D78',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Glitz & Glamour" />
        <link rel="apple-touch-icon" href="/favicon-glitz.png" />
        <link rel="icon" type="image/png" href="/favicon-glitz.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              "name": "Glitz & Glamour Studio",
              "image": "https://glitzandglamours.com/favicon-glitz.png",
              "@id": "https://glitzandglamours.com",
              "url": "https://glitzandglamours.com",
              "telephone": "",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "San Marcos",
                "addressLocality": "San Marcos",
                "addressRegion": "CA",
                "postalCode": "92069",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 33.1813,
                "longitude": -117.2342
              },
              "priceRange": "$$",
              "sameAs": [
                "https://www.instagram.com/glitzandglamours"
              ]
            })
          }}
        />
      </head>
      {/* Google Analytics GA4 */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { page_path: window.location.pathname });
      `}</Script>
      <body>
        <SessionProvider>
          <OnboardingGuard>
            {/* Native page view tracker — fires on every route change */}
            <PageTracker />
            {/* Pink progress bar — fires on every navigation */}
            <ProgressBar />

            {/* Floating orb background — global */}
            <div className="orb-container" aria-hidden="true">
              <div className="orb orb-1" />
              <div className="orb orb-2" />
              <div className="orb orb-3" />
            </div>

            {/* Desktop top navigation */}
            <TopNav />

            {/* Main content wrapped in page transition */}
            <main style={{ position: 'relative', zIndex: 1 }}>
              <PageTransition>
                {children}
              </PageTransition>
            </main>

            {/* Mobile bottom navigation */}
            <BottomNav />

            {/* PWA install prompt */}
            <PWAInstallPrompt />

            {/* Hello Kitty AI Chatbot */}
            <Chatbot />

            {/* April Special Popup — once per session, auto-ends May 1 */}
            <AprilPromoPopup />
          </OnboardingGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
