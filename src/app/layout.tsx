import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ProgressBar from '@/components/ProgressBar';
import Script from 'next/script';
import PageTracker from '@/components/PageTracker';
import ChatbotLazy from '@/components/ChatbotLazy';
import GoogleAnalyticsLazy from '@/components/GoogleAnalyticsLazy';
import OnboardingGuard from '@/components/OnboardingGuard';
import SiteFooter from '@/components/SiteFooter';
import { LanguageProvider } from '@/lib/i18n';
import NavigationFeedback from '@/components/NavigationFeedback';
import QuoteModalProvider from '@/components/QuoteModalProvider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
});

const GA_ID = 'G-4VMS8GSC0P';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.glitzandglamours.com'),
  title: 'Glitz & Glamour Studio | Nails, Hair & Beauty in San Marcos, CA',
  description: 'Premium nail, hair, and beauty services by JoJany at 935 W San Marcos Blvd, Suite 101, San Marcos, CA. Serving San Marcos, Vista & North County. Book your appointment today.',
  manifest: '/manifest.json',
  keywords: 'nails, hair, beauty, salon, San Marcos CA, Vista CA, 935 W San Marcos Blvd, gel nails, balayage, facials, JoJany',
  icons: {
    icon: '/favicon-glitz.png',
    apple: '/favicon-glitz.png',
    shortcut: '/favicon-glitz.png',
  },
  openGraph: {
    title: 'Glitz & Glamour Studio | Nails, Hair & Beauty in San Marcos, CA',
    description: 'Nails, Hair & Beauty at 935 W San Marcos Blvd, San Marcos, CA — Book your appointment today.',
    type: 'website',
    url: 'https://www.glitzandglamours.com',
    images: [{ url: '/favicon-glitz.png', width: 512, height: 512, alt: 'Glitz & Glamour Studio' }],
  },
  twitter: {
    card: 'summary',
    title: 'Glitz & Glamour Studio | San Marcos, CA',
    description: 'Nails, Hair & Beauty in San Marcos, CA',
    images: ['/favicon-glitz.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#FF2D78',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Glitz & Glamour" />
        <link rel="apple-touch-icon" href="/favicon-glitz.png" />
        <link rel="icon" type="image/png" href="/favicon-glitz.png" />

        {/* Preconnect to Google Analytics — but don't block render */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              "name": "Glitz & Glamour Studio",
              "image": "https://www.glitzandglamours.com/favicon-glitz.png",
              "@id": "https://www.glitzandglamours.com",
              "url": "https://www.glitzandglamours.com",
              "telephone": "+1-760-290-5910",
              "email": "info@glitzandglamours.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "935 W San Marcos Blvd, Suite 101",
                "addressLocality": "San Marcos",
                "addressRegion": "CA",
                "postalCode": "92078",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 33.1434,
                "longitude": -117.1856
              },
              "openingHoursSpecification": [
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
                { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "16:00" }
              ],
              "priceRange": "$$",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "50",
                "bestRating": "5"
              },
              "sameAs": [
                "https://www.instagram.com/glitzandglamourstudio/",
                "https://www.glitzandglamours.com"
              ]
            })
          }}
        />
      </head>
      {/* Google Analytics GA4 — Loaded on idle/interaction to unblock initial load and eliminate long tasks */}
      <GoogleAnalyticsLazy gaId={GA_ID} />
      <body>
        <LanguageProvider>
          <SessionProvider>
            <OnboardingGuard>
              <QuoteModalProvider>
                {/* Native page view tracker — fires on every route change */}
                <PageTracker />
                {/* Instantaneous click navigation feedback & top progress glow */}
                <NavigationFeedback />
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

                {/* Site-wide footer — SEO internal links */}
                <SiteFooter />

                {/* Mobile bottom navigation */}
                <BottomNav />

                {/* PWA install prompt */}
                <PWAInstallPrompt />

                {/* Hello Kitty AI Chatbot — lazy loaded */}
                <ChatbotLazy />
              </QuoteModalProvider>
            </OnboardingGuard>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
